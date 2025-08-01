import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Shield, Award, Users, Heart } from "lucide-react";
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
    <footer className="bg-background border-t border-border">
      {/* Top CTA */}
      <section className="bg-gradient-to-r from-primary/5 to-accent/5 py-14 text-center">
        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Ready to Transform Your Career?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Join 34,650+ learners and kickstart your professional journey.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/courses">Start Learning Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/auth?mode=register">Create Account</Link>
          </Button>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16 grid md:grid-cols-4 gap-10">
        {/* Column 1: About & Contact */}
        <div className="space-y-6 md:col-span-1">
          <Link to="/" className="inline-block text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Patronecs
          </Link>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Empowering Pakistan's youth with <span className="text-primary font-medium">free education</span> & <span className="text-accent font-medium">certifications</span>.
          </p>

          {/* Trust Icons */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-background border border-border/50">
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
            <Card className="p-4 bg-background border border-border/50">
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
          <div className="space-y-4 pt-4 text-sm text-gray-700">
            <a href="mailto:info@patronecs.pk" className="flex items-center gap-3 hover:text-primary">
              <Mail className="h-5 w-5 text-primary" />
              info@patronecs.pk
            </a>
            <a href="tel:+923001234567" className="flex items-center gap-3 hover:text-primary">
              <Phone className="h-5 w-5 text-primary" />
              +92 300 1234567
            </a>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              Lahore, Pakistan
            </div>
          </div>
        </div>

        {/* Columns 2-4: Links */}
        {Object.entries(footerLinks).map(([title, links], idx) => (
          <div key={idx}>
            <h4 className="font-semibold text-lg mb-4 text-foreground">{title}</h4>
            <ul className="space-y-3">
              {links.map((link, i) => (
                <li key={i}>
                  <Link to={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Newsletter */}
      <section className="bg-muted px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
          <p className="text-muted-foreground mb-6">
            Get free learning updates, coding tips, and career guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 rounded-md border border-border bg-background flex-1"
            />
            <Button>Subscribe</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* Bottom Bar */}
      <section className="border-t border-border py-6 text-sm text-muted-foreground">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <span>© 2024 Patronecs</span>
            <Link to="/terms" className="hover:text-primary">Terms</Link>
            <Link to="/privacy" className="hover:text-primary">Privacy</Link>
            <Link to="/cookies" className="hover:text-primary">Cookies</Link>
          </div>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 animate-pulse" />
            <span>for Pakistan's youth</span>
          </div>
        </div>
      </section>

      {/* Social Icons */}
      <div className="py-6 text-center">
        <div className="flex justify-center gap-4">
          {socialLinks.map((social, i) => (
            <a
              key={i}
              href={social.href}
              aria-label={social.name}
              className="p-3 rounded-full bg-primary/10 hover:bg-primary hover:text-white transition-colors"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};
