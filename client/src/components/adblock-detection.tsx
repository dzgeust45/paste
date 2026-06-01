import { useState, useEffect } from "react";
import { useAdBlockDetection } from "@/hooks/use-adblock-detection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdBlockDetectionProps {
  children: React.ReactNode;
}

export function AdBlockDetection({ children }: AdBlockDetectionProps) {
  const { adBlockDetected, isChecking } = useAdBlockDetection();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show dialog if ad block is detected
    if (!isChecking && adBlockDetected) {
      setOpen(true);
    } else if (!isChecking && !adBlockDetected) {
      setOpen(false);
    }
  }, [adBlockDetected, isChecking]);

  const handleRefresh = () => {
    sessionStorage.removeItem("adBlockDetected");
    localStorage.removeItem("adBlockDetected");
    window.location.reload();
  };

  // While checking, show normal content
  if (isChecking) {
    return <>{children}</>;
  }

  // Always render children and popup at same level
  // The content will be hidden by ad blocker if it has adsbygoogle class
  // The popup will NOT be hidden because it's not marked as an ad
  return (
    <>
      {children}
      
      {/* Popup dialog - NOT blocked because it doesn't have ad class */}
      <AlertDialog open={open && adBlockDetected} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              Ad Blocker Detected
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Your ad blocker is blocking the content on this page. Please disable it to view pastes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-3">
              <strong>How to disable in Brave:</strong>
            </p>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Click the Brave Shields icon (⚔) in your address bar</li>
              <li>Toggle "Shields" to OFF</li>
              <li>Click the button below to refresh</li>
            </ol>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleRefresh}>
              Refresh After Disabling
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
