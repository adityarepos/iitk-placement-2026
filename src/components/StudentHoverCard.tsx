import { useState, useEffect } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Developer toggle - set to false to disable student image hover feature
export const ENABLE_STUDENT_IMAGE_HOVER = true;

interface StudentHoverCardProps {
  rollNo: string;
  name: string;
  children: React.ReactNode;
}

const getStudentImageUrl = (rollNo: string): string => {
  return `https://oa.cc.iitk.ac.in/Oa/Jsp/Photo/${rollNo}_0.jpg`;
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const StudentHoverCard = ({ rollNo, name, children }: StudentHoverCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if device is mobile/touch-enabled
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!ENABLE_STUDENT_IMAGE_HOVER) {
    return <>{children}</>;
  }

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault();
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <span 
            className="cursor-pointer hover:underline underline-offset-2 transition-colors"
            onClick={handleClick}
            role={isMobile ? "button" : undefined}
            tabIndex={isMobile ? 0 : undefined}
            onKeyDown={(e) => {
              if (isMobile && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                setIsDialogOpen(true);
              }
            }}
          >
            {children}
          </span>
        </HoverCardTrigger>
        {!isMobile && (
        <HoverCardContent className="w-auto p-3" side="right">
          <div className="flex flex-col items-center gap-2">
            <div 
              className="relative w-32 h-40 cursor-pointer overflow-hidden rounded-md border border-border"
              onClick={() => setIsDialogOpen(true)}
            >
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
              {imageError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm">
                  {getInitials(name)}
                </div>
              ) : (
                <img
                  src={getStudentImageUrl(rollNo)}
                  alt={`${name}'s photo`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{rollNo}</p>
            </div>
          </div>
        </HoverCardContent>
        )}
      </HoverCard>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md p-0">
          <div className="flex flex-col items-center gap-3 p-4">
            <div className="relative w-64 h-80 overflow-hidden rounded-md border border-border">
              {imageError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-2xl">
                  {getInitials(name)}
                </div>
              ) : (
                <img
                  src={getStudentImageUrl(rollNo)}
                  alt={`${name}'s photo`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
            <div className="text-center">
              <p className="font-medium text-base">{name}</p>
              <p className="text-sm text-muted-foreground">{rollNo}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
