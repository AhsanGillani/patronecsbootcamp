import { useRef } from "react";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Award, Users, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

export const Hero = () => {
  const preserve3DStyle: CSSProperties = { transformStyle: "preserve-3d" };
  const collageRef = useRef<HTMLDivElement | null>(null);
  const card1Ref = useRef<HTMLDivElement | null>(null);
  const card2Ref = useRef<HTMLDivElement | null>(null);
  const card3Ref = useRef<HTMLDivElement | null>(null);

  const categories = [
    { label: "Web Dev", href: "/courses?category=web" },
    { label: "Mobile", href: "/courses?category=mobile" },
    { label: "UI/UX", href: "/courses?category=design" },
    { label: "AI & Data", href: "/courses?category=ai" },
  ];

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = collageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const r1x = (-y * 10).toFixed(2);
    const r1y = (x * 10).toFixed(2);
    const r2x = (-y * 6).toFixed(2);
    const r2y = (x * 6).toFixed(2);
    const r3x = (-y * 14).toFixed(2);
    const r3y = (x * 14).toFixed(2);
    if (card1Ref.current) card1Ref.current.style.transform = `rotateX(${r1x}deg) rotateY(${r1y}deg)`;
    if (card2Ref.current) card2Ref.current.style.transform = `rotateX(${r2x}deg) rotateY(${r2y}deg)`;
    if (card3Ref.current) card3Ref.current.style.transform = `rotateX(${r3x}deg) rotateY(${r3y}deg)`;
  };

  const handleLeave = () => {
    if (card1Ref.current) card1Ref.current.style.transform = `rotateX(0deg) rotateY(0deg)`;
    if (card2Ref.current) card2Ref.current.style.transform = `rotateX(0deg) rotateY(0deg)`;
    if (card3Ref.current) card3Ref.current.style.transform = `rotateX(0deg) rotateY(0deg)`;
  };

  return (
    <section className="relative min-h-[82vh] md:min-h-[88vh] flex items-end overflow-hidden">
      {/* Background image banner */}
      <div className="absolute inset-0 -z-10">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=2000&auto=format&fit=crop&q=60"
          alt="Hero banner background"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />
      </div>

      <div className="container mx-auto px-4 pb-10 md:pb-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-end">
          {/* Copy */}
          <div>
            <Card className="relative p-6 md:p-10 bg-background/70 backdrop-blur-md border-border/60">
              <div className="absolute -top-1 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                Build Real Skills with a Modern Learning Platform
              </h1>
              <p className="mt-4 text-muted-foreground text-lg md:text-xl">
                Project-based courses, expert mentorship and recognized certificates—designed to get you job‑ready.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="hero" className="group px-8 py-6" asChild>
                  <Link to="/courses">
                    <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    Start Learning
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="group px-8 py-6 border-2" asChild>
                  <Link to="/auth?mode=register">
                    Browse Tracks
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              {/* Category chips */}
              <div className="mt-6 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link
                    key={c.label}
                    to={c.href}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-secondary/60 border border-border/60 text-sm hover:bg-secondary/80 transition-colors"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </Card>

            {/* Trust strip */}
            <div className="mt-6 grid grid-cols-3 gap-4 max-w-2xl">
              <Card className="p-4 bg-background/70 backdrop-blur-md border-border/60">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <span className="text-sm">Hands-on Learning</span>
                </div>
              </Card>
              <Card className="p-4 bg-background/70 backdrop-blur-md border-border/60">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="text-sm">Certificates</span>
                </div>
              </Card>
              <Card className="p-4 bg-background/70 backdrop-blur-md border-border/60">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm">34,650+ Learners</span>
                </div>
              </Card>
            </div>
          </div>

          {/* 3D-like collage */}
          <div
            ref={collageRef}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            className="relative h-[420px] md:h-[520px] perspective-[1000px]"
          >
            <div
              ref={card1Ref}
              className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-border/50 transition-transform duration-300 will-change-transform"
              style={preserve3DStyle}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=1600&auto=format&fit=crop&q=60"
                alt="Primary"
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            <div
              ref={card2Ref}
              className="absolute -bottom-8 -left-6 w-44 md:w-60 aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-border/50 transition-transform duration-300 will-change-transform"
              style={preserve3DStyle}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=1200&auto=format&fit=crop&q=60"
                alt="Students"
                className="w-full h-full object-cover"
              />
            </div>

            <div
              ref={card3Ref}
              className="absolute -top-6 -right-4 w-40 md:w-56 aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-border/50 transition-transform duration-300 will-change-transform"
              style={preserve3DStyle}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=60"
                alt="Collaboration"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};