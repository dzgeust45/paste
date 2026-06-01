import { useState, useEffect } from "react";
import { useAdBlockDetection } from "@/hooks/use-adblock-detection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
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
    if (!isChecking && adBlockDetected) {
      setOpen(true);
    }
  }, [adBlockDetected, isChecking]);

  const handleRetry = async () => {
    // Wait a moment then reload to re-check
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // While checking, show normal content
  if (isChecking) {
    return <>{children}</>;
  }

  // If ad block detected, show dialog and blur content
  if (adBlockDetected) {
    return (
      <>
        <div className="blur-sm pointer-events-none select-none opacity-50">
          {children}
        </div>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl">
                Ad Blocker Detected
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                This site is free and relies on ads to stay running. Please
                disable your ad blocker to continue viewing content.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-3">
                <strong>How to disable ad blocker:</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>Click the ad blocker icon in your browser toolbar</li>
                <li>Select "Disable on this site" or "Allow ads"</li>
                <li>Make sure no rules are blocking this domain</li>
              </ul>
            </div>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel onClick={() => setOpen(false)}>
                I'll Disable It Later
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleRetry}>
                I've Disabled Ad Blocker
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
