import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateQuestion } from "./CreateQuestion";
import { EditQuestionDialog } from "./EditQuestionDialog";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  difficulty: string;
  explanation: string | null;
  order_index: number;
}

interface EditQuizProps {
  quiz: {
    id: string;
    title: string;
    description: string | null;
    passing_score: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuizUpdated: () => void;
}

export const EditQuiz = ({ quiz, open, onOpenChange, onQuizUpdated }: EditQuizProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [showCreateQuestion, setShowCreateQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    title: quiz.title,
    description: quiz.description || "",
    passing_score: quiz.passing_score.toString()
  });

  useEffect(() => {
    if (open) {
      setFormData({
        title: quiz.title,
        description: quiz.description || "",
        passing_score: quiz.passing_score.toString()
      });
      fetchQuestions();
    }
  }, [open, quiz]);

  const fetchQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('order_index');

      if (error) throw error;
      
      const typedQuestions: Question[] = (data || []).map(item => ({
        id: item.id,
        question: item.question,
        options: Array.isArray(item.options) ? item.options as string[] : [],
        correct_answer: item.correct_answer,
        difficulty: item.difficulty,
        explanation: item.explanation,
        order_index: item.order_index
      }));
      
      setQuestions(typedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive",
      });
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({
          title: formData.title,
          description: formData.description,
          passing_score: parseInt(formData.passing_score)
        })
        .eq('id', quiz.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quiz updated successfully",
      });

      onOpenChange(false);
      onQuizUpdated();
    } catch (error) {
      console.error('Error updating quiz:', error);
      toast({
        title: "Error",
        description: "Failed to update quiz",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question deleted successfully",
      });

      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Quiz</DialogTitle>
            <DialogDescription>
              Update quiz details and manage questions
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Quiz Details</TabsTrigger>
              <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
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
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Quiz"}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="questions" className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Quiz Questions</h3>
                <Button onClick={() => setShowCreateQuestion(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
              
              {questionsLoading ? (
                <div className="text-center py-8">Loading questions...</div>
              ) : questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No questions added yet. Click "Add Question" to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <Card key={question.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-muted-foreground">Question {index + 1}</span>
                              <Badge className={getDifficultyColor(question.difficulty)}>
                                {question.difficulty}
                              </Badge>
                            </div>
                            <h4 className="font-medium">{question.question}</h4>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingQuestion(question)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Question</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this question? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteQuestion(question.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`p-2 rounded text-sm ${
                                optionIndex === question.correct_answer
                                  ? 'bg-green-50 border border-green-200 text-green-800'
                                  : 'bg-gray-50'
                              }`}
                            >
                              <span className="font-medium">
                                {String.fromCharCode(65 + optionIndex)}.
                              </span>{' '}
                              {option}
                              {optionIndex === question.correct_answer && (
                                <span className="ml-2 text-xs font-medium text-green-600">✓ Correct</span>
                              )}
                            </div>
                          ))}
                        </div>
                        {question.explanation && (
                          <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <CreateQuestion
        quizId={quiz.id}
        open={showCreateQuestion}
        onOpenChange={setShowCreateQuestion}
        onQuestionCreated={() => {
          fetchQuestions();
          onQuizUpdated();
        }}
      />

      {editingQuestion && (
        <EditQuestionDialog
          question={editingQuestion}
          open={!!editingQuestion}
          onOpenChange={(open) => !open && setEditingQuestion(null)}
          onQuestionUpdated={() => {
            fetchQuestions();
            onQuizUpdated();
            setEditingQuestion(null);
          }}
        />
      )}
    </>
  );
};