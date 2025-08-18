import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import logo from "@/assets/patronecs-logo.png";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Send, Heart, Shield, Award, Users, Sparkles } from "lucide-react";
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
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="relative">
        {/* CTA Section */}
        <div className="py-20 bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-blue-600/20 border-b border-slate-700/50">
          <div className="container mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-full text-blue-200 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Start Your Journey
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Ready to Transform Your Career?
              </span>
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join 34,650+ successful learners and start your journey to professional excellence today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" asChild>
                <Link to="/courses">
                  Start Learning Free
                  <Award className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center space-x-3 mb-6 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                </div>
                <div className="relative z-10">
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
              
              <p className="text-slate-300 mb-6 leading-relaxed">
                Empowering learners worldwide with cutting-edge technology education. 
                Join our community and unlock your potential with expert-led courses.
              </p>

              <div className="flex items-center justify-start flex-wrap gap-x-6 gap-y-4 text-sm text-slate-300 mb-8">
                {/* Email */}
                <a 
                  href="mailto:info@patronecs.pk"
                  className="flex items-center gap-3 group hover:text-blue-400 transition-colors"
                >
                  <div className="p-2 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                    <Mail className="h-4 w-4 text-blue-400" />
                  </div>
                  <span>info@patronecs.com</span>
                </a>

                {/* Phone */}
                <a 
                  href="tel:+923001234567"
                  className="flex items-center gap-3 group hover:text-blue-400 transition-colors"
                >
                  <div className="p-2 rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                    <Phone className="h-4 w-4 text-green-400" />
                  </div>
                  <span>+92 300 123 4567</span>
                </a>

                {/* Location */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-500/20">
                    <MapPin className="h-4 w-4 text-purple-400" />
                  </div>
                  <span>Lahore, Pakistan</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div className="text-slate-400 group-hover:text-white transition-colors">
                      {social.icon}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-white mb-6">{category}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-slate-300 hover:text-blue-400 transition-colors duration-300 text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-slate-700/50">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
              <p className="text-slate-300 mb-6">
                Get the latest course updates, industry insights, and exclusive offers delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Send className="h-4 w-4 mr-2" />
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700/50">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Shield className="h-4 w-4" />
                <span>Secure & Trusted Platform</span>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <span>© 2024 Patronecs. All rights reserved.</span>
                <div className="flex items-center gap-2">
                  <span>Made with</span>
                  <Heart className="h-4 w-4 text-red-400" />
                  <span>in Pakistan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};