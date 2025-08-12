import { useState, useEffect, useCallback } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchUserRole = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      setUserRole(data?.role || null);
    } catch (e) {
      console.error('Error fetching user role:', e);
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user || !userRole) return;
    try {
      const { data: userNotifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data: announcements } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_published', true)
        .or(`target_role.is.null,target_role.eq.${userRole}`)
        .order('created_at', { ascending: false })
        .limit(10);

      const announcementNotifications = (announcements || []).map(announcement => ({
        id: `announcement_${announcement.id}`,
        title: announcement.title,
        message: announcement.content,
        type: 'announcement',
        is_read: false,
        created_at: announcement.created_at,
        user_id: user.id
      }));

      const allNotifications = [...(userNotifications || []), ...announcementNotifications]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20);

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.is_read && n.type !== 'announcement').length);
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  }, [user, userRole]);

  useEffect(() => {
    if (user) {
      fetchUserRole();
      fetchNotifications();
      // Set up real-time subscription for new notifications
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, fetchUserRole, fetchNotifications]);

  // Re-fetch notifications when userRole changes
  useEffect(() => {
    if (userRole) {
      fetchNotifications();
    }
  }, [userRole, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    // Skip marking announcements as read in database (they're not user-specific)
    if (notificationId.startsWith('announcement_')) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      return;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark regular notifications as read in database
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;

      // Mark all in state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      // Recalculate unread count ignoring announcements
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    // For announcements, just remove from state (they're not user-specific)
    if (notificationId.startsWith('announcement_')) {
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'course_enrollment':
        return '📚';
      case 'lesson_completed':
        return '✅';
      case 'certificate_earned':
        return '🏆';
      case 'quiz_passed':
        return '🎯';
      case 'quiz_graded':
        return '🎯';
      case 'announcement':
        return '📢';
      case 'course_approved':
        return '✅';
      case 'course_rejected':
        return '❌';
      case 'blog_approved':
        return '📝';
      case 'blog_rejected':
        return '📝';
      case 'new_enrollment':
        return '👥';
      default:
        return '🔔';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 bg-red-500"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                {userRole && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {userRole}
                  </Badge>
                )}
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => {
                    let parsed: { path?: string; text?: string } | null = null;
                    try {
                      const maybe = JSON.parse(notification.message);
                      if (maybe && typeof maybe === 'object') parsed = maybe;
                    } catch (e) {
                      // ignore non-JSON messages
                    }

                    const goTo = async () => {
                      if (parsed?.path) {
                        await markAsRead(notification.id);
                        window.location.href = parsed.path;
                        setOpen(false);
                      }
                    };

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 border-b last:border-b-0 transition-colors ${
                          !notification.is_read ? 'bg-blue-50/50 hover:bg-blue-100/50' : 'hover:bg-muted/50'
                        } ${parsed?.path ? 'cursor-pointer' : ''}`}
                        onClick={parsed?.path ? goTo : undefined}
                      >
                        <div className="flex items-start justify-between space-x-3">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">
                                {getNotificationIcon(notification.type)}
                              </span>
                              <h4 className={`text-sm font-medium ${
                                !notification.is_read ? 'font-semibold' : ''
                              }`}>
                                {notification.title}
                              </h4>
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {parsed?.text || notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                                className="h-6 w-6 p-0"
                              >
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            {parsed?.path && (
                              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); goTo(); }}>
                                Open
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}