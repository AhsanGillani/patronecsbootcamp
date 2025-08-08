import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, User, Eye, Filter } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useBlogs } from "@/hooks/useBlogs";
import { useCategories } from "@/hooks/useCategories";

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  const { categories } = useCategories();
  const { blogs, loading } = useBlogs({
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getExcerpt = (content: string, length: number = 150) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > length ? plainText.substring(0, length) + '...' : plainText;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Header Section */}
        <section className="py-12 bg-hero-gradient">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Our <span className="text-primary">Blog</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Insights, tutorials, and stories from our community of learners and educators
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
                      placeholder="Search articles..."
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit" className="px-8">
                    Search
                  </Button>
                </form>
                
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
              </div>
            </div>
          </div>
        </section>

        {/* Blog Grid */}
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
            ) : blogs.length > 0 ? (
              <>
                <div className="text-center mb-8">
                  <p className="text-muted-foreground">
                    Showing {blogs.length} article{blogs.length !== 1 ? 's' : ''}
                    {searchQuery && ` for "${searchQuery}"`}
                    {selectedCategory && selectedCategory !== 'all' && 
                      ` in ${categories.find(c => c.id === selectedCategory)?.name}`
                    }
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {blogs.map((blog) => (
                    <Card key={blog.id} className="overflow-hidden bg-card-gradient hover:shadow-feature-glow transition-all duration-300">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {blog.featured_image_url ? (
                          <img 
                            src={blog.featured_image_url} 
                            alt={blog.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <div className="text-primary text-4xl font-bold">
                              {blog.title.charAt(0)}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          {blog.category && (
                            <Badge variant="secondary" className="text-xs">
                              {blog.category.name}
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-3 line-clamp-2 hover:text-primary transition-colors">
                          <Link to={`/blog/${blog.slug || blog.id}`}>
                            {blog.title}
                          </Link>
                        </h3>
                        
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {blog.excerpt || getExcerpt(blog.content)}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                          <div className="flex items-center gap-4">
                            {blog.profile && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{blog.profile.full_name}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(blog.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{blog.views}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link to={`/blog/${blog.slug || blog.id}`}>
                            Read More
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">No articles found</h3>
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

export default Blog;