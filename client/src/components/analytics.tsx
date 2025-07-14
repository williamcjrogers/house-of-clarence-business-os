import { BarChart3, TrendingUp, PieChart, Calendar } from "lucide-react";
import { useBusinessData } from "@/hooks/use-business-data";

export default function Analytics() {
  const { products, contractors, quotes, orders } = useBusinessData();

  // Calculate analytics
  const totalProducts = products.data?.length || 0;
  const totalContractors = contractors.data?.length || 0;
  const totalQuotes = quotes.data?.length || 0;
  const totalOrders = orders.data?.length || 0;

  const avgMargin = products.data?.reduce((sum, p) => {
    const margin = ((parseFloat(p.ukPrice) - parseFloat(p.hocPrice)) / parseFloat(p.ukPrice)) * 100;
    return sum + margin;
  }, 0) / totalProducts || 0;

  const totalRevenue = contractors.data?.reduce((sum, c) => sum + parseFloat(c.totalRevenue || "0"), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Analytics & Insights</h2>
          <p className="text-sm text-neutral-500 mt-1">Business performance and data insights</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-green-600">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">£{(totalRevenue / 1000).toFixed(0)}k</h3>
          <p className="text-sm text-neutral-600 mt-1">Total Revenue</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-neutral-600">{avgMargin.toFixed(1)}%</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">{totalProducts}</h3>
          <p className="text-sm text-neutral-600 mt-1">Active Products</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <PieChart className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-neutral-600">85% rate</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">{totalQuotes}</h3>
          <p className="text-sm text-neutral-600 mt-1">Quotes Generated</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-neutral-600">+8%</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">{totalOrders}</h3>
          <p className="text-sm text-neutral-600 mt-1">Orders Processed</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
          <div className="h-64 bg-neutral-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">Revenue chart visualization</p>
              <p className="text-xs text-neutral-400">Monthly and quarterly trends</p>
            </div>
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
          <div className="h-64 bg-neutral-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">Category breakdown</p>
              <p className="text-xs text-neutral-400">Sales by product category</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{avgMargin.toFixed(1)}%</p>
            <p className="text-sm text-neutral-600">Average Margin</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{totalContractors}</p>
            <p className="text-sm text-neutral-600">Active Contractors</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {totalQuotes > 0 ? (100).toFixed(0) : 0}%
            </p>
            <p className="text-sm text-neutral-600">Quote Acceptance Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
