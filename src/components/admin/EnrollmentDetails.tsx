import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  User, 
  BookOpen, 
  Clock, 
  TrendingUp,
  Award,
  Eye,
  Download
} from "lucide-react";

interface EnrollmentDetail {
  id: string;
  enrolled_at: string;
  progress: number;
  completed_at: string;
  student: {
    full_name: string;
    email: string;
    avatar_url: string;
  };
  course: {
    title: string;
    description: string;
    level: string;
    total_duration: number;
    lesson_count: number;
    instructor: {
      full_name: string;
    };
  };
}

export const EnrollmentDetails = () => {
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<EnrollmentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEnrollments: 0,
    activeStudents: 0,
    completedCourses: 0,
    averageProgress: 0
  });

  useEffect(() => {
    fetchEnrollmentDetails();
  }, []);

  const fetchEnrollmentDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          student:profiles!student_id(full_name, email, avatar_url),
          course:courses!course_id(
            title,
            description,
            level,
            total_duration,
            lesson_count,
            instructor:profiles!instructor_id(full_name)
          )
        `)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;

      setEnrollments(data || []);

      // Calculate stats
      const totalEnrollments = (data || []).length;
      const activeStudents = new Set((data || []).map(e => e.student_id)).size;
      const completedCourses = (data || []).filter(e => e.completed_at).length;
      const averageProgress = totalEnrollments > 0 
        ? (data || []).reduce((sum, e) => sum + (e.progress || 0), 0) / totalEnrollments 
        : 0;

      setStats({
        totalEnrollments,
        activeStudents,
        completedCourses,
        averageProgress
      });

    } catch (error) {
      console.error('Error fetching enrollment details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch enrollment details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportEnrollmentData = () => {
    const csvData = enrollments.map(enrollment => ({
      'Student Name': enrollment.student.full_name,
      'Student Email': enrollment.student.email,
      'Course Title': enrollment.course.title,
      'Course Level': enrollment.course.level,
      'Instructor': enrollment.course.instructor?.full_name,
      'Enrolled Date': new Date(enrollment.enrolled_at).toLocaleDateString(),
      'Progress': `${enrollment.progress || 0}%`,
      'Status': enrollment.completed_at ? 'Completed' : 'In Progress',
      'Completion Date': enrollment.completed_at ? new Date(enrollment.completed_at).toLocaleDateString() : 'N/A'
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enrollment-details.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Enrollment data has been exported to CSV",
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading enrollment details...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recent Enrollments</h2>
          <p className="text-muted-foreground">Complete details of all course enrollments</p>
        </div>
        <Button onClick={exportEnrollmentData}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.averageProgress)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Enrollment List */}
      <div className="space-y-4">
        {enrollments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No enrollments found.</p>
            </CardContent>
          </Card>
        ) : (
          enrollments.map((enrollment) => (
            <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{enrollment.course.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Student: {enrollment.student.full_name} ({enrollment.student.email})
                    </CardDescription>
                    <CardDescription>
                      Instructor: {enrollment.course.instructor?.full_name}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge variant={enrollment.completed_at ? "default" : "secondary"}>
                      {enrollment.completed_at ? "Completed" : "In Progress"}
                    </Badge>
                    <Badge variant="outline">{enrollment.course.level}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{enrollment.course.lesson_count} lessons</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{enrollment.course.total_duration || 0} minutes</span>
                    </div>
                  </div>

                  {enrollment.completed_at && (
                    <div className="flex items-center text-sm text-green-600">
                      <Award className="h-4 w-4 mr-1" />
                      Completed on {new Date(enrollment.completed_at).toLocaleDateString()}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium">{enrollment.progress || 0}%</span>
                    </div>
                    <Progress value={enrollment.progress || 0} className="h-2" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
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