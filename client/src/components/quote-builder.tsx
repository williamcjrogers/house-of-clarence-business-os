import { useState } from "react";
import { X, Plus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBusinessData } from "@/hooks/use-business-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuoteBuilderProps {
  onClose: () => void;
}

interface QuoteItem {
  productId: number;
  quantity: number;
  customPrice?: number;
}

export default function QuoteBuilder({ onClose }: QuoteBuilderProps) {
  const { products, contractors } = useBusinessData();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [projectName, setProjectName] = useState("");
  const [contractorId, setContractorId] = useState<number | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [expiryDays, setExpiryDays] = useState(30);

  const createQuoteMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      const response = await apiRequest("POST", "/api/quotes", quoteData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: "Success",
        description: "Quote created successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create quote",
        variant: "destructive",
      });
    },
  });

  const addItem = () => {
    if (products.data && products.data.length > 0) {
      setItems([...items, { productId: products.data[0].id, quantity: 1 }]);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotals = () => {
    if (!products.data) return { subtotal: 0, total: 0, ukTotal: 0, savings: 0 };
    
    const subtotal = items.reduce((sum, item) => {
      const product = products.data.find(p => p.id === item.productId);
      if (!product) return sum;
      const price = item.customPrice || parseFloat(product.hocPrice);
      return sum + (price * item.quantity);
    }, 0);

    const ukTotal = items.reduce((sum, item) => {
      const product = products.data.find(p => p.id === item.productId);
      if (!product) return sum;
      return sum + (parseFloat(product.ukPrice) * item.quantity);
    }, 0);

    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;
    const savings = ukTotal - total;

    return { subtotal, total, ukTotal, savings };
  };

  const handleSubmit = () => {
    if (!projectName || !contractorId || items.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const totals = calculateTotals();
    const quoteNumber = `Q${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const expiryDate = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();

    const quoteData = {
      quoteNumber,
      projectName,
      contractorId,
      expiryDate,
      items: JSON.stringify(items),
      notes,
      discount: discount.toString(),
      subtotal: totals.subtotal.toString(),
      total: totals.total.toString(),
      status: "draft",
      accepted: false,
    };

    createQuoteMutation.mutate(quoteData);
  };

  const totals = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Create New Quote</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          {/* Quote Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>
            <div>
              <Label htmlFor="contractor">Contractor</Label>
              <Select value={contractorId?.toString()} onValueChange={(value) => setContractorId(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contractor" />
                </SelectTrigger>
                <SelectContent>
                  {contractors.data?.map(contractor => (
                    <SelectItem key={contractor.id} value={contractor.id.toString()}>
                      {contractor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quote Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Quote Items</Label>
              <Button onClick={addItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item, index) => {
                  const product = products.data?.find(p => p.id === item.productId);
                  return (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <Select 
                          value={item.productId.toString()} 
                          onValueChange={(value) => updateItem(index, "productId", parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {products.data?.map(product => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.specs} - £{parseFloat(product.hocPrice).toLocaleString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                          min="1"
                          placeholder="Qty"
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          value={item.customPrice || ""}
                          onChange={(e) => updateItem(index, "customPrice", parseFloat(e.target.value) || undefined)}
                          placeholder={`£${product ? parseFloat(product.hocPrice) : 0}`}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">No items added yet</p>
                <p className="text-sm text-gray-500 mt-2">Click "Add Item" to start building your quote</p>
              </div>
            )}
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="discount">Additional Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                min="0"
                max="20"
              />
            </div>
            <div>
              <Label htmlFor="expiryDays">Expiry (days)</Label>
              <Input
                id="expiryDays"
                type="number"
                value={expiryDays}
                onChange={(e) => setExpiryDays(parseInt(e.target.value) || 30)}
                min="1"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special requirements or notes..."
              rows={3}
            />
          </div>

          {/* Quote Summary */}
          {items.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Quote Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal (HOC Prices)</span>
                  <span>£{totals.subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Additional Discount ({discount}%)</span>
                    <span>-£{(totals.subtotal * (discount / 100)).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>£{totals.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>UK Retail Value</span>
                  <span className="line-through">£{totals.ukTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Customer Saves</span>
                  <span>£{totals.savings.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createQuoteMutation.isPending || !projectName || !contractorId || items.length === 0}
          >
            {createQuoteMutation.isPending ? "Creating..." : "Create Quote"}
          </Button>
        </div>
      </div>
    </div>
  );
}
