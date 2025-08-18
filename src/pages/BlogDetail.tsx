import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, User, Eye, ArrowLeft, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Blog } from "@/hooks/useBlogs";

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      
      try {
        setLoading(true);

        const baseSelect = `
            *,
            category:categories!blogs_category_id_fkey(name),
            profile:profiles!blogs_author_id_fkey(full_name)
          `;

        let fetched: any = null;

        // Try by slug first, then fallback to ID
        const { data: bySlug, error: slugErr } = await supabase
          .from('blogs')
          .select(baseSelect)
          .eq('slug', id)
          .eq('status', 'approved')
          .eq('is_published', true)
          .maybeSingle();

        if (bySlug) {
          fetched = bySlug;
        } else {
          const { data: byId, error: idErr } = await supabase
            .from('blogs')
            .select(baseSelect)
            .eq('id', id)
            .eq('status', 'approved')
            .eq('is_published', true)
            .maybeSingle();

          if (idErr && (idErr as any).code !== 'PGRST116') {
            throw idErr;
          }
          fetched = byId;
        }

        if (!fetched) {
          throw new Error('Blog not found');
        }

        setBlog(fetched as any);

        // Increment view count using the found blog id
        await supabase
          .from('blogs')
          .update({ views: ((fetched as any).views || 0) + 1 })
          .eq('id', (fetched as any).id);

      } catch (error) {
        console.error('Error fetching blog:', error);
        toast({
          title: "Error",
          description: "Failed to load blog post",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt || "Check out this article on Patronecs",
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Blog URL has been copied to your clipboard",
        });
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Blog URL has been copied to your clipboard",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16">
            <Skeleton className="h-8 w-32 mb-8" />
            <div className="max-w-4xl mx-auto">
              <Skeleton className="h-64 w-full mb-6" />
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-6" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-6 py-16 text-center">
            <h1 className="text-3xl font-bold mb-4 text-slate-900">Blog post not found</h1>
            <p className="text-slate-600 mb-8">The article you're looking for doesn't exist or has been removed.</p>
            <Link 
              to="/blog"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-600 mb-8">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">{blog.title}</span>
          </nav>

          <div className="max-w-4xl mx-auto">
            {/* Article Header */}
            <article>
              <header className="mb-8">
                {blog.category && (
                  <Badge variant="secondary" className="mb-6 bg-slate-100 text-slate-700 border-slate-200">
                    {blog.category.name}
                  </Badge>
                )}
                
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-8 leading-tight text-slate-900">
                  {blog.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 mb-8">
                  {blog.profile && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>by {blog.profile.full_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(blog.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{blog.views} views</span>
                  </div>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                </div>
              </header>

              {/* Featured Image */}
              {blog.featured_image_url && (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-8">
                  <img 
                    src={blog.featured_image_url} 
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Article Content */}
              <Card className="p-8 bg-white border border-slate-200 rounded-2xl shadow-lg">
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </Card>
            </article>

            {/* Article Footer */}
            <footer className="mt-12 pt-8 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-600">
                    Published on {formatDate(blog.created_at)}
                    {blog.updated_at !== blog.created_at && (
                      <span> • Updated on {formatDate(blog.updated_at)}</span>
                    )}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share this article</span>
                  </button>
                </div>
              </div>
            </footer>

            {/* Navigation */}
            <div className="mt-12">
              <Link 
                to="/blog"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to all articles
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetail;