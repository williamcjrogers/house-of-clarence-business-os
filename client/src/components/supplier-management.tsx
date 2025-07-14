import { useState } from "react";
import { Search, Plus, Truck, Clock, Star, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useBusinessData } from "@/hooks/use-business-data";

export default function SupplierManagement() {
  const { suppliers } = useBusinessData();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSuppliers = suppliers.data?.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 95) return "text-green-600";
    if (reliability >= 90) return "text-yellow-600";
    return "text-red-600";
  };

  const getReliabilityBadge = (reliability: number) => {
    if (reliability >= 95) return "bg-green-100 text-green-800";
    if (reliability >= 90) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Supplier Management</h2>
            <p className="text-sm text-neutral-500 mt-1">Manage your supplier relationships and performance</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSuppliers.map(supplier => (
          <div key={supplier.id} className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{supplier.name}</h3>
                  <p className="text-sm text-neutral-500">{supplier.paymentTerms}</p>
                </div>
              </div>
              <Badge className={getReliabilityBadge(supplier.reliability)}>
                {supplier.reliability}% reliable
              </Badge>
            </div>

            {/* Contact Information */}
            <div className="space-y-2 mb-4">
              {supplier.contact && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <span>{supplier.contact}</span>
                </div>
              )}
              {supplier.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <span>{supplier.email}</span>
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span>{supplier.phone}</span>
                </div>
              )}
              {supplier.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-neutral-400" />
                  <span>{supplier.address}</span>
                </div>
              )}
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  <span className="text-2xl font-bold text-neutral-900">{supplier.leadTime}</span>
                </div>
                <p className="text-xs text-neutral-500">Lead Time (weeks)</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className={`w-4 h-4 ${getReliabilityColor(supplier.reliability)}`} />
                  <span className={`text-2xl font-bold ${getReliabilityColor(supplier.reliability)}`}>
                    {supplier.reliability}%
                  </span>
                </div>
                <p className="text-xs text-neutral-500">Reliability</p>
              </div>
            </div>

            {/* Notes */}
            {supplier.notes && (
              <div className="mb-4">
                <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg">
                  {supplier.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                Edit
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                View Products
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-neutral-200">
          <Truck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">No suppliers found</p>
          <p className="text-sm text-gray-500 mt-2">Add your first supplier to get started</p>
        </div>
      )}
    </div>
  );
}
