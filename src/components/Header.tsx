import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, User, LogOut, Settings, GraduationCap, Bell, BookOpen, Award } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSearch } from "@/hooks/useSearch";
import logo from "@/assets/patronecs-logo.png";

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
    await signOut();
    navigate("/");
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
    <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
              <img src={logo} alt="Patronecs" className="relative h-10 w-auto group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Patronecs
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">Learn. Grow. Succeed.</p>
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
                      ? "text-primary" 
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {item.name}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 ${
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}></span>
                </Link>
              );
            })}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, skills, topics..."
                className="w-full pl-12 pr-4 py-3 border border-border/50 rounded-full bg-background/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 placeholder:text-muted-foreground/70"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs text-muted-foreground bg-muted rounded border">
                  ⌘K
                </kbd>
              </div>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {!user ? (
              <>
                <Link 
                  to="/instructor" 
                  className="hidden lg:flex items-center text-sm text-muted-foreground hover:text-primary transition-colors duration-200 group"
                >
                  <GraduationCap className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                  Teach on Patronecs
                </Link>
                <Button variant="ghost" size="sm" className="hidden md:flex" asChild>
                  <Link to="/auth">Log in</Link>
                </Button>
                <Button variant="hero" size="sm" className="shadow-lg hover:shadow-xl transition-shadow" asChild>
                  <Link to="/auth?mode=register">Sign up</Link>
                </Button>
              </>
            ) : (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative group">
                  <Bell className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse"></span>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full group">
                      <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-300">
                        <AvatarImage src="" alt={profile?.full_name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                          {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                    <div className="flex items-center space-x-3 p-2 mb-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={profile?.full_name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                          {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardLink()} className="flex items-center cursor-pointer">
                        <User className="mr-3 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/student/courses" className="flex items-center cursor-pointer">
                        <BookOpen className="mr-3 h-4 w-4" />
                        <span>My Learning</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/student/certificates" className="flex items-center cursor-pointer">
                        <Award className="mr-3 h-4 w-4" />
                        <span>Certificates</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`${getDashboardLink()}/profile`} className="flex items-center cursor-pointer">
                        <Settings className="mr-3 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <div className="border-t my-2"></div>
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 cursor-pointer">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center space-x-3 mb-8">
                    <img src={logo} alt="Patronecs" className="h-8" />
                    <h2 className="text-xl font-bold text-primary">Patronecs</h2>
                  </div>
                  
                  {/* Mobile Search */}
                  <div className="mb-6">
                    <form onSubmit={handleSearchSubmit} className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search courses..."
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </form>
                  </div>

                  <nav className="flex-1">
                    <div className="space-y-2">
                      {navItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="block px-4 py-3 text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors font-medium"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                    
                    {!user && (
                      <div className="mt-8 space-y-3">
                        <Button variant="outline" className="w-full" asChild>
                          <Link to="/auth">Log in</Link>
                        </Button>
                        <Button variant="hero" className="w-full" asChild>
                          <Link to="/auth?mode=register">Sign up</Link>
                        </Button>
                      </div>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};