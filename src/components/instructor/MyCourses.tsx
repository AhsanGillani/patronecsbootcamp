import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  Clock, 
  Users, 
  TrendingUp,
  BookOpen,
  Award,
  BarChart3,
  Zap,
  ArrowRight,
  Calendar,
  DollarSign,
  Target,
  Star,
  XCircle
} from "lucide-react";
import { CreateCourse } from "./CreateCourse";
import { EditCourse } from "./EditCourse";
import { useNavigate } from "react-router-dom";

interface Course {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  price: number;
  level: string;
  total_enrollments: number;
  lesson_count: number;
  total_duration: number;
  admin_comments: string;
  created_at: string;
  category_id: string | null;
  thumbnail_url: string | null;
  category: { name: string } | null;
}

export const MyCourses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          id,
          title,
          description,
          status,
          price,
          level,
          total_enrollments,
          lesson_count,
          total_duration,
          admin_comments,
          created_at,
          category_id,
          thumbnail_url,
          category:categories!courses_category_id_fkey(name)
        `)
        .eq("instructor_id", user?.id)
        .eq("soft_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Handle potential null category relationships
      const coursesWithCategory = (data || []).map((course: Course) => ({
        ...course,
        category: course.category || { name: "Uncategorized" }
      }));
      
      setCourses(coursesWithCategory);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800 border-gray-200";
      case "pending": return "bg-blue-100 text-blue-800 border-blue-200";
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft": return <Clock className="w-4 h-4" />;
      case "pending": return <Eye className="w-4 h-4" />;
      case "approved": return <Award className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner": return "bg-green-100 text-green-800 border-green-200";
      case "intermediate": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const calculateStats = () => {
    const totalCourses = courses.length;
    const approvedCourses = courses.filter(c => c.status === 'approved').length;
    const totalEnrollments = courses.reduce((sum, c) => sum + c.total_enrollments, 0);
    const totalRevenue = courses.reduce((sum, c) => sum + (c.price * c.total_enrollments), 0);
    const averageRating = 4.2; // TODO: Calculate from actual ratings
    const completionRate = 78; // TODO: Calculate from actual data

    return {
      totalCourses,
      approvedCourses,
      totalEnrollments,
      totalRevenue,
      averageRating,
      completionRate
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-white/60 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
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
        
        {/* Header Section */}
        <div className="relative overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Course Management</h1>
                  <p className="text-indigo-100 text-lg">Manage your courses and track performance</p>
                </div>
                <Button 
                  size="lg"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 shadow-lg"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Course
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Courses */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </CardContent>
          </Card>

          {/* Approved Courses */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-gray-900">{stats.approvedCourses}</p>
              </div>
            </CardContent>
          </Card>

          {/* Total Enrollments */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEnrollments}</p>
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rating & Completion */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Performance Metrics</span>
              </CardTitle>
              <CardDescription>Your course performance overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Rating</span>
                  <span className="font-semibold text-gray-900">{stats.averageRating}/5.0</span>
                </div>
                <div className="flex items-center space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(stats.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="font-semibold text-gray-900">{stats.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${stats.completionRate}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-600" />
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2 bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">New Course</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2 bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300"
                  onClick={() => navigate('/instructor?tab=analytics')}
                >
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Analytics</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2 bg-purple-50 hover:bg-purple-100 border-purple-200 hover:border-purple-300"
                  onClick={() => navigate('/instructor?tab=students')}
                >
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">Students</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2 bg-amber-50 hover:bg-amber-100 border-amber-200 hover:border-amber-300"
                  onClick={() => navigate('/instructor?tab=quizzes')}
                >
                  <Target className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium">Quizzes</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Management */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Your Courses</CardTitle>
                <CardDescription>Manage and monitor your course portfolio</CardDescription>
          </div>
              <Button 
                onClick={() => setCreateOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
        </div>
      </CardHeader>
      <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
                <p className="text-gray-600 mb-6">Start building your course portfolio to share your knowledge</p>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Course
                </Button>
              </div>
            ) : (
        <div className="space-y-4">
                {courses.map((course) => (
                  <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/60 hover:bg-white/80">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">{course.title}</h3>
                                <Badge className={`${getStatusColor(course.status)} border`}>
                                  {getStatusIcon(course.status)}
                                  <span className="ml-1 capitalize">{course.status}</span>
                                </Badge>
                                <Badge className={getLevelColor(course.level)}>
                                  {course.level}
                                </Badge>
          </div>
          
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                              
                              <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
                                  <Users className="w-4 h-4" />
                                  <span>{course.total_enrollments} students</span>
            </div>
            <div className="flex items-center space-x-1">
                                  <BookOpen className="w-4 h-4" />
              <span>{course.lesson_count} lessons</span>
            </div>
            <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{course.total_duration}h</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="w-4 h-4" />
                                  <span>${course.price}</span>
                                </div>
                              </div>
                            </div>
            </div>
          </div>

                        <div className="flex items-center space-x-2 ml-4">
            <Button 
              variant="outline"
              size="sm" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setEditingCourse(course)}
            >
                            <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline"
              size="sm" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => navigate(`/course/${course.id}`)}
            >
                            <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
              ))}
            </div>
          )}
                </CardContent>
              </Card>
      </div>

      {/* Modals */}
      <CreateCourse
        onCourseCreated={fetchCourses}
      />
      
      {editOpen && editingCourse && (
        <EditCourse
          course={editingCourse}
          open={editOpen}
          onOpenChange={setEditOpen}
          onCourseUpdated={fetchCourses}
        />
      )}
    </div>
  );
}