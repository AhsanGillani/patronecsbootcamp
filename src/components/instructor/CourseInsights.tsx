import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Star, TrendingUp, DollarSign } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

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
  student_name: string;
  course_title: string;
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
      // Fetch instructor courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select(
          `
          id,
          title,
          total_enrollments,
          price
        `
        )
        .eq("instructor_id", user?.id)
        .eq("status", "approved");

      if (coursesError) throw coursesError;

      const courseIds = (coursesData || []).map((c) => c.id);

      // Fetch enrollments progress for these courses
      const { data: enrollments } =
        courseIds.length > 0
          ? await supabase
              .from("enrollments")
              .select("course_id, progress")
              .in("course_id", courseIds)
          : ({ data: [], error: null } as any);

      // Fetch feedback and student names
      const { data: feedbackRows } =
        courseIds.length > 0
          ? await supabase
              .from("course_feedback")
              .select("id, course_id, student_id, rating, comment, created_at")
              .in("course_id", courseIds)
              .order("created_at", { ascending: false })
              .limit(20)
          : ({ data: [], error: null } as any);

      const studentIds = Array.from(
        new Set(
          (feedbackRows || []).map((f: any) => f.student_id).filter(Boolean)
        )
      ) as string[];
      const { data: profileRows } =
        studentIds.length > 0
          ? await supabase
              .from("profiles")
              .select("user_id, full_name")
              .in("user_id", studentIds)
          : ({ data: [], error: null } as any);
      const userIdToName: Record<string, string> = {};
      (profileRows || []).forEach((p: any) => {
        userIdToName[p.user_id] = p.full_name;
      });

      // Compute per-course average rating
      const ratingsByCourse: Record<string, { sum: number; count: number }> =
        {};
      (feedbackRows || []).forEach((f: any) => {
        if (!ratingsByCourse[f.course_id])
          ratingsByCourse[f.course_id] = { sum: 0, count: 0 };
        ratingsByCourse[f.course_id].sum += f.rating || 0;
        ratingsByCourse[f.course_id].count += 1;
      });

      const metricsData: CourseMetrics[] = (coursesData || []).map((course) => {
        const progresses = (enrollments || [])
          .filter((e: any) => e.course_id === course.id)
          .map((e: any) => e.progress || 0);
        const completion_rate =
          progresses.length > 0
            ? progresses.reduce((a: number, b: number) => a + b, 0) /
              progresses.length
            : 0;
        const ratingAgg = ratingsByCourse[course.id];
        const average_rating =
          ratingAgg && ratingAgg.count > 0
            ? ratingAgg.sum / ratingAgg.count
            : 0;
        return {
          id: course.id,
          title: course.title,
          total_enrollments: course.total_enrollments || 0,
          completion_rate,
          average_rating,
          total_revenue: (course.price || 0) * (course.total_enrollments || 0),
          total_views: (course.total_enrollments || 0) * 3,
        };
      });

      setMetrics(metricsData);

      const courseIdToTitle: Record<string, string> = {};
      (coursesData || []).forEach((c) => {
        courseIdToTitle[c.id] = c.title;
      });
      const transformedFeedback: Feedback[] = (feedbackRows || []).map(
        (f: any) => ({
          id: f.id,
          rating: f.rating,
          comment: f.comment,
          student_name: userIdToName[f.student_id] || "Student",
          course_title: courseIdToTitle[f.course_id] || "Unknown Course",
          created_at: f.created_at,
        })
      );
      setFeedback(transformedFeedback);
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

  const totalEnrollments = metrics.reduce(
    (sum, course) => sum + course.total_enrollments,
    0
  );
  const totalRevenue = metrics.reduce(
    (sum, course) => sum + course.total_revenue,
    0
  );
  const averageRating =
    metrics.length > 0
      ? metrics.reduce((sum, course) => sum + course.average_rating, 0) /
        metrics.length
      : 0;

  if (loading) {
    return <div className="text-center py-8">Loading insights...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Instructor Dashboard</h2>
        <p className="text-muted-foreground">
          Student engagement, course completion, and performance
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Enrollments
            </CardTitle>
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
            <p className="text-xs text-muted-foreground">From course sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Courses
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.length}</div>
            <p className="text-xs text-muted-foreground">Published courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts: Enrollments per Course */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollments per Course</CardTitle>
          <CardDescription>
            Distribution of students across your courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No data</p>
          ) : (
            <ChartContainer
              config={{
                enrollments: {
                  label: "Enrollments",
                  color: "hsl(221, 83%, 53%)",
                },
              }}
              className="h-72"
            >
              <BarChart
                data={metrics.map((m) => ({
                  name: m.title,
                  enrollments: m.total_enrollments,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="enrollments"
                  fill="var(--color-enrollments)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Charts: Completion Rate per Course */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Rate by Course</CardTitle>
          <CardDescription>Average progress across enrollments</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No data</p>
          ) : (
            <ChartContainer
              config={{
                completion: {
                  label: "Completion %",
                  color: "hsl(262, 83%, 58%)",
                },
              }}
              className="h-72"
            >
              <LineChart
                data={metrics.map((m) => ({
                  name: m.title,
                  completion: Math.round(m.completion_rate),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="completion"
                  stroke="var(--color-completion)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

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
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
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
                        <span>
                          {course.completion_rate.toFixed(1)}% completion
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${course.total_revenue.toFixed(2)}
                    </p>
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
          <CardDescription>
            Latest reviews and ratings from your students
          </CardDescription>
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
                        {item.student_name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Course: {item.course_title}
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
