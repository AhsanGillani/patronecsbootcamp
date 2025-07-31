import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bell, CheckCircle, X, MessageSquare, BookOpen, FileText, Users } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'course_approval' | 'course_rejection' | 'blog_approval' | 'blog_rejection' | 'enrollment' | 'system';
  is_read: boolean;
  created_at: string;
}

export const NotificationCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data as Notification[] || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user?.id)
        .eq("is_read", false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );

      toast({
        title: "Notifications marked as read",
        description: "All notifications have been marked as read",
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );

      toast({
        title: "Notification deleted",
        description: "Notification has been successfully deleted",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "course_approval":
      case "course_rejection":
        return <BookOpen className="h-4 w-4" />;
      case "blog_approval":
      case "blog_rejection":
        return <FileText className="h-4 w-4" />;
      case "enrollment":
        return <Users className="h-4 w-4" />;
      case "system":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "course_approval":
      case "blog_approval":
        return "default";
      case "course_rejection":
      case "blog_rejection":
        return "destructive";
      case "enrollment":
        return "secondary";
      case "system":
        return "outline";
      default:
        return "secondary";
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <Card className={`hover:shadow-md transition-shadow ${!notification.is_read ? 'border-primary/50 bg-primary/5' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-muted">
              {getTypeIcon(notification.type)}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>{notification.title}</span>
                {!notification.is_read && (
                  <Badge variant="default" className="text-xs">New</Badge>
                )}
              </CardTitle>
              <CardDescription>
                <Badge variant={getTypeColor(notification.type)} className="mt-1">
                  {notification.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!notification.is_read && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => markAsRead(notification.id)}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => deleteNotification(notification.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">{notification.message}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(notification.created_at).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-8">Loading notifications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Bell className="h-6 w-6" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </h2>
          <p className="text-muted-foreground">Stay updated with course and blog activities</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
};