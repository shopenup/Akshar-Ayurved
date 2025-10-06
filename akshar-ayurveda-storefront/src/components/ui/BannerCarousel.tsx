import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

interface Banner {
  id: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  backgroundImage?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
  textColor?: string;
}

interface BannerCarouselProps {
  banners: Banner[];
  autoPlay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  height?: string;
  className?: string;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  autoPlay = true,
  interval = 6000,
  showArrows = true,
  showDots = true,
  height = 'h-[860px]',
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      banners.length === 0
        ? 0
        : prevIndex === banners.length - 1
          ? 0
          : prevIndex + 1
    );
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      banners.length === 0
        ? 0
        : prevIndex === 0
          ? banners.length - 1
          : prevIndex - 1
    );
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, nextSlide, banners.length]);

  useEffect(() => {
    if (currentIndex > banners.length - 1) {
      setCurrentIndex(0);
    }
  }, [banners.length, currentIndex]);

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <div className={`relative overflow-visible bg-transparent ${className}`}>
      {/* Banner Section */}
      <div className="relative w-full bg-[#F8F5F2] py-10 sm:py-14 md:py-[60px] h-[520px] sm:h-[620px] md:h-[720px] mb-[0px]" style={{ backgroundImage: 'url(/assets/images_New/banner-bg.png)', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
        {/* Background floating leaf */}
        <div className="relative top-0 left-[52px] right-0 mx-auto z-0 w-fit max-w-full animate-bounce">
          {/* <Image
            src="/assets/images_New/banner-bgleaf.png"
            alt="floating leaf"
            width={360}
            height={360}
            className="opacity-90"
          /> */}
        </div>

        {/* Decorative Leaves */}
        <div className="absolute inset-0 animate-leafFloatLeft pointer-events-none z-[1]">
          {/* Top-left leaf */}
          <Image
            src="/assets/images_New/ban-leafleft.png"
            alt="decorative leaf"
            width={300}
            height={300}
            className="absolute top-0 left-0 float-left-leaf w-28 h-28 sm:w-44 sm:h-44 md:w-72 md:h-72"
          />
          {/* Bottom-right leaf */}
          <Image
            src="/assets/images_New/ban-leafright.png"
            alt="decorative leaf"
            width={300}
            height={300}
            className="absolute right-0 bottom-0 float-right-leaf w-28 h-28 sm:w-44 sm:h-44 md:w-72 md:h-72"
          />

        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Banner Heading */}
          <div className="max-w-[1000px] text-center mx-auto relative z-10 mt-32 sm:mt-12 md:mt-20 md:pt-20">
            <h1 className="font-extrabold text-[#1F2937] tracking-tight mx-auto text-[28px] leading-[36px] sm:text-[38px] sm:leading-[46px] md:text-[56px] md:leading-[64px]">
              We Are Here To Give You The <br/>
              <span className="text-[#CD8973] text-2xl sm:text-3xl md:text-4xl pb-0">Best Herb Products</span>
            </h1>
            <p className="text-[#6B7280] mx-auto mt-0 md:mt-5 mb-2 md:mb-8 max-w-[900px] text-sm sm:text-base md:text-lg leading-relaxed">
              Shop authentic Ayurvedic remedies, wellness herbs, and natural personal care—sourced from trusted brands and delivered fresh to your door.
            </p>
            <a href="/products" className="inline-block min-w-[130px] sm:min-w-[145px] max-w-full rounded-[22px] bg-[#CD8973] min-h-[40px] sm:min-h-[45px] border border-[#f2efec] text-sm sm:text-base text-white font-medium text-center  px-4 py-2 hover:bg-[#B8755F] transition-colors duration-300">
              Shop Now
            </a>
          </div>

          {/* Banner Slider Section at bottom (overlapping next section) */}
          <div className="relative left-1/2 -translate-x-1/2 -bottom-16 sm:-bottom-20 md:-bottom-10 w-full px-4 z-[80] mt-8 sm:mt-12">
            <div className="relative mx-auto max-w-6xl pb-0">
              <div className="relative mx-auto bg-[#C88573] h-[140px] sm:h-[220px] md:h-[350px] rounded-[80px] sm:rounded-[120px] md:rounded-[160px] shadow-[0_30px_60px_rgba(0,0,0,0.18)] overflow-visible flex items-center justify-center z-[30]">
                <div className="relative w-[92%] sm:w-[87%] h-[115%] sm:h-[120%] translate-y-[-10%] z-[70] overflow-hidden ">
                  <div className="relative w-full h-full">
                    <Image
                      src={currentBanner.image || '/assets/images_New/ban-head-Image.png'}
                      alt="banner product"
                      fill
                      className="object-contain transition-all duration-700 ease-in-out transform"
                      sizes="(max-width: 640px) 85vw, (max-width: 1024px) 70vw, 640px"
                      style={{
                        animation: 'continuousSlide 8s ease-in-out infinite'
                      }}
                    />
                  </div>
                </div>
                {showArrows && banners.length > 1 && (
                  <>
                    <button 
                      type="button" 
                      className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white shadow-lg border border-white/60 transition-colors duration-200 text-[#C77B62] hover:text-[#B8755F]" 
                      aria-label="Previous"
                      onClick={prevSlide}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 6l-6 6 6 6" stroke="currentColor"/></svg>
                    </button>
                    <button 
                      type="button" 
                      className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white shadow-lg border border-white/60 transition-colors duration-200 text-[#C77B62] hover:text-[#B8755F]" 
                      aria-label="Next"
                      onClick={nextSlide}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18l6-6-6-6" stroke="currentColor"/></svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        {showDots && banners.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                    ? 'bg-[#CD8973] scale-125'
                    : 'bg-white/50 hover:bg-white/70'
                  }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerCarousel;