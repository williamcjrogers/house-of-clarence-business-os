import { useState } from "react";
import { Search, Plus, Edit, Trash2, Users, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useBusinessData } from "@/hooks/use-business-data";

export default function ContractorManagement() {
  const { contractors } = useBusinessData();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContractors = contractors.data?.filter(contractor =>
    contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contractor.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contractor.contact?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Contractor Management</h2>
            <p className="text-sm text-neutral-500 mt-1">Manage your contractor relationships and projects</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Contractor
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search contractors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Contractor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredContractors.map(contractor => {
          const creditUtilization = parseFloat(contractor.outstandingBalance || "0") / parseFloat(contractor.creditLimit || "1") * 100;
          const isHighRisk = creditUtilization > 80;
          
          return (
            <div key={contractor.id} className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {contractor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{contractor.name}</h3>
                    <p className="text-sm text-neutral-500">{contractor.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={contractor.status === "active" ? "default" : "secondary"}>
                    {contractor.status}
                  </Badge>
                  <Badge variant={contractor.discountTier === "Gold" ? "default" : "secondary"}>
                    {contractor.discountTier}
                  </Badge>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2 mb-4">
                {contractor.contact && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-neutral-400" />
                    <span>{contractor.contact}</span>
                  </div>
                )}
                {contractor.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-neutral-400" />
                    <span>{contractor.email}</span>
                  </div>
                )}
                {contractor.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-neutral-400" />
                    <span>{contractor.phone}</span>
                  </div>
                )}
                {contractor.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-neutral-400" />
                    <span>{contractor.address}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">{contractor.projectsActive}</p>
                  <p className="text-xs text-neutral-500">Active Projects</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">{contractor.projectsCompleted}</p>
                  <p className="text-xs text-neutral-500">Completed</p>
                </div>
              </div>

              {/* Financial Info */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Total Revenue:</span>
                  <span className="font-semibold">£{parseFloat(contractor.totalRevenue || "0").toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Outstanding:</span>
                  <span className={`font-semibold ${isHighRisk ? 'text-red-600' : 'text-neutral-900'}`}>
                    £{parseFloat(contractor.outstandingBalance || "0").toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Credit Available:</span>
                  <span className="font-semibold text-green-600">
                    £{(parseFloat(contractor.creditLimit || "0") - parseFloat(contractor.outstandingBalance || "0")).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="mb-4">
                <Badge variant="outline" className="text-xs">
                  {contractor.paymentTerms}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  View Projects
                </Button>
              </div>

              {/* Risk Warning */}
              {isHighRisk && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                  High credit utilization ({creditUtilization.toFixed(0)}%)
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredContractors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-neutral-200">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">No contractors found</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your search or add a new contractor</p>
        </div>
      )}
    </div>
  );
}
