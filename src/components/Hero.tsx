import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Award, Users } from "lucide-react";

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
    <section className="min-h-screen bg-hero-gradient flex items-center justify-center pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-foreground">InnoVista </span>
            <span className="text-primary shadow-text-glow">Learn Easy</span>
          </h1>
          
          <h2 className="text-2xl md:text-4xl font-semibold mb-4">
            Offers Online Course With{" "}
            <span className="text-primary">Free Certificate</span> in Pakistan
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Advance your career with high-quality courses taught by industry experts.
          </p>
          
          <p className="text-lg font-medium mb-12">
            Learn at your own pace, anytime, anywhere.
          </p>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 bg-card-gradient border-border hover:border-primary transition-all duration-300 hover:shadow-feature-glow">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="hero" className="text-lg px-8 py-6">
              Browse Courses
            </Button>
            <Button size="lg" variant="cta" className="text-lg px-8 py-6">
              Register Now
            </Button>
          </div>

          {/* Description */}
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="p-8 bg-card-gradient border border-border/50">
              <p className="text-lg leading-relaxed text-muted-foreground">
                Are you ready to upgrade your skills and build a successful future? At{" "}
                <span className="text-primary font-semibold">LearnEasy.pk</span>, we offer a wide range of{" "}
                <span className="text-accent">free online courses in Pakistan with certificates</span>, 
                helping students, professionals, and beginners achieve their goals without any cost. Whether you want to start a{" "}
                <span className="text-primary">freelancing career</span>, master{" "}
                <span className="text-primary">digital marketing</span>, learn{" "}
                <span className="text-primary">programming</span>, or improve your{" "}
                <span className="text-primary">writing skills</span>, our courses are designed to make learning easy and accessible for everyone.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};