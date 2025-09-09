import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Award,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
  Eye,
  Calendar,
  Globe,
  Smartphone
} from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  totalEnrollments: number;
  userGrowth: number;
  courseGrowth: number;
  revenueGrowth: number;
  enrollmentGrowth: number;
  topCategories: Array<{ name: string; count: number; growth: number }>;
  recentActivity: Array<{ type: string; description: string; time: string; value: string }>;
  platformStats: {
    approvedCourses: number;
    pendingCourses: number;
    totalInstructors: number;
    totalCertificates: number;
    activeBlogPosts: number;
    totalFeedbacks: number;
  };
}

export default function Analytics() {
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    totalEnrollments: 0,
    userGrowth: 0,
    courseGrowth: 0,
    revenueGrowth: 0,
    enrollmentGrowth: 0,
    topCategories: [],
    recentActivity: [],
    platformStats: {
      approvedCourses: 0,
      pendingCourses: 0,
      totalInstructors: 0,
      totalCertificates: 0,
      activeBlogPosts: 0,
      totalFeedbacks: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const now = new Date();
      const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
      const previousStartDate = new Date(startDate.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      // Fetch all analytics data in parallel
      const [
        profilesResult,
        coursesResult,
        enrollmentsResult,
        categoriesResult,
        certificatesResult,
        blogsResult,
        feedbackResult,
        recentEnrollmentsResult,
        recentCoursesResult,
        recentProfilesResult
      ] = await Promise.all([
        // Total users
        supabase.from('profiles').select('id, created_at, role', { count: 'exact' }),
        
        // Total courses
        supabase.from('courses').select('id, created_at, status, price').eq('soft_deleted', false),
        
        // Total enrollments
        supabase.from('enrollments').select('id, enrolled_at', { count: 'exact' }),
        
        // Categories with course counts
        supabase.from('categories').select(`
          id, name,
          courses!inner(id, created_at, category_id)
        `),
        
        // Certificates
        supabase.from('certificates').select('id, issued_at', { count: 'exact' }),
        
        // Active blogs
        supabase.from('blogs').select('id, created_at').eq('is_published', true).eq('status', 'approved'),
        
        // Course feedback
        supabase.from('course_feedback').select('id, created_at', { count: 'exact' }),
        
        // Recent enrollments for activity
        supabase.from('enrollments')
          .select('enrolled_at, profiles!student_id(full_name), courses!course_id(title)')
          .order('enrolled_at', { ascending: false })
          .limit(5),
        
        // Recent courses for activity
        supabase.from('courses')
          .select('created_at, title, profiles!instructor_id(full_name)')
          .eq('soft_deleted', false)
          .order('created_at', { ascending: false })
          .limit(5),
        
        // Recent user registrations
        supabase.from('profiles')
          .select('created_at, full_name')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (coursesResult.error) throw coursesResult.error;
      if (enrollmentsResult.error) throw enrollmentsResult.error;

      const profiles = profilesResult.data || [];
      const courses = coursesResult.data || [];
      const enrollments = enrollmentsResult.data || [];
      const categories = categoriesResult.data || [];
      const certificates = certificatesResult.data || [];
      const blogs = blogsResult.data || [];
      const feedbacks = feedbackResult.data || [];

      // Calculate current period data
      const currentProfiles = profiles.filter(p => new Date(p.created_at) >= startDate);
      const currentCourses = courses.filter(c => new Date(c.created_at) >= startDate);
      const currentEnrollments = enrollments.filter(e => new Date(e.enrolled_at) >= startDate);

      // Calculate previous period data for growth calculation
      const previousProfiles = profiles.filter(p => {
        const date = new Date(p.created_at);
        return date >= previousStartDate && date < startDate;
      });
      const previousCourses = courses.filter(c => {
        const date = new Date(c.created_at);
        return date >= previousStartDate && date < startDate;
      });
      const previousEnrollments = enrollments.filter(e => {
        const date = new Date(e.enrolled_at);
        return date >= previousStartDate && date < startDate;
      });

      // Calculate growth percentages
      const userGrowth = previousProfiles.length > 0 
        ? ((currentProfiles.length - previousProfiles.length) / previousProfiles.length) * 100 
        : currentProfiles.length > 0 ? 100 : 0;
      
      const courseGrowth = previousCourses.length > 0 
        ? ((currentCourses.length - previousCourses.length) / previousCourses.length) * 100 
        : currentCourses.length > 0 ? 100 : 0;
      
      const enrollmentGrowth = previousEnrollments.length > 0 
        ? ((currentEnrollments.length - previousEnrollments.length) / previousEnrollments.length) * 100 
        : currentEnrollments.length > 0 ? 100 : 0;

      // Calculate revenue (sum of course prices from enrollments)
      const approvedCourses = courses.filter(c => c.status === 'approved');
      const totalRevenue = approvedCourses.reduce((sum, course) => sum + (course.price || 0), 0);
      const currentRevenue = currentCourses
        .filter(c => c.status === 'approved')
        .reduce((sum, course) => sum + (course.price || 0), 0);
      const previousRevenue = previousCourses
        .filter(c => c.status === 'approved')
        .reduce((sum, course) => sum + (course.price || 0), 0);
      
      const revenueGrowth = previousRevenue > 0 
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
        : currentRevenue > 0 ? 100 : 0;

      // Process categories
      const topCategories = categories
        .map(category => {
          const coursesInCategory = category.courses || [];
          const currentCategoryCount = coursesInCategory.filter(c => 
            new Date(c.created_at) >= startDate
          ).length;
          const previousCategoryCount = coursesInCategory.filter(c => {
            const date = new Date(c.created_at);
            return date >= previousStartDate && date < startDate;
          }).length;
          
          const growth = previousCategoryCount > 0 
            ? ((currentCategoryCount - previousCategoryCount) / previousCategoryCount) * 100 
            : currentCategoryCount > 0 ? 100 : 0;

          return {
            name: category.name,
            count: coursesInCategory.length,
            growth: Math.round(growth * 10) / 10
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Process recent activity
      const recentActivity = [];
      
      // Add recent enrollments
      if (recentEnrollmentsResult.data) {
        recentEnrollmentsResult.data.forEach(enrollment => {
          recentActivity.push({
            type: 'enrollment',
            description: `${enrollment.profiles?.full_name || 'Student'} enrolled in ${enrollment.courses?.title || 'a course'}`,
            time: formatTimeAgo(enrollment.enrolled_at),
            value: '+1'
          });
        });
      }

      // Add recent courses
      if (recentCoursesResult.data) {
        recentCoursesResult.data.forEach(course => {
          recentActivity.push({
            type: 'course_creation',
            description: `${course.profiles?.full_name || 'Instructor'} created "${course.title}"`,
            time: formatTimeAgo(course.created_at),
            value: '+1'
          });
        });
      }

      // Add recent registrations
      if (recentProfilesResult.data) {
        recentProfilesResult.data.forEach(profile => {
          recentActivity.push({
            type: 'user_registration',
            description: `${profile.full_name || 'New user'} joined the platform`,
            time: formatTimeAgo(profile.created_at),
            value: '+1'
          });
        });
      }

      // Sort by time and take first 5
      recentActivity.sort((a, b) => {
        const timeA = parseTimeAgo(a.time);
        const timeB = parseTimeAgo(b.time);
        return timeA - timeB;
      });

      const analytics: AnalyticsData = {
        totalUsers: profiles.length,
        totalCourses: courses.length,
        totalRevenue: Math.round(totalRevenue),
        totalEnrollments: enrollments.length,
        userGrowth: Math.round(userGrowth * 10) / 10,
        courseGrowth: Math.round(courseGrowth * 10) / 10,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        enrollmentGrowth: Math.round(enrollmentGrowth * 10) / 10,
        topCategories,
        recentActivity: recentActivity.slice(0, 5),
        platformStats: {
          approvedCourses: courses.filter(c => c.status === 'approved').length,
          pendingCourses: courses.filter(c => c.status === 'pending').length,
          totalInstructors: profiles.filter(p => p.role === 'instructor').length,
          totalCertificates: certificates.length,
          activeBlogPosts: blogs.length,
          totalFeedbacks: feedbacks.length
        }
      };

      setData(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const parseTimeAgo = (timeAgo: string) => {
    const match = timeAgo.match(/(\d+)\s+(min|hour|day)/);
    if (!match) return 0;
    const value = parseInt(match[1]);
    const unit = match[2];
    if (unit === 'min') return value;
    if (unit === 'hour') return value * 60;
    return value * 24 * 60;
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

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
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
        <div>
                  <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                  <p className="text-emerald-100 text-lg">Monitor your platform's performance and growth</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mt-6">
                <div className="flex space-x-2 bg-white/20 rounded-lg p-1">
                  {['7d', '30d', '90d', '1y'].map((range) => (
                    <Button
                      key={range}
                      variant={timeRange === range ? "secondary" : "ghost"}
                      size="sm"
                      className={timeRange === range ? "bg-white text-emerald-600" : "text-white hover:bg-white/10"}
                      onClick={() => setTimeRange(range)}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${data.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.userGrowth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span className="font-medium">{Math.abs(data.userGrowth)}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{data.totalUsers.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Total Courses */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${data.courseGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.courseGrowth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span className="font-medium">{Math.abs(data.courseGrowth)}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{data.totalCourses}</p>
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
                <div className={`flex items-center space-x-1 text-sm ${data.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.revenueGrowth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span className="font-medium">{Math.abs(data.revenueGrowth)}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${data.totalRevenue.toLocaleString()}</p>
              </div>
          </CardContent>
        </Card>

          {/* Total Enrollments */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${data.enrollmentGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.enrollmentGrowth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span className="font-medium">{Math.abs(data.enrollmentGrowth)}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-3xl font-bold text-gray-900">{data.totalEnrollments.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <PieChart className="w-4 h-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="platform" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <Globe className="w-4 h-4 mr-2" />
              Platform
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Growth Chart */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span>Growth Trends</span>
                  </CardTitle>
                  <CardDescription>Platform growth over time</CardDescription>
          </CardHeader>
          <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-gray-600">User Growth</span>
                      <span className="font-semibold text-blue-600">+{data.userGrowth}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-600">Course Growth</span>
                      <span className="font-semibold text-green-600">+{data.courseGrowth}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                      <span className="text-sm text-gray-600">Revenue Growth</span>
                      <span className="font-semibold text-emerald-600">+{data.revenueGrowth}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm text-gray-600">Enrollment Growth</span>
                      <span className="font-semibold text-purple-600">+{data.enrollmentGrowth}%</span>
                    </div>
                  </div>
          </CardContent>
        </Card>

              {/* Quick Stats */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    <span>Quick Stats</span>
                  </CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Approved Courses</span>
                      <span className="font-semibold text-gray-900">{data.platformStats.approvedCourses}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending Courses</span>
                      <span className="font-semibold text-gray-900">{data.platformStats.pendingCourses}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Instructors</span>
                      <span className="font-semibold text-gray-900">{data.platformStats.totalInstructors}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Certificates Issued</span>
                      <span className="font-semibold text-gray-900">{data.platformStats.totalCertificates}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Blog Posts</span>
                      <span className="font-semibold text-gray-900">{data.platformStats.activeBlogPosts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Feedbacks</span>
                      <span className="font-semibold text-gray-900">{data.platformStats.totalFeedbacks}</span>
                    </div>
                  </div>
          </CardContent>
        </Card>
      </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5 text-green-600" />
                  <span>Top Categories</span>
                </CardTitle>
                <CardDescription>Most popular course categories</CardDescription>
          </CardHeader>
          <CardContent>
                <div className="space-y-4">
                  {data.topCategories.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-sm font-semibold text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{category.name}</p>
                          <p className="text-sm text-gray-600">{category.count} courses</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${category.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {category.growth >= 0 ? '+' : ''}{category.growth}%
                        </span>
                        {category.growth >= 0 ? <ArrowUp className="w-4 h-4 text-green-600" /> : <ArrowDown className="w-4 h-4 text-red-600" />}
                      </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-amber-600" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
                <div className="space-y-4">
                  {data.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.description}</p>
                          <p className="text-sm text-gray-600">{activity.time}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        {activity.value}
                      </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          {/* Platform Tab */}
          <TabsContent value="platform" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Overview */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <span>System Overview</span>
                  </CardTitle>
                  <CardDescription>Platform health and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Approved Courses</span>
                      <span className="font-semibold text-gray-900">{data.platformStats.approvedCourses}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending Courses</span>
                      <span className="font-semibold text-gray-900">{data.platformStats.pendingCourses}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Instructors</span>
                      <span className="font-semibold text-gray-900">{data.platformStats.totalInstructors}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Stats */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <span>Content Statistics</span>
                  </CardTitle>
                  <CardDescription>Platform content metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Certificates Issued</span>
                      <span className="font-semibold text-gray-900">{data.platformStats.totalCertificates}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Blog Posts</span>
                      <span className="font-semibold text-gray-900">{data.platformStats.activeBlogPosts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Feedbacks</span>
                      <span className="font-semibold text-gray-900">{data.platformStats.totalFeedbacks}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}