import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 h-16 flex items-center border-b border-border bg-background px-6">
            <SidebarTrigger className="mr-4" />
          </header>
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
