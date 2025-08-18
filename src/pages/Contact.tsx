import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Clock, Send, Sparkles, MessageSquare, Users, Globe } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      // Reset form
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Us",
      details: "info@patronecs.com",
      description: "Send us an email anytime",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Call Us",
      details: "+92 300 123 4567",
      description: "Mon-Fri from 9am to 6pm",
      color: "from-emerald-500 to-teal-500",
      bgColor: "from-emerald-50 to-teal-50"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Visit Us",
      details: "Lahore, Pakistan",
      description: "Drop by our office",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50"
    }
  ];

  const faqs = [
    {
      question: "How can I get help with a course?",
      answer: "You can reach out to our support team through email, live chat, or by submitting a ticket through your dashboard."
    },
    {
      question: "Are the courses really free?",
      answer: "Yes! All our courses are completely free with no hidden costs or subscriptions required."
    },
    {
      question: "Can I get a certificate?",
      answer: "Absolutely! You'll receive a certificate upon completing any course on our platform."
    },
    {
      question: "How do I report a technical issue?",
      answer: "Please use the contact form above or email us directly at support@patronecs.com with details about the issue."
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
              Get In Touch
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              Let's Start a
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Conversation
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Have questions about our courses? Need technical support? Want to collaborate?
              We'd love to hear from you. Reach out and let's make learning better together.
            </p>
          </div>

          {/* Contact Info Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <Card
                key={index}
                className="group relative p-6 bg-white border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-xl hover:shadow-slate-500/10 hover:-translate-y-2 rounded-2xl overflow-hidden animate-fade-in"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${info.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className={`w-12 h-12 bg-gradient-to-br ${info.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
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
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Contact Form */}
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-full text-emerald-700 text-sm font-medium mb-4">
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                  Get in Touch
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Fill out the form below and we'll get back to you within 24 hours.
                  We're here to help with any questions or concerns you might have.
                </p>
              </div>

              <Card className="p-8 bg-white border border-slate-200 rounded-2xl shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-slate-700">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        autoComplete="name"
                        className="bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-slate-700">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        autoComplete="email"
                        className="bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-slate-700">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="What's this about?"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-slate-700">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending Message...
                      </div>
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Additional Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Why Choose Patronecs?</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-slate-700">34K+ active learners worldwide</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                      <Globe className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-slate-700">Courses in 50+ countries</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-slate-700">24/7 support available</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Office Hours</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-900">Monday - Friday</p>
                      <p className="text-slate-600">9:00 AM - 6:00 PM (PKT)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-900">Saturday</p>
                      <p className="text-slate-600">10:00 AM - 4:00 PM (PKT)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-900">Sunday</p>
                      <p className="text-slate-600">Closed</p>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-2xl">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Need Immediate Help?</h4>
                  <p className="text-slate-600 mb-4 text-sm">
                    Check out our comprehensive FAQ section for quick answers to common questions.
                  </p>
                  <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
                    View FAQs
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Frequently Asked
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Find quick answers to the most common questions about our platform and services.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="group relative p-6 bg-white border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-xl hover:shadow-slate-500/10 hover:-translate-y-2 rounded-2xl overflow-hidden animate-fade-in"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">{faq.question}</h3>
                  <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
};

export default Contact;