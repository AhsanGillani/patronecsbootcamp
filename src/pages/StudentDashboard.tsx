import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { LogOut, Home } from "lucide-react";

// Import all student components
import { StudentHome } from "@/components/student/StudentHome";
import { StudentCourses } from "@/components/student/StudentCourses";
import { StudentLearning } from "@/components/student/StudentLearning";
import { StudentCertificates } from "@/components/student/StudentCertificates";
import { StudentFeedback } from "@/components/student/StudentFeedback";
import { StudentProfile } from "@/components/student/StudentProfile";

const StudentDashboard = () => {
  const { user, profile, signOut, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("home");

  // Redirect if not authenticated or not a student
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile || profile.role !== "student") {
    return <Navigate to="/auth" replace />;
  }

  const getComponent = () => {
    switch (activeTab) {
      case 'home': return <StudentHome />;
      case 'courses': return <StudentCourses />;
      case 'learning': return <StudentLearning />;
      case 'certificates': return <StudentCertificates />;
      case 'feedback': return <StudentFeedback />;
      case 'profile': return <StudentProfile />;
      default: return <StudentHome />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'home': return 'Dashboard';
      case 'courses': return 'My Courses';
      case 'learning': return 'Continue Learning';
      case 'certificates': return 'My Certificates';
      case 'feedback': return 'Course Feedback';
      case 'profile': return 'Profile & Settings';
      default: return 'Dashboard';
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <StudentSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          studentName={profile.full_name}
        />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="h-full px-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="h-8 w-8" />
                <div>
                  <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
                  <p className="text-sm text-muted-foreground">Welcome back, {profile.full_name}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => window.location.href = '/'} className="space-x-2">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
              <Button variant="outline" onClick={handleSignOut} className="space-x-2">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <div className="bg-card rounded-xl border shadow-sm">
                <div className="p-6">
                  {getComponent()}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StudentDashboard;