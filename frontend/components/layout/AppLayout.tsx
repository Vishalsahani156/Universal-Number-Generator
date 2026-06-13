import { Footer } from "./Footer";
import { Header } from "./Header";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
