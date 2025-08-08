import { 
  BookOpen, 
  User, 
  Play, 
  Award, 
  MessageSquare, 
  Settings,
  GraduationCap,
  Home
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
  { id: 'home', title: 'Dashboard', url: '/student?tab=home', icon: Home },
  { id: 'courses', title: 'My Courses', url: '/student?tab=courses', icon: BookOpen },
  { id: 'learning', title: 'Continue Learning', url: '/student?tab=learning', icon: Play },
  { id: 'certificates', title: 'Certificates', url: '/student?tab=certificates', icon: Award },
  { id: 'feedback', title: 'Course Feedback', url: '/student?tab=feedback', icon: MessageSquare },
  { id: 'profile', title: 'Profile & Settings', url: '/student?tab=profile', icon: User },
];

interface StudentSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  studentName?: string;
}

export function StudentSidebar({ activeTab, onTabChange, studentName }: StudentSidebarProps) {
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
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-semibold text-foreground">Student Portal</h2>
                <p className="text-xs text-muted-foreground">Learning Dashboard</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="px-2 py-4">
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Learning Hub
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