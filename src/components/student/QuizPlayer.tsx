import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, CheckCircle, XCircle, Clock, Award } from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  description: string;
  lesson_id: string;
  passing_score: number;
}

interface Question {
  id: string;
  question: string;
  type?: 'mcq' | 'qa';
  options: string[]; // MCQ options; empty for Q&A
  correct_answer?: number | null;
  expected_answer?: string | null;
  explanation?: string;
  order_index: number;
}

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete: (passed: boolean) => void;
  onBack: () => void;
}

export const QuizPlayer = ({ quiz, onComplete, onBack }: QuizPlayerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [questionId: string]: number | string }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('order_index');

      if (error) throw error;
      
      // Parse the options JSON for each question
      const parsedQuestions = (data || []).map(question => {
        let opts: unknown = question.options;
        try {
          if (!Array.isArray(opts)) opts = JSON.parse(opts as string);
        } catch (_err) { /* ignore parse errors */ }
        const jsonObj = (opts && !Array.isArray(opts) && typeof opts === 'object') ? (opts as Record<string, unknown>) : undefined;
        const qType: 'mcq' | 'qa' = (question as { type?: 'mcq' | 'qa' }).type || (jsonObj?.qaExpectedAnswer ? 'qa' : 'mcq');
        const expected = (question as { expected_answer?: string }).expected_answer || (jsonObj?.qaExpectedAnswer as string | undefined);
        return {
          ...question,
          type: qType,
          expected_answer: expected,
          options: qType === 'qa' ? [] : (Array.isArray(opts) ? (opts as string[]) : []),
        } as Question;
      });
      
      setQuestions(parsedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [quiz.id, toast]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleTextAnswerChange = (questionId: string, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: text
    }));
  };

  const submitQuiz = async () => {
    if (!user) return;

    setSubmitted(true);
    
    // Calculate score
    let correctAnswers = 0;
    questions.forEach(question => {
      if ((question.type || 'mcq') !== 'qa') {
        if (answers[question.id] === question.correct_answer) {
          correctAnswers++;
        }
      } else {
        const expected = (question.expected_answer || '').trim().toLowerCase();
        const given = (answers[question.id] || '').toString().trim().toLowerCase();
        if (expected && given && expected === given) correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    const passed = finalScore >= quiz.passing_score;

    try {
      // enforce max 3 attempts
      const { data: prevAttempts } = await supabase
        .from('quiz_attempts')
        .select('id')
        .eq('quiz_id', quiz.id)
        .eq('student_id', user.id);
      if ((prevAttempts?.length || 0) >= 3) {
        toast({ title: 'Attempt limit reached', description: 'You have used all 3 attempts for this quiz.', variant: 'destructive' });
        setSubmitted(false);
        return;
      }

      // First attempt row compatible with current schema
      const { data: attempt, error: attemptErr } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quiz.id,
          student_id: user.id,
          score: finalScore,
          passed,
          total_questions: questions.length,
          answers: answers,
          completed_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (attemptErr) throw attemptErr;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('quiz_attempt_answers').insert(
        questions.map(q => ({
          quiz_attempt_id: attempt.id,
          question_id: q.id,
          answer_text: (q.type === 'qa') ? String(answers[q.id] || '') : null,
          selected_index: (q.type !== 'qa') ? Number(answers[q.id]) : null,
          is_correct: (q.type !== 'qa') ? (answers[q.id] === q.correct_answer) : null,
          requires_review: q.type === 'qa'
        }))
      );

      setScore(finalScore);
      setShowResults(true);

      toast({
        title: passed ? "Quiz Passed!" : "Quiz Completed",
        description: passed 
          ? `Great job! You scored ${finalScore}%` 
          : `You scored ${finalScore}%. Passing score is ${quiz.passing_score}%`,
        variant: passed ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to submit quiz",
        variant: "destructive",
      });
    } finally {
      setSubmitted(false);
    }
  };

  // One-page quiz, so we do not need next/previous navigation anymore

  const isAllAnswered = () => {
    return questions.every(question => answers[question.id] !== undefined && answers[question.id] !== "");
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5 animate-pulse" />
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-32 w-full bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    const passed = score >= quiz.passing_score;
    
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {passed ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span>Quiz Results</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-primary">{score}%</div>
            <Badge variant={passed ? "default" : "destructive"} className="text-sm">
              {passed ? "Passed" : "Failed"}
            </Badge>
            <p className="text-muted-foreground">
              You answered {questions.filter(q => answers[q.id] === q.correct_answer).length} out of {questions.length} questions correctly
            </p>
            <p className="text-sm text-muted-foreground">
              Passing score: {quiz.passing_score}%
            </p>
          </div>

          {passed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <Award className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-green-800 font-medium">Congratulations! You've passed the quiz.</p>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold">Question Review:</h4>
            {questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.correct_answer;
              
              return (
                <div key={question.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start space-x-2">
                    {isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">Question {index + 1}: {question.question}</p>
                      <p className="text-xs text-muted-foreground">
                        Your answer: {question.options[userAnswer] || 'Not answered'}
                      </p>
                      {!isCorrect && (
                        <p className="text-xs text-green-600">
                          Correct answer: {question.options[question.correct_answer]}
                        </p>
                      )}
                      {question.explanation && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onBack}>
              Back to Lesson
            </Button>
            <div className="space-x-2">
              {!passed && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowResults(false);
                    setAnswers({});
                  }}
                >
                  Retake Quiz
                </Button>
              )}
              <Button onClick={() => onComplete(passed)}>
                Continue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const answeredCount = questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== "").length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <HelpCircle className="h-5 w-5" />
            <span>{quiz.title}</span>
          </CardTitle>
          <Badge variant="outline">
            {answeredCount} / {questions.length} answered
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">Question {idx + 1}</h3>
                <Badge variant="outline">{(q.type || 'mcq') === 'qa' ? 'Q&A' : 'MCQ'}</Badge>
              </div>
              <div className="text-sm">{q.question}</div>
              {(q.type || 'mcq') !== 'qa' ? (
                <RadioGroup
                  value={answers[q.id]?.toString() || ""}
                  onValueChange={(value) => handleAnswerChange(q.id, parseInt(value))}
                >
                  {q.options.map((option: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50">
                      <RadioGroupItem value={index.toString()} id={`q-${q.id}-opt-${index}`} />
                      <Label htmlFor={`q-${q.id}-opt-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div>
                  <Label htmlFor={`answer-${q.id}`}>Your Answer</Label>
                  <Textarea
                    id={`answer-${q.id}`}
                    value={(answers[q.id] as string) || ''}
                    onChange={(e) => handleTextAnswerChange(q.id, e.target.value)}
                    placeholder="Type your answer here..."
                    rows={4}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div />
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onBack}>
              Exit Quiz
            </Button>
            <Button 
              onClick={submitQuiz}
              disabled={!isAllAnswered() || submitted}
            >
              {submitted ? "Submitting..." : "Submit Quiz"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};