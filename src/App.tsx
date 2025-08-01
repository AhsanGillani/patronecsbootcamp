import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider, CssBaseline } from '@mui/material';
import { materialTheme } from './theme/materialTheme';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import About from "./pages/About";
import AllCourses from "./pages/AllCourses";
import Blog from "./pages/Blog";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import CourseDetail from "./pages/CourseDetail";
import BlogDetail from "./pages/BlogDetail";
import AdminDashboard from "./pages/AdminDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import NotFound from "./pages/NotFound";
import { CourseLearning } from "./components/student/CourseLearning";
import MuiIndex from "./pages/MuiIndex";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider theme={materialTheme}>
    <CssBaseline />
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/mui" element={<MuiIndex />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<AllCourses />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/course/:courseId/learn" element={<CourseLearning />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/instructor" element={<InstructorDashboard />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
