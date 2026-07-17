import { useState, useEffect } from "react";

export function useAdBlockDetection() {
  const [adBlockDetected, setAdBlockDetected] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    // Check if we already dismissed the popup
    const dismissed = sessionStorage.getItem("adBlockDismissed");
    
    if (dismissed) {
      setAdBlockDetected(false);
    } else {
      setAdBlockDetected(true);
    }
    
    setIsChecking(false);
  }, []);

  const dismissPopup = () => {
    sessionStorage.setItem("adBlockDismissed", "true");
    setAdBlockDetected(false);
  };

  return { adBlockDetected, isChecking, dismissPopup };
}
