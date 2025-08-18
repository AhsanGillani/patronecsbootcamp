import { Card } from "@/components/ui/card";
import { BookOpen, Users, Unlock, Star, TrendingUp, Sparkles } from "lucide-react";

export const Stats = () => {
  const stats = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      label: "Free Courses",
      value: "500+",
      description: "Comprehensive courses available",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50"
    },
    {
      icon: <Users className="h-6 w-6" />,
      label: "Active Students",
      value: "34K+",
      description: "Trusted by thousands",
      color: "from-emerald-500 to-teal-500",
      bgColor: "from-emerald-50 to-teal-50"
    },
    {
      icon: <Unlock className="h-6 w-6" />,
      label: "Free Access",
      value: "100%",
      description: "Always free to learn",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50"
    },
    {
      icon: <Star className="h-6 w-6" />,
      label: "Success Rate",
      value: "94%",
      description: "Students get hired",
      color: "from-amber-500 to-orange-500",
      bgColor: "from-amber-50 to-orange-50"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-full text-emerald-700 text-sm font-medium mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <TrendingUp className="h-4 w-4" />
            Platform Statistics
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Trusted by
            <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Join Pakistan's fastest-growing community of <span className="text-emerald-600 font-semibold">skilled professionals</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="group relative p-8 bg-white border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-xl hover:shadow-slate-500/10 text-center hover:-translate-y-2 rounded-2xl overflow-hidden animate-fade-in"
              style={{ animationDelay: `${0.4 + index * 0.1}s` }}
            >
              {/* Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative z-10 flex flex-col items-center space-y-6">
                {/* Icon */}
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300`} />
                  <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <div className={`text-${stat.color.split('-')[1]}-600`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="space-y-3">
                  <div className={`text-4xl lg:text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>
                    {stat.value}
                  </div>
                  <div className="font-bold text-lg text-slate-900 group-hover:text-slate-700 transition-colors duration-300">
                    {stat.label}
                  </div>
                  <div className="text-sm text-slate-600 leading-relaxed">
                    {stat.description}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <Card className="inline-block p-6 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-slate-900">New courses added weekly</div>
                <div className="text-xs text-slate-600">Stay updated with latest tech trends</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};