import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BookOpen, Play, Clock, Award, Users, ChevronDown, CheckCircle, HelpCircle, Target, Video, FileText, Lock } from "lucide-react";
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
    lessons: Array<{
      id: string;
      title: string;
      type: string;
      duration: number;
      order_index: number;
      quizzes: Array<{
        id: string;
        title: string;
        passing_score: number;
        quiz_questions: Array<{ id: string }>;
      }>;
      lesson_progress: Array<{
        id: string;
        is_completed: boolean;
        completed_at: string | null;
      }>;
    }>;
  };
}

export function StudentCourses() {
  const { user, profile } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('StudentCourses useEffect - user:', user, 'profile:', profile);
    if (user && profile) {
      fetchEnrolledCourses();
    }
  }, [user, profile]);

  const fetchEnrolledCourses = async () => {
    try {
      console.log('Fetching enrolled courses for user:', user?.id);
      
      // First, let's check if there are any courses at all
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, status')
        .limit(10);
      
      console.log('Available courses:', { coursesData, coursesError });
      
      // Check if there are any enrollments at all
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*')
        .limit(10);
      
      console.log('All enrollments:', { enrollmentsData, enrollmentsError });
      
      // Check if the current user has any enrollments
      const { data: userEnrollments, error: userEnrollmentsError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', user?.id);
      
      console.log('User enrollments:', { userEnrollments, userEnrollmentsError });
      
      // If user has no enrollments, let's create one for testing
      if (!userEnrollments || userEnrollments.length === 0) {
        console.log('No enrollments found for user, creating test enrollment...');
        
        if (coursesData && coursesData.length > 0 && profile?.id) {
          const firstCourse = coursesData[0];
          console.log('Creating enrollment for course:', firstCourse, 'with profile ID:', profile.id);
          
          const { data: newEnrollment, error: createError } = await supabase
            .from('enrollments')
            .insert({
              student_id: profile.id, // Use profile.id, not user.id
              course_id: firstCourse.id
            })
            .select();
          
          console.log('Test enrollment created:', { newEnrollment, createError });
          
          if (createError) {
            console.error('Failed to create test enrollment:', createError);
          }
        }
      }
      
      // Now try to fetch the enrolled courses with the full query
       const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses!fk_enrollments_course_id(
            id, title, description, thumbnail_url, level, 
            total_duration, lesson_count, instructor_id,
            profiles!instructor_id(full_name),
              lessons(
              id, title, type, duration, order_index,
              quizzes(
                id, title, passing_score,
                quiz_questions(id)
              ),
                lesson_progress!fk_lesson_progress_lesson_id(
                  id, is_completed, completed_at
                )
            )
          )
        `)
        .eq('student_id', user?.id)
        .order('enrolled_at', { ascending: false });

      console.log('Final Supabase response:', { data, error });
      
      if (error) {
        console.error('Error in main query:', error);
        throw error;
      }
      
      // Recalculate course progress from lesson completions if server-side value is stale
      const recalculated = (data || []).map((enrollment: any) => {
        const lessons = enrollment.courses?.lessons || [];
        const completed = lessons.filter((l: any) => l.lesson_progress?.[0]?.is_completed).length;
        const total = lessons.length || 1;
        const computed = Math.round((completed / total) * 100);
        return { ...enrollment, progress: Math.max(enrollment.progress || 0, computed) } as EnrolledCourse;
      });
      setEnrolledCourses(recalculated);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const testEnrollment = async () => {
    try {
      // Get the first available course
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .limit(1);
      
      if (courses && courses.length > 0 && profile?.id) {
        const { data, error } = await supabase
          .from('enrollments')
          .insert({
            student_id: profile.id, // Use profile.id, not user.id
            course_id: courses[0].id
          });
        
        console.log('Test enrollment result:', { data, error });
        
        if (!error) {
          // Refresh the enrolled courses
          fetchEnrolledCourses();
        }
      }
    } catch (error) {
      console.error('Error creating test enrollment:', error);
    }
  };

  const createTestData = async () => {
    try {
      console.log('Creating test data...');
      
      // First, check if we have any categories
      const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .limit(1);
      
      let categoryId = categories?.[0]?.id;
      
      // Create a category if none exists
      if (!categoryId) {
        const { data: newCategory } = await supabase
          .from('categories')
          .insert({
            name: 'Programming',
            description: 'Software development and programming languages'
          })
          .select()
          .single();
        
        categoryId = newCategory?.id;
        console.log('Created category:', newCategory);
      }
      
      // Create a test course if none exists
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .limit(1);
      
      let courseId = courses?.[0]?.id;
      
      if (!courseId && categoryId) {
        const { data: newCourse } = await supabase
          .from('courses')
          .insert({
            title: 'Introduction to Web Development',
            description: 'Learn the basics of HTML, CSS, and JavaScript',
            category_id: categoryId,
            instructor_id: user?.id, // Use current user as instructor for testing
            level: 'beginner',
            status: 'approved',
            total_duration: 120,
            lesson_count: 5
          })
          .select()
          .single();
        
        courseId = newCourse?.id;
        console.log('Created course:', newCourse);
      }
      
      // Create test lessons if course exists
      if (courseId) {
        const { data: lessons } = await supabase
          .from('lessons')
          .select('id')
          .eq('course_id', courseId)
          .limit(1);
        
        if (!lessons || lessons.length === 0) {
          const { data: newLessons } = await supabase
            .from('lessons')
            .insert([
              {
                title: 'HTML Basics',
                content: 'Learn the fundamentals of HTML markup',
                type: 'text',
                duration: 30,
                order_index: 1,
                course_id: courseId,
                is_published: true
              },
              {
                title: 'CSS Styling',
                content: 'Style your HTML with CSS',
                type: 'text',
                duration: 45,
                order_index: 2,
                course_id: courseId,
                is_published: true
              },
              {
                title: 'JavaScript Fundamentals',
                content: 'Add interactivity with JavaScript',
                type: 'text',
                duration: 45,
                order_index: 3,
                course_id: courseId,
                is_published: true
              }
            ])
            .select();
          
          console.log('Created lessons:', newLessons);
        }
      }
      
      // Create enrollment if course exists
      if (courseId && profile?.id) {
        const { data: enrollment } = await supabase
          .from('enrollments')
          .insert({
            student_id: profile.id, // Use profile.id, not user.id
            course_id: courseId
          })
          .select()
          .single();
        
        console.log('Created enrollment:', enrollment);
      }
      
      // Refresh the data
      fetchEnrolledCourses();
      
    } catch (error) {
      console.error('Error creating test data:', error);
    }
  };

  const getStatusBadge = (progress: number) => {
    if (progress === 0) return <Badge variant="secondary">Not Started</Badge>;
    if (progress < 100) return <Badge variant="outline">In Progress</Badge>;
    return <Badge variant="default">Completed</Badge>;
  };

  const isLessonUnlocked = (lessons: EnrolledCourse['courses']['lessons'], lessonIndex: number) => {
    if (lessonIndex === 0) return true; // First lesson is always unlocked
    
    // Check if previous lesson is completed
    const previousLesson = lessons[lessonIndex - 1];
    if (!previousLesson) return true;
    
    return previousLesson.lesson_progress && 
           previousLesson.lesson_progress.length > 0 && 
           previousLesson.lesson_progress[0].is_completed;
  };

  const getLessonProgress = (lesson: EnrolledCourse['courses']['lessons'][0]) => {
    if (!lesson.lesson_progress || lesson.lesson_progress.length === 0) {
      return 0;
    }
    
    const progress = lesson.lesson_progress[0];
    
    // For now, just check if the lesson is completed
    // When the detailed progress tracking is implemented, this can be enhanced
    if (progress.is_completed) {
      return 100;
    }
    
    return 0;
  };

  const checkPermissions = async () => {
    try {
      console.log('Checking user permissions...');
      
      // Check if user can view their own profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      console.log('Profile access:', { profile, profileError });
      
      // Check if user can view courses
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title')
        .limit(1);
      
      console.log('Courses access:', { courses, coursesError });
      
      // Check if user can view enrollments
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*')
        .limit(1);
      
      console.log('Enrollments access:', { enrollments, enrollmentsError });
      
      // Check if user can insert enrollments
      if (courses && courses.length > 0 && profile?.id) {
        const { data: testInsert, error: insertError } = await supabase
          .from('enrollments')
          .insert({
            student_id: profile.id, // Use profile.id, not user.id
            course_id: courses[0].id
          })
          .select();
        
        console.log('Test insert result:', { testInsert, insertError });
        
        // Clean up test insert
        if (testInsert && testInsert.length > 0) {
          await supabase
            .from('enrollments')
            .delete()
            .eq('id', testInsert[0].id);
        }
      }
      
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
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
        <div className="space-x-2">
          <Button>Browse Available Courses</Button>
          <Button variant="outline" onClick={testEnrollment}>
            Test: Enroll in First Course
          </Button>
          <Button variant="outline" onClick={createTestData}>
            Create Test Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Information */}
      <div className="bg-muted p-4 rounded-lg text-sm">
        <h4 className="font-semibold mb-2">Debug Info:</h4>
        <p>User ID: {user?.id || 'Not authenticated'}</p>
        <p>Profile ID: {profile?.id || 'No profile'}</p>
        <p>Profile Role: {profile?.role || 'No role'}</p>
        <p>Enrolled Courses Count: {enrolledCourses.length}</p>
        <div className="mt-2 space-x-2">
          <Button size="sm" variant="outline" onClick={checkPermissions}>
            Check Permissions
          </Button>
          <Button size="sm" variant="outline" onClick={createTestData}>
            Create Test Data
          </Button>
        </div>
      </div>
      
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

              {/* Course Content - Collapsible Lessons */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <span className="text-sm font-medium">Course Content</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {enrollment.courses.lessons
                    ?.sort((a, b) => a.order_index - b.order_index)
                    .map((lesson, index) => {
                      const isUnlocked = isLessonUnlocked(enrollment.courses.lessons, index);
                      const lessonProgress = getLessonProgress(lesson);
                      const isCompleted = lesson.lesson_progress && 
                                        lesson.lesson_progress.length > 0 && 
                                        lesson.lesson_progress[0].is_completed;
                      
                      return (
                        <div key={lesson.id} className={`border rounded p-3 space-y-2 ${
                          !isUnlocked ? 'opacity-50 bg-muted/30' : ''
                        } ${isCompleted ? 'border-green-200 bg-green-50/30' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                isCompleted 
                                  ? 'bg-green-100 text-green-700' 
                                  : isUnlocked 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'bg-muted text-muted-foreground'
                              }`}>
                                {isCompleted ? '✓' : index + 1}
                              </span>
                              <span className="text-sm font-medium">{lesson.title}</span>
                              {!isUnlocked && (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{lesson.duration}min</span>
                            </div>
                          </div>
                          
                          {/* Lesson Progress Bar */}
                          {isUnlocked && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Progress</span>
                                <span>{lessonProgress}%</span>
                              </div>
                              <Progress value={lessonProgress} className="h-1" />
                            </div>
                          )}
                          
                          {/* Show quiz if exists */}
                          {lesson.quizzes && lesson.quizzes.length > 0 && (
                            <div className="ml-6 space-y-1">
                              {lesson.quizzes.map((quiz) => (
                                <div key={quiz.id} className="flex items-center justify-between bg-secondary/20 p-2 rounded">
                                  <div className="flex items-center space-x-2">
                                    <HelpCircle className="h-3 w-3 text-blue-500" />
                                    <span className="text-xs font-medium">{quiz.title}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                    <Target className="h-3 w-3" />
                                    <span>{quiz.quiz_questions?.length || 0} questions</span>
                                    <span>•</span>
                                    <span>{quiz.passing_score}% to pass</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Lesson Type Indicators */}
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            {lesson.type === 'video' && <Video className="h-3 w-3" />}
                            {lesson.type === 'pdf' && <FileText className="h-3 w-3" />}
                            {lesson.type === 'text' && <FileText className="h-3 w-3" />}
                            {lesson.type === 'quiz' && <HelpCircle className="h-3 w-3" />}
                            <span className="capitalize">{lesson.type}</span>
                          </div>
                        </div>
                      );
                    })}
                </CollapsibleContent>
              </Collapsible>

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