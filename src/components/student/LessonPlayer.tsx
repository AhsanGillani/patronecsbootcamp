import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  CheckCircle, 
  FileText, 
  Video, 
  Download,
  ExternalLink 
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'video' | 'text' | 'pdf' | 'quiz';
  video_url?: string;
  pdf_url?: string;
  duration: number;
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
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const isCompleted = lesson.lesson_progress && lesson.lesson_progress.length > 0 && lesson.lesson_progress[0].is_completed;

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
                  <video 
                    className="w-full h-auto max-h-96"
                    controls
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    onEnded={() => !isCompleted && onComplete(lesson.id)}
                  >
                    <source src={lesson.video_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
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
          
          {!isCompleted && (
            <Button onClick={() => onComplete(lesson.id)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};