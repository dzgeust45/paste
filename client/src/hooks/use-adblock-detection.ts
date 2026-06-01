import { useState, useEffect } from "react";

export function useAdBlockDetection() {
  const [adBlockDetected, setAdBlockDetected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const detectAdBlock = async () => {
      try {
        // Method 1: Check for blocked ad-related elements
        const adClasses = [
          "ad-testing",
          "advertisement",
          "ad-banner",
          "adsbygoogle",
        ];

        let detected = false;

        for (const className of adClasses) {
          const elem = document.createElement("div");
          elem.className = className;
          elem.style.display = "none";
          elem.style.width = "1px";
          elem.style.height = "1px";
          document.body.appendChild(elem);

          // Ad blockers typically block elements with ad-related classNames
          if (elem.offsetHeight === 0 || elem.offsetWidth === 0) {
            detected = true;
            document.body.removeChild(elem);
            break;
          }

          document.body.removeChild(elem);
        }

        if (detected) {
          setAdBlockDetected(true);
          setIsChecking(false);
          return;
        }

        // Method 2: Try fetching an ad server endpoint
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        try {
          await fetch(
            "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
            { signal: controller.signal, mode: "no-cors" }
          );
          clearTimeout(timeoutId);
          setAdBlockDetected(false);
        } catch (error) {
          clearTimeout(timeoutId);
          setAdBlockDetected(true);
        }

        setIsChecking(false);
      } catch (error) {
        setAdBlockDetected(false);
        setIsChecking(false);
      }
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(detectAdBlock, 100);
    return () => clearTimeout(timer);
  }, []);

  return { adBlockDetected, isChecking };
}
