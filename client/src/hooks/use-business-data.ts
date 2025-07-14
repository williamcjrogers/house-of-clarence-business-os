import { useQuery } from "@tanstack/react-query";
import type { Product, Contractor, Quote, Order, Supplier } from "@shared/schema";

export function useBusinessData() {
  const products = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const contractors = useQuery<Contractor[]>({
    queryKey: ["/api/contractors"],
  });

  const quotes = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
  });

  const orders = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const suppliers = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  return {
    products,
    contractors,
    quotes,
    orders,
    suppliers,
  };
}
