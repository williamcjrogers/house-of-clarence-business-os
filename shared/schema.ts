import { pgTable, text, serial, integer, boolean, decimal, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  productCode: varchar("product_code", { length: 10 }).notNull().unique(),
  category: varchar("category", { length: 50 }).notNull(),
  subCategory: varchar("sub_category", { length: 100 }),
  type: varchar("type", { length: 100 }).notNull(),
  specs: text("specs").notNull(),
  hocPrice: decimal("hoc_price", { precision: 10, scale: 2 }).notNull(),
  ukPrice: decimal("uk_price", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }),
  leadTime: integer("lead_time").notNull(),
  moq: integer("moq").notNull(),
  supplier: varchar("supplier", { length: 100 }).notNull(),
  link: text("link"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contractors = pgTable("contractors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  contact: varchar("contact", { length: 100 }),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  projectsActive: integer("projects_active").default(0),
  projectsCompleted: integer("projects_completed").default(0),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0"),
  avgProjectValue: decimal("avg_project_value", { precision: 12, scale: 2 }).default("0"),
  paymentTerms: varchar("payment_terms", { length: 50 }),
  discountTier: varchar("discount_tier", { length: 20 }),
  status: varchar("status", { length: 20 }).default("active"),
  notes: text("notes"),
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }).default("0"),
  outstandingBalance: decimal("outstanding_balance", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  quoteNumber: varchar("quote_number", { length: 50 }).notNull().unique(),
  projectName: varchar("project_name", { length: 200 }).notNull(),
  contractorId: integer("contractor_id").references(() => contractors.id),
  createdDate: timestamp("created_date").defaultNow(),
  expiryDate: timestamp("expiry_date"),
  status: varchar("status", { length: 20 }).default("draft"),
  items: jsonb("items").notNull(),
  notes: text("notes"),
  discount: decimal("discount", { precision: 5, scale: 2 }).default("0"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  accepted: boolean("accepted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  quoteId: integer("quote_id").references(() => quotes.id),
  contractorId: integer("contractor_id").references(() => contractors.id),
  projectName: varchar("project_name", { length: 200 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  items: jsonb("items").notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  deliveryDate: timestamp("delivery_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  leadTime: integer("lead_time").notNull(),
  reliability: integer("reliability").notNull(),
  paymentTerms: varchar("payment_terms", { length: 50 }),
  contact: varchar("contact", { length: 100 }),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContractorSchema = createInsertSchema(contractors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Contractor = typeof contractors.$inferSelect;
export type InsertContractor = z.infer<typeof insertContractorSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
