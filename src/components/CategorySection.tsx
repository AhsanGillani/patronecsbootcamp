import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/useCategories";
import { Monitor, Palette, Code, TrendingUp, BookOpen, Camera, Briefcase, Globe, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const getIconForCategory = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('marketing') || name.includes('digital')) return <TrendingUp className="h-8 w-8 text-primary" />;
  if (name.includes('web') || name.includes('development') || name.includes('programming')) return <Code className="h-8 w-8 text-primary" />;
  if (name.includes('design') || name.includes('graphic')) return <Palette className="h-8 w-8 text-primary" />;
  if (name.includes('freelance')) return <Briefcase className="h-8 w-8 text-primary" />;
  if (name.includes('business')) return <Globe className="h-8 w-8 text-primary" />;
  if (name.includes('photo')) return <Camera className="h-8 w-8 text-primary" />;
  return <BookOpen className="h-8 w-8 text-primary" />;
};

export const CategorySection = () => {
  const { categories, loading, error } = useCategories();

  if (loading) {
    return (
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Top Categories
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our most popular course categories and start your learning journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="p-8 text-center bg-card border-border">
                <div className="mb-6 flex justify-center">
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
                <Skeleton className="h-6 w-3/4 mx-auto mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mx-auto mb-4" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Failed to load categories. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  const displayCategories = categories.slice(0, 4);

  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Explore 
            </span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Categories</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover your passion with our expertly curated course categories designed for 
            <span className="text-primary font-semibold"> Pakistani learners</span>
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {displayCategories.map((category, index) => (
            <Link 
              key={category.id} 
              to={`/courses?category=${category.id}`}
              className="block"
            >
              <Card className={`group relative p-8 text-center bg-gradient-to-br from-card to-card/80 border border-border/50 hover:border-primary/50 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-3 animate-fade-in animation-delay-${200 + index * 150} overflow-hidden`}>
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="mb-8 flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                      <div className="relative p-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 group-hover:scale-110 transition-transform duration-300">
                        {getIconForCategory(category.name)}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                    {category.name}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                    {category.description || `Master ${category.name} skills with expert guidance and practical projects`}
                  </p>
                  
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-primary font-bold text-lg">{category.course_count || 0}+</span>
                    <span className="text-muted-foreground text-sm">Courses Available</span>
                  </div>
                  
                  {/* Hover Arrow */}
                  <div className="mt-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="text-center animate-fade-in animation-delay-1000">
          <Button size="lg" variant="hero" className="group px-10 py-6 text-lg hover-scale shadow-xl" asChild>
            <Link to="/courses">
              Explore All Categories
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};