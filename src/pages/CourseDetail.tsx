import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Clock, Users, Star, Play, Download, Award, ArrowLeft, Video, FileText, Lock } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { CourseAccessModal } from "@/components/student/CourseAccessModal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  level: string;
  price: number;
  total_enrollments: number;
  total_duration: number;
  lesson_count: number;
  category?: { name: string };
  profile?: { full_name: string };
}

interface LessonSummary {
  id: string;
  title: string;
  type: string;
  duration: number | null;
  order_index: number;
  is_published: boolean;
  video_url?: string | null;
  content?: string | null;
  pdf_url?: string | null;
}

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [firstLesson, setFirstLesson] = useState<LessonSummary | null>(null);
  const [lessonsOverview, setLessonsOverview] = useState<LessonSummary[]>([]);
  const [showEnrollPrompt, setShowEnrollPrompt] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const baseSelect = `
            *,
            category:categories!courses_category_id_fkey(name),
            profile:profiles!courses_instructor_id_fkey(full_name)
          `;

        let courseData: Course | null = null;

        // Try by slug first (since we may receive a slug in the URL param), then fallback to ID
        const { data: bySlug } = await supabase
          .from('courses')
          .select(baseSelect)
          .eq('slug', id)
          .eq('status', 'approved')
          .eq('soft_deleted', false)
          .maybeSingle();

        if (bySlug) {
          courseData = bySlug;
        } else {
          const { data: byId, error: idErr } = await supabase
            .from('courses')
            .select(baseSelect)
            .eq('id', id)
            .eq('status', 'approved')
            .eq('soft_deleted', false)
            .maybeSingle();
          
          if (idErr && (idErr as { code?: string }).code !== 'PGRST116') {
            throw idErr;
          }
          courseData = byId;
        }

        if (!courseData) {
          throw new Error('Course not found');
        }
        
        setCourse(courseData);

        // Fetch first lesson
        const fetchFirstLesson = async () => {
          return await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', courseData.id)
            .eq('is_published', true)
            .order('order_index')
            .limit(1)
            .maybeSingle();
        };
        
        const { data: lessonsData } = await fetchFirstLesson();

        if (lessonsData) {
          setFirstLesson(lessonsData);
        }

        // Fetch lessons overview for curriculum display
        const { data: lessonsList } = await supabase
          .from('lessons')
          .select('id,title,type,duration,order_index,is_published')
          .eq('course_id', courseData.id)
          .eq('is_published', true)
          .order('order_index');
        setLessonsOverview((lessonsList as unknown as LessonSummary[]) || []);

        // Check if user is enrolled
        if (user) {
          const fetchEnrollment = async () => {
            return await supabase
              .from('enrollments')
              .select('id')
              .eq('course_id', courseData.id)
              .eq('student_id', user.id)
              .maybeSingle();
          };
          
          const { data: enrollment } = await fetchEnrollment();
          setIsEnrolled(!!enrollment);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        toast({
          title: "Error",
          description: "Failed to load course details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, user, toast]);

  const handleEnroll = async () => {
    if (!user || !course) {
      toast({
        title: "Authentication required",
        description: "Please log in to enroll in this course",
        variant: "destructive",
      });
      return;
    }

    // Check if user is a student
    if (profile?.role !== 'student') {
      toast({
        title: "Access Restricted",
        description: "Only students can enroll in courses. Please contact support if you need to switch your account type.",
        variant: "destructive",
      });
      return;
    }

    setEnrolling(true);
    try {
      const createEnrollment = async () => {
        return await supabase
          .from('enrollments')
          .insert({
            course_id: course.id,
            student_id: user.id
          });
      };
      
      const { error } = await createEnrollment();

      if (error) throw error;

      setIsEnrolled(true);
      toast({
        title: "Success!",
        description: "You've successfully enrolled in this course",
      });
    } catch (error) {
      console.error('Error enrolling:', error);
      toast({
        title: "Error",
        description: "Failed to enroll in course",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch ((type || '').toLowerCase()) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getLessonThumb = (type?: string) => {
    if ((type || '').toLowerCase() === 'video') {
      return course?.thumbnail_url || "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=1200&auto=format&fit=crop&q=60";
    }
    return course?.thumbnail_url || "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=1200&auto=format&fit=crop&q=60";
  };

  const renderFirstLessonContent = () => {
    if (!firstLesson) return null;

    const onContentEnd = () => {
      if (!isEnrolled) {
        setShowEnrollPrompt(true);
      }
    };

    return (
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Preview: {firstLesson.title}</h3>
          <div className="flex items-center space-x-2">
            {firstLesson.type === 'video' && <Video className="h-4 w-4" />}
            {firstLesson.type === 'text' && <FileText className="h-4 w-4" />}
            {firstLesson.type === 'pdf' && <FileText className="h-4 w-4" />}
            <span className="text-sm text-muted-foreground capitalize">{firstLesson.type}</span>
          </div>
        </div>

        {firstLesson.type === 'video' && firstLesson.video_url ? (
          <div className="relative rounded-lg overflow-hidden mb-4">
            {firstLesson.video_url.includes('youtube.com') || firstLesson.video_url.includes('youtu.be') ? (
              <div className="aspect-video">
                <iframe
                  className="w-full h-full"
                  src={firstLesson.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  title={firstLesson.title}
                  frameBorder="0"
                  allowFullScreen
                  onLoad={onContentEnd}
                />
              </div>
            ) : (
              <video 
                className="w-full h-auto max-h-96"
                controls
                onEnded={onContentEnd}
                poster={course?.thumbnail_url}
              >
                <source src={firstLesson.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        ) : firstLesson.type === 'text' && firstLesson.content ? (
          <div className="prose prose-sm max-w-none mb-4 p-4 bg-muted/20 rounded-lg">
            <div dangerouslySetInnerHTML={{ __html: firstLesson.content.slice(0, 300) + (firstLesson.content.length > 300 ? '...' : '') }} />
          </div>
        ) : firstLesson.type === 'pdf' && firstLesson.pdf_url ? (
          <div className="bg-muted/20 rounded-lg p-6 text-center mb-4">
            <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h4 className="font-semibold mb-2">PDF Preview</h4>
            <p className="text-sm text-muted-foreground mb-4">{firstLesson.title}</p>
            <Button variant="outline" size="sm" onClick={onContentEnd}>
              <FileText className="h-4 w-4 mr-2" />
              View Preview
            </Button>
          </div>
        ) : (
          <div className="bg-muted/20 rounded-lg p-6 text-center mb-4">
            <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Preview content will be available soon</p>
          </div>
        )}

        {showEnrollPrompt && !isEnrolled && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
            <Lock className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h4 className="font-semibold mb-2">Want to continue learning?</h4>
            <p className="text-sm text-muted-foreground">
              Enroll to unlock all lessons. Use the Enroll Now button above.
            </p>
          </div>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16">
            <Skeleton className="h-8 w-32 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-64 w-full mb-6" />
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-6" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div>
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold mb-4">Course not found</h1>
            <p className="text-muted-foreground mb-8">The course you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/courses">Browse All Courses</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/courses" className="hover:text-primary">Courses</Link>
            <span>/</span>
            <span className="text-foreground">{course.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Course Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  {course.category && (
                    <Badge variant="secondary">{course.category.name}</Badge>
                  )}
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                
                <p className="text-lg text-muted-foreground mb-6">
                  by <span className="font-medium text-foreground">{course.profile?.full_name || 'Patronecs'}</span>
                </p>

                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.total_enrollments} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{Math.floor(course.total_duration / 60)}h total</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.lesson_count} lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>4.8 (1,234 reviews)</span>
                  </div>
                </div>
              </div>

              {/* First Lesson Preview */}
              {firstLesson && renderFirstLessonContent()}

              {/* Course Image - Only show if no first lesson or no video */}
              {(!firstLesson || (firstLesson.type !== 'video' || !firstLesson.video_url)) && (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-8">
                  {course.thumbnail_url ? (
                    <ImageWithFallback
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Play className="h-16 w-16 text-primary" />
                    </div>
                  )}
                </div>
              )}

              {/* Course Description */}
              <Card className="p-6 mb-8 bg-card-gradient">
                <h2 className="text-2xl font-semibold mb-4">About this course</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {course.description || "No description available for this course."}
                </p>
              </Card>

              {/* Curriculum (Locked until enroll) */}
              <Card className="p-6 mb-8">
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Curriculum
                </h2>
                {lessonsOverview.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No lessons available yet.</p>
                ) : (
                  <div className="space-y-2">
                    {/* Some Chapters Included */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {lessonsOverview.slice(0, 3).map((lesson: LessonSummary, idx: number) => (
                        <div
                          key={`preview-${lesson.id}`}
                          className="rounded-lg overflow-hidden border hover:shadow-md transition cursor-pointer"
                          onClick={() => (!isEnrolled ? setShowAccessModal(true) : (window.location.href = `/course-learning/${course.id}`))}
                        >
                          <div className="relative aspect-video bg-muted">
                            <ImageWithFallback
                              src={getLessonThumb(lesson.type)}
                              alt={lesson.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-3">
                            <div className="text-xs text-muted-foreground mb-1">Lesson {idx + 1}</div>
                            <div className="font-medium line-clamp-2">{lesson.title}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Explore Every Course Chapter */}
                    <div className="hidden md:grid grid-cols-12 px-3 py-2 text-xs text-muted-foreground">
                      <div className="col-span-6">Chapter</div>
                      <div className="col-span-3">Type</div>
                      <div className="col-span-2">Duration</div>
                      <div className="col-span-1 text-right">Status</div>
                    </div>
                    {lessonsOverview.map((lesson: LessonSummary, idx: number) => (
                      <div
                        key={lesson.id}
                        className="grid grid-cols-12 items-center px-3 py-3 rounded-lg border hover:bg-muted/40 transition cursor-pointer"
                        onClick={() => (!isEnrolled ? setShowAccessModal(true) : (window.location.href = `/course-learning/${course.id}`))}
                      >
                        <div className="col-span-12 md:col-span-6 flex items-center gap-3">
                          {getTypeIcon(lesson.type)}
                          <span className="text-sm font-medium">L{idx + 1}: {lesson.title}</span>
                        </div>
                        <div className="col-span-6 md:col-span-3 mt-2 md:mt-0 text-xs md:text-sm text-muted-foreground capitalize">
                          {lesson.type}
                        </div>
                        <div className="col-span-3 md:col-span-2 mt-2 md:mt-0 text-xs md:text-sm text-muted-foreground">
                          {lesson.duration || 0} min
                        </div>
                        <div className="col-span-3 md:col-span-1 mt-2 md:mt-0 flex justify-end">
                          {!isEnrolled ? (
                            <Badge variant="outline" className="border-dashed">
                              <Lock className="h-3 w-3 mr-1" /> Locked
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Unlocked</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!isEnrolled && (
                  <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-md text-center">
                    <p className="text-sm">Enroll to unlock all lessons and start learning.</p>
                  </div>
                )}
              </Card>

              {/* What you'll learn */}
              <Card className="p-6 mb-8 bg-card-gradient">
                <h2 className="text-2xl font-semibold mb-4">What you'll learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Master the fundamentals and advanced concepts",
                    "Build real-world projects from scratch",
                    "Best practices and industry standards",
                    "Hands-on exercises and practical examples",
                    "Certificate of completion",
                    "Lifetime access to course materials"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div>
              <Card className="p-6 bg-card-gradient sticky top-24">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {course.price === 0 ? 'FREE' : `$${course.price}`}
                  </div>
                  <p className="text-sm text-muted-foreground">Full lifetime access</p>
                </div>

                {user ? (
                  profile?.role === 'student' ? (
                    isEnrolled ? (
                      <div className="space-y-4">
                        <Button className="w-full" asChild>
                          <Link to="/student">
                            <Play className="w-4 h-4 mr-2" />
                            Continue Learning
                          </Link>
                        </Button>
                        <div className="text-center">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            ✓ Enrolled
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={handleEnroll}
                        disabled={enrolling}
                      >
                        {enrolling ? "Enrolling..." : "Enroll Now"}
                      </Button>
                    )
                  ) : (
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">
                        Only students can enroll in courses
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Contact support to change your account type
                      </p>
                    </div>
                  )
                ) : (
                  <Button className="w-full" asChild>
                    <Link to="/auth">Sign up to Enroll</Link>
                  </Button>
                )}

                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-semibold mb-4">This course includes:</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-primary" />
                      <span>{course.lesson_count} video lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-primary" />
                      <span>Downloadable resources</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Lifetime access</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      {/* Access modal for locked content */}
      <CourseAccessModal
        open={showAccessModal}
        onOpenChange={setShowAccessModal}
        isSignedIn={!!user}
        isEnrolled={isEnrolled}
        price={course?.price}
        onEnroll={handleEnroll}
        enrolling={enrolling}
        backgroundUrl={course?.thumbnail_url}
        headerTitle={firstLesson?.title}
        headerSubtitle={`Lesson preview • ${firstLesson?.duration || 0} min`}
      />
      <Footer />
    </div>
  );
};

export default CourseDetail;
// Render access modal at root of page
// Note: Keeping outside main return would require portals; we include it above footer instead