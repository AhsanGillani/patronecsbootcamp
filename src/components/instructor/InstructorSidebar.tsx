import { 
  User, 
  BookOpen, 
  PlaySquare, 
  Brain, 
  BarChart3, 
  FileText, 
  Bell,
  GraduationCap
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
  { id: 'profile', title: 'Profile', url: '/instructor?tab=profile', icon: User },
  { id: 'courses', title: 'My Courses', url: '/instructor?tab=courses', icon: BookOpen },
  { id: 'lessons', title: 'Lessons', url: '/instructor?tab=lessons', icon: PlaySquare },
  { id: 'quizzes', title: 'Quizzes', url: '/instructor?tab=quizzes', icon: Brain },
  { id: 'submissions', title: 'Submitted Quizzes', url: '/instructor?tab=submissions', icon: FileText },
  { id: 'insights', title: 'Course Insights', url: '/instructor?tab=insights', icon: BarChart3 },
  { id: 'blogs', title: 'Blog Manager', url: '/instructor?tab=blogs', icon: FileText },
  { id: 'notifications', title: 'Notifications', url: '/instructor?tab=notifications', icon: Bell },
];

interface InstructorSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  instructorName?: string;
}

export function InstructorSidebar({ activeTab, onTabChange, instructorName }: InstructorSidebarProps) {
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
                <h2 className="font-semibold text-foreground">Instructor Panel</h2>
                <p className="text-xs text-muted-foreground">Teaching Dashboard</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="px-2 py-4">
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Teaching Tools
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