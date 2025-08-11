import { useState, useEffect, useCallback, type ComponentProps } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { LessonPlayer } from "./LessonPlayer";
import { CourseFeedback } from "./CourseFeedback";
import { 
  LessonCardSkeleton, 
  QuizCardSkeleton, 
  CourseOverviewSkeleton, 
  NavigationSkeleton,
  LessonPlayerSkeleton
} from "@/components/ui/skeleton-loader";
import { 
  Play, 
  CheckCircle, 
  Clock, 
  FileText, 
  Video, 
  HelpCircle, 
  BookOpen,
  ArrowLeft,
  Award,
  List,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Trophy
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
  quiz?: Quiz;
  lesson_progress?: {
    id?: string;
    is_completed: boolean;
    completed_at: string;
    student_id?: string;
    video_watch_progress?: number;
    video_watched_seconds?: number;
    pdf_viewed?: boolean;
    text_read?: boolean;
    quiz_passed?: boolean;
    last_accessed_at?: string;
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
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [showCourseContent, setShowCourseContent] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  const fetchCourseData = useCallback(async () => {
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles!courses_instructor_id_fkey(full_name)
        `)
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      // Fetch lessons with progress
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select(`
          *,
          lesson_progress!fk_lesson_progress_lesson_id(
            id,
            student_id,
            is_completed,
            completed_at,
            video_watch_progress,
            video_watched_seconds,
            pdf_viewed,
            text_read,
            quiz_passed,
            last_accessed_at
          )
        `)
        .eq('course_id', courseId)
        .eq('is_published', true)
        .order('order_index');

      if (lessonsError) throw lessonsError;

      // Fetch quizzes with attempts - Fixed RLS handling
      const lessonIds = (lessonsData || []).map(l => l.id);
      let quizzesData = [];
      
      if (lessonIds.length > 0) {
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select(`
            *,
            quiz_attempts!fk_quiz_attempts_quiz_id(id, score, passed, completed_at, student_id)
          `)
          .in('lesson_id', lessonIds);

        if (quizError) {
          console.error('Error fetching quizzes:', quizError);
        } else {
          // Filter quiz attempts for current user
          quizzesData = (quizData || []).map(quiz => ({
            ...quiz,
            quiz_attempts: (quiz.quiz_attempts || []).filter(attempt => 
              attempt.student_id === user?.id
            )
          }));
        }
      }
      
      setCourse(courseData);

      const mappedLessons = ((lessonsData || []) as unknown as Lesson[]).map((lesson) => ({
        ...lesson,
        lesson_progress: lesson.lesson_progress ? lesson.lesson_progress.filter(progress => 
          progress.student_id === user?.id
        ) : []
      })) as Lesson[];
      setLessons(mappedLessons);
      setQuizzes(quizzesData || []);

      // Calculate progress
      const completedLessons = mappedLessons.filter(lesson => 
        lesson.lesson_progress && lesson.lesson_progress.some(progress => 
          progress.student_id === user?.id && progress.is_completed
        )
      ).length;
      const totalLessons = mappedLessons.length;
      const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      setProgress(progressPercentage);

      // Persist course progress on enrollment so other views (e.g., Continue Learning) reflect it
      if (user && courseId) {
        try {
          await supabase
            .from('enrollments')
            .update({
              progress: Math.round(progressPercentage),
              updated_at: new Date().toISOString(),
              // set completed_at when finished
              ...(Math.round(progressPercentage) === 100 ? { completed_at: new Date().toISOString() } : {})
            })
            .eq('student_id', profile?.id || user.id)
            .eq('course_id', courseId);

          // Issue certificate when course is completed
          if (Math.round(progressPercentage) === 100) {
            // Try to get a generated certificate number from DB, fallback to client-generated
            let certificateNumber = `CERT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
            try {
              const { data: genNum } = await supabase.rpc('generate_certificate_number');
              if (genNum) certificateNumber = genNum as unknown as string;
            } catch (_) { /* ignore */ }

            await supabase
              .from('certificates')
              .upsert({
                student_id: (profile?.id || user.id) as string,
                course_id: courseId,
                certificate_number: certificateNumber,
                issued_at: new Date().toISOString()
              } as unknown as { student_id: string; course_id: string; certificate_number: string; issued_at: string }, {
                onConflict: 'student_id,course_id'
              });
          }
        } catch (e) {
          console.error('Error updating enrollment progress / certificate:', e);
        }
      }

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
  }, [courseId, toast, user?.id]);

  useEffect(() => {
    if (user && courseId) {
      fetchCourseData();
    }
  }, [user, courseId, fetchCourseData]);

  const markLessonComplete = async (lessonId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          student_id: user.id,
          lesson_id: lessonId,
          is_completed: true,
          completed_at: new Date().toISOString()
        } as unknown as { student_id: string; lesson_id: string; is_completed: boolean; completed_at: string }, { onConflict: 'student_id,lesson_id' });

      if (error) throw error;

      toast({
        title: "Lesson Completed!",
        description: "Great job! You've completed this lesson.",
      });

      // Refresh course data to show updated progress
      await fetchCourseData();
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      toast({
        title: "Error",
        description: "Failed to mark lesson as complete. Please try again.",
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

  const startLesson = (lesson: Lesson) => {
    // Find and attach quiz to lesson if it exists
    const lessonQuiz = quizzes.find(quiz => quiz.lesson_id === lesson.id);
    const lessonWithQuiz = lessonQuiz ? { ...lesson, quiz: lessonQuiz } : lesson;
    
    setCurrentLesson(lessonWithQuiz);
    setShowCourseContent(false);
    setShowFeedback(false);
  };

  const goToNext = () => {
    if (!currentLesson) return;
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex < lessons.length - 1) {
      const nextLesson = lessons[currentIndex + 1];
      const lessonQuiz = quizzes.find(quiz => quiz.lesson_id === nextLesson.id);
      const lessonWithQuiz = lessonQuiz ? { ...nextLesson, quiz: lessonQuiz } : nextLesson;
      setCurrentLesson(lessonWithQuiz);
    }
  };

  const goToPrevious = () => {
    if (!currentLesson) return;
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex > 0) {
      const prevLesson = lessons[currentIndex - 1];
      const lessonQuiz = quizzes.find(quiz => quiz.lesson_id === prevLesson.id);
      const lessonWithQuiz = lessonQuiz ? { ...prevLesson, quiz: lessonQuiz } : prevLesson;
      setCurrentLesson(lessonWithQuiz);
    }
  };

  const backToCourseContent = () => {
    setCurrentLesson(null);
    setShowCourseContent(true);
    setShowFeedback(false);
  };

  const showCourseFeedback = () => {
    setCurrentLesson(null);
    setShowCourseContent(false);
    setShowFeedback(true);
  };

  const getCurrentLessonIndex = () => {
    if (!currentLesson) return -1;
    return lessons.findIndex(l => l.id === currentLesson.id);
  };

  const toggleLessonExpanded = (lessonId: string) => {
    setExpandedLessons(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(lessonId)) {
        newExpanded.delete(lessonId);
      } else {
        newExpanded.add(lessonId);
      }
      return newExpanded;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/student">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div>
                  <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="h-4 w-16 bg-muted rounded animate-pulse mb-1" />
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-8 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Navigation Skeleton */}
            <div className="lg:col-span-1">
              <NavigationSkeleton />
            </div>

            {/* Main Content Area Skeleton */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                <div>
                  <div className="h-6 w-48 bg-muted rounded animate-pulse mb-4" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <LessonCardSkeleton key={i} />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="h-6 w-56 bg-muted rounded animate-pulse mb-4" />
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <QuizCardSkeleton key={i} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
              <Link to="/student">
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant={showCourseContent ? "default" : "outline"} 
                  className="w-full justify-start"
                  onClick={backToCourseContent}
                >
                  <List className="h-4 w-4 mr-2" />
                  Course Content
                </Button>
                
                <Button 
                  variant={showFeedback ? "default" : "outline"} 
                  className="w-full justify-start"
                  onClick={showCourseFeedback}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Give Feedback
                </Button>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Lessons</h4>
                  <div className="space-y-2">
                    {lessons.map((lesson, index) => {
                      const isCompleted = lesson.lesson_progress && lesson.lesson_progress.length > 0 && lesson.lesson_progress[0].is_completed;
                      const isCurrent = currentLesson?.id === lesson.id;
                      
                      return (
                        <Button
                          key={lesson.id}
                          variant={isCurrent ? "default" : "ghost"}
                          size="sm"
                          className={`w-full justify-start text-left ${isCompleted ? 'text-green-600' : ''}`}
                          onClick={() => startLesson(lesson)}
                        >
                          <div className="flex items-center space-x-2">
                            {isCompleted ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <div className="h-3 w-3 border border-gray-300 rounded-full" />
                            )}
                            {getTypeIcon(lesson.type)}
                            <span className="truncate">L{index + 1}: {lesson.title}</span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>

                {progress === 100 && (
                  <div className="pt-4 border-t">
                    <Button className="w-full" variant="default">
                      <Award className="h-4 w-4 mr-2" />
                      Get Certificate
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {currentLesson && !showCourseContent && !showFeedback && (
              <LessonPlayer
                key={currentLesson.id}
                lesson={currentLesson}
                onComplete={markLessonComplete}
                onNext={goToNext}
                onPrevious={goToPrevious}
                hasNext={getCurrentLessonIndex() < lessons.length - 1}
                hasPrevious={getCurrentLessonIndex() > 0}
              />
            )}

            {showFeedback && (
              <CourseFeedback 
                courseId={courseId!} 
                courseName={course.title} 
              />
            )}

            {showCourseContent && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Course Content
                  </h2>
                  <div className="space-y-3">
                    {lessons.map((lesson, index) => {
                      const isCompleted = lesson.lesson_progress && lesson.lesson_progress.length > 0 && lesson.lesson_progress[0].is_completed;
                      const lessonQuiz = quizzes.find(quiz => quiz.lesson_id === lesson.id);
                      const hasQuizAttempt = lessonQuiz?.quiz_attempts && lessonQuiz.quiz_attempts.length > 0;
                      const quizPassed = hasQuizAttempt && lessonQuiz.quiz_attempts[lessonQuiz.quiz_attempts.length - 1].passed;
                      const isExpanded = expandedLessons.has(lesson.id);
                      
                      return (
                        <Collapsible key={lesson.id} open={isExpanded} onOpenChange={() => toggleLessonExpanded(lesson.id)}>
                          <Card className={`transition-all ${isCompleted ? 'bg-green-50 border-green-200' : 'hover:shadow-md'}`}>
                            <CollapsibleTrigger asChild>
                              <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    {isCompleted ? (
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                      <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                                    )}
                                    <div className="flex-1">
                                      <CardTitle className="text-base flex items-center space-x-2">
                                        {getTypeIcon(lesson.type)}
                                        <span>Lesson {index + 1}: {lesson.title}</span>
                                        {lessonQuiz && (
                                          <Badge variant="outline" className="ml-2">
                                            <HelpCircle className="h-3 w-3 mr-1" />
                                            Quiz
                                          </Badge>
                                        )}
                                      </CardTitle>
                                      <CardDescription className="flex items-center space-x-2 mt-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{lesson.duration || 0} minutes</span>
                                        {lessonQuiz && hasQuizAttempt && (
                                          <>
                                            <span>•</span>
                                            <Badge variant={quizPassed ? "default" : "destructive"} className="text-xs">
                                              Quiz: {quizPassed ? "Passed" : "Failed"}
                                            </Badge>
                                          </>
                                        )}
                                      </CardDescription>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline">{lesson.type}</Badge>
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              <CardContent className="pt-0">
                                <div className="space-y-4">
                                  {/* Lesson Content Preview */}
                                  <div className="bg-muted/30 rounded-lg p-4">
                                    <h4 className="font-medium mb-2 flex items-center">
                                      {getTypeIcon(lesson.type)}
                                      <span className="ml-2">Lesson Content</span>
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-3">
                                      {lesson.content ? lesson.content.substring(0, 150) + (lesson.content.length > 150 ? '...' : '') : 'No description available'}
                                    </p>
                                    <Button
                                      size="sm"
                                      onClick={() => startLesson(lesson)}
                                      className="w-full"
                                    >
                                      <Play className="h-3 w-3 mr-2" />
                                      {isCompleted ? 'Review Lesson' : 'Start Lesson'}
                                    </Button>
                                  </div>

                                  {/* Quiz Section */}
                                  {lessonQuiz && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                      <h4 className="font-medium mb-2 flex items-center">
                                        <HelpCircle className="h-4 w-4 text-blue-600" />
                                        <span className="ml-2">{lessonQuiz.title}</span>
                                      </h4>
                                      <p className="text-sm text-muted-foreground mb-3">
                                        {lessonQuiz.description || 'Test your understanding of this lesson'}
                                      </p>
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                          <span className="flex items-center">
                                            <Trophy className="h-3 w-3 mr-1" />
                                            Passing Score: {lessonQuiz.passing_score}%
                                          </span>
                                        </div>
                                        {hasQuizAttempt && (
                                          <Badge variant={quizPassed ? "default" : "destructive"} className="text-xs">
                                            {quizPassed ? "Passed" : "Failed"} 
                                            {lessonQuiz.quiz_attempts && ` (${lessonQuiz.quiz_attempts[lessonQuiz.quiz_attempts.length - 1].score}%)`}
                                          </Badge>
                                        )}
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => startLesson(lesson)}
                                        className="w-full border-blue-200 hover:bg-blue-100"
                                      >
                                        <HelpCircle className="h-3 w-3 mr-2" />
                                        {hasQuizAttempt ? 'Retake Quiz' : 'Take Quiz'}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};