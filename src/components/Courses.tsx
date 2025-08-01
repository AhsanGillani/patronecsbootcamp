import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Award, ArrowRight, Play } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";

export const Courses = () => {
  const { courses, loading } = useCourses({ limit: 6 });

  return (
    <section id="courses" className="py-24 bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Free Training</span>{" "}
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">for Everyone</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Discover our <span className="text-primary font-bold">19+ expert-designed courses</span> that have already helped 
            <span className="text-accent font-semibold"> thousands of Pakistanis</span> advance their careers - completely free!
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-primary text-xl">Loading amazing courses...</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <Card key={course.id} className={`group relative overflow-hidden bg-gradient-to-br from-card to-card/80 border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-3 animate-fade-in animation-delay-${200 + index * 100}`}>
                {/* Course Image with Enhanced Overlay */}
                <div className="relative aspect-video bg-muted overflow-hidden">
                  <img 
                    src={course.thumbnail_url || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop"} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Free Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-500 text-white font-bold px-3 py-1">
                      FREE
                    </Badge>
                  </div>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 rounded-full p-4 hover:bg-white transition-colors">
                      <Play className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {course.category?.name || "General"}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                      {course.level}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300 leading-tight">
                    {course.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {course.description?.substring(0, 100)}...
                  </p>
                  
                  {/* Enhanced Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-400">
                        {"★".repeat(5)}
                      </div>
                      <span className="text-sm font-semibold">4.8</span>
                      <span className="text-xs text-muted-foreground">(2.8k)</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <Award className="h-4 w-4 inline mr-1" />
                      Certificate
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6 border-t pt-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.total_duration || 0}h
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.total_enrollments || 0}
                    </div>
                    <div className="text-green-500 font-semibold">
                      ✓ Lifetime Access
                    </div>
                  </div>
                  
                  <Link to={`/courses/${course.id}`}>
                    <Button className="w-full group font-semibold" variant="hero">
                      Start Learning Free
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-16 animate-fade-in animation-delay-1000">
          <Link to="/courses">
            <Button size="lg" variant="hero" className="group text-lg px-12 py-6 hover-scale shadow-2xl">
              Explore All 19+ Courses
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};