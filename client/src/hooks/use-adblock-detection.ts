import { useState, useEffect } from "react";

export function useAdBlockDetection() {
  const [adBlockDetected, setAdBlockDetected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const detectAdBlock = async () => {
      try {
        // Clear any cached detection
        sessionStorage.removeItem("adBlockDetected");

        // Check if content marked as ad is visible
        const contentAd = document.querySelector(".adsbygoogle");
        
        if (contentAd) {
          const style = window.getComputedStyle(contentAd);
          const isBlocked =
            style.display === "none" ||
            style.visibility === "hidden" ||
            contentAd.offsetHeight === 0 ||
            contentAd.offsetWidth === 0;

          setAdBlockDetected(isBlocked);
          setIsChecking(false);
          return;
        }

        // Fallback: test network-based detection
        const testAdUrl =
          "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1500);

          const response = await fetch(testAdUrl, {
            method: "HEAD",
            mode: "no-cors",
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          // If request succeeds, ad blocker is NOT active
          setAdBlockDetected(false);
        } catch (error) {
          // Request failed = ad blocker is active
          setAdBlockDetected(true);
        }

        setIsChecking(false);
      } catch (error) {
        console.log("Detection error:", error);
        setAdBlockDetected(false);
        setIsChecking(false);
      }
    };

    // Add delay to let DOM render
    const timer = setTimeout(detectAdBlock, 300);

    // Also listen for visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setIsChecking(true);
        setTimeout(detectAdBlock, 300);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return { adBlockDetected, isChecking };
}
