import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar, Award } from "lucide-react";

interface DummyCertificateProps {
  courseName?: string;
  completionPercentage?: number;
  completionDate?: string;
}

export function DummyCertificate({ 
  courseName = "Fundamentals of SEO & SEM", 
  completionPercentage = 100,
  completionDate = new Date().toLocaleDateString()
}: DummyCertificateProps) {
  const { user } = useAuth();

  return (
    <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white max-w-md">
      <CardContent className="p-6 text-center space-y-4">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img 
            src="/src/assets/patronecs-logo.png" 
            alt="Patronecs" 
            className="h-16 w-auto"
          />
        </div>

        {/* Certificate Title */}
        <div className="space-y-2">
          <div className="flex justify-center">
            <Award className="h-8 w-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Certificate of Completion</h3>
        </div>

        {/* Student Name */}
        <div className="space-y-1">
          <p className="text-sm text-gray-600">This certifies that</p>
          <h4 className="text-xl font-semibold text-gray-800">{user?.email || "Student Name"}</h4>
          <p className="text-sm text-gray-600">has successfully completed</p>
        </div>

        {/* Course Name */}
        <div className="bg-yellow-100 p-3 rounded-lg">
          <h5 className="font-semibold text-gray-800">{courseName}</h5>
        </div>

        {/* Completion Details */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between items-center">
            <span>Completion:</span>
            <span className="font-semibold text-green-600">{completionPercentage}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Date:</span>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{completionDate}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span>Certificate #:</span>
            <span className="font-mono text-xs">CERT-2025-{Math.floor(Math.random() * 100000)}</span>
          </div>
        </div>

        {/* Download Button */}
        <Button className="w-full" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Certificate
        </Button>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Patronecs Learning Platform
          </p>
        </div>
      </CardContent>
    </Card>
  );
}