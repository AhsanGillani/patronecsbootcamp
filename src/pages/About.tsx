import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Award, Target, Heart, Lightbulb } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Passion for Learning",
      description: "We believe everyone deserves access to quality education that transforms lives."
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Excellence",
      description: "We maintain the highest standards in content quality and user experience."
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-primary" />,
      title: "Innovation",
      description: "We continuously evolve our platform with the latest educational technologies."
    }
  ];

  const stats = [
    { icon: <Users className="h-6 w-6" />, label: "Students", value: "34,650+" },
    { icon: <BookOpen className="h-6 w-6" />, label: "Courses", value: "19+" },
    { icon: <Award className="h-6 w-6" />, label: "Certificates", value: "15,000+" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-hero-gradient">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6">About Patronecs</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Empowering <span className="text-primary">learners</span> worldwide
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                At Patronecs, we're on a mission to make quality education accessible to everyone, 
                everywhere. Join our community of passionate learners and expert instructors.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  We democratize education by providing free, high-quality courses that empower 
                  individuals to achieve their personal and professional goals. Our platform bridges 
                  the gap between knowledge seekers and expert educators.
                </p>
                <p className="text-lg text-muted-foreground">
                  Every course is carefully crafted by industry professionals and educators who are 
                  passionate about sharing their knowledge and helping others succeed.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                  <Card key={index} className="p-6 text-center bg-card-gradient">
                    <div className="flex justify-center mb-3 text-primary">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                These principles guide everything we do and shape the learning experience we create.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="p-8 text-center bg-card-gradient hover:shadow-feature-glow transition-all duration-300">
                  <div className="flex justify-center mb-6">
                    <div className="p-3 rounded-full bg-primary/10">
                      {value.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Story</h2>
                <p className="text-xl text-muted-foreground">
                  Born from a vision to make education accessible to all
                </p>
              </div>
              
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="text-lg leading-relaxed mb-6">
                  Patronecs was founded with a simple yet powerful belief: that everyone deserves access 
                  to quality education, regardless of their background or financial situation. We started 
                  as a small team of educators and technologists who were frustrated by the barriers that 
                  prevented people from learning new skills and advancing their careers.
                </p>
                
                <p className="text-lg leading-relaxed mb-6">
                  What began as a passion project has grown into a thriving community of learners and 
                  educators from around the world. Today, we're proud to offer completely free courses 
                  across a wide range of subjects, from technology and business to creative arts and 
                  personal development.
                </p>
                
                <p className="text-lg leading-relaxed">
                  As we continue to grow, our commitment remains unchanged: to provide exceptional 
                  educational experiences that transform lives and open doors to new opportunities. 
                  Join us on this journey of learning and discovery.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;