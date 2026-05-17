import { BottomNav } from "./bottom-nav";
import { Sidebar } from "./sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 relative overflow-hidden">
        <main className="flex-1 overflow-y-auto w-full h-full">
          {children}
        </main>
        
        {/* Bottom Nav - Mobile Only */}
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
