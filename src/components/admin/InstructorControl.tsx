import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Eye, UserPlus, BookOpen, PenTool } from 'lucide-react';

interface Instructor {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  course_count?: number;
  blog_count?: number;
  total_enrollments?: number;
}

interface InstructorActivity {
  courses: any[];
  blogs: any[];
  recent_enrollments: any[];
}

export default function InstructorControl() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [instructorActivity, setInstructorActivity] = useState<InstructorActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'instructor')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get activity counts for each instructor
      const instructorsWithCounts = await Promise.all(
        (data || []).map(async (instructor) => {
          const [courseResult, blogResult, enrollmentResult] = await Promise.all([
            supabase
              .from('courses')
              .select('id', { count: 'exact' })
              .eq('instructor_id', instructor.user_id),
            supabase
              .from('blogs')
              .select('id', { count: 'exact' })
              .eq('author_id', instructor.user_id),
            supabase
              .from('enrollments')
              .select('id', { count: 'exact' })
              .in('course_id', 
                await supabase
                  .from('courses')
                  .select('id')
                  .eq('instructor_id', instructor.user_id)
                  .then(({ data }) => data?.map(c => c.id) || [])
              )
          ]);

          return {
            ...instructor,
            course_count: courseResult.count || 0,
            blog_count: blogResult.count || 0,
            total_enrollments: enrollmentResult.count || 0,
          };
        })
      );

      setInstructors(instructorsWithCounts);
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

  const fetchInstructorActivity = async (instructor: Instructor) => {
    try {
      const [coursesResult, blogsResult, enrollmentsResult] = await Promise.all([
        supabase
          .from('courses')
          .select(`
            *,
            categories(name),
            enrollments(id)
          `)
          .eq('instructor_id', instructor.user_id)
          .order('created_at', { ascending: false }),
        supabase
          .from('blogs')
          .select('*')
          .eq('author_id', instructor.user_id)
          .order('created_at', { ascending: false }),
        supabase
          .from('enrollments')
          .select(`
            *,
            courses(title),
            profiles!student_id(full_name)
          `)
          .in('course_id', 
            await supabase
              .from('courses')
              .select('id')
              .eq('instructor_id', instructor.user_id)
              .then(({ data }) => data?.map(c => c.id) || [])
          )
          .order('enrolled_at', { ascending: false })
          .limit(10)
      ]);

      setInstructorActivity({
        courses: coursesResult.data || [],
        blogs: blogsResult.data || [],
        recent_enrollments: enrollmentsResult.data || [],
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCreateInstructor = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: formData.email,
          password: formData.password,
          fullName: formData.full_name,
          role: 'instructor'
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: 'Success',
        description: 'Instructor account created successfully',
      });

      setFormData({ email: '', password: '', full_name: '' });
      setIsCreateDialogOpen(false);
      fetchInstructors();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openActivityDialog = async (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setIsActivityDialogOpen(true);
    await fetchInstructorActivity(instructor);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading instructors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Instructor Control</h3>
          <p className="text-muted-foreground">Manage instructors and monitor their activities</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Instructor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Instructor Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="instructor@example.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Temporary password"
                />
              </div>
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <Button onClick={handleCreateInstructor} className="w-full">
                Create Instructor Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Instructors ({instructors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Blogs</TableHead>
                <TableHead>Enrollments</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructors.map((instructor) => (
                <TableRow key={instructor.id}>
                  <TableCell className="font-medium">{instructor.full_name}</TableCell>
                  <TableCell>{instructor.email}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(instructor.status)}>
                      {instructor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{instructor.course_count}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{instructor.blog_count}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{instructor.total_enrollments}</Badge>
                  </TableCell>
                  <TableCell>{new Date(instructor.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openActivityDialog(instructor)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Activity Details Dialog */}
      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Instructor Activity: {selectedInstructor?.full_name}
            </DialogTitle>
          </DialogHeader>
          
          {instructorActivity && (
            <Tabs defaultValue="courses" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="courses">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Courses ({instructorActivity.courses.length})
                </TabsTrigger>
                <TabsTrigger value="blogs">
                  <PenTool className="h-4 w-4 mr-2" />
                  Blogs ({instructorActivity.blogs.length})
                </TabsTrigger>
                <TabsTrigger value="enrollments">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Recent Enrollments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="courses">
                <div className="space-y-2">
                  {instructorActivity.courses.map((course) => (
                    <div key={course.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {course.categories?.name} • ${course.price} • {course.level}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={course.status === 'approved' ? 'default' : 'secondary'}>
                          {course.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {course.enrollments?.length || 0} enrollments
                        </p>
                      </div>
                    </div>
                  ))}
                  {instructorActivity.courses.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No courses created yet</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="blogs">
                <div className="space-y-2">
                  {instructorActivity.blogs.map((blog) => (
                    <div key={blog.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <h4 className="font-medium">{blog.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(blog.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={blog.status === 'approved' ? 'default' : 'secondary'}>
                        {blog.status}
                      </Badge>
                    </div>
                  ))}
                  {instructorActivity.blogs.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No blogs created yet</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="enrollments">
                <div className="space-y-2">
                  {instructorActivity.recent_enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <h4 className="font-medium">{enrollment.profiles?.full_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          enrolled in {enrollment.courses?.title}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {instructorActivity.recent_enrollments.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No recent enrollments</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}