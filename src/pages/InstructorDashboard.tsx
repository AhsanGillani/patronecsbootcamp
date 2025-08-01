import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { LogOut } from "lucide-react";

// Import all instructor components
import { InstructorProfile } from "@/components/instructor/InstructorProfile";
import { MyCourses } from "@/components/instructor/MyCourses";
import { LessonManagement } from "@/components/instructor/LessonManagement";
import { QuizManagement } from "@/components/instructor/QuizManagement";
import { CourseInsights } from "@/components/instructor/CourseInsights";
import { BlogManager } from "@/components/instructor/BlogManager";
import { NotificationCenter } from "@/components/instructor/NotificationCenter";

const InstructorDashboard = () => {
  const { user, profile, signOut, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Redirect if not authenticated or not an instructor
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

  if (!user || !profile || profile.role !== "instructor") {
    return <Navigate to="/auth" replace />;
  }

  const getComponent = () => {
    switch (activeTab) {
      case 'profile': return <InstructorProfile />;
      case 'courses': return <MyCourses />;
      case 'lessons': return <LessonManagement />;
      case 'quizzes': return <QuizManagement />;
      case 'insights': return <CourseInsights />;
      case 'blogs': return <BlogManager />;
      case 'notifications': return <NotificationCenter />;
      default: return <InstructorProfile />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'profile': return 'My Profile';
      case 'courses': return 'My Courses';
      case 'lessons': return 'Lesson Management';
      case 'quizzes': return 'Quiz Management';
      case 'insights': return 'Course Insights';
      case 'blogs': return 'Blog Manager';
      case 'notifications': return 'Notification Center';
      default: return 'Dashboard';
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <InstructorSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          instructorName={profile.full_name}
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
              <Button variant="outline" href= { } className="space-x-2">
                <StudentHome className = "h-1 w-1" />
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

export default InstructorDashboard;