import { useState, useEffect } from "react";

export function useAdBlockDetection() {
  const [adBlockDetected, setAdBlockDetected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // First check the main ad container that's created early
        const adContainer = document.getElementById("ad-container");
        if (adContainer && !document.body.contains(adContainer)) {
          setAdBlockDetected(true);
          setIsChecking(false);
          return;
        }

        // Check multiple elements that ad blockers target
        const adSelectors = [
          "#ad",
          "#advertisement",
          "#google-ad",
          "#banner-ad",
          ".ad",
          ".advertisement",
          ".adsbygoogle",
          "[id*='ad-']",
          "[id*='advertisement']",
          "[id*='google-ad']",
        ];

        let detected = false;

        for (const selector of adSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            const style = window.getComputedStyle(element);
            // Check if hidden by ad blocker
            if (
              style.display === "none" ||
              style.visibility === "hidden" ||
              element.offsetHeight === 0 ||
              element.offsetWidth === 0 ||
              !document.body.contains(element)
            ) {
              detected = true;
              break;
            }
          }
        }

        setAdBlockDetected(detected);
        setIsChecking(false);
      } catch (error) {
        setAdBlockDetected(false);
        setIsChecking(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return { adBlockDetected, isChecking };
}
