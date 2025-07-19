import OpenAI from "openai";
import { storage } from "./storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AIChatService {
  async processBusinessQuery(userMessage: string): Promise<string> {
    try {
      // First, analyze the user's intent and extract search parameters
      const intentResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a business data analysis assistant for House of Clarence Business OS. Analyze the user's query and determine what type of business information they're looking for. 

            Respond with JSON in this format:
            {
              "intent": "products" | "contractors" | "quotes" | "orders" | "suppliers" | "analytics" | "general_info",
              "parameters": {
                "category": "string or null",
                "priceRange": {"min": number, "max": number} or null,
                "supplier": "string or null",
                "contractor": "string or null",
                "dateRange": {"from": "string", "to": "string"} or null,
                "status": "string or null"
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
      
      let businessData: any = {};
      
      // Fetch relevant business data based on intent
      switch (intent.intent) {
        case "products":
          businessData.products = await storage.getProducts();
          break;
        case "contractors":
          businessData.contractors = await storage.getContractors();
          break;
        case "quotes":
          businessData.quotes = await storage.getQuotes();
          break;
        case "orders":
          businessData.orders = await storage.getOrders();
          break;
        case "suppliers":
          businessData.suppliers = await storage.getSuppliers();
          break;
        case "analytics":
          businessData = {
            products: await storage.getProducts(),
            contractors: await storage.getContractors(),
            quotes: await storage.getQuotes(),
            orders: await storage.getOrders(),
            suppliers: await storage.getSuppliers()
          };
          break;
        default:
          businessData = {
            products: await storage.getProducts(),
            contractors: await storage.getContractors(),
            quotes: await storage.getQuotes(),
            orders: await storage.getOrders(),
            suppliers: await storage.getSuppliers()
          };
      }

      // Generate natural language response based on the data
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a helpful business data assistant for House of Clarence Business OS. 
            
            Provide clear, professional responses about business data including:
            - Product catalog information (specs, pricing, suppliers, lead times)
            - Contractor relationships and project details
            - Quote generation and tracking
            - Order management and fulfillment
            - Supplier performance and relationships
            - Business analytics and insights
            
            Format your responses with:
            - Key information in bullet points when appropriate
            - Price formatting with £ symbol and commas
            - Clear summaries and actionable insights
            - Professional tone suitable for business use
            
            Focus on helping users understand their business performance, find products, analyze trends, and make informed decisions.`
          },
          {
            role: "user",
            content: `User asked: "${userMessage}"
            
            Business data retrieved:
            ${JSON.stringify(businessData, null, 2)}
            
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