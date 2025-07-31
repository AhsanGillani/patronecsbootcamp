import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, BookOpen, Clock } from "lucide-react";

export function StudentLearning() {
  const { user } = useAuth();
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
          courses!inner(
            id, title, description, thumbnail_url, level, 
            total_duration, lesson_count, instructor_id,
            profiles!instructor_id(full_name)
          )
        `)
        .eq('student_id', user?.id)
        .gt('progress', 0)
        .lt('progress', 100)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setRecentCourses(data || []);
    } catch (error) {
      console.error('Error fetching recent courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
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
        {recentCourses.map((enrollment) => (
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
              <Link to={`/course/${enrollment.courses.id}/learn`}>
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