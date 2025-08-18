import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Award, 
  Play, 
  TrendingUp, 
  Clock, 
  Target,
  Star,
  Calendar,
  ArrowRight,
  Zap,
  CheckCircle,
  BarChart3
} from "lucide-react";

interface DashboardStats {
  totalEnrolled: number;
  completedCourses: number;
  certificates: number;
  totalLearningTime: number;
  currentStreak: number;
  averageScore: number;
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
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalEnrolled: 0,
    completedCourses: 0,
    certificates: 0,
    totalLearningTime: 0,
    currentStreak: 0,
    averageScore: 0
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
          courses!fk_enrollments_course_id(
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

      // Calculate stats - only count enrollments with valid course data
      const validEnrollments = enrollments?.filter(e => e.courses) || [];
      const completedCount = validEnrollments.filter(e => e.progress >= 100).length || 0;
      
      setStats({
        totalEnrolled: validEnrollments.length || 0,
        completedCourses: completedCount,
        certificates: certificates?.length || 0,
        totalLearningTime: 0, // TODO: Calculate from lesson progress
        currentStreak: 7, // TODO: Calculate actual streak
        averageScore: 85 // TODO: Calculate actual average
      });

      // Set recent courses (in progress) - only include enrollments with valid course data
      setRecentCourses(validEnrollments.filter(e => e.progress > 0 && e.progress < 100).slice(0, 3) || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-white/60 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-white/60 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-white/60 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
      {/* Welcome Section */}
        <div className="relative overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Welcome back!</h1>
                  <p className="text-blue-100 text-lg">Ready to continue your learning journey?</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-6">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  onClick={() => navigate('/student?tab=courses')}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explore Courses
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-white border-white/30 hover:bg-white/10"
                  onClick={() => navigate('/student?tab=learning')}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Continue Learning
                </Button>
              </div>
            </div>
          </div>
      </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {/* Enrolled Courses */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEnrolled}</p>
              </div>
            </CardContent>
          </Card>

          {/* Completed Courses */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedCourses}</p>
              </div>
            </CardContent>
          </Card>

          {/* Certificates */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Certificates</p>
                <p className="text-3xl font-bold text-gray-900">{stats.certificates}</p>
              </div>
          </CardContent>
        </Card>
        
          {/* Learning Time */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Learning Time</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalLearningTime}h</p>
              </div>
          </CardContent>
        </Card>
        
          {/* Current Streak */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <Target className="w-6 h-6 text-red-600" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-3xl font-bold text-gray-900">{stats.currentStreak} days</p>
              </div>
          </CardContent>
        </Card>
        
          {/* Average Score */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <BarChart3 className="w-6 h-6 text-emerald-600" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
          </CardContent>
        </Card>
      </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="learning" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm p-1 rounded-xl">
            <TabsTrigger value="learning" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Play className="w-4 h-4 mr-2" />
              Continue Learning
            </TabsTrigger>
            <TabsTrigger value="progress" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Progress Overview
            </TabsTrigger>
            <TabsTrigger value="actions" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Zap className="w-4 h-4 mr-2" />
              Quick Actions
            </TabsTrigger>
          </TabsList>

          {/* Continue Learning Tab */}
          <TabsContent value="learning" className="space-y-6">
            {recentCourses.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {recentCourses.map((enrollment) => (
                  enrollment.courses && (
                    <Card key={enrollment.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                              {enrollment.courses.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-4">
                              by {enrollment.courses.profiles?.full_name || 'Unknown Instructor'}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center ml-4">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold text-gray-900">{Math.round(enrollment.progress)}%</span>
                        </div>
                          <Progress 
                            value={enrollment.progress} 
                            className="h-2 bg-gray-200"
                          />
                      </div>
                        
                        <Button 
                          size="lg" 
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                          onClick={() => navigate(`/course/${enrollment.courses.id}/learn`)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                        Continue Learning
                      </Button>
                    </CardContent>
                  </Card>
                  )
              ))}
            </div>
            ) : (
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses in progress</h3>
                  <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course</p>
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => navigate('/student?tab=courses')}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Courses
                  </Button>
          </CardContent>
        </Card>
      )}
          </TabsContent>

          {/* Progress Overview Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Learning Streak */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-red-600" />
                    <span>Learning Streak</span>
                  </CardTitle>
                  <CardDescription>Keep up your daily learning habit</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-red-600 mb-2">{stats.currentStreak}</div>
                    <p className="text-gray-600">days in a row</p>
                    <div className="flex justify-center space-x-1 mt-4">
                      {[...Array(7)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-3 h-3 rounded-full ${i < Math.min(stats.currentStreak, 7) ? 'bg-red-500' : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Chart */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    <span>Performance</span>
                  </CardTitle>
                  <CardDescription>Your learning progress overview</CardDescription>
        </CardHeader>
        <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Score</span>
                      <span className="font-semibold text-gray-900">{stats.averageScore}%</span>
                    </div>
                    <Progress value={stats.averageScore} className="h-3 bg-gray-200" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="font-semibold text-gray-900">
                        {stats.totalEnrolled > 0 ? Math.round((stats.completedCourses / stats.totalEnrolled) * 100) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={stats.totalEnrolled > 0 ? (stats.completedCourses / stats.totalEnrolled) * 100 : 0} 
                      className="h-3 bg-gray-200" 
                    />
          </div>
        </CardContent>
      </Card>
            </div>
          </TabsContent>

          {/* Quick Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Button 
                variant="outline" 
                className="h-32 flex-col space-y-3 bg-white/80 backdrop-blur-sm border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 rounded-xl"
                onClick={() => navigate('/student?tab=courses')}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <span className="font-medium text-gray-900">Browse Courses</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-32 flex-col space-y-3 bg-white/80 backdrop-blur-sm border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300 rounded-xl"
                onClick={() => navigate('/student?tab=learning')}
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Play className="w-6 h-6 text-green-600" />
                </div>
                <span className="font-medium text-gray-900">Continue Learning</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-32 flex-col space-y-3 bg-white/80 backdrop-blur-sm border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all duration-300 rounded-xl"
                onClick={() => navigate('/student?tab=certificates')}
              >
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
                <span className="font-medium text-gray-900">View Certificates</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-32 flex-col space-y-3 bg-white/80 backdrop-blur-sm border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 rounded-xl"
                onClick={() => navigate('/student?tab=learning')}
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <span className="font-medium text-gray-900">Track Progress</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}