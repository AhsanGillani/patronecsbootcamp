import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Award, Users, Search, ArrowRight, Play, Star } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  const features = [
    {
      icon: <GraduationCap className="h-8 w-8 text-primary" />,
      title: "Free access to professional courses",
      description: "Get unlimited access to high-quality courses without any cost"
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "Free certificates upon completion",
      description: "Earn official certificates to boost your professional credentials"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Learn from Pakistan's top instructors",
      description: "Study with industry experts and experienced professionals"
    }
  ];

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Promotional Banner */}
        <div className="animate-fade-in bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/30 rounded-full p-4 mb-8 text-center backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2">
            <Star className="h-5 w-5 text-primary animate-pulse" />
            <p className="text-primary font-semibold">
              🚀 Join 34,650+ Students Learning for FREE - Start Today!
            </p>
            <Star className="h-5 w-5 text-primary animate-pulse" />
          </div>
        </div>

        <div className="text-center max-w-5xl mx-auto">
          {/* Main Heading with Enhanced Typography */}
          <div className="animate-fade-in animation-delay-200">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text text-transparent">
                Master Skills That
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x">
                Transform Careers
              </span>
            </h1>
          </div>
          
          <div className="animate-fade-in animation-delay-400">
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Join <span className="text-primary font-bold">34,650+ learners</span> from Pakistan already advancing their careers with our 
              <span className="text-accent font-semibold"> completely free courses</span> and certificates.
            </p>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="animate-fade-in animation-delay-600 flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" variant="hero" className="group text-lg px-8 py-6 hover-scale shadow-2xl" asChild>
              <Link to="/courses">
                <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Learning Free
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="group text-lg px-8 py-6 hover-scale border-2" asChild>
              <Link to="/auth?mode=register">
                Browse 19+ Courses
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="animate-fade-in animation-delay-800 flex flex-wrap justify-center gap-8 mb-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>100% Free Access</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Official Certificates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Expert Instructors</span>
            </div>
          </div>

          {/* Enhanced Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className={`group p-8 bg-gradient-to-br from-card to-card/80 border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 animate-fade-in animation-delay-${1000 + index * 200}`}>
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative p-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="font-bold text-xl group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Enhanced Description Section */}
          <div className="animate-fade-in animation-delay-1200 mt-20 max-w-5xl mx-auto">
            <Card className="relative p-10 bg-gradient-to-br from-card/80 to-background/50 border border-border/30 backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-center mb-6 text-foreground">
                  Why Choose <span className="text-primary">Patronecs?</span>
                </h3>
                <p className="text-lg leading-relaxed text-muted-foreground text-center">
                  Ready to upgrade your skills and build a successful future? 
                  <span className="text-primary font-bold"> Patronecs.com</span> offers Pakistan's most comprehensive 
                  <span className="text-accent font-semibold"> free online courses with certificates</span>. 
                  From <span className="text-primary font-semibold">Mobile Development</span> to 
                  <span className="text-primary font-semibold"> Web Development</span>, 
                  <span className="text-primary font-semibold"> Programming</span>, and 
                  <span className="text-primary font-semibold"> Professional Writing</span> - 
                  our expertly designed courses make quality education accessible to everyone, everywhere.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};