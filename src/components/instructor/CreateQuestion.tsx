import { useState } from "react";
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

interface CreateQuestionProps {
  quizId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionCreated: () => void;
}

export const CreateQuestion = ({ quizId, open, onOpenChange, onQuestionCreated }: CreateQuestionProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    explanation: "",
    difficulty: "medium",
    type: "mcq" as "mcq" | "qa",
    correct_answer: 0,
    options: ["", "", "", ""],
    expected_answer: ""
  });

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
    if (!quizId) return;

    const filledOptions = formData.options.filter(option => option.trim() !== "");
    if (formData.type === 'mcq' && filledOptions.length < 2) {
      toast({
        title: "Error",
        description: "Please provide at least 2 options",
        variant: "destructive",
      });
      return;
    }
    if (formData.type === 'qa' && !formData.expected_answer.trim()) {
      toast({
        title: "Error",
        description: "Please provide the expected answer",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('quiz_questions')
        .insert([{
          quiz_id: quizId,
          question: formData.question,
          type: formData.type,
          options: formData.type === 'mcq' ? filledOptions : [],
          expected_answer: formData.type === 'qa' ? formData.expected_answer : null,
          correct_answer: formData.type === 'mcq' ? formData.correct_answer : 0,
          explanation: formData.explanation || null,
          difficulty: formData.difficulty
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question created successfully",
      });

      setFormData({
        question: "",
        explanation: "",
        difficulty: "medium",
        type: "mcq",
        correct_answer: 0,
        options: ["", "", "", ""],
        expected_answer: ""
      });
      onOpenChange(false);
      onQuestionCreated();
    } catch (error) {
      console.error('Error creating question:', error);
      toast({
        title: "Error",
        description: "Failed to create question",
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
          <DialogTitle>Add Question</DialogTitle>
          <DialogDescription>
            Create a new question for this quiz
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Question Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as 'mcq' | 'qa' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">Multiple Choice</SelectItem>
                      <SelectItem value="qa">Question & Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.type === 'mcq' && (
                <>
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
                </>
              )}

              {formData.type === 'qa' && (
                <div className="space-y-2">
                  <Label>Expected Answer</Label>
                  <Textarea
                    value={formData.expected_answer}
                    onChange={(e) => setFormData({ ...formData, expected_answer: e.target.value })}
                    placeholder="Provide the reference answer students should write"
                    rows={3}
                  />
                </div>
              )}

              {formData.type === 'mcq' && formData.options.length < 6 && (
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
              {formData.type === 'mcq' ? 'Select the correct answer by clicking the radio button next to it' : 'Students will type an answer; match is manual or via review.'}
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
              disabled={
                loading ||
                !formData.question.trim() ||
                (formData.type === 'mcq' ? formData.options.filter(o => o.trim()).length < 2 : !formData.expected_answer.trim())
              }
            >
              {loading ? "Creating..." : "Create Question"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};