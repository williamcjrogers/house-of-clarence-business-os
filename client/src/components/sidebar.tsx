import { 
  BarChart3, Package, Users, FileText, ShoppingCart, 
  Truck, TrendingUp, BookOpen, Palette, Globe, Target
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "catalogue", label: "Catalogue", icon: BookOpen },
    { id: "moodboard", label: "Mood Board", icon: Palette },
    { id: "webscraper", label: "Web Scraper", icon: Globe },
    { id: "products", label: "Products", icon: Package },
    { id: "contractors", label: "Contractors", icon: Users },
    { id: "quotes", label: "Quotes", icon: FileText },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "suppliers", label: "Suppliers", icon: Truck },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "strategy", label: "Strategy", icon: Target },
  ];

  return (
    <div className="hidden lg:flex w-64 bg-hoc-warm-white shadow-xl border-r border-hoc-stone flex-col">
      {/* Enhanced Logo/Brand */}
      <div className="p-6 border-b border-hoc-stone bg-gradient-hoc-subtle">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-hoc-primary rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-hoc-warm-white font-bold text-xl font-luxury">HC</span>
          </div>
          <div>
            <h1 className="font-bold text-xl text-hoc-dark-charcoal font-luxury text-shadow-luxury">House of Clarence</h1>
            <p className="text-sm text-hoc-bronze font-medium">Business OS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl font-medium transition-all duration-200 ${
                activeTab === item.id 
                  ? "bg-gradient-hoc-primary text-hoc-warm-white shadow-lg transform scale-[0.98]" 
                  : "hover:bg-hoc-cream text-hoc-charcoal hover:shadow-md hover:transform hover:scale-[0.99]"
              }`}
            >
              <Icon className={`w-5 h-5 ${activeTab === item.id ? 'text-hoc-gold' : ''}`} />
              <span className="font-luxury">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-hoc-stone bg-gradient-hoc-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-hoc-accent rounded-full flex items-center justify-center shadow-md">
            <span className="text-hoc-dark-charcoal font-semibold text-sm font-luxury">AU</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-hoc-dark-charcoal font-luxury">Admin User</p>
            <p className="text-xs text-hoc-bronze">admin@houseofclarence.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
