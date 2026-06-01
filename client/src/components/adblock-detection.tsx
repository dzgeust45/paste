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
    // Only show dialog if ad block is detected and not loading
    if (!isChecking && adBlockDetected) {
      setOpen(true);
    } else if (!isChecking && !adBlockDetected) {
      // If ad block is NOT detected, close the dialog
      setOpen(false);
    }
  }, [adBlockDetected, isChecking]);

  const handleRefresh = () => {
    // Clear any cached state
    sessionStorage.removeItem("adBlockDetected");
    localStorage.removeItem("adBlockDetected");
    // Reload the page to re-check
    window.location.reload();
  };

  // While checking, show normal content
  if (isChecking) {
    return <>{children}</>;
  }

  // If ad block detected, hide content and show dialog
  if (adBlockDetected) {
    return (
      <>
        <div className="hidden">{children}</div>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl">
                Ad Blocker Detected
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                Your ad blocker is blocking this content. Please disable it to
                view pastes on this site.
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

  // No ad block detected, show content normally
  return <>{children}</>;
}
