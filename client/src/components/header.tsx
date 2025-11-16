import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function Header() {
  const [location, setLocation] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        <div
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 hover-elevate active-elevate-2 px-2 py-1 rounded-md -ml-2 cursor-pointer"
          data-testid="link-home"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className="w-7 h-7 md:w-8 md:h-8"
            fill="currentColor"
          >
            <path d="M50 10 L50 45 M30 45 L70 45 Q75 45 75 50 L75 70 Q75 80 65 80 L35 80 Q25 80 25 70 L25 50 Q25 45 30 45 M45 70 Q45 75 50 75 Q55 75 55 70 L55 60 Q55 55 50 55 Q45 55 45 60 Z" />
          </svg>
          <span className="text-xl md:text-2xl font-semibold">Paste-Life</span>
        </div>

        {location !== "/" && (
          <Button
            size="sm"
            onClick={() => setLocation("/")}
            data-testid="button-new-paste"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Paste
          </Button>
        )}
      </div>
    </header>
  );
}
