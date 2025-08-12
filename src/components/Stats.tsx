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
    <section className="py-24 bg-gradient-to-b from-secondary/10 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Trusted by </span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Thousands</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Join Pakistan's fastest-growing community of <span className="text-primary font-semibold">skilled professionals</span>
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className={`group relative p-8 bg-gradient-to-br from-card to-card/80 border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 text-center hover:-translate-y-2 animate-fade-in animation-delay-${200 + index * 150} overflow-hidden`}
              style={{ perspective: 1000 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col items-center space-y-6 will-change-transform group-hover:[transform:rotateX(6deg)_rotateY(-6deg)] transition-transform duration-300">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative p-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    {stat.label}
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {stat.description}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};