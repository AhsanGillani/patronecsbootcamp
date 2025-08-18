import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Search, Sparkles, HelpCircle, BookOpen, Users, Award, Clock, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      title: "Getting Started",
      icon: <BookOpen className="h-5 w-5" />,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50"
    },
    {
      title: "Account & Profile",
      icon: <Users className="h-5 w-5" />,
      color: "from-emerald-500 to-teal-500",
      bgColor: "from-emerald-50 to-teal-50"
    },
    {
      title: "Courses & Learning",
      icon: <Award className="h-5 w-5" />,
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50"
    },
    {
      title: "Technical Support",
      icon: <HelpCircle className="h-5 w-5" />,
      color: "from-amber-500 to-orange-500",
      bgColor: "from-amber-50 to-orange-50"
    }
  ];

  const faqs = [
    // Getting Started
    {
      category: "Getting Started",
      question: "How do I create an account?",
      answer: "Creating an account is simple! Click the 'Get Started' button in the top right corner, fill in your details, and verify your email. You'll be ready to start learning in minutes.",
      tags: ["account", "signup", "registration"]
    },
    {
      category: "Getting Started",
      question: "Are the courses really free?",
      answer: "Yes, absolutely! All our courses are completely free with no hidden costs, subscriptions, or premium tiers. We believe education should be accessible to everyone.",
      tags: ["pricing", "free", "cost"]
    },
    {
      category: "Getting Started",
      question: "What courses are available?",
      answer: "We offer 500+ courses across various categories including Web Development, Mobile Apps, UI/UX Design, Digital Marketing, Business, and many more. New courses are added weekly.",
      tags: ["courses", "categories", "topics"]
    },
    
    // Account & Profile
    {
      category: "Account & Profile",
      question: "How do I update my profile information?",
      answer: "Go to your dashboard and click on 'Profile' in the sidebar. You can update your name, profile picture, bio, and other personal information. Changes are saved automatically.",
      tags: ["profile", "settings", "personal-info"]
    },
    {
      category: "Account & Profile",
      question: "Can I change my email address?",
      answer: "Yes, you can change your email address from your profile settings. You'll need to verify the new email address before the change takes effect.",
      tags: ["email", "verification", "account"]
    },
    {
      category: "Account & Profile",
      question: "How do I reset my password?",
      answer: "Click 'Forgot Password' on the login page, enter your email address, and follow the instructions sent to your email to create a new password.",
      tags: ["password", "reset", "security"]
    },
    
    // Courses & Learning
    {
      category: "Courses & Learning",
          question: "How do I enroll in a course?",
      answer: "Browse our course catalog, find a course you're interested in, and click 'Start Learning Free'. You'll be automatically enrolled and can start learning immediately.",
      tags: ["enrollment", "courses", "learning"]
    },
    {
      category: "Courses & Learning",
      question: "Do I get a certificate after completing a course?",
      answer: "Yes! You'll receive a certificate of completion for every course you finish. Certificates are downloadable and can be shared on LinkedIn or added to your resume.",
      tags: ["certificate", "completion", "achievement"]
    },
    {
      category: "Courses & Learning",
      question: "Can I access courses offline?",
      answer: "Currently, courses are available online only. However, you can download course materials and watch videos when you have internet access, then review the materials offline.",
      tags: ["offline", "download", "access"]
    },
    {
      category: "Courses & Learning",
      question: "How long do I have access to courses?",
      answer: "You have lifetime access to all courses you enroll in. You can revisit the content anytime, even after completion, to refresh your knowledge.",
      tags: ["access", "lifetime", "duration"]
    },
    
    // Technical Support
    {
      category: "Technical Support",
      question: "What if I experience technical issues?",
      answer: "If you encounter any technical problems, please contact our support team through the contact form, email us at support@patronecs.com, or call us during business hours.",
      tags: ["support", "technical", "help"]
    },
    {
      category: "Technical Support",
      question: "What browsers are supported?",
      answer: "Our platform works best with modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version for the best experience.",
      tags: ["browser", "compatibility", "technical"]
    },
    {
      category: "Technical Support",
      question: "Can I use the platform on mobile devices?",
      answer: "Absolutely! Our platform is fully responsive and works great on smartphones and tablets. You can learn on the go from any device with internet access.",
      tags: ["mobile", "responsive", "devices"]
    },
    {
      category: "Technical Support",
      question: "How do I report a bug or issue?",
      answer: "Please report any bugs or issues through our contact form, including details about what happened, your device/browser, and steps to reproduce the problem.",
      tags: ["bug", "report", "issue"]
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const contactInfo = [
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Email Support",
      details: "support@patronecs.com",
      description: "Get help via email",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: "Phone Support",
      details: "+92 300 123 4567",
      description: "Call us during business hours",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Response Time",
      details: "Within 24 hours",
      description: "We'll get back to you quickly",
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50 rounded-full text-blue-700 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Help Center
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              Frequently Asked
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Questions
              </span>
              </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Find quick answers to common questions about our platform, courses, and services. 
              Can't find what you're looking for? Contact our support team.
              </p>
          </div>
              
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-16">
                <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                    type="text"
                placeholder="Search for answers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-lg"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {faqCategories.map((category, index) => (
              <div
                key={index}
                className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${category.bgColor} border border-slate-200 rounded-full text-slate-700 text-sm font-medium`}
              >
                <div className={`text-${category.color.split('-')[1]}-600`}>
                  {category.icon}
                </div>
                {category.title}
              </div>
            ))}
          </div>
          </div>
        </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
            {filteredFaqs.length > 0 ? (
              <div className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <Card
                    key={index}
                    className="group relative border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-lg rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(index)}
                      className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">{faq.question}</h3>
                          <div className="flex flex-wrap gap-2">
                            {faq.tags.map((tag, tagIndex) => (
                              <Badge
                                key={tagIndex}
                                variant="secondary"
                                className="text-xs bg-slate-100 text-slate-600 border-0"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${
                            expandedItems.includes(index) ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>
                    
                    {expandedItems.includes(index) && (
                      <div className="px-6 pb-6 border-t border-slate-100">
                        <p className="text-slate-600 leading-relaxed mt-4">{faq.answer}</p>
                      </div>
                    )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                <HelpCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No results found</h3>
                <p className="text-slate-600 mb-6">
                  Try adjusting your search terms or browse our categories above.
                </p>
                <Button
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Clear Search
                </Button>
                </div>
              )}
            </div>
          </div>
        </section>

      {/* Contact Support Section */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Still Need
              <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Help?
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our support team is here to help you with any questions or issues you might have.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <Card
                key={index}
                className="group relative p-6 bg-white border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-xl hover:shadow-slate-500/10 text-center hover:-translate-y-2 rounded-2xl overflow-hidden animate-fade-in"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${info.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className="mb-4 flex justify-center">
                    <div className={`w-12 h-12 bg-gradient-to-br ${info.color} bg-opacity-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <div className={`text-${info.color.split('-')[1]}-600`}>
                        {info.icon}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{info.title}</h3>
                  <p className="text-slate-600 font-medium mb-1">{info.details}</p>
                  <p className="text-slate-500 text-sm">{info.description}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" asChild>
              <Link to="/contact">
                  Contact Support
              </Link>
            </Button>
          </div>
              </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-full text-blue-200 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Ready to Learn?
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Start Your Learning
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Journey Today
              </span>
            </h2>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Join thousands of learners who are already transforming their careers with our platform.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" asChild>
              <Link to="/courses">
                Explore Courses
              </Link>
            </Button>
            </div>
          </div>
        </section>

      <Footer />
    </div>
  );
};

export default FAQ;