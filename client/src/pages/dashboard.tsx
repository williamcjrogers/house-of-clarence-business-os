import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { useBusinessData } from "@/hooks/use-business-data";
import { 
  PoundSterling, Users, Target, FileText, ArrowUp, 
  Zap, TrendingUp, Clock, CheckCircle, Plus, UserPlus,
  BarChart3, Package, Search, Bell, MessageCircle, Upload, Palette, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ProductCatalog from "@/components/product-catalog";
import ContractorManagement from "@/components/contractor-management";
import QuoteBuilder from "@/components/quote-builder";
import OrderManagement from "@/components/order-management";
import SupplierManagement from "@/components/supplier-management";
import Analytics from "@/components/analytics";
import AIChat from "@/components/ai-chat";
import ExcelUpload from "@/components/excel-upload";
import Catalogue from "@/components/catalogue";
import MoodBoardAnalyzer from "@/components/mood-board-analyzer";
import VictorianReferenceManager from "@/components/victorian-reference-manager";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [showMoodBoardAnalyzer, setShowMoodBoardAnalyzer] = useState(false);
  const [showVictorianReferences, setShowVictorianReferences] = useState(false);
  const { products, contractors, quotes, orders, suppliers } = useBusinessData();

  // Calculate KPIs
  const totalRevenue = contractors.data?.reduce((sum, c) => sum + parseFloat(c.totalRevenue || "0"), 0) || 0;
  const activeProjects = contractors.data?.reduce((sum, c) => sum + (c.projectsActive || 0), 0) || 0;
  const avgMargin = products.data?.reduce((sum, p) => {
    const margin = ((parseFloat(p.ukPrice) - parseFloat(p.hocPrice)) / parseFloat(p.ukPrice)) * 100;
    return sum + margin;
  }, 0) / (products.data?.length || 1) || 0;
  const pendingQuotes = quotes.data?.filter(q => q.status === "sent").length || 0;

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-neutral-200 px-8 py-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Dashboard</h2>
            <p className="text-sm text-neutral-500 mt-1">Welcome back, here's your business overview</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowQuoteBuilder(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Quote
            </Button>
            <Button
              onClick={() => setShowExcelUpload(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Excel
            </Button>
            <Button
              onClick={() => setShowMoodBoardAnalyzer(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Palette className="w-4 h-4" />
              Mood Board
            </Button>
            <Button
              onClick={() => setShowVictorianReferences(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Victorian Refs
            </Button>
            <Button variant="outline" size="icon">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowAIChat(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none hover:from-blue-600 hover:to-purple-600"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <PoundSterling className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-green-600 flex items-center">
              <ArrowUp className="w-4 h-4 mr-1" />
              23%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">£{(totalRevenue / 1000).toFixed(0)}k</h3>
          <p className="text-sm text-neutral-600 mt-1">YTD Revenue</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-neutral-600">{avgMargin.toFixed(1)}%</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">{activeProjects}</h3>
          <p className="text-sm text-neutral-600 mt-1">Active Projects</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-neutral-600">85% active</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">{contractors.data?.length || 0}</h3>
          <p className="text-sm text-neutral-600 mt-1">Contractors</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-orange-600">{pendingQuotes} pending</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">{quotes.data?.length || 0}</h3>
          <p className="text-sm text-neutral-600 mt-1">Total Quotes</p>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Products */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
            Top Products
            <Zap className="w-5 h-5 text-yellow-500" />
          </h3>
          <div className="space-y-4">
            {products.data?.slice(0, 3).map((product, idx) => {
              const margin = ((parseFloat(product.ukPrice) - parseFloat(product.hocPrice)) / parseFloat(product.ukPrice)) * 100;
              return (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-neutral-500">#{idx + 1}</span>
                    <div>
                      <p className="font-medium text-sm">{product.specs}</p>
                      <p className="text-xs text-neutral-500">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">£{parseFloat(product.hocPrice).toLocaleString()}</p>
                    <p className="text-xs text-green-600">{margin.toFixed(0)}% margin</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contractor Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
            Contractor Performance
            <TrendingUp className="w-5 h-5 text-green-500" />
          </h3>
          <div className="space-y-4">
            {contractors.data?.map(contractor => (
              <div key={contractor.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {contractor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{contractor.name}</p>
                    <p className="text-xs text-neutral-500">{contractor.projectsActive} active projects</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">£{(parseFloat(contractor.totalRevenue || "0") / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-green-600">100% acceptance</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
            Recent Activity
            <Clock className="w-5 h-5 text-blue-500" />
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Quote Q2024-001 sent</p>
                <p className="text-xs text-neutral-500">13 Kewferry Drive project</p>
                <p className="text-xs text-neutral-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New product added</p>
                <p className="text-xs text-neutral-500">LED Spotlights catalog</p>
                <p className="text-xs text-neutral-400">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Contractor updated</p>
                <p className="text-xs text-neutral-500">Payment terms changed</p>
                <p className="text-xs text-neutral-400">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart & Quote Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
          <div className="h-64 bg-neutral-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">Chart visualization would be rendered here</p>
              <p className="text-xs text-neutral-400">Monthly revenue trends and projections</p>
            </div>
          </div>
        </div>

        {/* Active Quotes */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
            Active Quotes
            <Button variant="link" className="text-primary hover:text-blue-600 text-sm font-medium">
              View All
            </Button>
          </h3>
          <div className="space-y-4">
            {quotes.data?.length ? (
              quotes.data.slice(0, 2).map(quote => (
                <div key={quote.id} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">{quote.quoteNumber}</p>
                      <p className="text-xs text-neutral-500">{quote.projectName}</p>
                    </div>
                    <Badge variant={quote.status === "sent" ? "default" : "secondary"}>
                      {quote.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">
                      {contractors.data?.find(c => c.id === quote.contractorId)?.name || "Unknown"}
                    </span>
                    <span className="font-semibold">£{parseFloat(quote.total).toLocaleString()}</span>
                  </div>
                  <div className="mt-2 text-xs text-neutral-500">
                    Expires: {new Date(quote.expiryDate || "").toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <FileText className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No active quotes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Catalog Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Product Catalog</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 w-64"
                />
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="bathrooms">Bathrooms</SelectItem>
                  <SelectItem value="flooring">Flooring</SelectItem>
                  <SelectItem value="lighting">Lighting & Electrical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">HOC Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">UK Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Margin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Lead Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {products.data?.slice(0, 5).map(product => {
                const margin = ((parseFloat(product.ukPrice) - parseFloat(product.hocPrice)) / parseFloat(product.ukPrice)) * 100;
                return (
                  <tr key={product.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{product.specs}</p>
                        <p className="text-xs text-neutral-500">{product.type}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary">{product.category}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      £{parseFloat(product.hocPrice).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      £{parseFloat(product.ukPrice).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-green-600">{margin.toFixed(1)}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {product.leadTime} weeks
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="link" className="text-primary hover:text-blue-600 mr-3">
                        Edit
                      </Button>
                      <Button variant="link" className="text-secondary hover:text-green-600">
                        Add to Quote
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "catalogue":
        return <Catalogue />;
      case "moodboard":
        return (
          <div className="p-8">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Mood Board Analysis</h1>
                <p className="text-gray-600">Upload design inspiration images to find matching products from your catalogue</p>
              </div>
              <Button
                onClick={() => setShowMoodBoardAnalyzer(true)}
                size="lg"
                className="flex items-center gap-2"
              >
                <Palette className="h-5 w-5" />
                Start Analysis
              </Button>
            </div>
          </div>
        );
      case "products":
        return <ProductCatalog />;
      case "contractors":
        return <ContractorManagement />;
      case "quotes":
        return <div className="p-8">Quotes Management (Coming Soon)</div>;
      case "orders":
        return <OrderManagement />;
      case "suppliers":
        return <SupplierManagement />;
      case "analytics":
        return <Analytics />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen flex bg-neutral-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
      {showQuoteBuilder && (
        <QuoteBuilder onClose={() => setShowQuoteBuilder(false)} />
      )}
      <AIChat isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
      <ExcelUpload isOpen={showExcelUpload} onClose={() => setShowExcelUpload(false)} />
      <MoodBoardAnalyzer isOpen={showMoodBoardAnalyzer} onClose={() => setShowMoodBoardAnalyzer(false)} />
      <VictorianReferenceManager isOpen={showVictorianReferences} onClose={() => setShowVictorianReferences(false)} />
    </div>
  );
}
