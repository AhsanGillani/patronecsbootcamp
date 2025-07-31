import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Code, Palette, TrendingUp, Camera, Music, BookOpen, Cpu, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";

export const CategorySection = () => {
  const categories = [
    {
      icon: <Code className="h-8 w-8 text-primary" />,
      title: "Development",
      description: "Web development, mobile apps, programming languages",
      courseCount: "2,000+ courses",
      color: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Business",
      description: "Entrepreneurship, communication, management",
      courseCount: "1,500+ courses", 
      color: "bg-green-50 dark:bg-green-950/20"
    },
    {
      icon: <Palette className="h-8 w-8 text-primary" />,
      title: "Design",
      description: "Web design, graphic design, design tools",
      courseCount: "800+ courses",
      color: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      icon: <Camera className="h-8 w-8 text-primary" />,
      title: "Photography",
      description: "Digital photography, photo editing",
      courseCount: "500+ courses",
      color: "bg-orange-50 dark:bg-orange-950/20"
    },
    {
      icon: <Music className="h-8 w-8 text-primary" />,
      title: "Music",
      description: "Instruments, music production, music theory",
      courseCount: "400+ courses",
      color: "bg-pink-50 dark:bg-pink-950/20"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Academic",
      description: "Math, science, language learning",
      courseCount: "1,200+ courses",
      color: "bg-indigo-50 dark:bg-indigo-950/20"
    },
    {
      icon: <Cpu className="h-8 w-8 text-primary" />,
      title: "IT & Software",
      description: "Operating systems, networking, cybersecurity",
      courseCount: "900+ courses",
      color: "bg-cyan-50 dark:bg-cyan-950/20"
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Marketing",
      description: "Digital marketing, social media, SEO",
      courseCount: "700+ courses",
      color: "bg-yellow-50 dark:bg-yellow-950/20"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Top categories</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from thousands of online video courses with new additions published every month
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category, index) => (
            <Card 
              key={index} 
              className={`p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-border hover:border-primary ${category.color}`}
            >
              <div className="flex flex-col items-start space-y-4">
                <div className="p-3 rounded-lg bg-background">
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{category.title}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{category.description}</p>
                  <span className="text-primary text-sm font-medium">{category.courseCount}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg">
            View All Categories
          </Button>
        </div>
      </div>
    </section>
  );
};