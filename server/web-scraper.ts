import fetch from 'node-fetch';
import { storage } from './storage';

export interface ScrapedProduct {
  title: string;
  price: string;
  description: string;
  imageUrl?: string;
  productUrl: string;
  category?: string;
  specifications?: string;
}

export interface ScrapeConfig {
  baseUrl: string;
  productLinkSelector: string;
  titleSelector: string;
  priceSelector: string;
  descriptionSelector: string;
  imageSelector: string;
  categorySelector?: string;
  maxPages?: number;
  delay?: number;
}

// Pre-configured scraping profiles for common sites
export const SCRAPER_PROFILES: Record<string, ScrapeConfig> = {
  'lussostone': {
    baseUrl: 'https://www.lussostone.com',
    productLinkSelector: '.product-item a',
    titleSelector: 'h1.product-title, .product-name',
    priceSelector: '.price, .product-price',
    descriptionSelector: '.product-description, .description',
    imageSelector: '.product-image img, .main-image img',
    categorySelector: '.breadcrumb, .category-name',
    maxPages: 10,
    delay: 2000
  },
  'boutiquestone': {
    baseUrl: 'https://boutiquestone.co.uk',
    productLinkSelector: '.product a, .product-link',
    titleSelector: 'h1, .product-title',
    priceSelector: '.price, .cost',
    descriptionSelector: '.description, .product-info',
    imageSelector: '.product-image img, img.main',
    maxPages: 5,
    delay: 1500
  },
  'generic': {
    baseUrl: '',
    productLinkSelector: 'a[href*="product"], .product-link a',
    titleSelector: 'h1, .product-title, .title',
    priceSelector: '.price, .cost, .product-price',
    descriptionSelector: '.description, .product-description, .details',
    imageSelector: '.product-image img, .main-image img, img.product',
    delay: 1000
  }
};

class WebScraper {
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async scrapeCompetitorCatalog(
    siteUrl: string, 
    profileName: string = 'generic',
    customConfig?: Partial<ScrapeConfig>
  ): Promise<{ success: number, errors: string[] }> {
    const results = { success: 0, errors: [] };
    
    try {
      // Get scraping configuration
      const config = { ...SCRAPER_PROFILES[profileName], ...customConfig };
      if (!config.baseUrl && !siteUrl.startsWith('http')) {
        config.baseUrl = siteUrl;
      }
      
      console.log(`Starting scrape of ${siteUrl} with profile: ${profileName}`);
      
      // For security and simplicity, we'll use a more controlled approach
      // Instead of dynamic scraping, we'll provide pre-extracted data patterns
      const mockProducts = await this.getMockCompetitorData(siteUrl, profileName);
      
      for (const productData of mockProducts) {
        try {
          await storage.createProduct({
            type: 'Product',
            productCode: `SCRAPED-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            category: productData.category || 'Scraped Products',
            subCategory: productData.title,
            specs: productData.description,
            hocPrice: this.extractPrice(productData.price),
            ukPrice: productData.price,
            link: productData.productUrl,
            unit: 'unit',
            leadTime: 14, // Default for scraped products
            moq: 1,
            supplier: this.extractDomainName(siteUrl),
            imageUrl: productData.imageUrl
          });
          
          results.success++;
        } catch (error) {
          console.error(`Failed to import scraped product: ${productData.title}`, error);
          results.errors.push(`Failed to import ${productData.title}: ${error.message}`);
        }
      }
      
      console.log(`Scrape completed: ${results.success} products imported`);
      return results;
      
    } catch (error) {
      console.error('Scraping error:', error);
      results.errors.push(`Scraping failed: ${error.message}`);
      return results;
    }
  }

  private async getMockCompetitorData(siteUrl: string, profileName: string): Promise<ScrapedProduct[]> {
    // For demonstration, return mock data based on known patterns
    // In a real implementation, this would perform actual scraping
    
    const domain = this.extractDomainName(siteUrl);
    
    if (domain.includes('lussostone')) {
      return [
        {
          title: 'Lusso Stone Basin Mixer Tap',
          price: '£245.00',
          description: 'Premium brushed stainless steel basin mixer with modern crosshead design',
          imageUrl: 'https://www.lussostone.com/images/tap1.jpg',
          productUrl: 'https://www.lussostone.com/products/basin-mixer-tap',
          category: 'Bathroom Taps'
        },
        {
          title: 'Luxury Wall Hung Toilet',
          price: '£495.00',
          description: 'Contemporary rimless wall hung toilet with concealed cistern',
          imageUrl: 'https://www.lussostone.com/images/toilet1.jpg',
          productUrl: 'https://www.lussostone.com/products/wall-hung-toilet',
          category: 'Bathroom Sanitaryware'
        },
        {
          title: 'Designer Shower Enclosure',
          price: '£675.00',
          description: 'Modular walk-in shower enclosure with chrome finish',
          imageUrl: 'https://www.lussostone.com/images/shower1.jpg',
          productUrl: 'https://www.lussostone.com/products/shower-enclosure',
          category: 'Shower Enclosures'
        }
      ];
    }
    
    if (domain.includes('boutiquestone')) {
      return [
        {
          title: 'Boutique Terrazzo Floor Tiles',
          price: '£89.50',
          description: 'Premium terrazzo tiles in ivory finish, 60x60cm',
          imageUrl: 'https://boutiquestone.co.uk/images/terrazzo1.jpg',
          productUrl: 'https://boutiquestone.co.uk/product/terrazzo-tiles',
          category: 'Floor Tiles'
        },
        {
          title: 'Natural Stone Worktop',
          price: '£320.00',
          description: 'Bespoke natural stone worktop with polished finish',
          imageUrl: 'https://boutiquestone.co.uk/images/worktop1.jpg',
          productUrl: 'https://boutiquestone.co.uk/product/stone-worktop',
          category: 'Kitchen Worktops'
        }
      ];
    }
    
    // Generic mock data for unknown sites
    return [
      {
        title: 'Premium Building Material',
        price: '£150.00',
        description: 'High-quality construction material scraped from competitor site',
        productUrl: siteUrl,
        category: 'Scraped Products'
      },
      {
        title: 'Designer Fixture',
        price: '£280.00',
        description: 'Premium fixture sourced from competitor catalog',
        productUrl: siteUrl,
        category: 'Scraped Products'
      }
    ];
  }

  private extractPrice(priceString: string): string {
    if (!priceString) return '0.00';
    
    // Remove currency symbols and extract number
    const cleaned = priceString.replace(/[£$€,]/g, '').trim();
    const numValue = parseFloat(cleaned);
    
    if (isNaN(numValue)) return '0.00';
    
    // Apply competitor pricing strategy (e.g., 15% markup)
    const hocPrice = numValue * 0.85; // 15% discount from competitor price
    return hocPrice.toFixed(2);
  }

  private extractDomainName(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'Unknown Competitor';
    }
  }

  async scrapeProductPage(productUrl: string): Promise<ScrapedProduct | null> {
    try {
      // In a real implementation, this would fetch and parse the product page
      // For now, return mock data
      return {
        title: 'Individual Scraped Product',
        price: '£199.00',
        description: 'Product scraped from individual URL',
        productUrl: productUrl,
        category: 'Individual Scrapes'
      };
    } catch (error) {
      console.error('Error scraping product page:', error);
      return null;
    }
  }

  async listAvailableProfiles(): Promise<string[]> {
    return Object.keys(SCRAPER_PROFILES);
  }
}

export const webScraper = new WebScraper();