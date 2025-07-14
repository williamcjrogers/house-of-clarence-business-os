// Property Data API Configuration
const PROPERTY_API_KEY = "NGMENHMFDP";

// Mock property data service - replace with actual API calls
export class PropertyDataService {
  private apiKey: string;

  constructor() {
    this.apiKey = PROPERTY_API_KEY;
  }

  async searchProperties(query: string): Promise<any[]> {
    // This would typically make an API call to your property data service
    // For now, returning mock data structure
    return [
      {
        id: "prop_001",
        address: "123 Main Street, London, SW1A 1AA",
        price: 850000,
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1200,
        propertyType: "Apartment",
        yearBuilt: 2015,
        features: ["Parking", "Garden", "Modern Kitchen"],
        neighborhood: "Westminster",
        pricePerSqFt: 708.33,
        marketValue: 850000,
        lastSold: "2023-01-15",
        status: "For Sale"
      },
      {
        id: "prop_002", 
        address: "456 Oak Avenue, London, N1 2BC",
        price: 1200000,
        bedrooms: 4,
        bathrooms: 3,
        squareFeet: 1800,
        propertyType: "House",
        yearBuilt: 1995,
        features: ["Garden", "Garage", "Fireplace"],
        neighborhood: "Islington",
        pricePerSqFt: 666.67,
        marketValue: 1200000,
        lastSold: "2023-06-20",
        status: "For Sale"
      }
    ];
  }

  async getPropertyDetails(propertyId: string): Promise<any> {
    // Mock property details
    return {
      id: propertyId,
      address: "123 Main Street, London, SW1A 1AA",
      price: 850000,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1200,
      propertyType: "Apartment",
      yearBuilt: 2015,
      features: ["Parking", "Garden", "Modern Kitchen"],
      neighborhood: "Westminster",
      pricePerSqFt: 708.33,
      marketValue: 850000,
      lastSold: "2023-01-15",
      status: "For Sale",
      description: "Beautiful modern apartment in prime Westminster location",
      amenities: ["Gym", "Concierge", "Roof Terrace"],
      transport: ["Underground: 5 mins", "Bus: 2 mins"],
      schools: ["Primary: Outstanding", "Secondary: Good"],
      priceHistory: [
        { date: "2023-01-15", price: 850000 },
        { date: "2022-01-15", price: 780000 },
        { date: "2021-01-15", price: 750000 }
      ]
    };
  }

  async getMarketAnalysis(area: string): Promise<any> {
    // Mock market analysis
    return {
      area: area,
      averagePrice: 925000,
      priceChange: {
        monthly: 2.5,
        yearly: 8.3
      },
      inventory: 150,
      daysOnMarket: 45,
      pricePerSqFt: {
        average: 687,
        range: { min: 450, max: 1200 }
      },
      propertyTypes: {
        apartments: { count: 80, avgPrice: 750000 },
        houses: { count: 70, avgPrice: 1100000 }
      }
    };
  }
}

export const propertyDataService = new PropertyDataService();