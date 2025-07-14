import { 
  BarChart3, Package, Users, FileText, ShoppingCart, 
  Truck, TrendingUp
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "products", label: "Products", icon: Package },
    { id: "contractors", label: "Contractors", icon: Users },
    { id: "quotes", label: "Quotes", icon: FileText },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "suppliers", label: "Suppliers", icon: Truck },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-neutral-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">HC</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-neutral-800">House of Clarence</h1>
            <p className="text-sm text-neutral-500">Business OS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg font-medium transition-colors ${
                activeTab === item.id 
                  ? "bg-primary text-white" 
                  : "hover:bg-neutral-100 text-neutral-700"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">AU</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-neutral-800">Admin User</p>
            <p className="text-xs text-neutral-500">admin@houseofclarence.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
