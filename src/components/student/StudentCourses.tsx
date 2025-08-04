import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, Clock, Award, Users } from "lucide-react";
import { CourseCardSkeleton } from "@/components/ui/skeleton-loader";

interface EnrolledCourse {
  id: string;
  course_id: string;
  progress: number;
  enrolled_at: string;
  courses: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    level: string;
    total_duration: number;
    lesson_count: number;
    instructor_id: string;
    profiles: {
      full_name: string;
    };
  };
}

export function StudentCourses() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const fetchEnrolledCourses = async () => {
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
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      setEnrolledCourses(data || []);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (progress: number) => {
    if (progress === 0) return <Badge variant="secondary">Not Started</Badge>;
    if (progress < 100) return <Badge variant="outline">In Progress</Badge>;
    return <Badge variant="default">Completed</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">My Courses</h2>
            <p className="text-muted-foreground">Track your learning progress</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Enrolled Courses</h3>
        <p className="text-muted-foreground mb-4">Start learning by enrolling in your first course!</p>
        <Button>Browse Available Courses</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Courses</h2>
          <p className="text-muted-foreground">Track your learning progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolledCourses.map((enrollment) => (
          <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{enrollment.courses.title}</CardTitle>
                  <CardDescription className="mt-1">
                    by {enrollment.courses.profiles?.full_name}
                  </CardDescription>
                </div>
                {getStatusBadge(enrollment.progress)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {enrollment.courses.description}
              </p>
              
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

              <div className="flex space-x-2">
                <Button 
                  className="flex-1" 
                  size="sm"
                  onClick={() => window.location.href = `/course-learning/${enrollment.courses.id}`}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {enrollment.progress === 0 ? 'Start Course' : 'Continue'}
                </Button>
                {enrollment.progress >= 100 && (
                  <Button variant="outline" size="sm">
                    <Award className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}