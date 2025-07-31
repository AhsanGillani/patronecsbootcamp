import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Star, TrendingUp, DollarSign, Eye, Clock } from "lucide-react";

interface CourseMetrics {
  id: string;
  title: string;
  total_enrollments: number;
  completion_rate: number;
  average_rating: number;
  total_revenue: number;
  total_views: number;
}

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  student: { full_name: string } | null;
  course: { title: string } | null;
  created_at: string;
}

export const CourseInsights = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<CourseMetrics[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user]);

  const fetchInsights = async () => {
    try {
      // Fetch course metrics
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select(`
          id,
          title,
          total_enrollments,
          price
        `)
        .eq("instructor_id", user?.id)
        .eq("status", "approved");

      if (coursesError) throw coursesError;

      // Fetch feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("course_feedback")
        .select(`
          *,
          student:profiles!student_id(full_name),
          course:courses(title)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (feedbackError) throw feedbackError;

      // Transform courses data to include calculated metrics
      const metricsData: CourseMetrics[] = (coursesData || []).map(course => ({
        ...course,
        completion_rate: Math.random() * 100, // Mock data
        average_rating: 4 + Math.random(), // Mock data
        total_revenue: course.price * course.total_enrollments,
        total_views: course.total_enrollments * (2 + Math.random() * 3) // Mock data
      }));

      setMetrics(metricsData);
      setFeedback(feedbackData as any || []);
    } catch (error) {
      console.error("Error fetching insights:", error);
      toast({
        title: "Error",
        description: "Failed to fetch course insights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalEnrollments = metrics.reduce((sum, course) => sum + course.total_enrollments, 0);
  const totalRevenue = metrics.reduce((sum, course) => sum + course.total_revenue, 0);
  const averageRating = metrics.length > 0 
    ? metrics.reduce((sum, course) => sum + course.average_rating, 0) / metrics.length 
    : 0;

  if (loading) {
    return <div className="text-center py-8">Loading insights...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Course Insights</h2>
        <p className="text-muted-foreground">Track your course performance and student feedback</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              Across {metrics.length} courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From course sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Out of 5 stars
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.length}</div>
            <p className="text-xs text-muted-foreground">
              Published courses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Course Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Course Performance</CardTitle>
          <CardDescription>Detailed metrics for each course</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No published courses found
            </p>
          ) : (
            <div className="space-y-4">
              {metrics.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{course.title}</h4>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{course.total_enrollments} students</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4" />
                        <span>{course.average_rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{course.completion_rate.toFixed(1)}% completion</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${course.total_revenue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Student Feedback</CardTitle>
          <CardDescription>Latest reviews and ratings from your students</CardDescription>
        </CardHeader>
        <CardContent>
          {feedback.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No feedback received yet
            </p>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        {item.rating}/5
                      </Badge>
                      <span className="text-sm font-medium">
                        {item.student?.full_name || "Anonymous"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Course: {item.course?.title}
                  </p>
                  <p className="text-sm">{item.comment}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};