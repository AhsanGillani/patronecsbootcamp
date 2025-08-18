import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Calendar } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
// Use provided Patronecs SVG logo URL
const PATRONECS_LOGO_SVG = "https://cdn.prod.website-files.com/63eb79f4ab031d09e95a842f/6630f0f8c4d054dad1f951d9_Logo%20(7).svg";
import { DummyCertificate } from "./DummyCertificate";
import html2canvas from "html2canvas";

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
  const { user, profile } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    try {
      // Fetch actual certificates
      const { data: certificatesData, error: certificatesError } = await supabase
        .from('certificates')
        .select(`
          *,
          courses!fk_certificates_course_id(
            title, level, instructor_id,
            profiles!instructor_id(full_name)
          )
        `)
        .eq('student_id', user?.id)
        .order('issued_at', { ascending: false });

      // Fetch completed enrollments (100% progress)
      const { data: completedData, error: completedError } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses!fk_enrollments_course_id(
            title, level, instructor_id,
            profiles!instructor_id(full_name)
          )
        `)
        .eq('student_id', user?.id)
        .gte('progress', 100)
        .order('completed_at', { ascending: false });

      if (certificatesError) throw certificatesError;
      if (completedError) throw completedError;

      // Combine actual certificates with completed courses - only include those with valid course data
      const allCertificates = [
        ...(certificatesData || []),
        ...(completedData || [])
          .filter(enrollment => enrollment.courses) // Filter out enrollments with null courses
          .map(enrollment => ({
            id: `completed-${enrollment.id}`,
            certificate_number: `CERT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
            issued_at: enrollment.completed_at,
            student_id: enrollment.student_id,
            course_id: enrollment.course_id,
            courses: enrollment.courses,
            isFromCompletion: true
          }))
      ];

      setCertificates(allCertificates);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificatePDF = async (certificate: Certificate) => {
    try {
      const pdf = await PDFDocument.create();
      // Keep previous size (A4 landscape ~ 842 x 595)
      const width = 842;
      const height = 595;
      const page = pdf.addPage([width, height]);

      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
      const fontSignature = await pdf.embedFont(StandardFonts.TimesRomanItalic);

      // Helper: fetch an SVG and rasterize to PNG bytes using canvas
      const svgUrlToPngBytes = async (svgUrl: string, targetWidth = 140): Promise<ArrayBuffer> => {
        const svgResp = await fetch(svgUrl, { mode: 'cors' });
        const svgText = await svgResp.text();
        const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
        const objectUrl = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        return new Promise((resolve, reject) => {
          img.onload = () => {
            const scale = targetWidth / img.width;
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              URL.revokeObjectURL(objectUrl);
              reject(new Error('Canvas context not available'));
              return;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              URL.revokeObjectURL(objectUrl);
              if (!blob) {
                reject(new Error('Failed to rasterize SVG'));
                return;
              }
              blob.arrayBuffer().then(resolve).catch(reject);
            }, 'image/png');
          };
          img.onerror = (err) => {
            URL.revokeObjectURL(objectUrl);
            reject(err);
          };
          img.src = objectUrl;
        });
      };

      // Background image (certificate template)
      const backgroundUrl = "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/certificate-background-template-design-8673c42070573c71a94b91e9b8c45afc_screen.jpg?ts=1697121145";
      try {
        const bgResp = await fetch(backgroundUrl, { mode: 'cors' });
        const bgBytes = await bgResp.arrayBuffer();
        // Provided asset is JPG; embed as JPG
        const bgImage = await pdf.embedJpg(bgBytes);
        const scale = Math.max(width / bgImage.width, height / bgImage.height);
        const drawW = bgImage.width * scale;
        const drawH = bgImage.height * scale;
        const x = (width - drawW) / 2;
        const y = (height - drawH) / 2;
        page.drawImage(bgImage, { x, y, width: drawW, height: drawH });
      } catch (e) {
        // Fallback to plain background if image fails
        page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
      }

      // Logo: use provided Patronecs SVG, rasterize to PNG, and embed
      try {
        const logoPngBytes = await svgUrlToPngBytes(PATRONECS_LOGO_SVG, 140);
        const logoImg = await pdf.embedPng(logoPngBytes);
        const logoW = 140;
        const logoH = (logoImg.height / logoImg.width) * logoW;
        // Move a little down to sit nicely with content below
        page.drawImage(logoImg, { x: (width - logoW) / 2, y: height - 125, width: logoW, height: logoH });
      } catch (e) {
        console.warn('Logo embed failed (SVG rasterization)', e);
      }

      // Title (centered, moved slightly down to maintain spacing from logo)
      const title = "Certificate of Completion";
      const titleSize = 26;
      const titleWidth = fontBold.widthOfTextAtSize(title, titleSize);
      page.drawText(title, { x: (width - titleWidth) / 2, y: height - 155, size: titleSize, font: fontBold, color: rgb(0.12, 0.15, 0.2) });

      // Recipient
      const studentName = (profile as any)?.full_name || user?.email || "Student";
      const recipientLabel = "This certifies that";
      const centerX = width / 2;
      const labelW = font.widthOfTextAtSize(recipientLabel, 12);
      page.drawText(recipientLabel, { x: centerX - labelW / 2, y: height - 170, size: 12, font, color: rgb(0.35, 0.4, 0.5) });
      const nameW = fontBold.widthOfTextAtSize(studentName, 24);
      page.drawText(studentName, { x: centerX - nameW / 2, y: height - 200, size: 24, font: fontBold, color: rgb(0.15, 0.18, 0.25) });

      // Course name
      const courseLabel = "has successfully completed";
      const courseLabelW = font.widthOfTextAtSize(courseLabel, 12);
      page.drawText(courseLabel, { x: centerX - courseLabelW / 2, y: height - 230, size: 12, font, color: rgb(0.35, 0.4, 0.5) });
      const courseTitle = certificate.courses.title;
      const courseW = fontBold.widthOfTextAtSize(courseTitle, 18);
      page.drawText(courseTitle, { x: centerX - courseW / 2, y: height - 255, size: 18, font: fontBold, color: rgb(0.15, 0.18, 0.25) });

      // Details row
      const issued = new Date(certificate.issued_at).toLocaleDateString();
      const issuedText = `Issued: ${issued}`;
      const certNumText = `Certificate #: ${certificate.certificate_number}`;
      const issuedW = font.widthOfTextAtSize(issuedText, 12);
      const certNumW = font.widthOfTextAtSize(certNumText, 12);
      page.drawText(issuedText, { x: centerX - issuedW / 2, y: 110, size: 12, font, color: rgb(0.3, 0.35, 0.45) });
      page.drawText(certNumText, { x: centerX - certNumW / 2, y: 92, size: 12, font, color: rgb(0.3, 0.35, 0.45) });

      // Signature placeholders
      const sigLine = "___________________________";
      const sigLabel = "Authorized Signature";
      const sigName = "Ahsan Shah";
      const sigLineW = font.widthOfTextAtSize(sigLine, 10);
      const sigLabelW = font.widthOfTextAtSize(sigLabel, 10);
      const sigNameW = fontSignature.widthOfTextAtSize(sigName, 16);
      // Move signature further up to avoid overlap with issued date
      page.drawText(sigLine, { x: centerX - sigLineW / 2, y: 170, size: 10, font, color: rgb(0.6, 0.65, 0.75) });
      // Signature name on the bar in a signature-like italic font
      page.drawText(sigName, { x: centerX - sigNameW / 2, y: 178, size: 16, font: fontSignature, color: rgb(0.15, 0.18, 0.25) });
      page.drawText(sigLabel, { x: centerX - sigLabelW / 2, y: 155, size: 10, font, color: rgb(0.4, 0.45, 0.55) });

      // Footer brand
      page.drawText("Patronecs", { x: width - 140, y: 60, size: 14, font: fontBold, color: rgb(0.12, 0.33, 0.87) });

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${certificate.certificate_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to generate PDF', e);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading certificates...</div>;
  }

  const showEmpty = certificates.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Gradient header */}
        <div className="relative overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold">My Certificates</h1>
              <p className="text-blue-100 text-lg">Your achievements and certifications</p>
            </div>
          </div>
        </div>

        <Card className="border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Certificates</CardTitle>
            <CardDescription>Download your course completion certificates</CardDescription>
          </CardHeader>
          <CardContent>
            {showEmpty ? (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">No certificates yet</p>
                <p className="text-slate-500 text-sm">Complete a course to earn your first certificate</p>
              </div>
            ) : (
              <div className="divide-y">
                {/* Header Row */}
                <div className="hidden md:grid grid-cols-12 gap-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  <div className="col-span-6">Course</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Issued</div>
                  <div className="col-span-2 text-right">Action</div>
      </div>

                {certificates.filter(c => c.courses).map((certificate) => (
                  <div key={certificate.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4 items-center">
                    <div className="md:col-span-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                          <Award className="h-5 w-5 text-amber-600" />
            </div>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 truncate">{certificate.courses.title}</div>
                          <div className="text-xs text-slate-500 truncate">by {certificate.courses.profiles?.full_name}</div>
            </div>
          </div>
        </div>
                    <div className="md:col-span-2">
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(certificate.issued_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="md:col-span-2 md:text-right">
                      <Button variant="outline" onClick={() => downloadCertificatePDF(certificate)}>
                        <Download className="h-4 w-4 mr-2" /> Download PDF
                      </Button>
                </div>

                    {/* Hidden printable certificate */}
                    <div id={`cert-${certificate.id}`} className="hidden">
                      <div className="p-8" style={{ width: '794px' }}>
                  <div className="flex justify-center mb-3">
                    <img src="/src/assets/patronecs-logo.png" alt="Patronecs" className="h-12 w-auto" />
                  </div>
                  <div className="text-center mb-2">
                          <div className="flex justify-center mb-1"><Award className="h-6 w-6" /></div>
                    <div className="font-bold">Certificate of Completion</div>
                  </div>
                  <div className="text-center text-sm">This certifies that</div>
                  <div className="text-center text-lg font-semibold">{user?.email}</div>
                  <div className="text-center text-sm">has successfully completed</div>
                  <div className="text-center font-semibold mt-2">{certificate.courses.title}</div>
                  <div className="mt-3 text-sm flex justify-between">
                          <span>Certificate #:</span>
                    <span className="font-mono">{certificate.certificate_number}</span>
                  </div>
                  <div className="text-sm flex justify-between">
                          <span>Issued:</span>
                      <span>{new Date(certificate.issued_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                  </div>
          ))}
        </div>
      )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}