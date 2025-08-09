import fs from "fs";
import path from "path";
import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-placeholder_key' 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

interface VictorianHouseReference {
  id: string;
  name: string;
  style: string;
  keyFeatures: string[];
  colorPalette: string[];
  materials: string[];
  architecturalElements: string[];
  filePath: string;
  description: string;
  analysisDate: Date;
}

export class VictorianReferenceService {
  private referenceDir = 'uploads/victorian-references';
  private metadataFile = path.join(this.referenceDir, 'references.json');

  constructor() {
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(this.referenceDir)) {
      fs.mkdirSync(this.referenceDir, { recursive: true });
    }
  }

  async saveVictorianReference(imageBuffer: Buffer, filename: string): Promise<VictorianHouseReference> {
    const id = `victorian-${Date.now()}`;
    const filePath = path.join(this.referenceDir, `${id}-${filename}`);
    
    // Save the image
    fs.writeFileSync(filePath, imageBuffer);
    
    // Analyze the image with OpenAI Vision
    const base64Image = imageBuffer.toString('base64');
    const analysis = await this.analyzeVictorianHouse(base64Image);
    
    const reference: VictorianHouseReference = {
      id,
      name: filename.replace(/\.[^/.]+$/, ""), // Remove file extension
      style: analysis.style,
      keyFeatures: analysis.keyFeatures,
      colorPalette: analysis.colorPalette,
      materials: analysis.materials,
      architecturalElements: analysis.architecturalElements,
      filePath,
      description: analysis.description,
      analysisDate: new Date()
    };

    // Save metadata
    await this.saveReferenceMetadata(reference);
    
    return reference;
  }

  private async analyzeVictorianHouse(base64Image: string) {
    if (!openai) {
      // Return basic placeholder analysis when OpenAI is not available
      return {
        style: "Victorian (analysis unavailable)",
        keyFeatures: ["Analysis unavailable - OpenAI not configured"],
        colorPalette: ["Unknown"],
        materials: ["Unknown"],
        architecturalElements: ["Analysis unavailable"]
      };
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert Victorian architecture analyst. Analyze this Victorian house image and extract detailed architectural information.

          Focus on identifying:
          - Victorian style type (Queen Anne, Gothic Revival, Second Empire, Italianate, Eastlake/Stick, Shingle, etc.)
          - Key architectural features (turrets, bay windows, gingerbread trim, dormers, etc.)
          - Color palette and paint scheme
          - Building materials (brick, wood, stone, etc.)
          - Distinctive architectural elements

          Respond with JSON in this exact format:
          {
            "style": "Queen Anne Victorian",
            "keyFeatures": ["Asymmetrical facade", "Turret with conical roof", "Wraparound porch"],
            "colorPalette": ["Deep Forest Green", "Cream White", "Burgundy Red"],
            "materials": ["Wood siding", "Brick foundation", "Slate roof"],
            "architecturalElements": ["Bay windows", "Decorative brackets", "Ornate spindle work"],
            "description": "A classic example of Queen Anne Victorian featuring..."
          }`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this Victorian house and provide detailed architectural information."
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

  private saveReferenceMetadata(reference: VictorianHouseReference) {
    let references: VictorianHouseReference[] = [];
    
    // Load existing references
    if (fs.existsSync(this.metadataFile)) {
      const data = fs.readFileSync(this.metadataFile, 'utf8');
      references = JSON.parse(data);
    }
    
    // Add new reference
    references.push(reference);
    
    // Save updated references
    fs.writeFileSync(this.metadataFile, JSON.stringify(references, null, 2));
  }

  async getAllReferences(): Promise<VictorianHouseReference[]> {
    if (!fs.existsSync(this.metadataFile)) {
      return [];
    }
    
    const data = fs.readFileSync(this.metadataFile, 'utf8');
    return JSON.parse(data);
  }

  async findMatchingReferences(searchCriteria: {
    style?: string;
    features?: string[];
    colors?: string[];
    materials?: string[];
  }): Promise<VictorianHouseReference[]> {
    const allReferences = await this.getAllReferences();
    
    return allReferences.filter(ref => {
      if (searchCriteria.style && !ref.style.toLowerCase().includes(searchCriteria.style.toLowerCase())) {
        return false;
      }
      
      if (searchCriteria.features && !searchCriteria.features.some(feature => 
        ref.keyFeatures.some(refFeature => refFeature.toLowerCase().includes(feature.toLowerCase()))
      )) {
        return false;
      }
      
      if (searchCriteria.colors && !searchCriteria.colors.some(color => 
        ref.colorPalette.some(refColor => refColor.toLowerCase().includes(color.toLowerCase()))
      )) {
        return false;
      }
      
      if (searchCriteria.materials && !searchCriteria.materials.some(material => 
        ref.materials.some(refMaterial => refMaterial.toLowerCase().includes(material.toLowerCase()))
      )) {
        return false;
      }
      
      return true;
    });
  }

  async compareWithCatalogue(referenceId: string): Promise<{
    reference: VictorianHouseReference;
    matchingProducts: any[];
    designSuggestions: string[];
  }> {
    const references = await this.getAllReferences();
    const reference = references.find(ref => ref.id === referenceId);
    
    if (!reference) {
      throw new Error('Victorian reference not found');
    }

    // This would integrate with your existing product matching logic
    // For now, return a placeholder that shows the concept
    return {
      reference,
      matchingProducts: [],
      designSuggestions: [
        `Consider products that match the ${reference.style} aesthetic`,
        `Look for items in colors: ${reference.colorPalette.join(', ')}`,
        `Focus on materials: ${reference.materials.join(', ')}`,
        `Incorporate architectural elements: ${reference.architecturalElements.join(', ')}`
      ]
    };
  }

  // Predefined Victorian house references
  async createDefaultReferences() {
    const defaultReferences = [
      {
        name: "San Francisco Painted Lady",
        style: "Queen Anne Victorian",
        keyFeatures: ["Asymmetrical facade", "Bay windows", "Ornate trim", "Steep-pitched roof"],
        colorPalette: ["Sage Green", "Cream", "Burgundy", "Gold"],
        materials: ["Wood siding", "Decorative shingles", "Cast iron"],
        architecturalElements: ["Wraparound porch", "Decorative brackets", "Spindle work"],
        description: "Classic San Francisco Painted Lady showcasing Queen Anne Victorian style"
      },
      {
        name: "Gothic Revival Victorian",
        style: "Gothic Revival",
        keyFeatures: ["Pointed arch windows", "Steep gables", "Vertical emphasis"],
        colorPalette: ["Dark Green", "Cream", "Brown"],
        materials: ["Brick", "Stone trim", "Slate roof"],
        architecturalElements: ["Buttresses", "Gothic arches", "Ornate stonework"],
        description: "Gothic Revival Victorian emphasizing medieval architectural elements"
      },
      {
        name: "Second Empire Victorian",
        style: "Second Empire",
        keyFeatures: ["Mansard roof", "Dormer windows", "Classical details"],
        colorPalette: ["Gray", "White", "Black"],
        materials: ["Brick", "Stone", "Slate"],
        architecturalElements: ["Mansard roof", "Bracketed cornices", "Quoins"],
        description: "Second Empire Victorian with distinctive mansard roof"
      }
    ];

    // Save these as reference metadata without actual images
    // In a real implementation, you would have actual images for these
    for (const ref of defaultReferences) {
      const reference: VictorianHouseReference = {
        id: `default-${ref.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...ref,
        filePath: '',
        analysisDate: new Date()
      };
      
      this.saveReferenceMetadata(reference);
    }
  }
}

export const victorianReferenceService = new VictorianReferenceService();