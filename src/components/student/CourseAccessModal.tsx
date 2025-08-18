import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  isSignedIn: boolean;
  isEnrolled: boolean;
  price: number | null | undefined;
  onEnroll?: () => void;
  enrolling?: boolean;
  backgroundUrl?: string;
  headerTitle?: string;
  headerSubtitle?: string;
};

export const CourseAccessModal = ({ open, onOpenChange, isSignedIn, isEnrolled, price, onEnroll, enrolling, backgroundUrl, headerTitle, headerSubtitle }: Props) => {
  const showBuy = !!price && price > 0 && (!isSignedIn || !isEnrolled);
  const ctaPrimary = () => {
    if (!isSignedIn) return (
      <Button asChild size="lg" className="w-full">
        <Link to="/auth">Sign up</Link>
      </Button>
    );
    if (!isEnrolled) return (
      <Button size="lg" className="w-full" onClick={onEnroll} disabled={enrolling}>
        {enrolling ? 'Enrolling...' : 'Enroll Now'}
      </Button>
    );
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Course Access Required</DialogTitle>
          <DialogDescription>
            You need to enroll in this course to access its content.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-white">
          {/* Visual area */}
          <div className="relative aspect-video">
            <ImageWithFallback
              src={backgroundUrl}
              alt={headerTitle || 'Course preview'}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center text-white max-w-xl px-6">
                <div className="inline-flex items-center gap-2 bg-orange-500/90 text-white px-4 py-2 rounded-md mb-4 text-sm font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  You don't have access to this course
                </div>
                <div className="text-2xl md:text-3xl font-bold leading-snug">
                  {showBuy ? (
                    <>Buy this course for just ${price}</>
                  ) : (
                    <>Enroll now to unlock this course</>
                  )}
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  {showBuy && (
                    <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                      <ShoppingCart className="h-5 w-5 mr-2" /> Buy
                    </Button>
                  )}
                  {ctaPrimary()}
                </div>
              </div>
            </div>
          </div>

          {/* Meta area */}
          {(headerTitle || headerSubtitle) && (
            <div className="px-6 py-4">
              {headerTitle && <div className="text-lg font-semibold">{headerTitle}</div>}
              {headerSubtitle && <div className="text-sm text-muted-foreground mt-1">{headerSubtitle}</div>}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseAccessModal;


