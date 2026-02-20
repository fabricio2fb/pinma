import { BottomNav } from "./bottom-nav";

type MainLayoutProps = {
  children: React.ReactNode;
  showHeader?: boolean;
  title?: string;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
