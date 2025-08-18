import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              {/* 404 Icon */}
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 rounded-full mb-8">
                <AlertTriangle className="h-16 w-16 text-red-600" />
              </div>
              
              {/* Main Heading */}
              <h1 className="text-8xl lg:text-9xl font-bold text-slate-900 mb-6">
                404
              </h1>
              
              {/* Subtitle */}
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                Page Not Found
              </h2>
              
              {/* Description */}
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
              </p>
              
              {/* Error Details */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-xl shadow-red-500/10 mb-8">
                <p className="text-sm text-slate-500 mb-2">Attempted to access:</p>
                <code className="text-slate-700 bg-slate-100 px-3 py-1 rounded-lg font-mono text-sm break-all">
                  {location.pathname}
                </code>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  asChild
                >
                  <Link to="/">
                    <Home className="h-5 w-5 mr-2" />
                    Return Home
                  </Link>
                </Button>
                
                <Button 
                  variant="outline"
                  className="px-8 py-3 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
                  asChild
                >
                  <Link to="/courses">
                    <Search className="h-5 w-5 mr-2" />
                    Browse Courses
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Help Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-semibold text-slate-900 mb-8">
                Need Help Finding Something?
              </h3>
              
              <div className="grid md:grid-cols-3 gap-8">
                {/* Courses */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Explore Courses</h4>
                  <p className="text-slate-600 mb-4">
                    Discover our collection of free, high-quality courses
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/courses">Browse Courses</Link>
                  </Button>
                </div>

                {/* Blog */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-300">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Search className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Read Articles</h4>
                  <p className="text-slate-600 mb-4">
                    Check out our latest blog posts and tutorials
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/blog">View Blog</Link>
                  </Button>
                </div>

                {/* Contact */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-300">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Search className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Get Support</h4>
                  <p className="text-slate-600 mb-4">
                    Can't find what you're looking for? Contact us
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
      </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
