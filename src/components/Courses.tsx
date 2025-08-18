import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Award, ArrowRight, Play, BookOpen, Sparkles } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

export const Courses = () => {
  const { courses, loading } = useCourses({ limit: 6 });

  return (
    <section id="courses" className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-full text-purple-700 text-sm font-medium mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <BookOpen className="h-4 w-4" />
            Featured Courses
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Hands-on Training
            <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              for Everyone
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Discover our <span className="text-purple-600 font-bold">expert-designed courses</span> that have already helped 
            <span className="text-pink-600 font-semibold"> thousands of learners</span> advance their careers - completely free!
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-purple-600 text-xl">Loading amazing courses...</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <Card key={course.id} className="group relative overflow-hidden bg-white border border-slate-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-2 rounded-2xl animate-fade-in" style={{ animationDelay: `${0.4 + index * 0.1}s` }}>
                {/* Course Image */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <ImageWithFallback
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Expert Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-3 py-1 border-0">
                      Expert
                    </Badge>
                  </div>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 rounded-full p-4 hover:bg-white transition-colors shadow-lg">
                      <Play className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Category and Level Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="text-xs font-semibold bg-slate-100 text-slate-700 border-0">
                      {course.category?.name || "General"}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-purple-300 text-purple-600 bg-purple-50">
                      {course.level}
                    </Badge>
                  </div>
                  
                  {/* Course Title */}
                  <h3 className="text-xl font-bold mb-3 group-hover:text-purple-600 transition-colors duration-300 leading-tight text-slate-900">
                    {course.title}
                  </h3>
                  
                  {/* Course Description */}
                  <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                    {course.description?.substring(0, 100)}...
                  </p>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {"★".repeat(5)}
                      </div>
                      <span className="text-sm font-semibold text-slate-900">4.8</span>
                      <span className="text-xs text-slate-500">(2.8k)</span>
                    </div>
                    <div className="text-sm text-slate-600 flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      Certificate
                    </div>
                  </div>
                  
                  {/* Course Meta */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-6 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.total_duration || 0}h
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.total_enrollments || 0}
                    </div>
                    <div className="text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      Lifetime Access
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <Link to={`/course/${course.slug || course.id}`}>
                    <Button className="w-full group font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300" variant="default">
                      Start Learning Free
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center mt-20">
          <div className="inline-block p-8 bg-gradient-to-r from-slate-50 to-purple-50 border border-slate-200 rounded-3xl mb-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="text-lg font-semibold text-slate-900">Ready to start your journey?</div>
                <div className="text-sm text-slate-600">Join thousands of successful learners</div>
              </div>
            </div>
          </div>
          
          <Link to="/courses">
            <Button size="lg" className="group text-lg px-12 py-6 font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: '1s' }}>
              Explore All Courses
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};