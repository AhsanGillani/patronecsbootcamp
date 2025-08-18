import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { LogOut, Home, GraduationCap, BookOpen, Menu } from "lucide-react";

// Import all instructor components
import { InstructorProfile } from "@/components/instructor/InstructorProfile";
import { MyCourses } from "@/components/instructor/MyCourses";
import { LessonManagement } from "@/components/instructor/LessonManagement";
import { QuizManagement } from "@/components/instructor/QuizManagement";
import { CourseInsights } from "@/components/instructor/CourseInsights";
import { BlogManager } from "@/components/instructor/BlogManager";
import { NotificationCenter } from "@/components/instructor/NotificationCenter";
import { SubmittedQuizzes } from "@/components/instructor/SubmittedQuizzes";

export default function InstructorDashboard() {
  const { user, profile, signOut, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'courses';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Redirect if not authenticated or not an instructor
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Instructor Dashboard...</p>
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
      case 'students': return <SubmittedQuizzes />; // Student Progress
      case 'analytics': return <CourseInsights />;
      case 'insights': return <CourseInsights />; // backward compatibility
      case 'blogs': return <BlogManager />; // legacy
      case 'notifications': return <NotificationCenter />; // legacy
      case 'submissions': return <SubmittedQuizzes />; // legacy
      default: return <InstructorProfile />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'profile': return 'My Profile';
      case 'courses': return 'My Courses';
      case 'lessons': return 'Lesson Management';
      case 'quizzes': return 'Quiz Management';
      case 'analytics': return 'Analytics';
      case 'students': return 'Student Progress';
      case 'insights': return 'Course Insights';
      case 'blogs': return 'Blog Manager';
      case 'notifications': return 'Notification Center';
      default: return 'Dashboard';
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <InstructorSidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        instructorName={profile.full_name}
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
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg md:text-2xl font-bold text-slate-900">{getPageTitle()}</h1>
                  <p className="text-sm md:text-base text-slate-600">Welcome back, <span className="font-semibold text-slate-900">{profile.full_name}</span></p>
                </div>
                <div className="sm:hidden">
                  <h1 className="text-lg font-bold text-slate-900">{getPageTitle()}</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="hidden md:block">
                <NotificationBell />
              </div>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'} 
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
              <div className="p-4 md:p-8">
                {getComponent()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}