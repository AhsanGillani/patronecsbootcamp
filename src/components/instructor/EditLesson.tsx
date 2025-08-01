import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditLessonProps {
  lesson: {
    id: string;
    title: string;
    content: string | null;
    course_id: string;
    type: string;
    video_url: string | null;
    pdf_url: string | null;
    duration: number | null;
    order_index: number;
    is_published: boolean;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLessonUpdated: () => void;
}

export const EditLesson = ({ lesson, open, onOpenChange, onLessonUpdated }: EditLessonProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: lesson.title,
    content: lesson.content || "",
    type: lesson.type,
    video_url: lesson.video_url || "",
    pdf_url: lesson.pdf_url || "",
    duration: lesson.duration?.toString() || "",
    order_index: lesson.order_index.toString(),
    is_published: lesson.is_published
  });

  useEffect(() => {
    if (open) {
      setFormData({
        title: lesson.title,
        content: lesson.content || "",
        type: lesson.type,
        video_url: lesson.video_url || "",
        pdf_url: lesson.pdf_url || "",
        duration: lesson.duration?.toString() || "",
        order_index: lesson.order_index.toString(),
        is_published: lesson.is_published
      });
    }
  }, [open, lesson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          title: formData.title,
          content: formData.content,
          type: formData.type,
          video_url: formData.video_url || null,
          pdf_url: formData.pdf_url || null,
          duration: formData.duration ? parseInt(formData.duration) : null,
          order_index: parseInt(formData.order_index),
          is_published: formData.is_published
        })
        .eq('id', lesson.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lesson updated successfully",
      });

      onOpenChange(false);
      onLessonUpdated();
    } catch (error) {
      console.error('Error updating lesson:', error);
      toast({
        title: "Error",
        description: "Failed to update lesson",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Lesson</DialogTitle>
          <DialogDescription>
            Update the lesson details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="title">Lesson Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter lesson title"
                required
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter lesson content"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            {formData.type === "video" && (
              <div>
                <Label htmlFor="video_url">Video URL</Label>
                <Input
                  id="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://example.com/video.mp4"
                />
              </div>
            )}

            {formData.type === "pdf" && (
              <div>
                <Label htmlFor="pdf_url">PDF URL</Label>
                <Input
                  id="pdf_url"
                  type="url"
                  value={formData.pdf_url}
                  onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                  placeholder="https://example.com/document.pdf"
                />
              </div>
            )}

            <div>
              <Label htmlFor="order_index">Order Index</Label>
              <Input
                id="order_index"
                type="number"
                min="0"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="rounded border-border"
              />
              <Label htmlFor="is_published">Publish lesson</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Lesson"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};