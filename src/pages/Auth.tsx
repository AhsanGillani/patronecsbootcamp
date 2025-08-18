import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Mail, Lock, User, Sparkles, GraduationCap, Users, Award } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get("mode") || "login";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, signUp, user, profile, loading } = useAuth();

  // Handle redirection after successful authentication
  useEffect(() => {
    console.log('Auth useEffect triggered:', { user: !!user, profile: !!profile, loading, profileRole: profile?.role });
    
    if (!loading && user && profile) {
      console.log('Redirecting user to dashboard:', { role: profile.role, userId: user.id });
      // Redirect based on user role
      switch (profile.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'instructor':
          navigate('/instructor');
          break;
        case 'student':
          navigate('/student');
          break;
        default:
          console.warn('Unknown user role, defaulting to student:', profile.role);
          navigate('/student'); // Default fallback
      }
    } else if (!loading && user && !profile) {
      console.warn('User authenticated but no profile found:', { userId: user.id, email: user.email });
      setError("Profile not found. Please contact support.");
    }
  }, [user, profile, loading, navigate]);

  // If user is already authenticated, show loading while redirecting
  if (!loading && user && profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (mode === "register") {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          setIsLoading(false);
          return;
        }
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          setError(error.message || "Registration failed");
          setIsLoading(false);
          return;
        }
        // For registration, we might need to wait for email confirmation
        setError("Please check your email to confirm your account before signing in.");
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message || "Sign in failed");
          setIsLoading(false);
          return;
        }
        // If sign in is successful, the useEffect will handle redirection
        // Don't set isLoading to false here as we're redirecting
        return;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    }
    
    // Only set loading to false if we're not redirecting
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side - Form */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md p-8 bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl shadow-blue-500/10 rounded-3xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50 rounded-full text-blue-700 text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                {mode === "login" ? "Welcome Back" : "Join Our Community"}
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {mode === "login" ? "Sign In" : "Create Account"}
              </h1>
              <p className="text-slate-600">
                {mode === "login" 
                  ? "Access your learning dashboard" 
                  : "Start your learning journey today"
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                         <Input
                       id="fullName"
                       name="fullName"
                       type="text"
                       placeholder="Enter your full name"
                       value={formData.fullName}
                       onChange={handleInputChange}
                       required
                       autoComplete="name"
                       className="pl-10 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                     />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                     <Input
                     id="email"
                     name="email"
                     type="email"
                     placeholder="Enter your email"
                     value={formData.email}
                     onChange={handleInputChange}
                     required
                     autoComplete="email"
                     className="pl-10 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                   />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                     <Input
                     id="password"
                     name="password"
                     type={showPassword ? "text" : "password"}
                     placeholder="Enter your password"
                     value={formData.password}
                     onChange={handleInputChange}
                     required
                     autoComplete={mode === "login" ? "current-password" : "new-password"}
                     className="pl-10 pr-10 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                   />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                         <Input
                       id="confirmPassword"
                       name="confirmPassword"
                       type={showConfirmPassword ? "text" : "password"}
                       placeholder="Confirm your password"
                       value={formData.confirmPassword}
                       onChange={handleInputChange}
                       required
                       autoComplete="new-password"
                       className="pl-10 pr-10 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                     />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {mode === "login" ? "Signing In..." : "Creating Account..."}
                  </div>
                ) : (
                  mode === "login" ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-600">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                <Link
                  to={mode === "login" ? "/auth?mode=register" : "/auth?mode=login"}
                  className="ml-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </Link>
              </p>
            </div>

            {mode === "login" && (
              <div className="mt-6 text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Right Side - Info */}
        <div className="hidden lg:block">
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                Join Pakistan's
                <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Learning Revolution
                </span>
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                Access world-class education, connect with industry experts, and build the skills that will transform your career.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">500+ Expert Courses</h3>
                  <p className="text-slate-600 text-sm">Learn from industry professionals</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">34K+ Active Learners</h3>
                  <p className="text-slate-600 text-sm">Join a thriving community</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">100% Free Access</h3>
                  <p className="text-slate-600 text-sm">No hidden costs or subscriptions</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-6">
              <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" asChild>
                <Link to="/courses">
                  Explore Courses
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;