import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Calendar } from "lucide-react";

interface Certificate {
  id: string;
  certificate_number: string;
  issued_at: string;
  courses: {
    title: string;
    level: string;
    profiles: {
      full_name: string;
    };
  };
}

export function StudentCertificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          courses!inner(
            title, level, instructor_id,
            profiles!instructor_id(full_name)
          )
        `)
        .eq('student_id', user?.id)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = (certificate: Certificate) => {
    // TODO: Implement PDF generation/download
    console.log('Downloading certificate:', certificate.certificate_number);
  };

  if (loading) {
    return <div className="text-center py-8">Loading certificates...</div>;
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Certificates Yet</h3>
        <p className="text-muted-foreground mb-4">Complete courses and pass quizzes to earn certificates!</p>
        <Button>View Available Courses</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Certificates</h2>
        <p className="text-muted-foreground">Your achievements and certifications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((certificate) => (
          <Card key={certificate.id} className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Award className="h-8 w-8 text-yellow-500" />
                <Badge variant="outline">Certified</Badge>
              </div>
              <CardTitle className="text-lg">{certificate.courses.title}</CardTitle>
              <CardDescription>
                by {certificate.courses.profiles?.full_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Certificate #:</span>
                  <span className="font-mono">{certificate.certificate_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level:</span>
                  <Badge variant="secondary">{certificate.courses.level}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issued:</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(certificate.issued_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => downloadCertificate(certificate)}
                className="w-full" 
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}