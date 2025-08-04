import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { CreditProvider } from "./hooks/useCreditSystem";
import { AppRoutes } from "./components/routing/AppRoutes";
import { SessionPersistence } from "./components/routing/SessionPersistence";
import Header from "./components/Header";
import Footer from "./components/Footer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CreditProvider>
            <div 
              className="flex min-h-screen flex-col bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 text-foreground antialiased"
              style={{
                fontFeatureSettings: '"rlig" 1, "calt" 1'
              }}
            >
              <Header />
              <main className="flex-1 relative pt-25 md:pt-28">
                <SessionPersistence />
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </CreditProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
