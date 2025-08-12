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
      { name: "Digital Marketing", href: "/courses?category=digital marketing"},
      { name: "Web Development", href: "/courses?category=web development" },
      { name: "Freelancing", href: "/courses?category=freelancing" },
      { name: "Graphic Design", href: "/courses?category=graphic design" }
    ],
    "Support": [
      { name: "Help Center", href: "/faq" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Cookie Policy", href: "/cookies" }
    ]
  };

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: "https://www.facebook.com/patronecs", name: "Facebook" },
    { icon: <Instagram className="h-5 w-5" />, href: "https://www.instagram.com/patronecs/", name: "Instagram" },
    { icon: <Linkedin className="h-5 w-5" />, href: "https://www.linkedin.com/company/patronecs/", name: "LinkedIn" }
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
                </div>
                <div>
                 <a href="/" className="footer-brand _1 w-inline-block">
                    <img
                      src="https://cdn.prod.website-files.com/63eb79f4ab031d09e95a842f/6630f0f8c4d054dad1f951d9_Logo%20(7).svg"
                      loading="lazy"
                      alt="Company Logo"
                      className="w-28 h-auto image-8 juio"
                    />
                  </a>
                </div>
              </Link>
              
              

                <div className="flex items-center justify-start flex-wrap gap-x-6 gap-y-4 text-sm text-gray-700 mb-10">

                  {/* Email */}
                  <a 
                    href="mailto:info@patronecs.pk"
                    className="flex items-center gap-3 group hover:text-primary transition-colors"
                  >
                    <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <span>info@patronecs.com</span>
                  </a>

                  {/* Divider */}
                  <div className="h-5 w-px bg-border hidden sm:block" />

                  {/* Phone */}
                  <a 
                    href="tel:+923348124091"
                    className="flex items-center gap-3 group hover:text-primary transition-colors"
                  >
                    <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <span>+92 334 8124091</span>
                  </a>

                  {/* Divider */}
                  <div className="h-5 w-px bg-border hidden sm:block" />

                  {/* Location */}
                  <div className="flex items-center gap-3 group hover:text-primary transition-colors">
                    <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <span>Patronecs Office, Doburji Mallian,
Pasrur Bypass, Sialkot, Punjab 51350</span>
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
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 p-8 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/20">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="text-muted-foreground mb-6">
              Get the latest course updates, coding tips, and career advice delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border border-input bg-background"
              />
              <Button variant="default" className="px-6">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              No spam, unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 bg-gradient-to-r from-background to-secondary/20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
                <p>© 2025 Patronecs. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
    </footer>
  );
};