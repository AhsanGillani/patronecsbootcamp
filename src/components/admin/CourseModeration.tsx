import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Eye, MessageSquare } from 'lucide-react';

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
      const coursesWithCategory = (data || []).map((course: any) => ({
        ...course,
        categories: course.categories || { name: "Uncategorized" }
      }));
      
      setCourses(coursesWithCategory);
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
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
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
    return <div className="flex justify-center p-8">Loading courses...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Course Moderation</h3>
        <p className="text-muted-foreground">Review and moderate course submissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Courses ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.profiles?.full_name}</TableCell>
                  <TableCell>{course.categories?.name || 'No category'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{course.level}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(course.status)}>
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${course.price}</TableCell>
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
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Review Course: {course.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold">Description</h4>
                                <p className="text-muted-foreground">{course.description}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold">Instructor</h4>
                                <p>{course.profiles?.full_name} ({course.profiles?.email})</p>
                              </div>
                              <div>
                                <h4 className="font-semibold">Category</h4>
                                <p>{course.categories?.name || 'No category'}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold">Level & Price</h4>
                                <p>{course.level} - ${course.price}</p>
                              </div>
                            </div>
                            
                            {/* Lessons Section */}
                            <div>
                              <h4 className="font-semibold mb-3">Lessons ({lessons.length})</h4>
                              {loadingDetails ? (
                                <p className="text-muted-foreground">Loading lessons...</p>
                              ) : lessons.length > 0 ? (
                                <div className="space-y-2">
                                  {lessons.map((lesson) => (
                                    <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                                      <div>
                                        <p className="font-medium">{lesson.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {lesson.type} • {lesson.duration ? `${lesson.duration} min` : 'Duration not set'}
                                        </p>
                                      </div>
                                      <Badge variant={lesson.is_published ? 'default' : 'secondary'}>
                                        {lesson.is_published ? 'Published' : 'Draft'}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-muted-foreground">No lessons created yet</p>
                              )}
                            </div>

                            {/* Quizzes Section */}
                            <div>
                              <h4 className="font-semibold mb-3">Quizzes ({quizzes.length})</h4>
                              {loadingDetails ? (
                                <p className="text-muted-foreground">Loading quizzes...</p>
                              ) : quizzes.length > 0 ? (
                                <div className="space-y-2">
                                  {quizzes.map((quiz) => (
                                    <div key={quiz.id} className="p-3 border rounded-lg">
                                      <div className="flex items-center justify-between">
                                        <p className="font-medium">{quiz.title}</p>
                                        <Badge variant="outline">
                                          {quiz.quiz_questions?.length || 0} questions
                                        </Badge>
                                      </div>
                                      {quiz.description && (
                                        <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
                                      )}
                                      <p className="text-sm text-muted-foreground mt-1">
                                        Passing score: {quiz.passing_score}%
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-muted-foreground">No quizzes created yet</p>
                              )}
                            </div>

                            {course.admin_comments && (
                              <div>
                                <h4 className="font-semibold">Previous Comments</h4>
                                <p className="text-muted-foreground">{course.admin_comments}</p>
                              </div>
                            )}
                            
                            <div>
                              <label className="block text-sm font-medium mb-2">Admin Comments</label>
                              <Textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Add comments for the instructor..."
                                rows={3}
                              />
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleStatusChange(course.id, 'approved', comments)}
                                className="flex-1"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleStatusChange(course.id, 'rejected', comments)}
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