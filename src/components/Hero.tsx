import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Award, Users, Search } from "lucide-react";

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
        {/* Promotional Banner - Udemy Style */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8 text-center">
          <p className="text-primary font-semibold">
            🎉 Special Offer: Get unlimited access to all courses - Starting from PKR 1,999!
          </p>
        </div>

        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-foreground">Learn skills that </span>
            <span className="text-primary shadow-text-glow">advance your career</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join millions of learners from around the world already learning on Patronecs. 
            Find the right instructor for you.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="What do you want to learn?"
                className="w-full pl-12 pr-4 py-4 text-lg border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <Button className="absolute right-2 top-2 bottom-2">
                Search
              </Button>
            </div>
          </div>

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
                <span className="text-primary font-semibold">Patronecs.com</span>, we offer a wide range of{" "}
                <span className="text-accent"> online courses in Pakistan with certificates</span>, 
                helping students, professionals, and beginners achieve their goals without any extra cost. Whether you want to start a{" "}
                <span className="text-primary">Mobile Development</span>, master{" "}
                <span className="text-primary">Website Development</span>, master{" "}
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