import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Award } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";

export const Courses = () => {
  const { courses, loading } = useCourses({ limit: 6 });

  return (
    <section id="courses" className="py-16 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-primary">Free Training</span>{" "}
            <span className="text-foreground">19 courses to choose from</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our most popular courses designed by industry experts to help you advance your career. 
            Our mission is to make quality education accessible to everyone in Pakistan.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading courses...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden bg-card-gradient border-border hover:border-primary transition-all duration-300 hover:shadow-feature-glow group">
                <div className="aspect-video bg-muted overflow-hidden">
                  <img 
                    src={course.thumbnail_url || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop"} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {course.category?.name || "General"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {course.level}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
                    {course.description?.substring(0, 120)}...
                  </p>
                  
                  {/* Rating - Udemy Style */}
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {"★".repeat(5)}
                    </div>
                    <span className="ml-2 text-sm text-muted-foreground">4.8 (2,847)</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.total_duration || 0} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.total_enrollments || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      Certificate
                    </div>
                  </div>
                  
                  <Link to={`/courses/${course.id}`}>
                    <Button className="w-full" variant="hero">
                      Enroll Free
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/courses">
            <Button size="lg" variant="cta" className="text-lg px-8 py-6">
              View All Courses
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};