import { useState } from "react";
import { Search, Upload, Clock, Package, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useBusinessData } from "@/hooks/use-business-data";

export default function ProductCatalog() {
  const { products } = useBusinessData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const filteredProducts = products.data?.filter(product => {
    const matchesSearch = product.specs.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || product.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = Array.from(new Set(products.data?.map(p => p.category) || []));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-hoc-warm-white rounded-2xl shadow-xl p-6 border border-hoc-stone bg-gradient-hoc-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-hoc-dark-charcoal font-luxury text-shadow-luxury">Product Catalog</h2>
            <p className="text-sm text-hoc-bronze mt-1 font-medium">Manage your luxury construction product inventory and pricing</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map(product => {
          const margin = ((parseFloat(product.ukPrice) - parseFloat(product.hocPrice)) / parseFloat(product.ukPrice)) * 100;
          const savings = parseFloat(product.ukPrice) - parseFloat(product.hocPrice);
          
          return (
            <div key={product.id} className="bg-white rounded-xl shadow-sm p-4 border border-neutral-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-medium text-neutral-500">{product.productCode}</span>
                <Badge variant={margin > 40 ? "default" : margin > 30 ? "secondary" : "outline"}>
                  {margin.toFixed(0)}% margin
                </Badge>
              </div>
              
              <h4 className="font-semibold text-sm mb-1">{product.specs}</h4>
              <p className="text-xs text-neutral-600 mb-3">{product.type} • {product.supplier}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">UK Price:</span>
                  <span className="line-through text-neutral-400">
                    £{parseFloat(product.ukPrice).toLocaleString()}{product.unit || ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">HOC Price:</span>
                  <span className="font-bold text-green-600">
                    £{parseFloat(product.hocPrice).toLocaleString()}{product.unit || ''}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">You save:</span>
                  <span className="font-medium text-green-600">£{savings.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2 text-xs text-neutral-500 mb-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {product.leadTime}w
                </span>
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  MOQ: {product.moq}
                </span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button size="sm" className="flex-1">
                  Add to Quote
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-neutral-200">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">No products found</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
