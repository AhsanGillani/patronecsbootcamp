import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Award,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
  Eye,
  Calendar,
  Globe,
  Smartphone
} from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  totalEnrollments: number;
  userGrowth: number;
  courseGrowth: number;
  revenueGrowth: number;
  enrollmentGrowth: number;
  topCategories: Array<{ name: string; count: number; growth: number }>;
  recentActivity: Array<{ type: string; description: string; time: string; value: string }>;
  platformStats: {
    webUsers: number;
    mobileUsers: number;
    activeUsers: number;
    newUsers: number;
  };
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    totalEnrollments: 0,
    userGrowth: 0,
    courseGrowth: 0,
    revenueGrowth: 0,
    enrollmentGrowth: 0,
    topCategories: [],
    recentActivity: [],
    platformStats: {
      webUsers: 0,
      mobileUsers: 0,
      activeUsers: 0,
      newUsers: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setData({
        totalUsers: 1247,
        totalCourses: 89,
        totalRevenue: 45678,
        totalEnrollments: 3456,
        userGrowth: 12.5,
        courseGrowth: 8.3,
        revenueGrowth: 23.7,
        enrollmentGrowth: 15.2,
        topCategories: [
          { name: 'Web Development', count: 23, growth: 15.2 },
          { name: 'Data Science', count: 18, growth: 22.1 },
          { name: 'Design', count: 15, growth: 8.7 },
          { name: 'Business', count: 12, growth: 12.3 },
          { name: 'Marketing', count: 10, growth: 18.9 }
        ],
        recentActivity: [
          { type: 'user_registration', description: 'New user registered', time: '2 min ago', value: '+1' },
          { type: 'course_creation', description: 'New course published', time: '15 min ago', value: '+1' },
          { type: 'enrollment', description: 'Course enrollment', time: '1 hour ago', value: '+5' },
          { type: 'payment', description: 'Payment received', time: '2 hours ago', value: '$299' },
          { type: 'certificate', description: 'Certificate issued', time: '3 hours ago', value: '+2' }
        ],
        platformStats: {
          webUsers: 847,
          mobileUsers: 400,
          activeUsers: 892,
          newUsers: 45
        }
      });
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-white/60 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-white/60 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-white/60 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header Section */}
        <div className="relative overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
        <div>
                  <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                  <p className="text-emerald-100 text-lg">Monitor your platform's performance and growth</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mt-6">
                <div className="flex space-x-2 bg-white/20 rounded-lg p-1">
                  {['7d', '30d', '90d', '1y'].map((range) => (
                    <Button
                      key={range}
                      variant={timeRange === range ? "secondary" : "ghost"}
                      size="sm"
                      className={timeRange === range ? "bg-white text-emerald-600" : "text-white hover:bg-white/10"}
                      onClick={() => setTimeRange(range)}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${data.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.userGrowth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span className="font-medium">{Math.abs(data.userGrowth)}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{data.totalUsers.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Total Courses */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${data.courseGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.courseGrowth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span className="font-medium">{Math.abs(data.courseGrowth)}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{data.totalCourses}</p>
              </div>
          </CardContent>
        </Card>

          {/* Total Revenue */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${data.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.revenueGrowth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span className="font-medium">{Math.abs(data.revenueGrowth)}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${data.totalRevenue.toLocaleString()}</p>
              </div>
          </CardContent>
        </Card>

          {/* Total Enrollments */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${data.enrollmentGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.enrollmentGrowth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span className="font-medium">{Math.abs(data.enrollmentGrowth)}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-3xl font-bold text-gray-900">{data.totalEnrollments.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <PieChart className="w-4 h-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="platform" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <Globe className="w-4 h-4 mr-2" />
              Platform
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Growth Chart */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span>Growth Trends</span>
                  </CardTitle>
                  <CardDescription>Platform growth over time</CardDescription>
          </CardHeader>
          <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-gray-600">User Growth</span>
                      <span className="font-semibold text-blue-600">+{data.userGrowth}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-600">Course Growth</span>
                      <span className="font-semibold text-green-600">+{data.courseGrowth}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                      <span className="text-sm text-gray-600">Revenue Growth</span>
                      <span className="font-semibold text-emerald-600">+{data.revenueGrowth}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm text-gray-600">Enrollment Growth</span>
                      <span className="font-semibold text-purple-600">+{data.enrollmentGrowth}%</span>
                    </div>
                  </div>
          </CardContent>
        </Card>

              {/* Quick Stats */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    <span>Quick Stats</span>
                  </CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Users</span>
                      <span className="font-semibold text-gray-900">{data.platformStats.activeUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">New Users (Today)</span>
                      <span className="font-semibold text-gray-900">{data.platformStats.newUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Web Users</span>
                      <span className="font-semibold text-gray-900">{data.platformStats.webUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Mobile Users</span>
                      <span className="font-semibold text-gray-900">{data.platformStats.mobileUsers}</span>
                    </div>
                  </div>
          </CardContent>
        </Card>
      </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5 text-green-600" />
                  <span>Top Categories</span>
                </CardTitle>
                <CardDescription>Most popular course categories</CardDescription>
          </CardHeader>
          <CardContent>
                <div className="space-y-4">
                  {data.topCategories.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-sm font-semibold text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{category.name}</p>
                          <p className="text-sm text-gray-600">{category.count} courses</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${category.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {category.growth >= 0 ? '+' : ''}{category.growth}%
                        </span>
                        {category.growth >= 0 ? <ArrowUp className="w-4 h-4 text-green-600" /> : <ArrowDown className="w-4 h-4 text-red-600" />}
                      </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-amber-600" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
                <div className="space-y-4">
                  {data.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.description}</p>
                          <p className="text-sm text-gray-600">{activity.time}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        {activity.value}
                      </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          {/* Platform Tab */}
          <TabsContent value="platform" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Device Usage */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    <span>Device Usage</span>
                  </CardTitle>
                  <CardDescription>Platform access distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Web Users</span>
                      <span className="font-semibold text-gray-900">{data.platformStats.webUsers}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(data.platformStats.webUsers / data.totalUsers) * 100}%` }}
                      ></div>
      </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Mobile Users</span>
                      <span className="font-semibold text-gray-900">{data.platformStats.mobileUsers}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(data.platformStats.mobileUsers / data.totalUsers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Engagement */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span>User Engagement</span>
                  </CardTitle>
                  <CardDescription>Active user metrics</CardDescription>
        </CardHeader>
        <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Users</span>
                      <span className="font-semibold text-gray-900">{data.platformStats.activeUsers}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(data.platformStats.activeUsers / data.totalUsers) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">New Users (Today)</span>
                      <span className="font-semibold text-gray-900">{data.platformStats.newUsers}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(data.platformStats.newUsers / data.totalUsers) * 100}%` }}
                      ></div>
                </div>
          </div>
        </CardContent>
      </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}