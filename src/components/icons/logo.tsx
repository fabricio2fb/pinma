import { cn } from "@/lib/utils";

export const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-primary", className)}
    {...props}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <path d="M12 10V3" stroke="hsl(var(--accent))" strokeWidth="2.5" />
    <path d="M12 3h.01" stroke="hsl(var(--accent))" strokeWidth="2.5" />
    <path d="M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" fill="hsl(var(--accent))" stroke="none" />
    <path d="M14 10a2 2 0 1 1-4 0" fill="hsl(var(--primary))" stroke="none" />
  </svg>
);

export const LogoIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={cn(className)}
        {...props}
    >
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
        <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
        <path d="M13.73 15a2 2 0 0 1-3.46 0"/>
    </svg>
);
