import { useQuery } from "@tanstack/react-query";
import type { Product, Contractor, Quote, Order, Supplier } from "@shared/schema";
import { sampleProducts, sampleContractors, sampleQuotes, sampleOrders, sampleSuppliers } from "../data/sample-data";

// Fallback data service for when API is not available
async function fetchWithFallback<T>(url: string, fallbackData: T): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`API endpoint ${url} failed, using fallback data:`, error);
    return fallbackData;
  }
}

export function useBusinessData() {
  const products = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: () => fetchWithFallback("/api/products", sampleProducts),
  });

  const contractors = useQuery<Contractor[]>({
    queryKey: ["/api/contractors"],
    queryFn: () => fetchWithFallback("/api/contractors", sampleContractors),
  });

  const quotes = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
    queryFn: () => fetchWithFallback("/api/quotes", sampleQuotes),
  });

  const orders = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    queryFn: () => fetchWithFallback("/api/orders", sampleOrders),
  });

  const suppliers = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
    queryFn: () => fetchWithFallback("/api/suppliers", sampleSuppliers),
  });

  return {
    products,
    contractors,
    quotes,
    orders,
    suppliers,
  };
}
