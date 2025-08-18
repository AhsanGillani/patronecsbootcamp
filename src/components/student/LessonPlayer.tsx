import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QuizPlayer } from "./QuizPlayer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import YouTube from 'react-youtube';
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
    id?: string;
    is_completed: boolean;
    completed_at: string;
    video_watch_progress?: number;
    video_watched_seconds?: number;
    pdf_viewed?: boolean;
    text_read?: boolean;
    quiz_passed?: boolean;
    last_accessed_at?: string;
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
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoWatched, setVideoWatched] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfViewed, setPdfViewed] = useState(false);
  const [textRead, setTextRead] = useState(false);
  const [lessonCompletionChanged, setLessonCompletionChanged] = useState(false);
  
  // YouTube player state
  const [youtubePlayer, setYoutubePlayer] = useState<any | null>(null);
  const [youtubeProgress, setYoutubeProgress] = useState(0);
  const [youtubeWatched, setYoutubeWatched] = useState(false);
  const [youtubeTrackingInterval, setYoutubeTrackingInterval] = useState<NodeJS.Timeout | null>(null);
  
  const currentProgress = lesson.lesson_progress && lesson.lesson_progress.length > 0 ? lesson.lesson_progress[0] : null;
  const isCompleted = currentProgress?.is_completed || false;

  useEffect(() => {
    checkQuizCompletion();
    initializeProgress();
  }, [lesson.id, user]);

  // Reset media state and position when lesson changes
  useEffect(() => {
    setIsVideoPlaying(false);
    setVideoProgress(0);
    setVideoWatched(false);
    setPdfViewed(false);
    setTextRead(false);
    setShowQuiz(false);
    setYoutubeProgress(0);
    setYoutubeWatched(false);
    setLessonCompletionChanged(false);
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      } catch (_) {}
    }
    if (youtubePlayer) {
      try {
        youtubePlayer.seekTo(0, true);
      } catch (_) {}
    }
  }, [lesson.id]);

  const initializeProgress = () => {
    if (currentProgress) {
      if (lesson.video_url && (lesson.video_url.includes('youtube.com') || lesson.video_url.includes('youtu.be'))) {
        // YouTube video
        setYoutubeProgress(currentProgress.video_watch_progress || 0);
        setYoutubeWatched(currentProgress.video_watch_progress >= 90);
      } else {
        // Native video
        setVideoProgress(currentProgress.video_watch_progress || 0);
        setVideoWatched(currentProgress.video_watch_progress >= 90);
      }
      setPdfViewed(currentProgress.pdf_viewed || false);
      setTextRead(currentProgress.text_read || false);
      setQuizCompleted(currentProgress.quiz_passed || false);
    }
  };

  const checkQuizCompletion = async () => {
    if (!user || !lesson.quiz) return;
    
    try {
      const userId = profile?.id || user.id;
      console.log('Checking quiz completion for user:', userId);
      
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('passed')
        .eq('quiz_id', lesson.quiz.id)
        .eq('student_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      setQuizCompleted(data?.passed || false);
    } catch (error) {
      console.error('Error checking quiz completion:', error);
    }
  };

  const handleVideoTimeUpdate = async () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const currentTime = video.currentTime;
    const duration = video.duration;
    
    if (duration > 0) {
      const progress = (currentTime / duration) * 100;
    setVideoProgress(progress);
    
      // Update video progress in database every 5 seconds
      if (Math.floor(currentTime) % 5 === 0) {
        await updateVideoProgress(progress, Math.floor(currentTime));
      }
      
      // Mark as watched if 90% completed
    if (progress >= 90 && !videoWatched) {
      setVideoWatched(true);
        await updateVideoProgress(progress, Math.floor(currentTime));
      }
    }
  };

  const updateVideoProgress = async (progress: number, watchedSeconds: number) => {
    if (!user) return;
    
    try {
      console.log('Updating video progress for user:', user.id, 'profile:', profile?.id);
      const userId = profile?.id || user.id;
      console.log('Using userId:', userId);
      
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          student_id: userId as string,
          lesson_id: lesson.id,
          video_watch_progress: progress,
          video_watched_seconds: watchedSeconds,
          last_accessed_at: new Date().toISOString()
        } as any, { onConflict: 'student_id,lesson_id' });

      if (error) throw error;
      
      // Update local state for the appropriate video type
      if (lesson.video_url && (lesson.video_url.includes('youtube.com') || lesson.video_url.includes('youtu.be'))) {
        setYoutubeProgress(progress);
        if (progress >= 90) {
          setYoutubeWatched(true);
        }
      } else {
        setVideoProgress(progress);
        if (progress >= 90) {
          setVideoWatched(true);
        }
      }
    } catch (error) {
      console.error('Error updating video progress:', error);
    }
  };

  const markPdfViewed = async () => {
    if (!user || pdfViewed) return;
    
    try {
      const userId = profile?.id || user.id;
      console.log('Marking PDF as viewed for user:', userId);
      
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          student_id: userId as string,
          lesson_id: lesson.id,
          pdf_viewed: true,
          last_accessed_at: new Date().toISOString()
        } as any, { onConflict: 'student_id,lesson_id' });

      if (error) throw error;
      setPdfViewed(true);
    } catch (error) {
      console.error('Error marking PDF as viewed:', error);
    }
  };

  const markTextRead = async () => {
    if (!user || textRead) return;
    
    try {
      const userId = profile?.id || user.id;
      console.log('Marking text as read for user:', userId);
      
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          student_id: userId as string,
          lesson_id: lesson.id,
          text_read: true,
          last_accessed_at: new Date().toISOString()
        } as any, { onConflict: 'student_id,lesson_id' });

      if (error) throw error;
      setTextRead(true);
    } catch (error) {
      console.error('Error marking text as read:', error);
    }
  };

  // YouTube Player Event Handlers
  const onYouTubeReady = (event: { target: any }) => {
    const player = event.target;
    setYoutubePlayer(player);
    try { player.seekTo(0, true); } catch (_) {}
    
    // Start tracking progress every second
    const interval = setInterval(async () => {
      try {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        
        if (duration > 0) {
          const progress = (currentTime / duration) * 100;
          setYoutubeProgress(progress);
          
          // Update progress in database every 5 seconds
          if (Math.floor(currentTime) % 5 === 0) {
            await updateVideoProgress(progress, Math.floor(currentTime));
          }
          
          // Mark as watched if 90% completed
          if (progress >= 90 && !youtubeWatched) {
            setYoutubeWatched(true);
            await updateVideoProgress(progress, Math.floor(currentTime));
          }
        }
      } catch (error) {
        console.error('Error tracking YouTube progress:', error);
      }
    }, 1000);
    
    setYoutubeTrackingInterval(interval);
  };

  const onYouTubeStateChange = (event: { target: any; data: number }) => {
    const player = event.target;
    const state = event.data;
    
    // YT.PlayerState.PLAYING = 1, YT.PlayerState.PAUSED = 2, YT.PlayerState.ENDED = 0
    if (state === 1) {
      setIsVideoPlaying(true);
    } else if (state === 2) {
      setIsVideoPlaying(false);
    } else if (state === 0) {
      // Video ended
      setIsVideoPlaying(false);
      setYoutubeWatched(true);
      if (youtubePlayer) {
        updateVideoProgress(100, Math.floor(youtubePlayer.getDuration()));
      }
    }
  };

  const onYouTubeError = (event: { target: any; data: number }) => {
    console.error('YouTube player error:', event.data);
    toast({
      title: "Video Error",
      description: "There was an error loading the video. Please try again.",
      variant: "destructive",
    });
  };

  // Cleanup YouTube tracking interval
  useEffect(() => {
    return () => {
      if (youtubeTrackingInterval) {
        clearInterval(youtubeTrackingInterval);
      }
    };
  }, [youtubeTrackingInterval]);

  // Cleanup tracking when lesson changes
  useEffect(() => {
    if (youtubeTrackingInterval) {
      clearInterval(youtubeTrackingInterval);
      setYoutubeTrackingInterval(null);
    }
  }, [lesson.id]);

  const canCompleteLesson = () => {
    // Check video completion (90% watched) - handle both native and YouTube videos
    if (lesson.type === 'video' && lesson.video_url) {
      if (lesson.video_url.includes('youtube.com') || lesson.video_url.includes('youtu.be')) {
        // YouTube video
        if (!youtubeWatched) {
          return false;
        }
      } else {
        // Native video
        if (!videoWatched) {
          return false;
        }
      }
    }
    
    // Check PDF completion
    if (lesson.type === 'pdf' && lesson.pdf_url && !pdfViewed) {
      return false;
    }
    
    // Check text completion
    if (lesson.type === 'text' && lesson.content && !textRead) {
      return false;
    }
    
    // Check quiz completion if lesson has quiz
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
      console.log('Completing lesson...');
      // Reset quiz attempts for this lesson when completing it
      if (lesson.quiz) {
        console.log('Resetting quiz attempts for lesson:', lesson.id);
        const userId = profile?.id || user.id;
        console.log('Using userId for quiz attempts reset:', userId);
        
        const { error } = await supabase
          .from('quiz_attempts')
          .delete()
          .eq('quiz_id', lesson.quiz.id)
          .eq('student_id', userId);
        
        if (error) {
          console.error('Error deleting quiz attempts:', error);
        } else {
          console.log('Quiz attempts reset successfully');
        }
      }
      
      await onComplete(lesson.id);
      console.log('Lesson completed successfully');
      
      // Force refresh of attempts by toggling the flag
      setLessonCompletionChanged(prev => !prev);
      
      toast({
        title: "Lesson completed!",
        description: "Great job! You can now move to the next lesson. Quiz attempts have been reset.",
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
    
    if (lesson.type === 'video' && lesson.video_url) {
      if (lesson.video_url.includes('youtube.com') || lesson.video_url.includes('youtu.be')) {
        // YouTube video
        if (!youtubeWatched) {
          requirements.push("Watch the complete video (90% minimum)");
        }
      } else {
        // Native video
        if (!videoWatched) {
          requirements.push("Watch the complete video (90% minimum)");
        }
      }
    }
    
    if (lesson.type === 'pdf' && lesson.pdf_url && !pdfViewed) {
      requirements.push("View the PDF document");
    }
    
    if (lesson.type === 'text' && lesson.content && !textRead) {
      requirements.push("Read the lesson content");
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
    const videoId = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const getYouTubeVideoId = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)?.[1];
    return videoId;
  };

  const renderContent = () => {
    switch (lesson.type) {
      case 'video':
        return (
          <div className="space-y-4">
            {lesson.video_url ? (
              <div className="relative rounded-lg overflow-hidden bg-black">
                {lesson.video_url.includes('youtube.com') || lesson.video_url.includes('youtu.be') ? (
                  <div className="space-y-4">
                    <YouTube
                      key={lesson.id}
                      videoId={getYouTubeVideoId(lesson.video_url)}
                      opts={{
                        height: '384',
                        width: '100%',
                        playerVars: {
                          autoplay: 0,
                          controls: 1,
                          modestbranding: 1,
                          rel: 0,
                        },
                      }}
                      onReady={onYouTubeReady}
                      onStateChange={onYouTubeStateChange}
                      onError={onYouTubeError}
                      className="w-full"
                    />
                    <div className="space-y-2 px-4 pb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Video Progress</span>
                        <span className={`${youtubeWatched ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {Math.round(youtubeProgress)}% {youtubeWatched && '✓'}
                        </span>
                      </div>
                      <Progress 
                        value={youtubeProgress} 
                        className={`h-2 ${youtubeWatched ? 'bg-green-100' : ''}`}
                      />
                      {!youtubeWatched && (
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Watch 90% of the video to unlock lesson completion
                        </p>
                      )}
                    </div>
                  </div>
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
          <div className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: lesson.content || 'No content available' }} />
            </div>
            {lesson.content && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reading Progress</span>
                  <span className={`${textRead ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {textRead ? 'Completed ✓' : 'Not Read'}
                  </span>
                </div>
                {!textRead && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={markTextRead}
                    className="w-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                )}
              </div>
            )}
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
                    <Button 
                      asChild 
                      onClick={markPdfViewed}
                      className={pdfViewed ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {pdfViewed ? 'PDF Viewed ✓' : 'View PDF'}
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href={lesson.pdf_url} download>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </div>
                  {!pdfViewed && (
                    <p className="text-xs text-muted-foreground text-center">
                      Click "View PDF" to mark this document as completed
                    </p>
                  )}
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
        key={`${lesson.id}-${lessonCompletionChanged ? 'completed' : 'not-completed'}`}
        quiz={lesson.quiz}
        onComplete={(passed: boolean) => handleQuizComplete(passed)}
        onBack={() => setShowQuiz(false)}
        refreshAttempts={lessonCompletionChanged}
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