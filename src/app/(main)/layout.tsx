import Navbar from "@/ui/layout/Navbar";
import Footer from "@/ui/layout/footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative z-50">
        <Navbar />
      </div>
      <main className="flex-1 w-full flex flex-col relative">
        {children}
      </main>
      <div className="relative z-50">
        <Footer />
      </div>
    </div>
  );
}
