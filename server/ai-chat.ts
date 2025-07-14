import OpenAI from "openai";
import { propertyDataService } from "./property-api";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AIChatService {
  async processPropertyQuery(userMessage: string): Promise<string> {
    try {
      // First, analyze the user's intent and extract search parameters
      const intentResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a property data analysis assistant. Analyze the user's query and determine what type of property information they're looking for. 

            Respond with JSON in this format:
            {
              "intent": "search_properties" | "property_details" | "market_analysis" | "general_info",
              "parameters": {
                "location": "string or null",
                "priceRange": {"min": number, "max": number} or null,
                "propertyType": "string or null",
                "bedrooms": number or null,
                "bathrooms": number or null,
                "features": ["string"] or null,
                "propertyId": "string or null",
                "area": "string or null"
              },
              "query": "reformulated search query"
            }`
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        response_format: { type: "json_object" }
      });

      const intent = JSON.parse(intentResponse.choices[0].message.content || "{}");
      
      let propertyData;
      
      // Fetch relevant property data based on intent
      switch (intent.intent) {
        case "search_properties":
          propertyData = await propertyDataService.searchProperties(intent.query);
          break;
        case "property_details":
          if (intent.parameters.propertyId) {
            propertyData = await propertyDataService.getPropertyDetails(intent.parameters.propertyId);
          } else {
            propertyData = await propertyDataService.searchProperties(intent.query);
          }
          break;
        case "market_analysis":
          propertyData = await propertyDataService.getMarketAnalysis(intent.parameters.area || intent.parameters.location || "London");
          break;
        default:
          propertyData = await propertyDataService.searchProperties(intent.query);
      }

      // Generate natural language response based on the data
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a helpful property data assistant for House of Clarence Business OS. 
            
            Provide clear, professional responses about property data. Format your responses with:
            - Key information in bullet points when appropriate
            - Price formatting with £ symbol and commas
            - Clear property details and comparisons
            - Professional tone suitable for business use
            
            If the data appears to be mock/sample data, still provide a helpful response but you can mention this is sample data for demonstration purposes.`
          },
          {
            role: "user",
            content: `User asked: "${userMessage}"
            
            Property data retrieved:
            ${JSON.stringify(propertyData, null, 2)}
            
            Please provide a helpful response based on this data.`
          }
        ]
      });

      return response.choices[0].message.content || "I'm sorry, I couldn't process your request.";
      
    } catch (error) {
      console.error("AI Chat Error:", error);
      return "I'm sorry, I encountered an error while processing your request. Please try again.";
    }
  }
}

export const aiChatService = new AIChatService();