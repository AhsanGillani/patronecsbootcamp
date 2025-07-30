import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/patronecs-logo.png";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  const footerLinks = {
    "Quick Links": [
      { name: "About Us", href: "#about" },
      { name: "All Courses", href: "#courses" },
      { name: "FAQs", href: "#faq" },
      { name: "Contact", href: "#contact" }
    ],
    "Courses": [
      { name: "Digital Marketing", href: "#" },
      { name: "Web Development", href: "#" },
      { name: "Freelancing", href: "#" },
      { name: "Graphic Design", href: "#" }
    ],
    "Support": [
      { name: "Help Center", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "Cookie Policy", href: "#" }
    ]
  };

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: "#", name: "Facebook" },
    { icon: <Twitter className="h-5 w-5" />, href: "#", name: "Twitter" },
    { icon: <Instagram className="h-5 w-5" />, href: "#", name: "Instagram" },
    { icon: <Linkedin className="h-5 w-5" />, href: "#", name: "LinkedIn" }
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <img src={logo} alt="Patronecs" className="h-8" />
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Empowering Pakistan's youth with free, high-quality online education and certifications to build successful careers.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@learneasy.pk</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span>+92 300 1234567</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Lahore, Pakistan</span>
              </div>
            </div>

            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary hover:text-primary-foreground"
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
              <h3 className="font-semibold text-lg mb-6 text-foreground">{title}</h3>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-foreground">Stay Updated</h3>
            <p className="text-muted-foreground mb-4">
              Subscribe to get the latest course updates and learning tips.
            </p>
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-background border-border"
              />
              <Button className="w-full" variant="hero">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2024 LearnEasy.pk. All rights reserved.
            </p>
            <p className="text-muted-foreground text-sm">
              Made with ❤️ for Pakistan's future leaders
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};