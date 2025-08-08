import { NavLink, useLocation } from "react-router-dom";
import { 
  Users, 
  BookOpen, 
  FileText, 
  BarChart3, 
  Megaphone, 
  FolderOpen, 
  Settings,
  Shield
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { id: 'users', title: 'User Management', url: '/admin?tab=users', icon: Users },
  { id: 'courses', title: 'Course Moderation', url: '/admin?tab=courses', icon: BookOpen },
  { id: 'blogs', title: 'Blog Moderation', url: '/admin?tab=blogs', icon: FileText },
  { id: 'categories', title: 'Categories', url: '/admin?tab=categories', icon: FolderOpen },
  { id: 'instructors', title: 'Instructor Control', url: '/admin?tab=instructors', icon: Shield },
  { id: 'analytics', title: 'Analytics', url: '/admin?tab=analytics', icon: BarChart3 },
  { id: 'announcements', title: 'Announcements', url: '/admin?tab=announcements', icon: Megaphone },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const getNavClass = (itemId: string) =>
    activeTab === itemId 
      ? "bg-primary text-primary-foreground font-medium shadow-sm" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card border-r">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-semibold text-foreground">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Management Dashboard</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="px-2 py-4">
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Management Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    asChild 
                    className={`${getNavClass(item.id)} rounded-lg transition-all duration-200`}
                  >
                    <button
                      onClick={() => onTabChange(item.id)}
                      className="w-full flex items-center justify-start"
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && <span className="ml-3 truncate">{item.title}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}