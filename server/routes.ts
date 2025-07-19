import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { insertProductSchema, insertContractorSchema, insertQuoteSchema, insertOrderSchema, insertSupplierSchema } from "@shared/schema";
import { aiChatService } from "./ai-chat";
import { uploadMiddleware, importProductsFromExcel } from "./upload-service";
import { moodBoardAnalyzer } from "./moodboard-analyzer";
import multer from "multer";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files for extracted images
  app.use('/uploads/extracted-images', express.static(path.join(process.cwd(), 'uploads', 'extracted-images')));
  
  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(parseInt(req.params.id), req.body);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Contractors
  app.get("/api/contractors", async (req, res) => {
    try {
      const contractors = await storage.getContractors();
      res.json(contractors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contractors" });
    }
  });

  app.get("/api/contractors/:id", async (req, res) => {
    try {
      const contractor = await storage.getContractor(parseInt(req.params.id));
      if (!contractor) {
        return res.status(404).json({ message: "Contractor not found" });
      }
      res.json(contractor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contractor" });
    }
  });

  app.post("/api/contractors", async (req, res) => {
    try {
      const validatedData = insertContractorSchema.parse(req.body);
      const contractor = await storage.createContractor(validatedData);
      res.status(201).json(contractor);
    } catch (error) {
      res.status(400).json({ message: "Invalid contractor data" });
    }
  });

  app.patch("/api/contractors/:id", async (req, res) => {
    try {
      const contractor = await storage.updateContractor(parseInt(req.params.id), req.body);
      if (!contractor) {
        return res.status(404).json({ message: "Contractor not found" });
      }
      res.json(contractor);
    } catch (error) {
      res.status(500).json({ message: "Failed to update contractor" });
    }
  });

  app.delete("/api/contractors/:id", async (req, res) => {
    try {
      const success = await storage.deleteContractor(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Contractor not found" });
      }
      res.json({ message: "Contractor deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contractor" });
    }
  });

  // Quotes
  app.get("/api/quotes", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const quote = await storage.getQuote(parseInt(req.params.id));
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.json(quote);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote" });
    }
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      const validatedData = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(validatedData);
      res.status(201).json(quote);
    } catch (error) {
      res.status(400).json({ message: "Invalid quote data" });
    }
  });

  app.patch("/api/quotes/:id", async (req, res) => {
    try {
      const quote = await storage.updateQuote(parseInt(req.params.id), req.body);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.json(quote);
    } catch (error) {
      res.status(500).json({ message: "Failed to update quote" });
    }
  });

  app.delete("/api/quotes/:id", async (req, res) => {
    try {
      const success = await storage.deleteQuote(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.json({ message: "Quote deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete quote" });
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.updateOrder(parseInt(req.params.id), req.body);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const success = await storage.deleteOrder(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json({ message: "Order deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete order" });
    }
  });

  // Suppliers
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.getSupplier(parseInt(req.params.id));
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Invalid supplier data" });
    }
  });

  app.patch("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.updateSupplier(parseInt(req.params.id), req.body);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      const success = await storage.deleteSupplier(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json({ message: "Supplier deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // AI Chat endpoint
  app.post("/api/ai-chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const response = await aiChatService.processBusinessQuery(message);
      res.json({ response });
    } catch (error) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Mood Board Analysis endpoint
  const moodboardUpload = multer({
    dest: 'uploads/moodboards/',
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    }
  }).single('moodboard');

  app.post("/api/analyze-moodboard", moodboardUpload, async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      const analysis = await moodBoardAnalyzer.analyzeMoodBoard(req.file.path);
      
      res.json(analysis);
    } catch (error) {
      console.error("Mood board analysis error:", error);
      res.status(500).json({ error: "Failed to analyze mood board" });
    }
  });

  // Excel Upload endpoint
  app.post("/api/upload-excel", uploadMiddleware, async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const results = await importProductsFromExcel(req.file.path);
      
      res.json({
        message: "Excel file processed successfully",
        results: {
          imported: results.success,
          errors: results.errors
        }
      });
    } catch (error) {
      console.error("Excel Upload Error:", error);
      res.status(500).json({ error: "Failed to process Excel file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
