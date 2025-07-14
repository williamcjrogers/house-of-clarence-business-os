import { useState } from "react";
import { Search, Plus, ShoppingCart, Calendar, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useBusinessData } from "@/hooks/use-business-data";

export default function OrderManagement() {
  const { orders } = useBusinessData();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.data?.filter(order =>
    order.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-green-100 text-green-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Order Management</h2>
            <p className="text-sm text-neutral-500 mt-1">Track and manage your orders and deliveries</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Order
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                  <p className="text-sm text-neutral-600">{order.projectName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[order.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
                    {order.status}
                  </Badge>
                  <span className="text-lg font-bold">£{parseFloat(order.total).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-600">
                    Created: {new Date(order.createdAt || "").toLocaleDateString()}
                  </span>
                </div>
                {order.deliveryDate && (
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-600">
                      Delivery: {new Date(order.deliveryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-600">
                    Items: {Array.isArray(order.items) ? order.items.length : 0}
                  </span>
                </div>
              </div>

              {order.notes && (
                <div className="mb-4">
                  <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg">
                    {order.notes}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  Edit Order
                </Button>
                <Button variant="outline" size="sm">
                  Track Delivery
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-neutral-200">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">No orders found</p>
            <p className="text-sm text-gray-500 mt-2">Create your first order to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
