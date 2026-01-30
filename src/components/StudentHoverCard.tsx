import { useState, useEffect } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IdCard } from "lucide-react";

// Developer toggle - set to false to disable student image hover feature
export const ENABLE_STUDENT_IMAGE_HOVER = true;

interface StudentHoverCardProps {
  rollNo: string;
  name: string;
  email?: string;
  children: React.ReactNode;
}

// Extract userid from email (part before @iitk.ac.in)
const getUserIdFromEmail = (email?: string): string | null => {
  if (!email) return null;
  const match = email.match(/^([^@]+)@/);
  return match ? match[1] : null;
};

// Get home.iitk.ac.in profile photo URL
const getHomeImageUrl = (userId: string): string => {
  return `https://home.iitk.ac.in/~${userId}/dp`;
};

// Get OA (ID card) photo URL
const getOaImageUrl = (rollNo: string): string => {
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

export const StudentHoverCard = ({ rollNo, name, email, children }: StudentHoverCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isIdCardDialogOpen, setIsIdCardDialogOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [homeImageError, setHomeImageError] = useState(false);
  const [oaImageError, setOaImageError] = useState(false);
  const [homeImageLoaded, setHomeImageLoaded] = useState(false);
  const [oaImageLoaded, setOaImageLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const userId = getUserIdFromEmail(email);
  const homeImageUrl = userId ? getHomeImageUrl(userId) : null;
  const oaImageUrl = getOaImageUrl(rollNo);
  
  // Determine which image to show as primary
  const showHomeImage = homeImageUrl && !homeImageError;
  const showOaImage = !showHomeImage && !oaImageError;
  const primaryImageUrl = showHomeImage ? homeImageUrl : oaImageUrl;
  const hasIdCardPhoto = homeImageLoaded && oaImageLoaded && !oaImageError;

  // Detect if device is mobile/touch-enabled
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Pre-check if OA image exists (for showing ID card button)
  useEffect(() => {
    const img = new Image();
    img.onload = () => setOaImageLoaded(true);
    img.onerror = () => setOaImageError(true);
    img.src = oaImageUrl;
  }, [oaImageUrl]);

  if (!ENABLE_STUDENT_IMAGE_HOVER) {
    return <>{children}</>;
  }

  const handleHomeImageLoad = () => {
    setImageLoading(false);
    setHomeImageLoaded(true);
  };

  const handleHomeImageError = () => {
    setHomeImageError(true);
    // If home image fails and no OA image, stop loading
    if (oaImageError) {
      setImageLoading(false);
    }
  };
  
  const handleOaImageLoad = () => {
    setImageLoading(false);
  };
  
  const handleOaImageError = () => {
    setImageLoading(false);
    setOaImageError(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDialogOpen(true);
  };
  
  const bothImagesFailed = (homeImageError || !homeImageUrl) && oaImageError;

  return (
    <>
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <span 
            className="cursor-pointer hover:underline underline-offset-2 transition-colors"
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
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
              {bothImagesFailed ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm">
                  {getInitials(name)}
                </div>
              ) : (
                <>
                  {/* Try home.iitk.ac.in first */}
                  {homeImageUrl && !homeImageError && (
                    <img
                      src={homeImageUrl}
                      alt={`${name}'s photo`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onLoad={handleHomeImageLoad}
                      onError={handleHomeImageError}
                    />
                  )}
                  {/* Fallback to OA image */}
                  {(!homeImageUrl || homeImageError) && !oaImageError && (
                    <img
                      src={oaImageUrl}
                      alt={`${name}'s photo`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onLoad={handleOaImageLoad}
                      onError={handleOaImageError}
                    />
                  )}
                </>
              )}
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{rollNo}</p>
              {/* Show ID Card button if home image is shown and OA image is also available */}
              {showHomeImage && hasIdCardPhoto && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-1 h-6 text-xs gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsIdCardDialogOpen(true);
                  }}
                >
                  <IdCard className="h-3 w-3" />
                  ID Card
                </Button>
              )}
            </div>
          </div>
        </HoverCardContent>
        )}
      </HoverCard>

      {/* Main photo dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md p-0">
          <div className="flex flex-col items-center gap-3 p-4">
            <div className="relative w-64 h-80 overflow-hidden rounded-md border border-border">
              {bothImagesFailed ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-2xl">
                  {getInitials(name)}
                </div>
              ) : (
                <>
                  {showHomeImage ? (
                    <img
                      src={homeImageUrl!}
                      alt={`${name}'s photo`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <img
                      src={oaImageUrl}
                      alt={`${name}'s photo`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </>
              )}
            </div>
            <div className="text-center">
              <p className="font-medium text-base">{name}</p>
              <p className="text-sm text-muted-foreground">{rollNo}</p>
              {/* Show ID Card button in dialog too */}
              {showHomeImage && hasIdCardPhoto && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 gap-1"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setIsIdCardDialogOpen(true);
                  }}
                >
                  <IdCard className="h-4 w-4" />
                  View ID Card Photo
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* ID Card photo dialog */}
      <Dialog open={isIdCardDialogOpen} onOpenChange={setIsIdCardDialogOpen}>
        <DialogContent className="max-w-md p-0">
          <div className="flex flex-col items-center gap-3 p-4">
            <div className="relative w-64 h-80 overflow-hidden rounded-md border border-border">
              <img
                src={oaImageUrl}
                alt={`${name}'s ID card photo`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="text-center">
              <p className="font-medium text-base">{name}</p>
              <p className="text-sm text-muted-foreground">{rollNo}</p>
              <p className="text-xs text-muted-foreground mt-1">ID Card Photo</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
