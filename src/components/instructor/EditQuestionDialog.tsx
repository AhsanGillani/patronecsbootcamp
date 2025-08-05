import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  difficulty: string;
  explanation: string | null;
  order_index: number;
}

interface EditQuestionDialogProps {
  question: Question;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionUpdated: () => void;
}

export const EditQuestionDialog = ({ question, open, onOpenChange, onQuestionUpdated }: EditQuestionDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    question: question.question,
    explanation: question.explanation || "",
    difficulty: question.difficulty,
    correct_answer: question.correct_answer,
    options: [...question.options]
  });

  useEffect(() => {
    if (open) {
      setFormData({
        question: question.question,
        explanation: question.explanation || "",
        difficulty: question.difficulty,
        correct_answer: question.correct_answer,
        options: [...question.options]
      });
    }
  }, [open, question]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData({ ...formData, options: [...formData.options, ""] });
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      const newCorrectAnswer = formData.correct_answer >= index ? Math.max(0, formData.correct_answer - 1) : formData.correct_answer;
      setFormData({ 
        ...formData, 
        options: newOptions,
        correct_answer: newCorrectAnswer
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const filledOptions = formData.options.filter(option => option.trim() !== "");
    if (filledOptions.length < 2) {
      toast({
        title: "Error",
        description: "Please provide at least 2 options",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('quiz_questions')
        .update({
          question: formData.question,
          options: filledOptions,
          correct_answer: formData.correct_answer,
          explanation: formData.explanation || null,
          difficulty: formData.difficulty
        })
        .eq('id', question.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question updated successfully",
      });

      onQuestionUpdated();
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Update the question details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="question">Question *</Label>
            <Textarea
              id="question"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Enter your question here..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label>Answer Options *</Label>
            <div className="space-y-3 mt-2">
              {formData.options.map((option, index) => (
                <Card key={index} className={`p-3 ${formData.correct_answer === index ? 'ring-2 ring-green-500' : ''}`}>
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="correct_answer"
                          value={index}
                          checked={formData.correct_answer === index}
                          onChange={(e) => setFormData({ ...formData, correct_answer: parseInt(e.target.value) })}
                          className="w-4 h-4 text-green-600"
                        />
                        <span className="text-sm font-medium">Option {index + 1}</span>
                      </div>
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Enter option ${index + 1}`}
                        className="flex-1"
                      />
                      {formData.options.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {formData.options.length < 6 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOption}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Select the correct answer by clicking the radio button next to it
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="explanation">Explanation (Optional)</Label>
            <Textarea
              id="explanation"
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Explain why this answer is correct..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.question.trim() || formData.options.filter(o => o.trim()).length < 2}
            >
              {loading ? "Updating..." : "Update Question"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};