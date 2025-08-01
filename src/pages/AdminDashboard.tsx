import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { LogOut } from 'lucide-react';

// Import all admin components
import UserManagement from '@/components/admin/UserManagement';
import InstructorControl from '@/components/admin/InstructorControl';
import CourseModeration from '@/components/admin/CourseModeration';
import BlogModeration from '@/components/admin/BlogModeration';
import CategoryManagement from '@/components/admin/CategoryManagement';
import CMSControl from '@/components/admin/CMSControl';
import Analytics from '@/components/admin/Analytics';
import Announcements from '@/components/admin/Announcements';

export default function AdminDashboard() {
  const { isAdmin, signOut, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  const getComponent = () => {
    switch (activeTab) {
      case 'users': return <UserManagement />;
      case 'instructors': return <InstructorControl />;
      case 'courses': return <CourseModeration />;
      case 'blogs': return <BlogModeration />;
      case 'categories': return <CategoryManagement />;
      case 'cms': return <CMSControl />;
      case 'analytics': return <Analytics />;
      case 'announcements': return <Announcements />;
      default: return <UserManagement />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'users': return 'User Management';
      case 'instructors': return 'Instructor Control';
      case 'courses': return 'Course Moderation';
      case 'blogs': return 'Blog Moderation';
      case 'categories': return 'Category Management';
      case 'cms': return 'CMS Control';
      case 'analytics': return 'Analytics Dashboard';
      case 'announcements': return 'Announcements';
      default: return 'Dashboard';
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="h-full px-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="h-8 w-8" />
                <div>
                  <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
                  <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => window.location.href = '/'} className="space-x-2">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
              <Button variant="outline" onClick={signOut} className="space-x-2">
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
}