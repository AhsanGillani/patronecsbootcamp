import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import logo from "@/assets/patronecs-logo.png";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Send, Heart, Shield, Award, Users } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  const footerLinks = {
    "Quick Links": [
      { name: "About Us", href: "/about" },
      { name: "All Courses", href: "/courses" },
      { name: "Blog", href: "/blog" },
      { name: "FAQs", href: "/faq" },
      { name: "Contact", href: "/contact" }
    ],
    "Courses": [
      { name: "Digital Marketing", href: "/courses?search=digital marketing" },
      { name: "Web Development", href: "/courses?search=web development" },
      { name: "Freelancing", href: "/courses?search=freelancing" },
      { name: "Graphic Design", href: "/courses?search=graphic design" }
    ],
    "Support": [
      { name: "Help Center", href: "/faq" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Cookie Policy", href: "/cookies" }
    ]
  };

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: "#", name: "Facebook" },
    { icon: <Twitter className="h-5 w-5" />, href: "#", name: "Twitter" },
    { icon: <Instagram className="h-5 w-5" />, href: "#", name: "Instagram" },
    { icon: <Linkedin className="h-5 w-5" />, href: "#", name: "LinkedIn" }
  ];

  return (
    <footer className="relative bg-gradient-to-br from-background via-secondary/10 to-accent/5 border-t border-border/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative">
        {/* CTA Section */}
        <div className="py-16 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Ready to Transform Your Career?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join 34,650+ successful learners and start your journey to professional excellence today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="hero" className="group px-8 py-6 text-lg hover-scale shadow-xl" asChild>
                <Link to="/courses">
                  Start Learning Free
                  <Award className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="group px-8 py-6 text-lg border-2" asChild>
                <Link to="/auth?mode=register">
                  Create Account
                  <Users className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center space-x-3 mb-6 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <img src={logo} alt="Patronecs" className="relative h-12 w-auto group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Patronecs
                  </h3>
                  <p className="text-sm text-muted-foreground">Learn. Grow. Succeed.</p>
                </div>
              </Link>
              
              <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
                Empowering Pakistan's youth with <span className="text-primary font-semibold">free, world-class education</span> and 
                <span className="text-accent font-semibold"> official certifications</span> to build successful, future-ready careers.
              </p>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <Card className="p-4 bg-gradient-to-br from-card to-card/80 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-500/10">
                      <Shield className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">100% Free</p>
                      <p className="text-xs text-muted-foreground">Always & Forever</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-card to-card/80 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Certified</p>
                      <p className="text-xs text-muted-foreground">Official Certificates</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 text-sm group hover:text-primary transition-colors cursor-pointer">
                  <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <span>info@patronecs.pk</span>
                </div>
                <div className="flex items-center gap-4 text-sm group hover:text-primary transition-colors cursor-pointer">
                  <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <span>+92 300 1234567</span>
                </div>
                <div className="flex items-center gap-4 text-sm group hover:text-primary transition-colors cursor-pointer">
                  <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <span>Lahore, Punjab, Pakistan</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 hover:from-primary hover:to-accent hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    asChild
                  >
                    <a href={social.href} aria-label={social.name}>
                      {social.icon}
                    </a>
                  </Button>
                ))}
              </div>
            </div>

            {/* Links Sections */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="font-bold text-xl mb-6 text-foreground relative">
                  {title}
                  <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-accent"></div>
                </h3>
                <ul className="space-y-4">
                  {links.map((link, index) => (
                    <li key={index}>
                      <Link
                        to={link.href}
                        className="text-muted-foreground hover:text-primary transition-all duration-200 block py-1 group text-sm"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">
                          {link.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Newsletter */}
            <div>
              <h3 className="font-bold text-xl mb-6 text-foreground relative">
                Stay Updated
                <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-accent"></div>
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Get the latest course updates, coding tips, and career advice delivered to your inbox.
              </p>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 bg-background/80 border-border/50 focus:border-primary"
                  />
                  <Button variant="default" className="px-6">
                    Subscribe
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  No spam, unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 bg-gradient-to-r from-background to-secondary/20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
                <p>© 2024 Patronecs. All rights reserved.</p>
                <div className="flex items-center gap-4">
                  <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
                  <span>•</span>
                  <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                  <span>•</span>
                  <Link to="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                <span>for Pakistan's future leaders</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};