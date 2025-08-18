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
import { Plus, Eye, UserPlus, BookOpen, PenTool, GraduationCap, Users, Search, Filter, TrendingUp, Calendar, DollarSign, Target } from 'lucide-react';

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
  courses: Array<{
    id: string;
    title: string;
    status: string;
    price: number;
    level: string;
    categories?: { name: string } | null;
    enrollments?: Array<{ id: string }>;
  }>;
  blogs: Array<{
    id: string;
    title: string;
    status: string;
    created_at: string;
  }>;
  recent_enrollments: Array<{
    id: string;
    enrolled_at: string;
    courses?: { title: string } | null;
    profiles?: { full_name: string } | null;
  }>;
}

export default function InstructorControl() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [instructorActivity, setInstructorActivity] = useState<InstructorActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: 'Error',
        description: errorMessage,
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: 'Error',
        description: errorMessage,
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: 'Error',
        description: errorMessage,
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
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Filter instructors
  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = instructor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || instructor.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading instructors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h3 className="text-3xl font-bold text-slate-900">Instructor Control</h3>
          <p className="text-slate-600 mt-2 text-lg">Manage instructors and monitor their activities</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3">
              <UserPlus className="h-5 w-5 mr-2" />
              Create Instructor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-900">Create New Instructor Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="instructor@example.com"
                  className="mt-2 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Temporary password"
                  className="mt-2 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="full_name" className="text-slate-700 font-medium">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                  className="mt-2 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button onClick={handleCreateInstructor} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-3">
                Create Instructor Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">Total Instructors</p>
                <p className="text-2xl font-bold text-blue-900">{instructors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">Total Courses</p>
                <p className="text-2xl font-bold text-green-900">{instructors.reduce((sum, inst) => sum + (inst.course_count || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <PenTool className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">Total Blogs</p>
                <p className="text-2xl font-bold text-purple-900">{instructors.reduce((sum, inst) => sum + (inst.blog_count || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-emerald-900">{instructors.reduce((sum, inst) => sum + (inst.total_enrollments || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Instructors Table */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200">
          <CardTitle className="text-xl font-semibold text-slate-900 flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span>All Instructors ({filteredInstructors.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50">
                <TableHead className="text-slate-700 font-semibold">Name</TableHead>
                <TableHead className="text-slate-700 font-semibold">Email</TableHead>
                <TableHead className="text-slate-700 font-semibold">Status</TableHead>
                <TableHead className="text-slate-700 font-semibold">Courses</TableHead>
                <TableHead className="text-slate-700 font-semibold">Blogs</TableHead>
                <TableHead className="text-slate-700 font-semibold">Enrollments</TableHead>
                <TableHead className="text-slate-700 font-semibold">Joined</TableHead>
                <TableHead className="text-slate-700 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstructors.map((instructor) => (
                <TableRow key={instructor.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-semibold text-slate-900">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                      </div>
                      <span>{instructor.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{instructor.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(instructor.status)}>
                      {instructor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      {instructor.course_count}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                      {instructor.blog_count}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      {instructor.total_enrollments}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{new Date(instructor.created_at).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openActivityDialog(instructor)}
                      className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
                      title="View activity"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredInstructors.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">No instructors found</p>
              <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Details Dialog */}
      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span>Instructor Activity: {selectedInstructor?.full_name}</span>
            </DialogTitle>
          </DialogHeader>
          
          {instructorActivity && (
            <Tabs defaultValue="courses" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-lg">
                <TabsTrigger value="courses" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Courses ({instructorActivity.courses.length})
                </TabsTrigger>
                <TabsTrigger value="blogs" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                  <PenTool className="h-4 w-4 mr-2" />
                  Blogs ({instructorActivity.blogs.length})
                </TabsTrigger>
                <TabsTrigger value="enrollments" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                  <Users className="h-4 w-4 mr-2" />
                  Recent Enrollments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="courses" className="space-y-4">
                <div className="space-y-3">
                  {instructorActivity.courses.map((course) => (
                    <div key={course.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                      <div>
                        <h4 className="font-medium text-slate-900">{course.title}</h4>
                        <p className="text-sm text-slate-600">
                          {course.categories?.name} • ${course.price} • {course.level}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={course.status === 'approved' ? 'default' : 'secondary'} className={course.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                          {course.status}
                        </Badge>
                        <p className="text-xs text-slate-500 mt-1">
                          {course.enrollments?.length || 0} enrollments
                        </p>
                      </div>
                    </div>
                  ))}
                  {instructorActivity.courses.length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No courses created yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="blogs" className="space-y-4">
                <div className="space-y-3">
                  {instructorActivity.blogs.map((blog) => (
                    <div key={blog.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                      <div>
                        <h4 className="font-medium text-slate-900">{blog.title}</h4>
                        <p className="text-sm text-slate-600">
                          {new Date(blog.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={blog.status === 'approved' ? 'default' : 'secondary'} className={blog.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                        {blog.status}
                      </Badge>
                    </div>
                  ))}
                  {instructorActivity.blogs.length === 0 && (
                    <div className="text-center py-8">
                      <PenTool className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No blogs created yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="enrollments" className="space-y-4">
                <div className="space-y-3">
                  {instructorActivity.recent_enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                      <div>
                        <h4 className="font-medium text-slate-900">{enrollment.profiles?.full_name}</h4>
                        <p className="text-sm text-slate-600">
                          enrolled in {enrollment.courses?.title}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">
                          {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {instructorActivity.recent_enrollments.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No recent enrollments</p>
                    </div>
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