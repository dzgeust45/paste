import { useState, useEffect } from "react";

export function useAdBlockDetection() {
  const [adBlockDetected, setAdBlockDetected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const detectAdBlock = async () => {
      try {
        // Method 1: Try to create a fake ad element
        const testElement = document.createElement("div");
        testElement.innerHTML = "&nbsp;";
        testElement.className = "ad-testing";
        testElement.style.display = "none";
        document.body.appendChild(testElement);

        // Check if the element was removed or hidden by ad blocker
        const detected = testElement.offsetHeight === 0;
        
        document.body.removeChild(testElement);

        // Method 2: Try to load a common ad server script
        if (!detected) {
          const script = document.createElement("script");
          script.src = "//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
          script.onerror = () => setAdBlockDetected(true);
          script.onload = () => setAdBlockDetected(false);
          document.head.appendChild(script);
          
          // Timeout after 2 seconds if no response
          setTimeout(() => {
            setAdBlockDetected(detected);
            setIsChecking(false);
            if (document.head.contains(script)) {
              document.head.removeChild(script);
            }
          }, 2000);
        } else {
          setAdBlockDetected(true);
          setIsChecking(false);
        }
      } catch (error) {
        setAdBlockDetected(true);
        setIsChecking(false);
      }
    };

    detectAdBlock();
  }, []);

  return { adBlockDetected, isChecking };
}
