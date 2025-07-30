import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategorySection } from "@/components/CategorySection";
import { Stats } from "@/components/Stats";
import { Courses } from "@/components/Courses";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <CategorySection />
      <Stats />
      <Courses />
      <Footer />
    </div>
  );
};

export default Index;
