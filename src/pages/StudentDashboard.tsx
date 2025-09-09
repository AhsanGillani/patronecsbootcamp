import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { LogOut, Home, User, BookOpen, Menu } from "lucide-react";

// Import all student components
import { StudentHome } from "@/components/student/StudentHome";
import { StudentCourses } from "@/components/student/StudentCourses";
import { StudentLearning } from "@/components/student/StudentLearning";
import { StudentCertificates } from "@/components/student/StudentCertificates";
import { StudentFeedback } from "@/components/student/StudentFeedback";
import { StudentProfile } from "@/components/student/StudentProfile";

export default function StudentDashboard() {
  const { user, profile, signOut, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "home";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sync activeTab with URL search param
  useEffect(() => {
    const tab = searchParams.get("tab") || "home";
    if (tab !== activeTab) setActiveTab(tab);
  }, [searchParams, activeTab]);

  // Redirect if not authenticated or not a student
  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">
            Loading Student Dashboard...
          </p>
          <p className="text-slate-500 text-sm mt-2">
            This may take a few seconds
          </p>

          {/* Debug info - only show in development */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-3 bg-slate-100 rounded-lg text-left text-xs">
              <p>
                <strong>Debug Info:</strong>
              </p>
              <p>User: {user ? "Yes" : "No"}</p>
              <p>Profile: {profile ? "Yes" : "No"}</p>
              <p>Loading: {loading ? "Yes" : "No"}</p>
              <p>Profile Role: {profile?.role || "None"}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Check if user is a student only after profile is loaded
  if (!user || profile.role !== "student") {
    console.log(
      "User is not a student, redirecting to auth. Profile:",
      profile
    );
    return <Navigate to="/auth" replace />;
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const getComponent = () => {
    switch (activeTab) {
      case "home":
        return <StudentHome />;
      case "courses":
        return <StudentCourses />;
      case "learning":
        return <StudentLearning />;
      case "certificates":
        return <StudentCertificates />;
      case "profile":
        return <StudentProfile />;
      default:
        return <StudentHome />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "home":
        return "Dashboard";
      case "courses":
        return "My Courses";
      case "learning":
        return "Continue Learning";
      case "certificates":
        return "My Certificates";
      case "profile":
        return "Profile & Settings";
      default:
        return "Dashboard";
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <StudentSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        studentName={profile.full_name}
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
                  <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg md:text-2xl font-bold text-slate-900">
                    {getPageTitle()}
                  </h1>
                  <p className="text-sm md:text-base text-slate-600">
                    Welcome back,{" "}
                    <span className="font-semibold text-slate-900">
                      {profile.full_name}
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
                onClick={handleSignOut}
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
