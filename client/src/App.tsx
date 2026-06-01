import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/header";
import { AdBlockDetection } from "@/components/adblock-detection";
import CreatePaste from "@/pages/create-paste";
import ViewPaste from "@/pages/view-paste";
import RawPaste from "@/pages/raw-paste";
import NotFound from "@/pages/not-found";

function Router() {
  const [, setLocation] = useLocation();

  // Handle redirect from 404.html for GitHub Pages SPA routing
  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath && redirectPath !== '/') {
      sessionStorage.removeItem('redirectPath');
      setLocation(redirectPath);
    }
  }, [setLocation]);

  return (
    <Switch>
      <Route path="/" component={CreatePaste} />
      <Route path="/raw/:slug" component={RawPaste} />
      <Route path="/:slug" component={ViewPaste} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Create hidden ad elements that ad blockers will block
    const adContainer = document.createElement("div");
    adContainer.id = "ad-container";
    adContainer.className = "adsbygoogle";
    adContainer.style.display = "none";
    adContainer.innerHTML = '<ins class="adsbygoogle" data-ad-client="ca-pub-123"></ins>';
    document.body.appendChild(adContainer);

    return () => {
      if (document.body.contains(adContainer)) {
        document.body.removeChild(adContainer);
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdBlockDetection>
          <div className="min-h-screen bg-background">
            <Header />
            <Router />
          </div>
        </AdBlockDetection>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
