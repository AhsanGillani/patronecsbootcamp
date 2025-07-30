import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react";
import logo from "@/assets/patronecs-logo.png";

export const Header = () => {
  const navItems = [
    { name: "Home", href: "#" },
    { name: "About", href: "#about" },
    { name: "All Courses", href: "#courses" },
    { name: "FAQs", href: "#faq" },
    { name: "Blog", href: "#blog" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src={logo} alt="Patronecs" className="h-8" />
          </div>

          {/* Search Bar - Udemy Style */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for anything..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-full bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors duration-200 text-sm font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            <span className="hidden lg:block text-sm text-muted-foreground">Teach on Patronecs</span>
            <Button variant="ghost" className="hidden md:flex text-sm">
              Log in
            </Button>
            <Button variant="hero" className="text-sm">
              Sign up
            </Button>
            
            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};