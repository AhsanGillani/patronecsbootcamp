import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/useCategories";
import { Monitor, Palette, Code, TrendingUp, BookOpen, Camera, Briefcase, Globe } from "lucide-react";
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
          {displayCategories.map((category) => (
            <Link 
              key={category.id} 
              to={`/courses?category=${category.id}`}
              className="block"
            >
              <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 group bg-card border-border hover:border-primary/50 cursor-pointer">
                <div className="mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {getIconForCategory(category.name)}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {category.description || `Explore ${category.name} courses and master new skills`}
                </p>
                <p className="text-sm text-primary font-medium">
                  {category.course_count || 0} Courses
                </p>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="text-center">
          <Button size="lg" variant="outline" className="px-8" asChild>
            <Link to="/courses">View All Categories</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};