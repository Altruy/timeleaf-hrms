
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { LucideIcon, BarChart2, Calendar, Clock, Home, Users, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem = ({ icon: Icon, label, href, active }: SidebarItemProps) => {
  return (
    <Link 
      to={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        active 
          ? "bg-hrms-primary text-white"
          : "text-gray-700 hover:bg-hrms-primary/10"
      )}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const sidebarItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: Clock, label: "Attendance", href: "/attendance" },
    { icon: BarChart2, label: "Projects", href: "/projects" },
    { icon: Calendar, label: "Schedule", href: "/schedule" },
    { icon: Users, label: "Team", href: "/team" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];
  
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64 py-6">
      <div className="px-4 mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-hrms-primary">
          <img 
            src="/lovable-uploads/4260d4a1-190f-4554-80a3-c86d5c95e013.png" 
            alt="TimeLeaf Logo" 
            className="w-8 h-8"
          />
          TimeLeaf
        </h1>
      </div>
      
      <div className="flex-1 px-3 space-y-1">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={currentPath === item.href}
          />
        ))}
      </div>
      
      <div className="px-3 mt-6 border-t border-gray-200 pt-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
