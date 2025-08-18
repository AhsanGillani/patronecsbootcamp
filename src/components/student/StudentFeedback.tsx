import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Star, Send } from "lucide-react";

interface CompletedCourse {
  id: string;
  course_id: string;
  progress: number;
  completed_at: string;
  courses: {
    id: string;
    title: string;
    description: string;
    instructor_id: string;
    profiles: {
      full_name: string;
    };
  };
  feedback?: {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
  };
}

export function StudentFeedback() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCompletedCourses();
    }
  }, [user]);

  const fetchCompletedCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses!fk_enrollments_course_id(
            id, title, description, instructor_id,
            profiles!instructor_id(full_name)
          )
        `)
        .eq('student_id', profile?.id || user?.id)
        .gte('progress', 100)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      
      // Fetch feedback separately due to missing FK relationship in schema cache
      const enrollmentIds = (data || []).map((e: any) => e.id);
      let feedbackByCourse: Record<string, any[]> = {};
      if (enrollmentIds.length > 0) {
        const { data: feedbackData } = await supabase
          .from('course_feedback')
          .select('id, course_id, rating, comment, created_at')
          .in('course_id', (data || []).map((e: any) => e.course_id))
          .eq('student_id', profile?.id || user?.id);
        (feedbackData || []).forEach((f: any) => {
          const arr = feedbackByCourse[f.course_id] || [];
          arr.push(f);
          feedbackByCourse[f.course_id] = arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        });
      }

      const coursesWithFeedback = (data || [])
        .filter((enrollment: any) => enrollment.courses) // Filter out enrollments with null courses
        .map((enrollment: any) => ({
          ...enrollment,
          feedbacks: feedbackByCourse[enrollment.course_id] || []
        }));
      
      setCompletedCourses(coursesWithFeedback as CompletedCourse[]);
    } catch (error) {
      console.error('Error fetching completed courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (courseId: string, rating: number, comment: string) => {
    if (!user) return;
    
    setSubmitting(courseId);
    try {
      const { error } = await supabase
        .from('course_feedback')
        .insert({
          student_id: user.id,
          course_id: courseId,
          rating,
          comment
        });

      if (error) throw error;

      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback!',
      });

      fetchCompletedCourses(); // Refresh the list
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(null);
    }
  };

  const renderStars = (rating: number, onRate?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 cursor-pointer transition-colors ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300 hover:text-yellow-400'
            }`}
            onClick={() => onRate?.(star)}
          />
        ))}
      </div>
    );
  };

  const FeedbackForm = ({ course }: { course: CompletedCourse }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    return (
      <div className="space-y-4 border-t pt-4">
        <div>
          <Label>Rate this course</Label>
          {renderStars(rating, setRating)}
        </div>
        <div>
          <Label htmlFor={`comment-${course.id}`}>Your feedback</Label>
          <Textarea
            id={`comment-${course.id}`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this course..."
            rows={3}
          />
        </div>
        <Button
          onClick={() => submitFeedback(course.course_id, rating, comment)}
          disabled={submitting === course.course_id}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {submitting === course.course_id ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading completed courses...</div>;
  }

  if (completedCourses.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Completed Courses</h3>
        <p className="text-muted-foreground mb-4">Complete a course to share your feedback!</p>
        <Button asChild>
          <a href="/student">View My Courses</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Course Feedback</h2>
        <p className="text-muted-foreground">Help other students and improve the courses</p>
      </div>

      <div className="space-y-6">
        {completedCourses.filter(course => course.courses).map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{course.courses.title}</span>
                {Array.isArray((course as any).feedbacks) && (course as any).feedbacks.length > 0
                  ? <Badge variant="default">{(course as any).feedbacks.length} Feedback(s)</Badge>
                  : <Badge variant="outline">Pending Feedback</Badge>}
              </CardTitle>
              <CardDescription>
                by {course.courses.profiles?.full_name} • Completed on{' '}
                {new Date(course.completed_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Array.isArray((course as any).feedbacks) && (course as any).feedbacks.length > 0 ? (
                <div className="space-y-4">
                  {(course as any).feedbacks.map((fb: any) => (
                    <div key={fb.id} className="space-y-2 border rounded p-3">
                      <div>
                        <Label>Your Rating</Label>
                        {renderStars(fb.rating)}
                      </div>
                      <div>
                        <Label>Your Feedback</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {fb.comment}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Submitted on {new Date(fb.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  <FeedbackForm course={course} />
                </div>
              ) : (
                <FeedbackForm course={course} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}