import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, User, LogOut, Settings, GraduationCap, Bell, BookOpen, Award } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSearch } from "@/hooks/useSearch";
import logo from "@/assets/patronecs-logo.png";
import { NotificationBell } from "./ui/NotificationBell";

export const Header = () => {
  const { user, profile, signOut } = useAuth();
  const { searchQuery, setSearchQuery, handleSearch } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "All Courses", href: "/courses" },
    { name: "FAQs", href: "/faq" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      
      // Force a small delay to ensure state is updated
      setTimeout(() => {
        navigate("/");
      }, 100);
      
    } catch (error) {
      console.error('Error in handleSignOut:', error);
    }
  };

  const getDashboardLink = () => {
    if (!profile) return "/";
    switch (profile.role) {
      case "admin": return "/admin";
      case "instructor": return "/instructor";
      case "student": return "/student";
      default: return "/";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
            </div>
            <div className="relative z-10">
              <img
                src="https://cdn.prod.website-files.com/63eb79f4ab031d09e95a842f/6630f0f8c4d054dad1f951d9_Logo%20(7).svg"
                loading="lazy"
                alt="Company Logo"
                className="w-28 h-auto image-8 juio"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative text-sm font-medium transition-all duration-300 py-2 px-1 group ${
                    isActive 
                      ? "text-blue-600" 
                      : "text-slate-700 hover:text-blue-600"
                  }`}
                >
                  {item.name}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-300 ${
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}></span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Button variant="ghost" size="sm" className="hidden md:flex text-slate-700 hover:text-blue-600 hover:bg-blue-50" asChild>
                  <Link to="/auth?mode=login">Sign In</Link>
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                  <Link to="/auth?mode=register">Get Started</Link>
                </Button>
              </>
            ) : (
              <>
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="hidden md:block">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors"
                    />
                  </div>
                </form>

                {/* Notifications */}
                <NotificationBell />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-slate-100">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                          {profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl" align="end">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900">{profile?.full_name || "User"}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardLink()} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg mx-2 my-1">
                        <GraduationCap className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg mx-2 my-1">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg mx-2 my-1">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    
                    <div className="border-t border-slate-100 mt-2 pt-2">
                      <DropdownMenuItem 
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg mx-2 my-1 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-white border-l border-slate-200">
              <div className="py-6">
                <div className="mb-6">
                  <Link to="/" className="flex items-center space-x-3">
                    <img
                      src="https://cdn.prod.website-files.com/63eb79f4ab031d09e95a842f/6630f0f8c4d054dad1f951d9_Logo%20(7).svg"
                      alt="Logo"
                      className="w-24 h-auto"
                    />
                  </Link>
                </div>
                
                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive 
                            ? "bg-blue-50 text-blue-600" 
                            : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
                
                {!user ? (
                  <div className="mt-6 space-y-3">
                    <Button variant="ghost" className="w-full justify-start text-slate-700 hover:text-blue-600 hover:bg-blue-50" asChild>
                      <Link to="/auth?mode=login">Sign In</Link>
                    </Button>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white" asChild>
                      <Link to="/auth?mode=register">Get Started</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    <div className="px-4 py-3 border-t border-slate-100">
                      <p className="text-sm font-medium text-slate-900">{profile?.full_name || "User"}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <Button variant="ghost" className="w-full justify-start text-slate-700 hover:text-blue-600 hover:bg-blue-50" asChild>
                      <Link to={getDashboardLink()}>Dashboard</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};