import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, BookOpen, DollarSign, TrendingUp } from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  usersByRole: { role: string; count: number }[];
  coursesByStatus: { status: string; count: number }[];
  recentEnrollments: any[];
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [timeFilter]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date filter
      let dateFilter = '';
      if (timeFilter === 'month') {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        dateFilter = lastMonth.toISOString();
      } else if (timeFilter === 'week') {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        dateFilter = lastWeek.toISOString();
      }

      // Get total users with optional date filter
      let usersQuery = supabase.from('profiles').select('role, created_at');
      if (dateFilter) {
        usersQuery = usersQuery.gte('created_at', dateFilter);
      }
      const { data: users, error: usersError } = await usersQuery;
      if (usersError) throw usersError;

      // Get total courses with optional date filter
      let coursesQuery = supabase.from('courses').select('status, price, created_at');
      if (dateFilter) {
        coursesQuery = coursesQuery.gte('created_at', dateFilter);
      }
      const { data: courses, error: coursesError } = await coursesQuery;
      if (coursesError) throw coursesError;

      // Get total enrollments with optional date filter
      let enrollmentsQuery = supabase.from('enrollments').select(`
        *,
        courses!fk_enrollments_course_id(price),
        profiles(full_name, email)
      `);
      if (dateFilter) {
        enrollmentsQuery = enrollmentsQuery.gte('enrolled_at', dateFilter);
      }
      const { data: enrollments, error: enrollmentsError } = await enrollmentsQuery;
      if (enrollmentsError) throw enrollmentsError;

      // Calculate analytics
      const totalUsers = users?.length || 0;
      const totalCourses = courses?.length || 0;
      const totalEnrollments = enrollments?.length || 0;
      
      // Calculate revenue (sum of course prices for enrolled courses)
      const totalRevenue = enrollments?.reduce((sum, enrollment) => {
        return sum + (enrollment.courses?.price || 0);
      }, 0) || 0;

      // Users by role
      const usersByRole = users?.reduce((acc: any[], user) => {
        const existing = acc.find(item => item.role === user.role);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ role: user.role, count: 1 });
        }
        return acc;
      }, []) || [];

      // Courses by status
      const coursesByStatus = courses?.reduce((acc: any[], course) => {
        const existing = acc.find(item => item.status === course.status);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ status: course.status, count: 1 });
        }
        return acc;
      }, []) || [];

      // Recent enrollments (last 10)
      const recentEnrollments = enrollments?.slice(-10).reverse() || [];

      setAnalytics({
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue,
        usersByRole,
        coursesByStatus,
        recentEnrollments,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="flex justify-center p-8">No data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Platform Analytics</h3>
          <p className="text-muted-foreground">Overview of platform performance and usage</p>
        </div>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active platform users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Available courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">Course enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">Platform revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.usersByRole.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="capitalize">{item.role}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Courses by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.coursesByStatus.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="capitalize">{item.status}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.recentEnrollments.length > 0 ? (
              analytics.recentEnrollments.map((enrollment, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b">
                  <span>{enrollment.profiles?.full_name}</span>
                  <span className="text-muted-foreground text-sm">
                    {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No recent enrollments</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}