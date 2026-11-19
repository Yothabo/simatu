import { useEffect } from 'react';

export function useTouchSelection() {
  useEffect(() => {
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartTime = Date.now();
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchDuration = Date.now() - touchStartTime;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      // Calculate distance moved
      const distance = Math.sqrt(
        Math.pow(touchEndX - touchStartX, 2) + Math.pow(touchEndY - touchStartY, 2)
      );

      // If it was a quick tap (< 200ms) AND didn't move much (< 10px), prevent selection
      if (touchDuration < 200 && distance < 10) {
        // Temporarily disable selection
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';

        // Re-enable after a tiny delay so the native long-press selection works
        setTimeout(() => {
          document.body.style.userSelect = '';
          document.body.style.webkitUserSelect = '';
        }, 50);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
}
