import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Folder, Plus, Edit, Trash2, GripVertical, Video, FileText, HelpCircle } from "lucide-react";
import { CreateLesson } from "./CreateLesson";
import { EditLesson } from "./EditLesson";

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
  course_id: string;
  course: { title: string } | null;
}

interface Course {
  id: string;
  title: string;
  lessons: Lesson[];
}

export const LessonManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [openCourses, setOpenCourses] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchLessons();
    }
  }, [user]);

  const fetchLessons = async () => {
    try {
      // Get courses owned by this instructor with their lessons
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select(`
          id,
          title,
          lessons(
            id,
            title,
            content,
            type,
            order_index,
            video_url,
            pdf_url,
            duration,
            is_published,
            course_id
          )
        `)
        .eq("instructor_id", user?.id)
        .order("title");

      if (coursesError) throw coursesError;
      
      // Transform data to group lessons by course
      const coursesWithLessons: Course[] = (coursesData || []).map(course => ({
        id: course.id,
        title: course.title,
        lessons: (course.lessons || [])
          .sort((a, b) => a.order_index - b.order_index)
          .map(lesson => ({
            ...lesson,
            type: lesson.type as 'video' | 'text' | 'pdf' | 'quiz',
            course: { title: course.title }
          }))
      }));

      setCourses(coursesWithLessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast({
        title: "Error",
        description: "Failed to fetch lessons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video": return "default";
      case "text": return "secondary";
      case "pdf": return "outline";
      case "quiz": return "destructive";
      default: return "secondary";
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", lessonId);

      if (error) throw error;

      toast({
        title: "Lesson deleted",
        description: "Lesson has been successfully deleted",
      });
      fetchLessons();
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast({
        title: "Error",
        description: "Failed to delete lesson",
        variant: "destructive",
      });
    }
  };

  const toggleCourse = (courseId: string) => {
    const newOpenCourses = new Set(openCourses);
    if (newOpenCourses.has(courseId)) {
      newOpenCourses.delete(courseId);
    } else {
      newOpenCourses.add(courseId);
    }
    setOpenCourses(newOpenCourses);
  };

  const LessonCard = ({ lesson }: { lesson: Lesson }) => (
    <Card className="hover:shadow-md transition-shadow ml-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            <div>
              <CardTitle className="text-lg flex items-center space-x-2">
                {getTypeIcon(lesson.type)}
                <span>{lesson.title}</span>
              </CardTitle>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getTypeColor(lesson.type)}>
              {lesson.type}
            </Badge>
            <Badge variant={lesson.is_published ? "default" : "secondary"}>
              {lesson.is_published ? "Published" : "Draft"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {lesson.content?.substring(0, 150)}...
          </p>
          
          {lesson.type === "video" && lesson.video_url && (
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm">
                <strong>Video URL:</strong> {lesson.video_url}
              </p>
            </div>
          )}

          {lesson.duration && (
            <p className="text-sm text-muted-foreground">
              Duration: {lesson.duration} minutes
            </p>
          )}

          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setEditingLesson(lesson);
                setEditOpen(true);
              }}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleDeleteLesson(lesson.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CourseFolder = ({ course }: { course: Course }) => {
    const isOpen = openCourses.has(course.id);
    
    return (
      <Collapsible open={isOpen} onOpenChange={() => toggleCourse(course.id)}>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Folder className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                    <CardDescription>
                      {course.lessons.length} lesson{course.lessons.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {course.lessons.filter(l => l.is_published).length} published
                  </Badge>
                  {isOpen ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-3">
          {course.lessons.length === 0 ? (
            <Card className="ml-4">
              <CardContent className="py-6 text-center">
                <p className="text-sm text-muted-foreground">No lessons in this course yet.</p>
              </CardContent>
            </Card>
          ) : (
            course.lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))
          )}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading lessons...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lesson Management</h2>
          <p className="text-muted-foreground">Create and organize your course content</p>
        </div>
        <CreateLesson onLessonCreated={fetchLessons} />
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No courses found. Create your first course!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <CourseFolder key={course.id} course={course} />
          ))}
        </div>
      )}

      {editingLesson && (
        <EditLesson
          lesson={editingLesson}
          open={editOpen}
          onOpenChange={setEditOpen}
          onLessonUpdated={fetchLessons}
        />
      )}
    </div>
  );
};