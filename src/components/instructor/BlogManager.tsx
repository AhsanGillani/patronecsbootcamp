import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, Calendar, Globe, Lock } from "lucide-react";
import { CreateBlog } from "./CreateBlog";
import { EditBlog } from "./EditBlog";

interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  is_published: boolean;
  views: number;
  featured_image_url: string | null;
  admin_comments: string;
  created_at: string;
  category_id: string | null;
  category: { name: string } | null;
}

export const BlogManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBlogs();
    }
  }, [user]);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select(`
          *,
          categories!fk_blogs_category_id(name)
        `)
        .eq("author_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Handle potential null category relationships
      const blogsWithCategory = (data || []).map((blog: any) => ({
        ...blog,
        category: blog.categories || { name: "Uncategorized" }
      }));
      
      setBlogs(blogsWithCategory);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch blogs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "secondary";
      case "pending": return "default";
      case "approved": return "default";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  const filterBlogsByStatus = (status: string) => {
    return blogs.filter(blog => blog.status === status);
  };

  const handleDeleteBlog = async (blogId: string) => {
    try {
      const { error } = await supabase
        .from("blogs")
        .delete()
        .eq("id", blogId);

      if (error) throw error;

      toast({
        title: "Blog deleted",
        description: "Blog has been successfully deleted",
      });
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast({
        title: "Error",
        description: "Failed to delete blog",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublish = async (blogId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("blogs")
        .update({ is_published: !currentStatus })
        .eq("id", blogId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Blog ${!currentStatus ? 'published' : 'unpublished'} successfully`,
      });
      fetchBlogs();
    } catch (error) {
      console.error("Error updating blog:", error);
      toast({
        title: "Error",
        description: "Failed to update blog status",
        variant: "destructive",
      });
    }
  };

  const BlogCard = ({ blog }: { blog: Blog }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{blog.title}</CardTitle>
            <CardDescription className="mt-2">
              {blog.excerpt || blog.content?.substring(0, 100) + "..."}
            </CardDescription>
          </div>
          <div className="flex flex-col space-y-2">
            <Badge variant={getStatusColor(blog.status)}>
              {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
            </Badge>
            {blog.is_published && (
              <Badge variant="outline">Published</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Category: {blog.category?.name || "Uncategorized"}</span>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{blog.views || 0} views</span>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{new Date(blog.created_at).toLocaleDateString()}</span>
          </div>

          {blog.status === "rejected" && blog.admin_comments && (
            <div className="p-3 bg-destructive/10 rounded-md">
              <p className="text-sm text-destructive">
                <strong>Admin Comments:</strong> {blog.admin_comments}
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setEditingBlog(blog);
                setEditOpen(true);
              }}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            
            {/* Publish/Unpublish button - only show for approved blogs */}
            {blog.status === 'approved' && (
              <Button 
                size="sm" 
                variant={blog.is_published ? "default" : "secondary"}
                onClick={() => handleTogglePublish(blog.id, blog.is_published)}
              >
                {blog.is_published ? (
                  <>
                    <Lock className="h-4 w-4 mr-1" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-1" />
                    Publish
                  </>
                )}
              </Button>
            )}
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleDeleteBlog(blog.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-8">Loading blogs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blog Manager</h2>
          <p className="text-muted-foreground">Create and manage your blog content</p>
        </div>
        <CreateBlog onBlogCreated={fetchBlogs} />
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All ({blogs.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({filterBlogsByStatus("draft").length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({filterBlogsByStatus("pending").length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({filterBlogsByStatus("approved").length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({filterBlogsByStatus("rejected").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {blogs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No blog posts found. Create your first post!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}
        </TabsContent>

        {["draft", "pending", "approved", "rejected"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterBlogsByStatus(status).map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
            {filterBlogsByStatus(status).length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No {status} blog posts found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {editingBlog && (
        <EditBlog
          blog={editingBlog}
          open={editOpen}
          onOpenChange={setEditOpen}
          onBlogUpdated={fetchBlogs}
        />
      )}
    </div>
  );
};