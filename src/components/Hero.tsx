import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Award, Users, ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

export const Hero = () => {
  const categories = [
    { label: "Web Development", href: "/courses?category=web", color: "from-blue-500 to-cyan-500" },
    { label: "Mobile Apps", href: "/courses?category=mobile", color: "from-purple-500 to-pink-500" },
    { label: "UI/UX Design", href: "/courses?category=design", color: "from-orange-500 to-red-500" },
    { label: "AI & Data", href: "/courses?category=ai", color: "from-green-500 to-emerald-500" },
  ];

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50 rounded-full text-blue-700 text-sm font-medium animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Sparkles className="h-4 w-4" />
              Free Learning Platform
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-slate-900 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Master Modern
                <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Tech Skills
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-slate-600 leading-relaxed max-w-2xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
                Project-based courses with expert mentorship. Learn at your own pace and build a portfolio that gets you hired.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Button size="lg" className="group px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" asChild>
                <Link to="/courses">
                  <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Start Learning
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="group px-8 py-6 text-lg font-semibold border-2 border-slate-300 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300" asChild>
                <Link to="/auth?mode=register">
                  Browse Courses
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              {categories.map((category, index) => (
                <Link
                  key={category.label}
                  to={category.href}
                  className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${category.color} text-white text-sm font-medium hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                  style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                >
                  {category.label}
                </Link>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-6 pt-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">500+</div>
                <div className="text-sm text-slate-600">Courses</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">34K+</div>
                <div className="text-sm text-slate-600">Students</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">100%</div>
                <div className="text-sm text-slate-600">Free</div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative animate-fade-in" style={{ animationDelay: '0.9s' }}>
            {/* Main Card */}
            <Card className="relative p-8 bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl shadow-blue-500/10 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
              <div className="relative z-10">
                <div className="aspect-video rounded-2xl overflow-hidden mb-6">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=1600&auto=format&fit=crop&q=60"
                    alt="Learning platform preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-900">Interactive Learning</h3>
                  <p className="text-slate-600">Hands-on projects and real-world applications</p>
                  <div className="flex items-center gap-2 text-blue-600 font-medium">
                    <Play className="h-4 w-4" />
                    Watch Demo
                  </div>
                </div>
              </div>
            </Card>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 animate-fade-in" style={{ animationDelay: '1.1s' }}>
              <Card className="p-4 bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Live Support</div>
                    <div className="text-xs text-slate-600">24/7 Help</div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="absolute -bottom-4 -left-4 animate-fade-in" style={{ animationDelay: '1.2s' }}>
              <Card className="p-4 bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Certificate</div>
                    <div className="text-xs text-slate-600">Upon Completion</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};