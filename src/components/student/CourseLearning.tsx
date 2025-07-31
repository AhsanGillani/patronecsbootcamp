import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  CheckCircle, 
  Clock, 
  FileText, 
  Video, 
  HelpCircle, 
  BookOpen,
  ArrowLeft,
  Award
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'video' | 'text' | 'pdf' | 'quiz';
  order_index: number;
  video_url: string;
  pdf_url: string;
  duration: number;
  is_published: boolean;
  lesson_progress?: {
    is_completed: boolean;
    completed_at: string;
  }[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  lesson_id: string;
  passing_score: number;
  quiz_attempts?: {
    score: number;
    passed: boolean;
    completed_at: string;
  }[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: { full_name: string };
  total_duration: number;
  lesson_count: number;
}

export const CourseLearning = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && courseId) {
      fetchCourseData();
    }
  }, [user, courseId]);

  const fetchCourseData = async () => {
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles!instructor_id(full_name)
        `)
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      // Fetch lessons with progress
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select(`
          *,
          lesson_progress!left(is_completed, completed_at)
        `)
        .eq('course_id', courseId)
        .eq('is_published', true)
        .eq('lesson_progress.student_id', user?.id)
        .order('order_index');

      if (lessonsError) throw lessonsError;

      // Fetch quizzes with attempts
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select(`
          *,
          lessons!inner(course_id),
          quiz_attempts!left(score, passed, completed_at)
        `)
        .eq('lessons.course_id', courseId)
        .eq('quiz_attempts.student_id', user?.id);

      if (quizzesError) throw quizzesError;

      setCourse(courseData);
      setLessons((lessonsData || []) as Lesson[]);
      setQuizzes(quizzesData || []);

      // Calculate progress
      const completedLessons = (lessonsData || []).filter(lesson => 
        lesson.lesson_progress && lesson.lesson_progress.length > 0 && lesson.lesson_progress[0].is_completed
      ).length;
      const totalLessons = (lessonsData || []).length;
      const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      setProgress(progressPercentage);

    } catch (error) {
      console.error('Error fetching course data:', error);
      toast({
        title: "Error",
        description: "Failed to load course content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          student_id: user?.id,
          lesson_id: lessonId,
          is_completed: true,
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Lesson completed!",
        description: "Your progress has been saved.",
      });

      fetchCourseData(); // Refresh progress
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      toast({
        title: "Error",
        description: "Failed to save progress",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />;
      case "text": return <FileText className="h-4 w-4" />;
      case "pdf": return <FileText className="h-4 w-4" />;
      case "quiz": return <HelpCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading course content...</div>;
  }

  if (!course) {
    return <div className="text-center py-8">Course not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/student-dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{course.title}</h1>
                <p className="text-muted-foreground">by {course.instructor?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Progress</p>
                <div className="flex items-center space-x-2">
                  <Progress value={progress} className="w-32" />
                  <span className="text-sm font-medium">{Math.round(progress)}%</span>
                </div>
              </div>
              {progress === 100 && (
                <Badge variant="default" className="bg-green-500">
                  <Award className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Course Content
                </h2>
                <div className="space-y-3">
                  {lessons.map((lesson, index) => {
                    const isCompleted = lesson.lesson_progress && lesson.lesson_progress.length > 0 && lesson.lesson_progress[0].is_completed;
                    
                    return (
                      <Card key={lesson.id} className={`transition-all ${isCompleted ? 'bg-green-50 border-green-200' : 'hover:shadow-md'}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                              )}
                              <div>
                                <CardTitle className="text-base flex items-center space-x-2">
                                  {getTypeIcon(lesson.type)}
                                  <span>Lesson {index + 1}: {lesson.title}</span>
                                </CardTitle>
                                <CardDescription className="flex items-center space-x-2 mt-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{lesson.duration || 0} minutes</span>
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{lesson.type}</Badge>
                              {!isCompleted && (
                                <Button
                                  size="sm"
                                  onClick={() => markLessonComplete(lesson.id)}
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  Start
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Quizzes Section */}
              {quizzes.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2" />
                    Quizzes & Assessments
                  </h2>
                  <div className="space-y-3">
                    {quizzes.map((quiz) => {
                      const hasAttempted = quiz.quiz_attempts && quiz.quiz_attempts.length > 0;
                      const lastAttempt = hasAttempted ? quiz.quiz_attempts[quiz.quiz_attempts.length - 1] : null;
                      
                      return (
                        <Card key={quiz.id} className="hover:shadow-md transition-all">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-base flex items-center space-x-2">
                                  <HelpCircle className="h-4 w-4" />
                                  <span>{quiz.title}</span>
                                </CardTitle>
                                <CardDescription>{quiz.description}</CardDescription>
                              </div>
                              <div className="flex items-center space-x-2">
                                {hasAttempted && (
                                  <Badge variant={lastAttempt?.passed ? "default" : "destructive"}>
                                    {lastAttempt?.passed ? "Passed" : "Failed"}
                                    {lastAttempt && ` (${lastAttempt.score}%)`}
                                  </Badge>
                                )}
                                <Button size="sm">
                                  {hasAttempted ? "Retake" : "Take Quiz"}
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Lessons</span>
                  <span className="font-medium">{lessons.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-medium">{course.total_duration || 0} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Quizzes</span>
                  <span className="font-medium">{quizzes.length}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              </CardContent>
            </Card>

            {progress === 100 && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-700 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Course Completed!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-600 text-sm mb-4">
                    Congratulations! You've completed this course. Download your certificate below.
                  </p>
                  <Button className="w-full" variant="default">
                    <Award className="h-4 w-4 mr-2" />
                    Download Certificate
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};