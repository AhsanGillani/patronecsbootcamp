import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Brain, Award } from "lucide-react";
import { CreateQuiz } from "./CreateQuiz";
import { EditQuiz } from "./EditQuiz";

interface Quiz {
  id: string;
  title: string;
  description: string;
  passing_score: number;
  lesson_id: string;
  lesson: { title: string; course: { title: string } } | null;
  quiz_questions: { id: string }[];
}

export const QuizManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchQuizzes();
    }
  }, [user]);

  const fetchQuizzes = async () => {
    try {
      // First get courses owned by this instructor
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("id")
        .eq("instructor_id", user?.id);

      if (coursesError) throw coursesError;
      
      const courseIds = coursesData?.map(c => c.id) || [];
      
      if (courseIds.length === 0) {
        setQuizzes([]);
        return;
      }

      // Get lessons for these courses
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("id")
        .in("course_id", courseIds);

      if (lessonsError) throw lessonsError;
      
      const lessonIds = lessonsData?.map(l => l.id) || [];
      
      if (lessonIds.length === 0) {
        setQuizzes([]);
        return;
      }

      const { data, error } = await supabase
        .from("quizzes")
        .select(`
          *,
          lesson:lessons(
            title,
            course:courses(title)
          ),
          quiz_questions(id)
        `)
        .in("lesson_id", lessonIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch quizzes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quizId);

      if (error) throw error;

      toast({
        title: "Quiz deleted",
        description: "Quiz has been successfully deleted",
      });
      fetchQuizzes();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive",
      });
    }
  };

  const QuizCard = ({ quiz }: { quiz: Quiz }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-lg">{quiz.title}</CardTitle>
              <CardDescription>
                Lesson: {quiz.lesson?.title}
              </CardDescription>
              <CardDescription className="text-xs">
                Course: {quiz.lesson?.course?.title}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              <Award className="h-3 w-3 mr-1" />
              {quiz.passing_score}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {quiz.description || "No description provided"}
          </p>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Questions: {quiz.quiz_questions?.length || 0}</span>
            <span>Passing Score: {quiz.passing_score}%</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setEditingQuiz(quiz);
                setEditOpen(true);
              }}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Quiz
            </Button>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Questions
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleDeleteQuiz(quiz.id)}
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
    return <div className="text-center py-8">Loading quizzes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quiz Management</h2>
          <p className="text-muted-foreground">Create and manage quizzes for your lessons</p>
        </div>
        <CreateQuiz onQuizCreated={fetchQuizzes} />
      </div>

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No quizzes found. Create your first quiz!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}

      {editingQuiz && (
        <EditQuiz
          quiz={editingQuiz}
          open={editOpen}
          onOpenChange={setEditOpen}
          onQuizUpdated={fetchQuizzes}
        />
      )}
    </div>
  );
};