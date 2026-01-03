import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  if (!ENABLE_STUDENT_IMAGE_HOVER) {
    return <>{children}</>;
  }

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer hover:underline">{children}</span>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto p-3" side="right">
        <div className="flex flex-col items-center gap-2">
          <Avatar className="h-24 w-24">
            <AvatarImage 
              src={getStudentImageUrl(rollNo)} 
              alt={`${name}'s photo`}
              className="object-cover"
            />
            <AvatarFallback className="text-lg">{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="font-medium text-sm">{name}</p>
            <p className="text-xs text-muted-foreground">{rollNo}</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
