import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Eye, MessageSquare, BookOpen, Clock, DollarSign, Search, Filter, TrendingUp, Users, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  admin_comments: string | null;
  price: number;
  created_at: string;
  instructor_id: string;
  profiles: {
    full_name: string;
    email: string;
  };
  categories: {
    name: string;
  } | null;
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  duration: number | null;
  is_published: boolean;
  order_index: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  passing_score: number;
  lesson_id: string;
  quiz_questions: { id: string }[];
}

export default function CourseModeration() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [comments, setComments] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles!instructor_id(full_name, email),
          categories!fk_courses_category_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Handle potential null category relationships
      const coursesWithCategory = (data || []).map((course: Course) => ({
        ...course,
        categories: course.categories || { name: "Uncategorized" }
      }));
      
      setCourses(coursesWithCategory);
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

  const fetchCourseDetails = async (courseId: string) => {
    setLoadingDetails(true);
    try {
      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, title, type, duration, is_published, order_index')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (lessonsError) throw lessonsError;

      // Fetch quizzes
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select(`
          id, title, description, passing_score, lesson_id,
          quiz_questions(id)
        `)
        .in('lesson_id', lessonsData?.map(l => l.id) || []);

      if (quizzesError) throw quizzesError;

      setLessons(lessonsData || []);
      setQuizzes(quizzesData || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStatusChange = async (courseId: string, status: 'approved' | 'rejected', adminComments?: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ 
          status, 
          admin_comments: adminComments || null 
        })
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Course ${status} successfully`,
      });

      fetchCourses();
      setIsDialogOpen(false);
      setComments('');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advanced': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    const matchesLevel = levelFilter === 'all' || course.level.toLowerCase() === levelFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesLevel;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h3 className="text-3xl font-bold text-slate-900">Course Moderation</h3>
          <p className="text-slate-600 mt-2 text-lg">Review and moderate course submissions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">Total Courses</p>
                <p className="text-2xl font-bold text-blue-900">{courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-900">{courses.filter(c => c.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">Approved</p>
                <p className="text-2xl font-bold text-green-900">{courses.filter(c => c.status === 'approved').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
      <div>
                <p className="text-sm font-medium text-red-600">Rejected</p>
                <p className="text-2xl font-bold text-red-900">{courses.filter(c => c.status === 'rejected').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search courses..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200">
          <CardTitle className="text-xl font-semibold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>All Courses ({filteredCourses.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50">
                <TableHead className="text-slate-700 font-semibold">Title</TableHead>
                <TableHead className="text-slate-700 font-semibold">Instructor</TableHead>
                <TableHead className="text-slate-700 font-semibold">Category</TableHead>
                <TableHead className="text-slate-700 font-semibold">Level</TableHead>
                <TableHead className="text-slate-700 font-semibold">Status</TableHead>
                <TableHead className="text-slate-700 font-semibold">Price</TableHead>
                <TableHead className="text-slate-700 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-semibold text-slate-900 max-w-xs truncate" title={course.title}>
                    {course.title}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    <div>
                      <p className="font-medium">{course.profiles?.full_name}</p>
                      <p className="text-sm text-slate-500">{course.profiles?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                      {course.categories?.name || 'Uncategorized'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(course.status)}>
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">${course.price}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog 
                        open={isDialogOpen && selectedCourse?.id === course.id} 
                        onOpenChange={(open) => {
                          setIsDialogOpen(open);
                          if (open) setSelectedCourse(course);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => fetchCourseDetails(course.id)}
                            className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
                            title="Review course"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center space-x-2">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                              <span>Review Course: {course.title}</span>
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div className="bg-slate-50 rounded-xl p-4">
                                  <h4 className="font-semibold text-slate-900 mb-2">Description</h4>
                                  <p className="text-slate-600 text-sm leading-relaxed">{course.description}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4">
                                  <h4 className="font-semibold text-slate-900 mb-2">Instructor</h4>
                                  <p className="text-slate-600">{course.profiles?.full_name} ({course.profiles?.email})</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="bg-slate-50 rounded-xl p-4">
                                  <h4 className="font-semibold text-slate-900 mb-2">Course Details</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Category:</span>
                                      <span className="font-medium">{course.categories?.name || 'No category'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Level:</span>
                                      <Badge variant="outline" className={getLevelColor(course.level)}>
                                        {course.level}
                                      </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Price:</span>
                                      <span className="font-medium text-green-600">${course.price}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Status:</span>
                                      <Badge variant="outline" className={getStatusColor(course.status)}>
                                        {course.status}
                                      </Badge>
                              </div>
                              </div>
                              </div>
                              </div>
                            </div>
                            
                            {/* Lessons Section */}
                            <div className="bg-slate-50 rounded-xl p-4">
                              <h4 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span>Lessons ({lessons.length})</span>
                              </h4>
                              {loadingDetails ? (
                                <div className="text-center py-4">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                  <p className="text-slate-500 text-sm">Loading lessons...</p>
                                </div>
                              ) : lessons.length > 0 ? (
                                <div className="space-y-2">
                                  {lessons.map((lesson) => (
                                    <div key={lesson.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                      <div>
                                        <p className="font-medium text-slate-900">{lesson.title}</p>
                                        <p className="text-sm text-slate-600">
                                          {lesson.type} • {lesson.duration ? `${lesson.duration} min` : 'Duration not set'}
                                        </p>
                                      </div>
                                      <Badge variant={lesson.is_published ? 'default' : 'secondary'} className={lesson.is_published ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                                        {lesson.is_published ? 'Published' : 'Draft'}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-slate-500 text-center py-4">No lessons created yet</p>
                              )}
                            </div>

                            {/* Quizzes Section */}
                            <div className="bg-slate-50 rounded-xl p-4">
                              <h4 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                                <MessageSquare className="w-4 h-4 text-purple-600" />
                                <span>Quizzes ({quizzes.length})</span>
                              </h4>
                              {loadingDetails ? (
                                <div className="text-center py-4">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                  <p className="text-slate-500 text-sm">Loading quizzes...</p>
                                </div>
                              ) : quizzes.length > 0 ? (
                                <div className="space-y-2">
                                  {quizzes.map((quiz) => (
                                    <div key={quiz.id} className="p-3 bg-white rounded-lg border border-slate-200">
                                      <div className="flex items-center justify-between">
                                        <p className="font-medium text-slate-900">{quiz.title}</p>
                                        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                                          {quiz.quiz_questions?.length || 0} questions
                                        </Badge>
                                      </div>
                                      {quiz.description && (
                                        <p className="text-sm text-slate-600 mt-1">{quiz.description}</p>
                                      )}
                                      <p className="text-sm text-slate-600 mt-1">
                                        Passing score: {quiz.passing_score}%
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-slate-500 text-center py-4">No quizzes created yet</p>
                              )}
                            </div>

                            {course.admin_comments && (
                              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                                <h4 className="font-semibold text-slate-900 mb-2">Previous Comments</h4>
                                <p className="text-slate-600 text-sm">{course.admin_comments}</p>
                              </div>
                            )}
                            
                            <div className="bg-slate-50 rounded-xl p-4">
                              <label className="block text-sm font-medium text-slate-700 mb-2">Admin Comments</label>
                              <Textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Add comments for the instructor..."
                                rows={3}
                                className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div className="flex space-x-3">
                              <Button
                                onClick={() => handleStatusChange(course.id, 'approved', comments)}
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-3"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Course
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleStatusChange(course.id, 'rejected', comments)}
                                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-3"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Course
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
          
          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">No courses found</p>
              <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}