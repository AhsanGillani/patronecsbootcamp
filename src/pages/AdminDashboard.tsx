import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import UserManagement from '@/components/admin/UserManagement';
import InstructorControl from '@/components/admin/InstructorControl';
import CourseModeration from '@/components/admin/CourseModeration';
import BlogModeration from '@/components/admin/BlogModeration';
import CategoryManagement from '@/components/admin/CategoryManagement';
import CMSControl from '@/components/admin/CMSControl';
import Analytics from '@/components/admin/Analytics';
import Announcements from '@/components/admin/Announcements';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  BookOpen, 
  PenTool, 
  Settings, 
  BarChart3, 
  Megaphone,
  LogOut,
  GraduationCap,
  Tag
} from 'lucide-react';

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

  const tabs = [
    { id: 'users', label: 'Users', icon: Users, component: UserManagement },
    { id: 'instructors', label: 'Instructors', icon: GraduationCap, component: InstructorControl },
    { id: 'courses', label: 'Courses', icon: BookOpen, component: CourseModeration },
    { id: 'blogs', label: 'Blogs', icon: PenTool, component: BlogModeration },
    { id: 'categories', label: 'Categories', icon: Tag, component: CategoryManagement },
    { id: 'cms', label: 'CMS', icon: Settings, component: CMSControl },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, component: Analytics },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, component: Announcements },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.full_name}</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <tab.icon className="h-5 w-5" />
                    {tab.label} Management
                  </CardTitle>
                  <CardDescription>
                    Manage and oversee {tab.label.toLowerCase()} on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <tab.component />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}