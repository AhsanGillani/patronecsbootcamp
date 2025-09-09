import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { LogOut, Home, Shield, Crown, Menu } from "lucide-react";

// Import all admin components
import UserManagement from "@/components/admin/UserManagement";
import InstructorControl from "@/components/admin/InstructorControl";
import CourseModeration from "@/components/admin/CourseModeration";
import BlogModeration from "@/components/admin/BlogModeration";
import CategoryManagement from "@/components/admin/CategoryManagement";
import CMSControl from "@/components/admin/CMSControl";
import Analytics from "@/components/admin/Analytics";
import Announcements from "@/components/admin/Announcements";
import StudentProgress from "@/components/admin/StudentProgress";

export default function AdminDashboard() {
  const { isAdmin, signOut, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">
            Loading Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  const getComponent = () => {
    switch (activeTab) {
      case "users":
        return <UserManagement />;
      case "instructors":
        return <InstructorControl />;
      case "courses":
        return <CourseModeration />;
      case "blogs":
        return <BlogModeration />;
      case "categories":
        return <CategoryManagement />;
      case "cms":
        return <CMSControl />;
      case "analytics":
        return <Analytics />;
      case "student-progress":
        return <StudentProgress />;
      case "announcements":
        return <Announcements />;
      default:
        return <UserManagement />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "users":
        return "User Management";
      case "instructors":
        return "Instructor Control";
      case "courses":
        return "Course Moderation";
      case "blogs":
        return "Blog Moderation";
      case "categories":
        return "Category Management";
      case "cms":
        return "CMS Control";
      case "analytics":
        return "Analytics Dashboard";
      case "student-progress":
        return "Student Progress";
      case "announcements":
        return "Announcements";
      default:
        return "Dashboard";
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 md:h-20 border-b border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="h-full px-4 md:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden h-8 w-8 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Shield className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg md:text-2xl font-bold text-slate-900">
                    {getPageTitle()}
                  </h1>
                  <p className="text-sm md:text-base text-slate-600">
                    Welcome back,{" "}
                    <span className="font-semibold text-slate-900">
                      {profile?.full_name}
                    </span>
                  </p>
                </div>
                <div className="sm:hidden">
                  <h1 className="text-lg font-bold text-slate-900">
                    {getPageTitle()}
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="hidden md:block">
                <NotificationBell />
              </div>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="hidden sm:flex space-x-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
              <Button
                variant="outline"
                onClick={signOut}
                className="space-x-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg">
              <div className="p-4 md:p-8">{getComponent()}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
