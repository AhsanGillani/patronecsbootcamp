import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Award, Play, TrendingUp, Clock } from "lucide-react";

interface DashboardStats {
  totalEnrolled: number;
  completedCourses: number;
  certificates: number;
  totalLearningTime: number;
}

interface RecentActivity {
  id: string;
  type: 'lesson_completed' | 'quiz_passed' | 'certificate_earned';
  title: string;
  course: string;
  date: string;
}

export function StudentHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEnrolled: 0,
    completedCourses: 0,
    certificates: 0,
    totalLearningTime: 0
  });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch enrolled courses
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses!inner(
            id, title, thumbnail_url, instructor_id,
            profiles!instructor_id(full_name)
          )
        `)
        .eq('student_id', user?.id);

      if (enrollError) throw enrollError;

      // Fetch certificates
      const { data: certificates, error: certError } = await supabase
        .from('certificates')
        .select('*')
        .eq('student_id', user?.id);

      if (certError) throw certError;

      // Calculate stats
      const completedCount = enrollments?.filter(e => e.progress >= 100).length || 0;
      
      setStats({
        totalEnrolled: enrollments?.length || 0,
        completedCourses: completedCount,
        certificates: certificates?.length || 0,
        totalLearningTime: 0 // TODO: Calculate from lesson progress
      });

      // Set recent courses (in progress)
      setRecentCourses(enrollments?.filter(e => e.progress > 0 && e.progress < 100).slice(0, 3) || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your Learning Journey!</h1>
        <p className="text-gray-600">Continue where you left off and explore new courses</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrolled}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certificates}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLearningTime}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning Section */}
      {recentCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5" />
              <span>Continue Learning</span>
            </CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentCourses.map((enrollment) => (
                <Card key={enrollment.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">{enrollment.courses.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      by {enrollment.courses.profiles?.full_name}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(enrollment.progress)}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>
                    <Button size="sm" className="w-full mt-3">
                      Continue Learning
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>What would you like to do today?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <BookOpen className="h-6 w-6" />
              <span>Browse Courses</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Play className="h-6 w-6" />
              <span>Continue Learning</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Award className="h-6 w-6" />
              <span>View Certificates</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <TrendingUp className="h-6 w-6" />
              <span>Track Progress</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}