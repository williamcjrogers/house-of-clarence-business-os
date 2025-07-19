import OpenAI from "openai";
import { storage } from "./storage";
import sharp from "sharp";
import fs from "fs";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ColorAnalysis {
  color: string;
  hex: string;
  percentage: number;
}

interface VisualElements {
  colors: ColorAnalysis[];
  styles: string[];
  materials: string[];
  themes: string[];
}

interface ProductMatch {
  product: any;
  matchScore: number;
  matchReasons: string[];
}

interface MoodBoardAnalysis {
  visualElements: VisualElements;
  matchingProducts: ProductMatch[];
  designInsights: string[];
  suggestions: string[];
}

export class MoodBoardAnalyzer {
  async analyzeMoodBoard(imagePath: string): Promise<MoodBoardAnalysis> {
    try {
      // Get all products from the database
      const products = await storage.getProducts();
      
      // Convert image to base64 for OpenAI Vision analysis
      const imageBuffer = await sharp(imagePath)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      
      const base64Image = imageBuffer.toString('base64');

      // Analyze the mood board with OpenAI Vision
      const visionAnalysis = await this.analyzeImageWithAI(base64Image);
      
      // Match products based on the analysis
      const matchingProducts = await this.matchProductsToAnalysis(visionAnalysis, products);
      
      // Generate design insights and suggestions
      const insights = await this.generateDesignInsights(visionAnalysis, matchingProducts);

      // Clean up the uploaded file
      fs.unlinkSync(imagePath);

      return {
        visualElements: visionAnalysis,
        matchingProducts: matchingProducts,
        designInsights: insights.insights,
        suggestions: insights.suggestions
      };

    } catch (error) {
      console.error("Mood board analysis error:", error);
      throw new Error("Failed to analyze mood board");
    }
  }

  private async analyzeImageWithAI(base64Image: string): Promise<VisualElements> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert interior design analyst. Analyze this mood board image and extract detailed visual elements.

          Focus on identifying:
          - Dominant colors (provide color names and hex codes)
          - Design styles (modern, traditional, minimalist, industrial, etc.)
          - Materials visible (wood, metal, stone, ceramic, glass, etc.)
          - Overall themes and aesthetic direction

          Respond with JSON in this exact format:
          {
            "colors": [
              {"color": "Warm White", "hex": "#F5F5F0", "percentage": 35},
              {"color": "Sage Green", "hex": "#9CAF88", "percentage": 25}
            ],
            "styles": ["Modern", "Minimalist", "Scandinavian"],
            "materials": ["Natural Wood", "Ceramic", "Brushed Metal"],
            "themes": ["Clean Lines", "Natural Light", "Organic Forms"]
          }`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this mood board image and extract the visual elements as requested."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  private async matchProductsToAnalysis(
    visualElements: VisualElements, 
    products: any[]
  ): Promise<ProductMatch[]> {
    const matches: ProductMatch[] = [];

    for (const product of products) {
      const matchScore = this.calculateProductMatch(visualElements, product);
      
      if (matchScore.score > 30) { // Only include products with >30% match
        matches.push({
          product: product,
          matchScore: matchScore.score,
          matchReasons: matchScore.reasons
        });
      }
    }

    // Sort by match score and return top 10
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }

  private calculateProductMatch(visualElements: VisualElements, product: any): {
    score: number;
    reasons: string[];
  } {
    let score = 0;
    const reasons: string[] = [];

    // Match by category and product type
    const categoryKeywords = {
      'WC': ['bathroom', 'toilet', 'modern', 'white', 'ceramic'],
      'Shower': ['bathroom', 'shower', 'modern', 'chrome', 'steel'],
      'Worktop': ['kitchen', 'surface', 'stone', 'modern', 'clean'],
      'Wall Tiles': ['wall', 'ceramic', 'tile', 'surface', 'bathroom', 'kitchen']
    };

    const productCategory = product.category;
    const keywords = categoryKeywords[productCategory] || [];
    
    // Check style matches
    const productText = `${product.specs} ${product.subCategory || ''}`.toLowerCase();
    
    visualElements.styles.forEach(style => {
      if (productText.includes(style.toLowerCase()) || 
          keywords.some(keyword => productText.includes(keyword))) {
        score += 25;
        reasons.push(`Matches ${style} style`);
      }
    });

    // Check material matches
    visualElements.materials.forEach(material => {
      const materialLower = material.toLowerCase();
      if (productText.includes(materialLower) ||
          productText.includes('ceramic') && materialLower.includes('ceramic') ||
          productText.includes('stone') && materialLower.includes('stone') ||
          productText.includes('steel') && materialLower.includes('metal')) {
        score += 20;
        reasons.push(`Contains ${material}`);
      }
    });

    // Check color matches (if product description contains color references)
    visualElements.colors.forEach(color => {
      const colorLower = color.color.toLowerCase();
      if (productText.includes(colorLower) ||
          (colorLower.includes('white') && productText.includes('white')) ||
          (colorLower.includes('black') && productText.includes('black')) ||
          (colorLower.includes('grey') && productText.includes('grey'))) {
        score += 15;
        reasons.push(`Matches ${color.color} color palette`);
      }
    });

    // Theme matching
    visualElements.themes.forEach(theme => {
      const themeLower = theme.toLowerCase();
      if (productText.includes(themeLower) ||
          (themeLower.includes('modern') && productText.includes('modern')) ||
          (themeLower.includes('clean') && productText.includes('rimless'))) {
        score += 10;
        reasons.push(`Fits ${theme} theme`);
      }
    });

    // Boost score for products with images (they're more likely to be relevant)
    if (product.imageUrl) {
      score += 5;
      reasons.push('Has product image');
    }

    return {
      score: Math.min(100, score),
      reasons: reasons.slice(0, 3) // Limit to top 3 reasons
    };
  }

  private async generateDesignInsights(
    visualElements: VisualElements, 
    matchingProducts: ProductMatch[]
  ): Promise<{ insights: string[]; suggestions: string[] }> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert interior designer. Based on the mood board analysis and matching products, provide professional design insights and suggestions.

          Generate:
          1. Design insights about the visual style and aesthetic
          2. Product suggestions and combinations
          3. Design tips for achieving this look

          Respond with JSON in this format:
          {
            "insights": [
              "This mood board emphasizes clean, modern lines with natural materials",
              "The color palette suggests a calming, spa-like atmosphere"
            ],
            "suggestions": [
              "Consider combining the ceramic elements with natural wood accents",
              "Use consistent hardware finishes throughout the space"
            ]
          }`
        },
        {
          role: "user",
          content: `Mood board analysis:
          Colors: ${visualElements.colors.map(c => c.color).join(', ')}
          Styles: ${visualElements.styles.join(', ')}
          Materials: ${visualElements.materials.join(', ')}
          Themes: ${visualElements.themes.join(', ')}

          Top matching products:
          ${matchingProducts.slice(0, 5).map(p => 
            `- ${p.product.specs} (${p.product.category}) - ${p.matchScore}% match`
          ).join('\n')}

          Please provide design insights and suggestions.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800
    });

    return JSON.parse(response.choices[0].message.content || '{"insights":[],"suggestions":[]}');
  }
}

export const moodBoardAnalyzer = new MoodBoardAnalyzer();