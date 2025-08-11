import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, Users, Search, Filter } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useCourses } from "@/hooks/useCourses";
import { useCategories } from "@/hooks/useCategories";

const AllCourses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('latest');

  const { categories } = useCategories();
  const { courses, loading } = useCourses({
    search: searchQuery,
    categoryId: selectedCategory || undefined
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    setSearchParams(params);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (categoryId && categoryId !== 'all') params.set('category', categoryId);
    setSearchParams(params);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const sortedCourses = courses.sort((a, b) => {
    switch (sortBy) {
      case 'popular': return b.total_enrollments - a.total_enrollments;
      case 'title': return a.title.localeCompare(b.title);
      case 'latest':
      default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Header Section */}
        <section className="py-12 bg-hero-gradient">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                All <span className="text-primary">Courses</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Discover our complete catalog of free, high-quality courses
              </p>
              
              {/* Search and Filters */}
              <div className="bg-background/80 backdrop-blur-sm rounded-lg p-6 border border-border">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search courses..."
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit" className="px-8">
                    Search
                  </Button>
                </form>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-6">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-20 w-full mb-4" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : sortedCourses.length > 0 ? (
              <>
                <div className="text-center mb-8">
                  <p className="text-muted-foreground">
                    Showing {sortedCourses.length} course{sortedCourses.length !== 1 ? 's' : ''}
                    {searchQuery && ` for "${searchQuery}"`}
                    {selectedCategory && selectedCategory !== 'all' && 
                      ` in ${categories.find(c => c.id === selectedCategory)?.name}`
                    }
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedCourses.map((course) => (
                    <Card key={course.id} className="overflow-hidden bg-card-gradient hover:shadow-feature-glow transition-all duration-300">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {course.thumbnail_url ? (
                          <img 
                            src={course.thumbnail_url} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <BookOpen className="h-12 w-12 text-primary" />
                          </div>
                        )}
                        <Badge className={`absolute top-3 left-3 ${getLevelColor(course.level)}`}>
                          {course.level}
                        </Badge>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          {course.category && (
                            <Badge variant="secondary" className="text-xs">
                              {course.category.name}
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                        
                        {course.profile && (
                          <p className="text-sm text-muted-foreground mb-3">
                            by {course.profile.full_name}
                          </p>
                        )}
                        
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {course.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{Math.floor(course.total_duration / 60)}h</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{course.total_enrollments}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              <span>{course.lesson_count} lessons</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button className="w-full" asChild>
                          <Link to={`/course/${course.slug || course.id}`}>
                            Enroll 
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search criteria or browse all categories.
                </p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setSearchParams({});
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AllCourses;