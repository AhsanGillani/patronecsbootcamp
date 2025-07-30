import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Award } from "lucide-react";

export const Courses = () => {
  const courses = [
    {
      title: "Digital Marketing Mastery",
      description: "Learn comprehensive digital marketing strategies including SEO, social media, and content marketing.",
      duration: "8 weeks",
      students: "2,500+",
      level: "Beginner",
      category: "Marketing",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop"
    },
    {
      title: "Web Development Fundamentals",
      description: "Master HTML, CSS, JavaScript and build responsive websites from scratch.",
      duration: "12 weeks",
      students: "3,200+",
      level: "Beginner",
      category: "Programming",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop"
    },
    {
      title: "Freelancing Success Guide",
      description: "Learn how to start and grow a successful freelancing career with proven strategies.",
      duration: "6 weeks",
      students: "1,800+",
      level: "Beginner",
      category: "Business",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop"
    },
    {
      title: "Graphic Design Essentials",
      description: "Master design principles and tools like Photoshop and Illustrator for creative projects.",
      duration: "10 weeks",
      students: "2,100+",
      level: "Intermediate",
      category: "Design",
      image: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=250&fit=crop"
    },
    {
      title: "Content Writing Mastery",
      description: "Develop professional writing skills for blogs, social media, and marketing content.",
      duration: "8 weeks",
      students: "1,600+",
      level: "Beginner",
      category: "Writing",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop"
    },
    {
      title: "Data Analysis with Excel",
      description: "Learn advanced Excel techniques for data analysis and business intelligence.",
      duration: "6 weeks",
      students: "2,800+",
      level: "Intermediate",
      category: "Analytics",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop"
    }
  ];

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <Card key={index} className="overflow-hidden bg-card-gradient border-border hover:border-primary transition-all duration-300 hover:shadow-feature-glow group">
              <div className="aspect-video bg-muted overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {course.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {course.level}
                  </Badge>
                </div>
                
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {course.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.students}
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Certificate
                  </div>
                </div>
                
                <Button className="w-full" variant="hero">
                  Enroll Free
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="cta" className="text-lg px-8 py-6">
            View All Courses
          </Button>
        </div>
      </div>
    </section>
  );
};