import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

interface Blog {
  id: string;
  title: string;
  content: string;
  category_id: string | null;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  admin_comments: string | null;
  created_at: string;
  author_id: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export default function BlogModeration() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          profiles!author_id(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (blogId: string, status: 'approved' | 'rejected', adminComments?: string) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ 
          status, 
          admin_comments: adminComments || null 
        })
        .eq('id', blogId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Blog ${status} successfully`,
      });

      fetchBlogs();
      setIsDialogOpen(false);
      setComments('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading blogs...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Blog Moderation</h3>
        <p className="text-muted-foreground">Review and moderate blog submissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Blogs ({blogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell className="font-medium">{blog.title}</TableCell>
                  <TableCell>{blog.profiles?.full_name}</TableCell>
                  <TableCell>{blog.category_id || 'No category'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(blog.status)}>
                      {blog.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(blog.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog 
                        open={isDialogOpen && selectedBlog?.id === blog.id} 
                        onOpenChange={(open) => {
                          setIsDialogOpen(open);
                          if (open) setSelectedBlog(blog);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Review Blog: {blog.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold">Content</h4>
                              <div className="text-muted-foreground bg-muted p-4 rounded-md max-h-60 overflow-y-auto">
                                {blog.content}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold">Author</h4>
                              <p>{blog.profiles?.full_name} ({blog.profiles?.email})</p>
                            </div>
                            {blog.admin_comments && (
                              <div>
                                <h4 className="font-semibold">Previous Comments</h4>
                                <p className="text-muted-foreground">{blog.admin_comments}</p>
                              </div>
                            )}
                            <div>
                              <label className="block text-sm font-medium mb-2">Admin Comments</label>
                              <Textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Add comments for the author..."
                                rows={3}
                              />
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleStatusChange(blog.id, 'approved', comments)}
                                className="flex-1"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleStatusChange(blog.id, 'rejected', comments)}
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}