import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, BookOpen, Clock } from "lucide-react";
import { CourseCardSkeleton } from "@/components/ui/skeleton-loader";
import { Progress } from "@/components/ui/progress";

export function StudentLearning() {
  const { user, profile } = useAuth();
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentCourses();
    }
  }, [user]);

  const fetchRecentCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses!fk_enrollments_course_id(
            id, title, description, thumbnail_url, level, 
            total_duration, lesson_count, instructor_id,
            profiles!instructor_id(full_name),
            lessons(
              id, order_index,
              lesson_progress!fk_lesson_progress_lesson_id(id, student_id, is_completed, last_accessed_at)
            )
          )
        `)
        .eq('student_id', profile?.id || user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const computed = (data || [])
        .filter((enrollment: any) => enrollment.courses) // Filter out enrollments with null courses
        .map((enrollment: any) => {
          const lessons = enrollment.courses?.lessons || [];
          const filteredLessons = lessons.map((l: any) => ({
            ...l,
            lesson_progress: (l.lesson_progress || []).filter((p: any) => p.student_id === (profile?.id || user?.id))
          }));
          const completed = filteredLessons.filter((l: any) => l.lesson_progress?.[0]?.is_completed).length;
          const total = filteredLessons.length || 1;
          const progress = Math.round((completed / total) * 100);
          const latestAccess = filteredLessons
            .flatMap((l: any) => l.lesson_progress || [])
            .map((p: any) => p.last_accessed_at)
            .filter(Boolean)
            .sort()
            .slice(-1)[0] || enrollment.updated_at;
          return { ...enrollment, computedProgress: progress, latestAccess };
        });

      const inProgress = computed
        .filter((e: any) => e.computedProgress > 0 && e.computedProgress < 100)
        .sort((a: any, b: any) => new Date(b.latestAccess).getTime() - new Date(a.latestAccess).getTime());

      setRecentCourses(inProgress);
    } catch (error) {
      console.error('Error fetching recent courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Continue Learning</h2>
          <p className="text-muted-foreground">Pick up where you left off</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (recentCourses.length === 0) {
    return (
      <div className="text-center py-12">
        <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Courses in Progress</h3>
        <p className="text-muted-foreground mb-4">Start a course to continue your learning journey!</p>
        <Link to="/courses">
          <Button>Browse Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Continue Learning</h2>
        <p className="text-muted-foreground">Pick up where you left off</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recentCourses.filter(enrollment => enrollment.courses).map((enrollment) => (
          <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{enrollment.courses.title}</CardTitle>
              <CardDescription>by {enrollment.courses.profiles?.full_name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{enrollment.courses.lesson_count} lessons</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{enrollment.courses.total_duration || 0}min</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(enrollment.progress)}%</span>
                </div>
                <Progress value={enrollment.progress} className="h-2" />
              </div>
              
              <Link to={`/course-learning/${enrollment.courses.id}`}>
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Continue Learning
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}