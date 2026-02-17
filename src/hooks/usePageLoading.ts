import { useState, useEffect } from 'react';

/**
 * Custom hook for managing page loading state
 * Waits for images, videos, and fonts to load before hiding the loading screen
 */
export const usePageLoading = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if it's a search engine bot
    const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(
      navigator.userAgent
    );

    if (isBot) {
      // Don't show loading screen for bots
      setLoading(false);
      return;
    }

    let resourcesLoaded = 0;
    const totalResources = {
      images: 0,
      videos: 0,
      fonts: 0,
    };

    // Track image loading
    const images = document.querySelectorAll('img');
    totalResources.images = images.length;

    // Track video loading
    const videos = document.querySelectorAll('video');
    totalResources.videos = videos.length;

    // Track font loading
    if (document.fonts) {
      totalResources.fonts = 1;
    }

    // Calculate total resource count
    const totalResourceCount =
      totalResources.images + totalResources.videos + totalResources.fonts;

    // Update progress function
    function updateProgress() {
      if (totalResourceCount > 0) {
        const newProgress = (resourcesLoaded / totalResourceCount) * 100;
        setProgress(Math.min(newProgress, 100));
      }
    }

    // Create image promises
    const imagePromises = Array.from(images).map((img) => {
      return new Promise((resolve) => {
        if (img.complete) {
          resourcesLoaded++;
          updateProgress();
          resolve(true);
        } else {
          img.addEventListener('load', () => {
            resourcesLoaded++;
            updateProgress();
            resolve(true);
          });
          img.addEventListener('error', () => {
            resourcesLoaded++;
            updateProgress();
            resolve(true);
          });
        }
      });
    });

    // Create video promises
    const videoPromises = Array.from(videos).map((video) => {
      return new Promise((resolve) => {
        if (video.readyState >= 3) {
          // HAVE_FUTURE_DATA or greater
          resourcesLoaded++;
          updateProgress();
          resolve(true);
        } else {
          video.addEventListener('canplaythrough', () => {
            resourcesLoaded++;
            updateProgress();
            resolve(true);
          });
          video.addEventListener('error', () => {
            resourcesLoaded++;
            updateProgress();
            resolve(true);
          });
        }
      });
    });

    // Handle font loading
    if (document.fonts) {
      document.fonts.ready.then(() => {
        resourcesLoaded++;
        updateProgress();
      }).catch(() => {
        resourcesLoaded++;
        updateProgress();
      });
    }

    // Wait for all resources or timeout after 3 seconds
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 3000);

    Promise.all([...imagePromises, ...videoPromises]).then(() => {
      // Add a small delay for smooth transition
      setTimeout(() => {
        setLoading(false);
        clearTimeout(timeoutId);
      }, 500);
    });

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return { loading, progress };
};
