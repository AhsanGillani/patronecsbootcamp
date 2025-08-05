import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QuizPlayer } from "./QuizPlayer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Pause, 
  CheckCircle, 
  FileText, 
  Video, 
  Download,
  ExternalLink,
  HelpCircle,
  Clock,
  Lock
} from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  description: string;
  lesson_id: string;
  passing_score: number;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'video' | 'text' | 'pdf' | 'quiz';
  video_url?: string;
  pdf_url?: string;
  duration: number;
  quiz?: Quiz;
  lesson_progress?: {
    is_completed: boolean;
    completed_at: string;
  }[];
}

interface LessonPlayerProps {
  lesson: Lesson;
  onComplete: (lessonId: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export const LessonPlayer = ({ 
  lesson, 
  onComplete, 
  onNext, 
  onPrevious, 
  hasNext, 
  hasPrevious 
}: LessonPlayerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoWatched, setVideoWatched] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const isCompleted = lesson.lesson_progress && lesson.lesson_progress.length > 0 && lesson.lesson_progress[0].is_completed;

  useEffect(() => {
    checkQuizCompletion();
  }, [lesson.id, user]);

  const checkQuizCompletion = async () => {
    if (!user || !lesson.quiz) return;
    
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('passed')
        .eq('quiz_id', lesson.quiz.id)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      setQuizCompleted(data?.passed || false);
    } catch (error) {
      console.error('Error checking quiz completion:', error);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const progress = (video.currentTime / video.duration) * 100;
    setVideoProgress(progress);
    
    // Mark video as watched if user watched 90% or more
    if (progress >= 90 && !videoWatched) {
      setVideoWatched(true);
    }
  };

  const canCompleteLesson = () => {
    if (lesson.type === 'video' && lesson.video_url && !videoWatched) {
      return false;
    }
    if (lesson.quiz && !quizCompleted) {
      return false;
    }
    return true;
  };

  const handleCompleteLesson = async () => {
    if (!canCompleteLesson()) {
      toast({
        title: "Cannot complete lesson",
        description: getCompletionRequirement(),
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      await onComplete(lesson.id);
      toast({
        title: "Lesson completed!",
        description: "Great job! You can now move to the next lesson.",
      });
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast({
        title: "Error",
        description: "Failed to complete lesson",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCompletionRequirement = () => {
    const requirements = [];
    if (lesson.type === 'video' && lesson.video_url && !videoWatched) {
      requirements.push("Watch the complete video");
    }
    if (lesson.quiz && !quizCompleted) {
      requirements.push("Pass the quiz");
    }
    return requirements.join(" and ");
  };

  const handleQuizComplete = (passed: boolean) => {
    setQuizCompleted(passed);
    setShowQuiz(false);
    
    if (passed && canCompleteLesson()) {
      handleCompleteLesson();
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const renderContent = () => {
    switch (lesson.type) {
      case 'video':
        return (
          <div className="space-y-4">
            {lesson.video_url ? (
              <div className="relative rounded-lg overflow-hidden bg-black">
                {lesson.video_url.includes('youtube.com') || lesson.video_url.includes('youtu.be') ? (
                  <iframe
                    className="w-full h-96"
                    src={getYouTubeEmbedUrl(lesson.video_url)}
                    title={lesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={() => setIsVideoPlaying(true)}
                  />
                ) : (
                  <div className="space-y-2">
                    <video 
                      ref={videoRef}
                      className="w-full h-auto max-h-96"
                      controls
                      onPlay={() => setIsVideoPlaying(true)}
                      onPause={() => setIsVideoPlaying(false)}
                      onTimeUpdate={handleVideoTimeUpdate}
                      onEnded={() => setVideoWatched(true)}
                    >
                      <source src={lesson.video_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    {lesson.type === 'video' && lesson.video_url && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Video Progress</span>
                          <span className={`${videoWatched ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {Math.round(videoProgress)}% {videoWatched && '✓'}
                          </span>
                        </div>
                        <Progress 
                          value={videoProgress} 
                          className={`h-2 ${videoWatched ? 'bg-green-100' : ''}`}
                        />
                        {!videoWatched && (
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Watch 90% of the video to unlock lesson completion
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-muted rounded-lg p-8 text-center">
                <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Video content will be available soon</p>
              </div>
            )}
            {lesson.content && (
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: lesson.content || 'No content available' }} />
          </div>
        );

      case 'pdf':
        return (
          <div className="space-y-4">
            {lesson.pdf_url ? (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-6 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">PDF Document</h3>
                  <p className="text-sm text-muted-foreground mb-4">{lesson.title}</p>
                  <div className="flex gap-2 justify-center">
                    <Button asChild>
                      <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View PDF
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href={lesson.pdf_url} download>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
                {lesson.content && (
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-muted rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">PDF content will be available soon</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: lesson.content || 'No content available' }} />
          </div>
        );
    }
  };

  // Show quiz if lesson has quiz and user clicked to show it
  if (showQuiz && lesson.quiz) {
    return (
      <QuizPlayer
        quiz={lesson.quiz}
        onComplete={(passed: boolean) => handleQuizComplete(passed)}
        onBack={() => setShowQuiz(false)}
      />
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {lesson.type === 'video' && <Video className="h-5 w-5" />}
              {lesson.type === 'text' && <FileText className="h-5 w-5" />}
              {lesson.type === 'pdf' && <FileText className="h-5 w-5" />}
              <CardTitle className="text-lg">{lesson.title}</CardTitle>
            </div>
            {isCompleted && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
          <Badge variant="outline">{lesson.type}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderContent()}
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex space-x-2">
            {hasPrevious && (
              <Button variant="outline" onClick={onPrevious}>
                Previous
              </Button>
            )}
            {hasNext && (
              <Button variant="outline" onClick={onNext}>
                Next
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            {/* Quiz Button - Show if quiz exists (whether lesson is completed or not) */}
            {lesson.quiz && (
              <Button 
                variant={quizCompleted ? "default" : "outline"}
                onClick={() => setShowQuiz(true)}
                className={quizCompleted ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                {quizCompleted ? "Retake Quiz" : "Take Quiz"}
              </Button>
            )}
            
            {/* Complete Lesson Button - Show if not completed */}
            {!isCompleted && (
              <Button 
                onClick={handleCompleteLesson}
                disabled={!canCompleteLesson() || loading}
                variant={canCompleteLesson() ? "default" : "outline"}
              >
                {loading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Completing...
                  </>
                ) : !canCompleteLesson() ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Complete Requirements
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </>
                )}
              </Button>
            )}
            
            {/* Show completion requirements */}
            {!isCompleted && !canCompleteLesson() && (
              <div className="text-xs text-muted-foreground mt-2">
                Requirements: {getCompletionRequirement()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};