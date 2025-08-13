import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateQuizProps {
  onQuizCreated: () => void;
}

interface Lesson {
  id: string;
  title: string;
  course: {
    title: string;
  };
}

export const CreateQuiz = ({ onQuizCreated }: CreateQuizProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    lesson_id: "",
    passing_score: "70",
    question_mode: "mcq" // 'mcq' or 'qa'
  });

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      await fetchLessons();
    }
  };

  const fetchLessons = async () => {
    if (!user) return;

    try {
      // First get courses for this instructor
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title')
        .eq('instructor_id', user.id);

      if (coursesError) throw coursesError;

      if (!coursesData || coursesData.length === 0) {
        setLessons([]);
        return;
      }

      const courseIds = coursesData.map(c => c.id);

      // Then get lessons for those courses
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, course_id')
        .in('course_id', courseIds)
        .order('title');

      if (error) throw error;

      // Transform data to include course title
      const lessonsWithCourse = (data || []).map(lesson => {
        const course = coursesData.find(c => c.id === lesson.course_id);
        return {
          ...lesson,
          course: { title: course?.title || 'Unknown Course' }
        };
      });

      setLessons(lessonsWithCourse);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: "Error",
        description: "Failed to load lessons",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('quizzes')
        .insert([{
          title: formData.title,
          description: formData.description,
          lesson_id: formData.lesson_id,
          passing_score: parseInt(formData.passing_score)
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quiz created successfully",
      });

      setFormData({
        title: "",
        description: "",
        lesson_id: "",
        passing_score: "70",
        question_mode: "mcq"
      });
      setOpen(false);
      onQuizCreated();
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast({
        title: "Error",
        description: "Failed to create quiz",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Quiz</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Quiz</DialogTitle>
          <DialogDescription>
            Add a new quiz to one of your lessons
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="lesson">Lesson *</Label>
              <Select 
                value={formData.lesson_id} 
                onValueChange={(value) => setFormData({ ...formData, lesson_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a lesson" />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.course?.title} - {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter quiz title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter quiz description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="passing_score">Passing Score (%)</Label>
              <Input
                id="passing_score"
                type="number"
                min="0"
                max="100"
                value={formData.passing_score}
                onChange={(e) => setFormData({ ...formData, passing_score: e.target.value })}
                placeholder="70"
              />
            </div>

            <div>
              <Label>Default Question Mode</Label>
              <Select
                value={formData.question_mode}
                onValueChange={(value) => setFormData({ ...formData, question_mode: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                  <SelectItem value="qa">Question & Answer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Instructors can still mix both types when adding questions.</p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.lesson_id}>
              {loading ? "Creating..." : "Create Quiz"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};