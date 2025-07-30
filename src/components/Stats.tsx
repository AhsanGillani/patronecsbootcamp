import { Card } from "@/components/ui/card";
import { BookOpen, Users, Unlock, Star } from "lucide-react";

export const Stats = () => {
  const stats = [
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      label: "Free Courses",
      value: "19+",
      description: "Comprehensive courses available"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      label: "Students",
      value: "34,650+",
      description: "Trusted by thousands"
    },
    {
      icon: <Unlock className="h-8 w-8 text-primary" />,
      label: "Free Access",
      value: "100%",
      description: "Always free to learn"
    },
    {
      icon: <Star className="h-8 w-8 text-primary" />,
      label: "Rating",
      value: "4.8★",
      description: "Highly rated platform"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Trusted by </span>
            <span className="text-primary">thousands</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Join our growing community of learners
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 bg-card-gradient border-border hover:border-primary transition-all duration-300 hover:shadow-feature-glow text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-3 rounded-full bg-primary/10">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="font-semibold text-foreground mb-2">{stat.label}</div>
                  <div className="text-sm text-muted-foreground">{stat.description}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};