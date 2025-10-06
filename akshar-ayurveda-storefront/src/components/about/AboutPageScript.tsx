import { useEffect } from 'react';

export default function AboutPageScript() {
  useEffect(() => {
    // Initialize tilt effect for images with vanilla JS
    const initTilt = () => {
      const tiltElements = document.querySelectorAll('[data-tilt]');
      tiltElements.forEach((element) => {
        if (element instanceof HTMLElement) {
          const maxTilt = parseInt(element.getAttribute('data-tilt-max') || '10');
          const speed = parseInt(element.getAttribute('data-tilt-speed') || '1000');
          const perspective = parseInt(element.getAttribute('data-tilt-perspective') || '1000');
          
          const handleMouseMove = (e: MouseEvent) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * maxTilt;
            const rotateY = ((centerX - x) / centerX) * maxTilt;
            
            element.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            element.style.transition = 'none';
          };
          
          const handleMouseLeave = () => {
            element.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`;
            element.style.transition = `transform ${speed}ms ease-out`;
          };
          
          element.addEventListener('mousemove', handleMouseMove);
          element.addEventListener('mouseleave', handleMouseLeave);
        }
      });
    };

    // Initialize counter animation with vanilla JS
    const initCounters = () => {
      const counters = document.querySelectorAll('.ayur-counting');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counter = entry.target as HTMLElement;
            const target = parseInt(counter.getAttribute('data-to') || '0');
            const duration = 2000;
            const startTime = performance.now();
            
            const animateCounter = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easeOutQuart = 1 - Math.pow(1 - progress, 4);
              const current = Math.floor(target * easeOutQuart);
              
              counter.textContent = current.toString();
              
              if (progress < 1) {
                requestAnimationFrame(animateCounter);
              } else {
                counter.textContent = target.toString();
              }
            };
            
            requestAnimationFrame(animateCounter);
            observer.unobserve(counter);
          }
        });
      }, { threshold: 0.5 });
      
      counters.forEach((counter) => observer.observe(counter));
    };

    // Initialize smooth scrolling for anchor links
    const initSmoothScroll = () => {
      const links = document.querySelectorAll('a[href^="#"]');
      links.forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href')?.substring(1);
          const targetElement = document.getElementById(targetId || '');
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });
    };

    // Initialize video popup functionality
    const initVideoPopup = () => {
      const playButtons = document.querySelectorAll('.ayur-video-playicon');
      const popups = document.querySelectorAll('.ayur-popup');
      const closeButtons = document.querySelectorAll('.close');
      
      playButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
          if (popups[index]) {
            (popups[index] as HTMLElement).style.display = 'flex';
            document.body.style.overflow = 'hidden';
          }
        });
      });
      
      closeButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
          if (popups[index]) {
            (popups[index] as HTMLElement).style.display = 'none';
            document.body.style.overflow = 'auto';
          }
        });
      });
      
      // Close popup when clicking outside
      popups.forEach((popup) => {
        popup.addEventListener('click', (e) => {
          if (e.target === popup) {
            (popup as HTMLElement).style.display = 'none';
            document.body.style.overflow = 'auto';
          }
        });
      });
    };

    // Initialize all effects
    initTilt();
    initCounters();
    initSmoothScroll();
    initVideoPopup();

    // Cleanup function
    return () => {
      const tiltElements = document.querySelectorAll('[data-tilt]');
      tiltElements.forEach((element) => {
        element.removeEventListener('mousemove', () => {});
        element.removeEventListener('mouseleave', () => {});
      });
    };
  }, []);

  return null;
}
