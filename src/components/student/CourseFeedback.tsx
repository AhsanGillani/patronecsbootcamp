import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Star, MessageSquare, Send } from "lucide-react";

interface CourseFeedbackProps {
  courseId: string;
  courseName: string;
}

export const CourseFeedback = ({ courseId, courseName }: CourseFeedbackProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [existingFeedback, setExistingFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExistingFeedback();
  }, [courseId, user]);

  const fetchExistingFeedback = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('course_feedback')
        .select('*')
        .eq('course_id', courseId)
        .eq('student_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setExistingFeedback(data);
        setRating(data.rating);
        setComment(data.comment || "");
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const submitFeedback = async () => {
    if (!user || rating === 0) {
      toast({
        title: "Error",
        description: "Please provide a rating",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const feedbackData = {
        course_id: courseId,
        student_id: user.id,
        rating,
        comment: comment.trim() || null,
      };

      if (existingFeedback) {
        const { error } = await supabase
          .from('course_feedback')
          .update(feedbackData)
          .eq('id', existingFeedback.id);

        if (error) throw error;

        toast({
          title: "Feedback Updated",
          description: "Thank you for updating your feedback!",
        });
      } else {
        const { error } = await supabase
          .from('course_feedback')
          .insert(feedbackData);

        if (error) throw error;

        toast({
          title: "Feedback Submitted",
          description: "Thank you for your feedback!",
        });
      }

      fetchExistingFeedback();

      // Redirect student to the dashboard feedback tab so they can view their submission
      navigate('/student?tab=feedback');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Course Feedback</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your experience with "{courseName}"
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Rating */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Rate this course</label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-muted-foreground">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Comments (optional)
          </label>
          <Textarea
            placeholder="Share your thoughts about this course..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>

        {/* Submit Button */}
        <Button 
          onClick={submitFeedback}
          disabled={loading || rating === 0}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {existingFeedback ? 'Update Feedback' : 'Submit Feedback'}
        </Button>

        {existingFeedback && (
          <p className="text-xs text-muted-foreground text-center">
            You submitted feedback on {new Date(existingFeedback.created_at).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};