import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, Award, Globe, Target, Heart, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const About = () => {
  const stats = [
    { icon: <GraduationCap className="h-6 w-6" />, value: "500+", label: "Expert Courses", color: "from-blue-500 to-cyan-500" },
    { icon: <Users className="h-6 w-6" />, value: "34K+", label: "Active Learners", color: "from-emerald-500 to-teal-500" },
    { icon: <Award className="h-6 w-6" />, value: "100%", label: "Free Access", color: "from-purple-500 to-pink-500" },
    { icon: <Globe className="h-6 w-6" />, value: "50+", label: "Countries", color: "from-amber-500 to-orange-500" }
  ];

  const values = [
    {
      icon: <Target className="h-8 w-8" />,
      title: "Excellence",
      description: "We strive for the highest quality in everything we do, from course content to user experience.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Passion",
      description: "Our love for education drives us to create meaningful learning experiences for every student.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Innovation",
      description: "We continuously evolve our platform with cutting-edge technology and modern learning methods.",
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
              About Patronecs
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              Empowering
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Global Learners
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to democratize education by providing world-class learning experiences 
              to anyone, anywhere, completely free.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="group relative p-6 bg-white border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-xl hover:shadow-slate-500/10 text-center hover:-translate-y-2 rounded-2xl overflow-hidden animate-fade-in"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className="mb-4 flex justify-center">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} bg-opacity-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <div className={`text-${stat.color.split('-')[1]}-600`}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-slate-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-full text-emerald-700 text-sm font-medium">
                <Target className="h-4 w-4" />
                Our Mission
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900">
                Transforming Education
                <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  for Everyone
                </span>
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                We believe that quality education should be accessible to everyone, regardless of their 
                background or financial situation. Our platform breaks down barriers and creates opportunities 
                for learners worldwide.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-slate-700">Free access to premium courses</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-slate-700">Expert-led instruction</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-slate-700">Practical, job-ready skills</span>
                </div>
              </div>
              <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" asChild>
                <Link to="/courses">
                  Explore Courses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <Card className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-3xl">
                <div className="aspect-video rounded-2xl overflow-hidden mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60"
                    alt="Students learning together"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Learning Together</h3>
                  <p className="text-slate-600">Join our global community of learners and instructors</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Our Core
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Values
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              These principles guide everything we do and shape the learning experience we provide.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="group relative p-8 bg-white border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-xl hover:shadow-slate-500/10 text-center hover:-translate-y-2 rounded-2xl overflow-hidden animate-fade-in"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className="mb-6 flex justify-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${value.color} bg-opacity-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <div className={`text-${value.color.split('-')[1]}-600`}>
                        {value.icon}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{value.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{value.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Our
              <span className="block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Story
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Born from a vision to make education accessible to all
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Story Content */}
            <div className="space-y-6">
              <p className="text-lg text-slate-700 leading-relaxed">
                At Patronecs, since 2020 we have been on a mission to automate as many processes as we can in an organization. We are technology partners of different no-code/low-code tools that can help achieve our goals.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                Till now we have worked with more than 600 different businesses from different industries. Our team is dedicated to providing an exceptional service in this domain.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                We are on a mission to help more than 10000 businesses by the end of 2027 in the digital transformation journey. We always keep on exploring new trends and technologies coming in and finding out how they can provide better solutions to client problems.
              </p>
            </div>

            {/* CEO Card */}
            <div className="flex justify-center">
              <Card className="group relative p-8 bg-white border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-xl hover:shadow-slate-500/10 hover:-translate-y-2 rounded-2xl overflow-hidden animate-fade-in max-w-sm">
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-slate-100 group-hover:border-blue-200 transition-colors duration-300">
                      <img
                        src="https://cdn.prod.website-files.com/63eb79f4ab031d09e95a842f/661e32377046a04957a568f3_image%2075%201.svg"
                        alt="Ahsan Shah"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Ahsan Shah</h3>
                  <Badge className="mb-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-sm px-4 py-2">
                    CEO at Patronecs
                  </Badge>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-full text-blue-200 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Join Our Mission
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Start Your
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Learning Journey?
              </span>
            </h2>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Join thousands of learners who are already transforming their careers with our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" asChild>
                <Link to="/courses">
                  Start Learning Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300" asChild>
                <Link to="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default About;