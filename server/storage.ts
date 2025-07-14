import { 
  products, contractors, quotes, orders, suppliers,
  type Product, type InsertProduct,
  type Contractor, type InsertContractor,
  type Quote, type InsertQuote,
  type Order, type InsertOrder,
  type Supplier, type InsertSupplier
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Contractors
  getContractors(): Promise<Contractor[]>;
  getContractor(id: number): Promise<Contractor | undefined>;
  createContractor(contractor: InsertContractor): Promise<Contractor>;
  updateContractor(id: number, contractor: Partial<InsertContractor>): Promise<Contractor | undefined>;
  deleteContractor(id: number): Promise<boolean>;

  // Quotes
  getQuotes(): Promise<Quote[]>;
  getQuote(id: number): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  deleteQuote(id: number): Promise<boolean>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;

  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private contractors: Map<number, Contractor>;
  private quotes: Map<number, Quote>;
  private orders: Map<number, Order>;
  private suppliers: Map<number, Supplier>;
  private currentProductId: number = 1;
  private currentContractorId: number = 1;
  private currentQuoteId: number = 1;
  private currentOrderId: number = 1;
  private currentSupplierId: number = 1;

  constructor() {
    this.products = new Map();
    this.contractors = new Map();
    this.quotes = new Map();
    this.orders = new Map();
    this.suppliers = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Initialize with real data from the spreadsheet
    const initialProducts = [
      { 
        productCode: 'KWO001', 
        category: 'KITCHEN', 
        subCategory: 'Worktop', 
        type: 'Sintered Stone Worktop', 
        specs: 'Premium 20mm Calacatta', 
        hocPrice: '2850.00', 
        ukPrice: '4500.00', 
        leadTime: 4, 
        moq: 1, 
        supplier: 'Lusso Stone',
        link: 'https://lussostone.com/sintered'
      },
      { 
        productCode: 'KOC001', 
        category: 'KITCHEN', 
        subCategory: 'Overhead cabinets', 
        type: 'German Kitchen Cabinets', 
        specs: 'Häcker Systemat Range', 
        hocPrice: '3200.00', 
        ukPrice: '5100.00', 
        leadTime: 6, 
        moq: 1, 
        supplier: 'Häcker'
      },
      { 
        productCode: 'KOU001', 
        category: 'KITCHEN', 
        subCategory: 'Other Units', 
        type: 'Island Unit', 
        specs: '2400x1200mm with storage', 
        hocPrice: '4800.00', 
        ukPrice: '7500.00', 
        leadTime: 8, 
        moq: 1, 
        supplier: 'Häcker'
      },
      { 
        productCode: 'BBA001', 
        category: 'BATHROOMS', 
        subCategory: 'Family Bathroom', 
        type: 'Basin+Vanity Unit', 
        specs: 'Wooden Vanity Unit 1500mm', 
        hocPrice: '980.00', 
        ukPrice: '1580.00', 
        leadTime: 3, 
        moq: 1, 
        supplier: 'Lusso Stone',
        link: 'https://lussostone.com/products/tiffany-velvet-beige'
      },
      { 
        productCode: 'BBA002', 
        category: 'BATHROOMS', 
        subCategory: 'Family Bathroom', 
        type: 'Basin Faucet', 
        specs: 'Regal Brushed SS Crosshead 3-Hole', 
        hocPrice: '134.00', 
        ukPrice: '214.17', 
        leadTime: 2, 
        moq: 2, 
        supplier: 'Lusso Stone',
        link: 'https://lussostone.com/products/regal-brushed'
      },
      { 
        productCode: 'BWC001', 
        category: 'BATHROOMS', 
        subCategory: 'Family Bathroom', 
        type: 'WC', 
        specs: 'Rimless Back to Wall WC Pan', 
        hocPrice: '285.00', 
        ukPrice: '425.00', 
        leadTime: 2, 
        moq: 1, 
        supplier: 'Lusso Stone'
      },
      { 
        productCode: 'BSH001', 
        category: 'BATHROOMS', 
        subCategory: 'Family Bathroom', 
        type: 'Shower', 
        specs: 'Walk-in Shower Screen 1200mm', 
        hocPrice: '450.00', 
        ukPrice: '780.00', 
        leadTime: 3, 
        moq: 1, 
        supplier: 'Lusso Stone'
      },
      { 
        productCode: 'BBA003', 
        category: 'BATHROOMS', 
        subCategory: 'Master Ensuite', 
        type: 'Bath', 
        specs: 'Freestanding Stone Bath 1700mm', 
        hocPrice: '1850.00', 
        ukPrice: '2950.00', 
        leadTime: 4, 
        moq: 1, 
        supplier: 'Lusso Stone'
      },
      { 
        productCode: 'FWO001', 
        category: 'FLOORING', 
        subCategory: 'Living Areas', 
        type: 'Engineered Wood', 
        specs: 'Oak 15mm x 220mm', 
        hocPrice: '48.00', 
        ukPrice: '75.00', 
        unit: 'per m²', 
        leadTime: 2, 
        moq: 50, 
        supplier: 'Kährs'
      },
      { 
        productCode: 'FTI001', 
        category: 'FLOORING', 
        subCategory: 'Bathrooms', 
        type: 'Porcelain Tiles', 
        specs: 'Large Format 600x1200mm', 
        hocPrice: '38.00', 
        ukPrice: '62.00', 
        unit: 'per m²', 
        leadTime: 3, 
        moq: 30, 
        supplier: 'Porcelanosa'
      },
      { 
        productCode: 'LCH001', 
        category: 'LIGHTING & ELECTRICAL', 
        subCategory: 'Reception', 
        type: 'Chandelier', 
        specs: 'Crystal 800mm diameter', 
        hocPrice: '2800.00', 
        ukPrice: '4500.00', 
        leadTime: 6, 
        moq: 1, 
        supplier: 'Schonbek'
      },
      { 
        productCode: 'LSM001', 
        category: 'LIGHTING & ELECTRICAL', 
        subCategory: 'Whole House', 
        type: 'Smart Home System', 
        specs: 'Control4 Complete Package', 
        hocPrice: '8500.00', 
        ukPrice: '14000.00', 
        leadTime: 4, 
        moq: 1, 
        supplier: 'Control4'
      },
      { 
        productCode: 'LSP001', 
        category: 'LIGHTING & ELECTRICAL', 
        subCategory: 'General', 
        type: 'LED Spotlights', 
        specs: 'Adjustable GU10 Fire Rated', 
        hocPrice: '18.00', 
        ukPrice: '32.00', 
        leadTime: 1, 
        moq: 20, 
        supplier: 'JCC'
      }
    ];

    initialProducts.forEach(product => {
      const id = this.currentProductId++;
      this.products.set(id, {
        id,
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Product);
    });

    // Initialize contractors
    const initialContractors = [
      {
        name: 'The Market Design & Build',
        type: 'Design & Build',
        contact: 'James Mitchell',
        email: 'james@marketdb.co.uk',
        phone: '020 7123 4567',
        address: 'Chelsea, London',
        projectsActive: 3,
        projectsCompleted: 12,
        totalRevenue: '342000.00',
        avgProjectValue: '1850000.00',
        paymentTerms: 'Net 30',
        discountTier: 'Gold',
        status: 'active',
        notes: 'RIBA chartered, focuses on £250k-£3M projects',
        creditLimit: '500000.00',
        outstandingBalance: '48500.00'
      },
      {
        name: 'Prime London Developments',
        type: 'Developer',
        contact: 'Sarah Chen',
        email: 'sarah@primeld.com',
        phone: '020 7891 2345',
        address: 'Mayfair, London',
        projectsActive: 2,
        projectsCompleted: 8,
        totalRevenue: '218000.00',
        avgProjectValue: '2400000.00',
        paymentTerms: 'Net 45',
        discountTier: 'Silver',
        status: 'active',
        creditLimit: '750000.00',
        outstandingBalance: '0.00'
      }
    ];

    initialContractors.forEach(contractor => {
      const id = this.currentContractorId++;
      this.contractors.set(id, {
        id,
        ...contractor,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Contractor);
    });

    // Initialize suppliers
    const initialSuppliers = [
      { name: 'Lusso Stone', leadTime: 3, reliability: 95, paymentTerms: 'Net 60' },
      { name: 'Häcker', leadTime: 6, reliability: 98, paymentTerms: 'Net 45' },
      { name: 'Control4', leadTime: 4, reliability: 92, paymentTerms: 'Net 30' }
    ];

    initialSuppliers.forEach(supplier => {
      const id = this.currentSupplierId++;
      this.suppliers.set(id, {
        id,
        ...supplier,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Supplier);
    });
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct: Product = {
      id,
      ...product,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    
    const updated: Product = {
      ...existing,
      ...product,
      updatedAt: new Date()
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Contractors
  async getContractors(): Promise<Contractor[]> {
    return Array.from(this.contractors.values());
  }

  async getContractor(id: number): Promise<Contractor | undefined> {
    return this.contractors.get(id);
  }

  async createContractor(contractor: InsertContractor): Promise<Contractor> {
    const id = this.currentContractorId++;
    const newContractor: Contractor = {
      id,
      ...contractor,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.contractors.set(id, newContractor);
    return newContractor;
  }

  async updateContractor(id: number, contractor: Partial<InsertContractor>): Promise<Contractor | undefined> {
    const existing = this.contractors.get(id);
    if (!existing) return undefined;
    
    const updated: Contractor = {
      ...existing,
      ...contractor,
      updatedAt: new Date()
    };
    this.contractors.set(id, updated);
    return updated;
  }

  async deleteContractor(id: number): Promise<boolean> {
    return this.contractors.delete(id);
  }

  // Quotes
  async getQuotes(): Promise<Quote[]> {
    return Array.from(this.quotes.values());
  }

  async getQuote(id: number): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const id = this.currentQuoteId++;
    const newQuote: Quote = {
      id,
      ...quote,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.quotes.set(id, newQuote);
    return newQuote;
  }

  async updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined> {
    const existing = this.quotes.get(id);
    if (!existing) return undefined;
    
    const updated: Quote = {
      ...existing,
      ...quote,
      updatedAt: new Date()
    };
    this.quotes.set(id, updated);
    return updated;
  }

  async deleteQuote(id: number): Promise<boolean> {
    return this.quotes.delete(id);
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const newOrder: Order = {
      id,
      ...order,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;
    
    const updated: Order = {
      ...existing,
      ...order,
      updatedAt: new Date()
    };
    this.orders.set(id, updated);
    return updated;
  }

  async deleteOrder(id: number): Promise<boolean> {
    return this.orders.delete(id);
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const id = this.currentSupplierId++;
    const newSupplier: Supplier = {
      id,
      ...supplier,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.suppliers.set(id, newSupplier);
    return newSupplier;
  }

  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const existing = this.suppliers.get(id);
    if (!existing) return undefined;
    
    const updated: Supplier = {
      ...existing,
      ...supplier,
      updatedAt: new Date()
    };
    this.suppliers.set(id, updated);
    return updated;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    return this.suppliers.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  // Contractors
  async getContractors(): Promise<Contractor[]> {
    return await db.select().from(contractors);
  }

  async getContractor(id: number): Promise<Contractor | undefined> {
    const [contractor] = await db.select().from(contractors).where(eq(contractors.id, id));
    return contractor;
  }

  async createContractor(contractor: InsertContractor): Promise<Contractor> {
    const [newContractor] = await db.insert(contractors).values(contractor).returning();
    return newContractor;
  }

  async updateContractor(id: number, contractor: Partial<InsertContractor>): Promise<Contractor | undefined> {
    const [updated] = await db
      .update(contractors)
      .set({ ...contractor, updatedAt: new Date() })
      .where(eq(contractors.id, id))
      .returning();
    return updated;
  }

  async deleteContractor(id: number): Promise<boolean> {
    const result = await db.delete(contractors).where(eq(contractors.id, id));
    return result.rowCount > 0;
  }

  // Quotes
  async getQuotes(): Promise<Quote[]> {
    return await db.select().from(quotes);
  }

  async getQuote(id: number): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [newQuote] = await db.insert(quotes).values(quote).returning();
    return newQuote;
  }

  async updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined> {
    const [updated] = await db
      .update(quotes)
      .set({ ...quote, updatedAt: new Date() })
      .where(eq(quotes.id, id))
      .returning();
    return updated;
  }

  async deleteQuote(id: number): Promise<boolean> {
    const result = await db.delete(quotes).where(eq(quotes.id, id));
    return result.rowCount > 0;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async deleteOrder(id: number): Promise<boolean> {
    const result = await db.delete(orders).where(eq(orders.id, id));
    return result.rowCount > 0;
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers);
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [updated] = await db
      .update(suppliers)
      .set({ ...supplier, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning();
    return updated;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    const result = await db.delete(suppliers).where(eq(suppliers.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
