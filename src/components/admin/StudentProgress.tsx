import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Eye, GraduationCap, User, BookOpen, CheckCircle2, XCircle } from "lucide-react";

interface CourseOption {
  id: string;
  title: string;
}

interface EnrollmentRow {
  id: string;
  enrolled_at: string;
  progress: number;
  completed_at: string | null;
  student_id: string;
  course_id: string;
  profiles: { full_name: string; email: string } | null;
  courses: { title: string } | null;
}

interface LessonProgressRow {
  lesson_id: string;
  is_completed: boolean;
}

interface LessonRow {
  id: string;
  title: string;
  order_index: number | null;
  lesson_progress?: LessonProgressRow[];
}

export default function StudentProgress() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [progressBand, setProgressBand] = useState<string>("all");

  // Details dialog
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsLessons, setDetailsLessons] = useState<LessonRow[]>([]);
  const [detailsStudent, setDetailsStudent] = useState<{ name: string; email: string } | null>(null);
  const [detailsCourse, setDetailsCourse] = useState<string>("");
  const [detailsOverall, setDetailsOverall] = useState<number>(0);

  useEffect(() => {
    fetchFilters();
    fetchEnrollments();
  }, []);

  const fetchFilters = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('soft_deleted', false)
        .order('title');
      if (error) throw error;
      setCourses((data || []).map((c) => ({ id: c.id, title: c.title })));
    } catch (e) {
      console.error('Error loading courses', e);
    }
  };

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id, enrolled_at, progress, completed_at, student_id, course_id,
          profiles!enrollments_student_id_fkey(full_name, email),
          courses!enrollments_course_id_fkey(title)
        `)
        .order('enrolled_at', { ascending: false });
      if (error) throw error;
      setEnrollments((data as any) || []);
    } catch (e) {
      console.error('Error loading enrollments', e);
      toast({ title: 'Error', description: 'Failed to load enrollments', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return enrollments.filter((e) => {
      if (courseFilter !== 'all' && e.course_id !== courseFilter) return false;
      if (progressBand !== 'all') {
        const [min, max] = progressBand.split('-').map(Number);
        if (isFinite(min) && e.progress < min) return false;
        if (isFinite(max) && e.progress > max) return false;
      }
      return true;
    });
  }, [enrollments, courseFilter, progressBand]);

  const openDetails = async (row: EnrollmentRow) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsStudent({ name: row.profiles?.full_name || 'Student', email: row.profiles?.email || '' });
    setDetailsCourse(row.courses?.title || 'Course');
    setDetailsOverall(row.progress || 0);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id, title, order_index,
          lesson_progress!fk_lesson_progress_lesson_id(student_id, is_completed)
        `)
        .eq('course_id', row.course_id)
        .order('order_index');
      if (error) throw error;
      const lessons: LessonRow[] = (data as any) || [];
      // Only keep this student's progress per lesson
      const filteredLessons = lessons.map((lesson) => ({
        ...lesson,
        lesson_progress: (lesson.lesson_progress || []).filter((lp: any) => lp.student_id === row.student_id)
      }));
      setDetailsLessons(filteredLessons);
    } catch (e) {
      console.error('Error loading lesson progress', e);
      toast({ title: 'Error', description: 'Failed to load lesson progress', variant: 'destructive' });
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Student Progress</h2>
        <p className="text-muted-foreground">Track progress across courses with filters</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Narrow results by course, date, or progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500">Course</label>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Progress</label>
              <Select value={progressBand} onValueChange={setProgressBand}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="0-25">0-25%</SelectItem>
                  <SelectItem value="25-50">25-50%</SelectItem>
                  <SelectItem value="50-75">50-75%</SelectItem>
                  <SelectItem value="75-100">75-100%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollments</CardTitle>
          <CardDescription>Showing {filtered.length} results</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No enrollments match your filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-500" />
                          <div>
                             <div className="font-medium">{row.profiles?.full_name || 'Student'}</div>
                             <div className="text-xs text-slate-500">{row.profiles?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-slate-500" />
                          <span>{row.courses?.title || 'Course'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="h-4 w-4" />
                          {new Date(row.enrolled_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-40">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500">{row.completed_at ? 'Completed' : 'In progress'}</span>
                            <span className="font-medium">{row.progress || 0}%</span>
                          </div>
                          <Progress value={row.progress || 0} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openDetails(row)}>
                          <Eye className="h-4 w-4 mr-2" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Student Progress Details</DialogTitle>
            <DialogDescription>
              {detailsStudent?.name} • {detailsCourse}
            </DialogDescription>
          </DialogHeader>
          {detailsLoading ? (
            <div className="py-8 text-center">Loading details...</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Overall Progress:</span> {detailsOverall}%
                </div>
                <div className="min-w-48">
                  <Progress value={detailsOverall} className="h-2" />
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Lessons</CardTitle>
                  <CardDescription>Completion status per lesson</CardDescription>
                </CardHeader>
                <CardContent>
                  {detailsLessons.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No lessons found.</div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-auto pr-2">
                      {detailsLessons.map((lesson) => {
                        const completed = (lesson.lesson_progress || []).some(lp => lp.is_completed);
                        return (
                          <div key={lesson.id} className="flex items-center justify-between p-2 rounded-md border">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-slate-500" />
                              <span className="font-medium">{lesson.title}</span>
                            </div>
                            {completed ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Done
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-slate-700">
                                <XCircle className="h-3 w-3 mr-1" /> Pending
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


