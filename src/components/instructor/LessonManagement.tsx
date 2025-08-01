import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, GripVertical, Video, FileText, HelpCircle } from "lucide-react";
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

export const LessonManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLessons();
    }
  }, [user]);

  const fetchLessons = async () => {
    try {
      // First get lessons for courses owned by this instructor
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("id")
        .eq("instructor_id", user?.id);

      if (coursesError) throw coursesError;
      
      const courseIds = coursesData?.map(c => c.id) || [];
      
      if (courseIds.length === 0) {
        setLessons([]);
        return;
      }

      const { data, error } = await supabase
        .from("lessons")
        .select(`
          *,
          course:courses(title)
        `)
        .in("course_id", courseIds)
        .order("course_id")
        .order("order_index");

      if (error) throw error;
      setLessons((data || []) as Lesson[]);
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

  const LessonCard = ({ lesson }: { lesson: Lesson }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            <div>
              <CardTitle className="text-lg flex items-center space-x-2">
                {getTypeIcon(lesson.type)}
                <span>{lesson.title}</span>
              </CardTitle>
              <CardDescription>
                Course: {lesson.course?.title}
              </CardDescription>
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

      {lessons.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No lessons found. Create your first lesson!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
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