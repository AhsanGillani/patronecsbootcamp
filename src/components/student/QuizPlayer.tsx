import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  options: any; // This will be parsed from JSON
  correct_answer: number;
  explanation?: string;
  order_index: number;
}

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete: () => void;
  onBack: () => void;
}

export const QuizPlayer = ({ quiz, onComplete, onBack }: QuizPlayerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [quiz.id]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('order_index');

      if (error) throw error;
      
      // Parse the options JSON for each question
      const parsedQuestions = (data || []).map(question => ({
        ...question,
        options: Array.isArray(question.options) ? question.options : JSON.parse(question.options as string)
      }));
      
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
  };

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const submitQuiz = async () => {
    if (!user) return;

    setSubmitted(true);
    
    // Calculate score
    let correctAnswers = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correct_answer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    const passed = finalScore >= quiz.passing_score;

    try {
      const { error } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quiz.id,
          student_id: user.id,
          score: finalScore,
          passed,
          total_questions: questions.length,
          answers: answers,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

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

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const isAllAnswered = () => {
    return questions.every(question => answers[question.id] !== undefined);
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
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retake Quiz
                </Button>
              )}
              <Button onClick={onComplete}>
                Continue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <span>{quiz.title}</span>
          </CardTitle>
          <Badge variant="outline">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {currentQuestion && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
              <p className="text-sm text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Passing score: {quiz.passing_score}%
              </p>
            </div>

            <RadioGroup
              value={answers[currentQuestion.id]?.toString() || ""}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              onClick={nextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Next
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onBack}>
              Exit Quiz
            </Button>
            {currentQuestionIndex === questions.length - 1 && (
              <Button 
                onClick={submitQuiz}
                disabled={!isAllAnswered() || submitted}
              >
                {submitted ? "Submitting..." : "Submit Quiz"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};