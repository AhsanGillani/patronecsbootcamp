import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Copy, Trash2, Eye, Clock, Users } from "lucide-react";
import { CreateCourse } from "./CreateCourse";
import { EditCourse } from "./EditCourse";

interface Course {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  price: number;
  level: string;
  total_enrollments: number;
  lesson_count: number;
  total_duration: number;
  admin_comments: string;
  created_at: string;
  category_id: string | null;
  thumbnail_url: string | null;
  category: { name: string } | null;
}

export const MyCourses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          id,
          title,
          description,
          status,
          price,
          level,
          total_enrollments,
          lesson_count,
          total_duration,
          admin_comments,
          created_at,
          category_id,
          thumbnail_url,
          category:categories!courses_category_id_fkey(name)
        `)
        .eq("instructor_id", user?.id)
        .eq("soft_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Handle potential null category relationships
      const coursesWithCategory = (data || []).map((course: any) => ({
        ...course,
        category: course.category || { name: "Uncategorized" }
      }));
      
      setCourses(coursesWithCategory);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "secondary";
      case "pending": return "default";
      case "approved": return "default";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved": return "default";
      default: return "secondary";
    }
  };

  const filterCoursesByStatus = (status: string) => {
    return courses.filter(course => course.status === status);
  };

  const handleDuplicateCourse = async (courseId: string) => {
    try {
      const originalCourse = courses.find(c => c.id === courseId);
      if (!originalCourse) return;

      const { data, error } = await supabase
        .from("courses")
        .insert({
          title: `${originalCourse.title} (Copy)`,
          description: originalCourse.description,
          price: originalCourse.price,
          level: originalCourse.level as "beginner" | "intermediate" | "advanced",
          category_id: originalCourse.category ? null : null,
          instructor_id: user?.id,
          status: "draft"
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Course duplicated",
        description: "Course has been successfully duplicated",
      });
      fetchCourses();
    } catch (error) {
      console.error("Error duplicating course:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate course",
        variant: "destructive",
      });
    }
  };

  const handleSoftDelete = async (courseId: string) => {
    try {
      // 1) Soft delete the course so it disappears from listings
      const { error: courseErr } = await supabase
        .from("courses")
        .update({ soft_deleted: true })
        .eq("id", courseId);

      if (courseErr) throw courseErr;

      // 2) Cascade delete lessons and quizzes belonging to this course
      // Fetch lessons for the course
      const { data: lessons, error: lessonsErr } = await supabase
        .from("lessons")
        .select("id")
        .eq("course_id", courseId);

      if (lessonsErr) throw lessonsErr;

      const lessonIds = (lessons || []).map((l: any) => l.id);

      if (lessonIds.length > 0) {
        // Fetch quizzes for these lessons
        const { data: quizzes, error: quizzesErr } = await supabase
          .from("quizzes")
          .select("id")
          .in("lesson_id", lessonIds);
        if (quizzesErr) throw quizzesErr;
        const quizIds = (quizzes || []).map((q: any) => q.id);

        // Delete quiz questions first (if any)
        if (quizIds.length > 0) {
          const { error: qqErr } = await supabase
            .from("quiz_questions")
            .delete()
            .in("quiz_id", quizIds);
          if (qqErr) throw qqErr;

          const { error: qErr } = await supabase
            .from("quizzes")
            .delete()
            .in("id", quizIds);
          if (qErr) throw qErr;
        }

        // Delete lesson progress records is restricted by RLS (no DELETE policy)
        // so we skip it here.

        const { error: lErr } = await supabase
          .from("lessons")
          .delete()
          .in("id", lessonIds);
        if (lErr) throw lErr;
      }

      toast({
        title: "Course deleted",
        description: "Course and related lessons/quizzes have been removed",
      });
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: "Failed to delete course and its content",
        variant: "destructive",
      });
    }
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{course.title}</CardTitle>
            <CardDescription className="mt-2">
              {course.description?.substring(0, 100)}...
            </CardDescription>
          </div>
          <Badge variant={getStatusVariant(course.status)}>
            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Category: {course.category?.name || "Uncategorized"}</span>
            <span>Level: {course.level}</span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{course.total_enrollments} enrollments</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{course.lesson_count} lessons</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{course.total_duration || 0} min</span>
            </div>
          </div>

          {course.status === "rejected" && course.admin_comments && (
            <div className="p-3 bg-destructive/10 rounded-md">
              <p className="text-sm text-destructive">
                <strong>Admin Comments:</strong> {course.admin_comments}
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setEditingCourse(course);
                setEditOpen(true);
              }}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleDuplicateCourse(course.id)}
            >
              <Copy className="h-4 w-4 mr-1" />
              Duplicate
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleSoftDelete(course.id)}
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
    return <div className="text-center py-8">Loading courses...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Courses</h2>
          <p className="text-muted-foreground">Manage your course content</p>
        </div>
        <CreateCourse onCourseCreated={fetchCourses} />
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All ({courses.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({filterCoursesByStatus("draft").length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({filterCoursesByStatus("pending").length})</TabsTrigger>
          <TabsTrigger value="approved">Published ({filterCoursesByStatus("approved").length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({filterCoursesByStatus("rejected").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {courses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No courses found. Create your first course!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </TabsContent>

        {["draft", "pending", "approved", "rejected"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterCoursesByStatus(status).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            {filterCoursesByStatus(status).length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No {status} courses found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {editingCourse && (
        <EditCourse
          course={{
            id: editingCourse.id,
            title: editingCourse.title,
            description: editingCourse.description,
            category_id: editingCourse.category_id,
            level: editingCourse.level,
            price: editingCourse.price,
            thumbnail_url: editingCourse.thumbnail_url
          }}
          open={editOpen}
          onOpenChange={setEditOpen}
          onCourseUpdated={fetchCourses}
        />
      )}
    </div>
  );
};