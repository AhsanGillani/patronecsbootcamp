import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/useCategories";
import { Monitor, Palette, Code, TrendingUp, BookOpen, Camera, Briefcase, Globe, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const getIconForCategory = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('marketing') || name.includes('digital')) return <TrendingUp className="h-6 w-6" />;
  if (name.includes('web') || name.includes('development') || name.includes('programming')) return <Code className="h-6 w-6" />;
  if (name.includes('design') || name.includes('graphic')) return <Palette className="h-6 w-6" />;
  if (name.includes('freelance')) return <Briefcase className="h-6 w-6" />;
  if (name.includes('business')) return <Globe className="h-6 w-6" />;
  if (name.includes('photo')) return <Camera className="h-6 w-6" />;
  return <BookOpen className="h-6 w-6" />;
};

const getCategoryColor = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('marketing') || name.includes('digital')) return "from-emerald-500 to-teal-500";
  if (name.includes('web') || name.includes('development') || name.includes('programming')) return "from-blue-500 to-cyan-500";
  if (name.includes('design') || name.includes('graphic')) return "from-purple-500 to-pink-500";
  if (name.includes('freelance')) return "from-orange-500 to-red-500";
  if (name.includes('business')) return "from-indigo-500 to-blue-500";
  if (name.includes('photo')) return "from-amber-500 to-orange-500";
  return "from-slate-500 to-gray-500";
};

export const CategorySection = () => {
  const { categories, loading, error } = useCategories();

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Explore Categories
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Discover our most popular course categories
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
                <div className="mb-6 flex justify-center">
                  <Skeleton className="h-12 w-12 rounded-xl" />
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
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-slate-600">Failed to load categories. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  const displayCategories = categories.slice(0, 4);

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50 rounded-full text-blue-700 text-sm font-medium mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <Sparkles className="h-4 w-4" />
            Popular Categories
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Explore Learning
            <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Categories
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Discover your passion with our expertly curated course categories designed for 
            <span className="text-blue-600 font-semibold"> modern learners</span>
          </p>
        </div>
        
        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {displayCategories.map((category, index) => (
            <Link 
              key={category.id} 
              to={`/courses?category=${category.id}`}
              className="block group"
            >
              <Card className="relative p-8 text-center bg-white border border-slate-200 hover:border-blue-300 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2 rounded-2xl overflow-hidden animate-fade-in" style={{ animationDelay: `${0.4 + index * 0.1}s` }}>
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(category.name)} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6 flex justify-center">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(category.name)} opacity-20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300`} />
                      <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${getCategoryColor(category.name)} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                        <div className={`text-${getCategoryColor(category.name).split('-')[1]}-600`}>
                          {getIconForCategory(category.name)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold mb-4 text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                    {category.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                    {category.description || `Master ${category.name} skills with expert guidance and practical projects`}
                  </p>
                  
                  {/* Course Count */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-blue-600 font-bold text-lg">{category.course_count || 0}+</span>
                    <span className="text-slate-500 text-sm">Courses</span>
                  </div>
                  
                  {/* Hover Arrow */}
                  <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getCategoryColor(category.name)} flex items-center justify-center`}>
                      <ArrowRight className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        
        {/* CTA Button */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <Button size="lg" className="group px-10 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" asChild>
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