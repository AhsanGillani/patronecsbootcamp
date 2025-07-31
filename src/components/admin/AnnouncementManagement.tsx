import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Users, 
  Clock,
  Eye,
  EyeOff
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  target_role: 'admin' | 'instructor' | 'student' | null;
  is_published: boolean;
  created_at: string;
  expires_at?: string;
  admin: {
    full_name: string;
  };
}

export const AnnouncementManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    target_role: "",
    expires_at: "",
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select(`
          *,
          admin:profiles!admin_id(full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title: "Error",
        description: "Failed to fetch announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const announcementData = {
        title: formData.title,
        content: formData.content,
        target_role: (formData.target_role as 'admin' | 'instructor' | 'student') || null,
        admin_id: user?.id,
        is_published: true,
        ...(formData.expires_at && { expires_at: new Date(formData.expires_at).toISOString() })
      };

      if (editingAnnouncement) {
        const { error } = await supabase
          .from("announcements")
          .update(announcementData)
          .eq("id", editingAnnouncement.id);

        if (error) throw error;

        toast({
          title: "Announcement updated",
          description: "The announcement has been successfully updated",
        });
      } else {
        const { error } = await supabase
          .from("announcements")
          .insert(announcementData);

        if (error) throw error;

        toast({
          title: "Announcement created",
          description: "The announcement has been published successfully",
        });
      }

      setFormData({ title: "", content: "", target_role: "", expires_at: "" });
      setDialogOpen(false);
      setEditingAnnouncement(null);
      fetchAnnouncements();
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast({
        title: "Error",
        description: "Failed to save announcement",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      target_role: announcement.target_role || "",
      expires_at: announcement.expires_at ? new Date(announcement.expires_at).toISOString().split('T')[0] : "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (announcementId: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", announcementId);

      if (error) throw error;

      toast({
        title: "Announcement deleted",
        description: "The announcement has been successfully deleted",
      });
      fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const togglePublishStatus = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .update({ is_published: !announcement.is_published })
        .eq("id", announcement.id);

      if (error) throw error;

      toast({
        title: announcement.is_published ? "Announcement hidden" : "Announcement published",
        description: `The announcement is now ${announcement.is_published ? "hidden" : "visible"}`,
      });
      fetchAnnouncements();
    } catch (error) {
      console.error("Error updating announcement status:", error);
      toast({
        title: "Error",
        description: "Failed to update announcement status",
        variant: "destructive",
      });
    }
  };

  const getTargetBadge = (role: string | null) => {
    if (!role) return <Badge variant="secondary">All Users</Badge>;
    return <Badge variant="outline">{role.charAt(0).toUpperCase() + role.slice(1)}s</Badge>;
  };

  const isExpired = (expiresAt: string | undefined) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return <div className="text-center py-8">Loading announcements...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Announcement Management</h2>
          <p className="text-muted-foreground">Create and manage system announcements</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingAnnouncement(null);
              setFormData({ title: "", content: "", target_role: "", expires_at: "" });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement ? "Edit" : "Create"} Announcement
              </DialogTitle>
              <DialogDescription>
                {editingAnnouncement ? "Update" : "Create a new"} announcement for users
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Announcement title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Announcement content"
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="target_role">Target Audience</Label>
                <Select
                  value={formData.target_role}
                  onValueChange={(value) => setFormData({ ...formData, target_role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Users</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="instructor">Instructors</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expires_at">Expiry Date (Optional)</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAnnouncement ? "Update" : "Create"} Announcement
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No announcements found. Create your first announcement!</p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <span>{announcement.title}</span>
                      {isExpired(announcement.expires_at) && (
                        <Badge variant="destructive" className="text-xs">
                          Expired
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      By {announcement.admin.full_name} • {new Date(announcement.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      {getTargetBadge(announcement.target_role)}
                      <Badge variant={announcement.is_published ? "default" : "secondary"}>
                        {announcement.is_published ? "Published" : "Hidden"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {announcement.content.length > 200 
                      ? announcement.content.substring(0, 200) + "..."
                      : announcement.content
                    }
                  </p>

                  {announcement.expires_at && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        Expires: {new Date(announcement.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(announcement)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => togglePublishStatus(announcement)}
                    >
                      {announcement.is_published ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Publish
                        </>
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};