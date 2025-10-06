import React from 'react';
import Image from 'next/image';

interface AboutIntroProps {
  headingSmall: string;
  headingLarge: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  yearsOfExperience?: number;
  imageSrc: string;
  bgShapeSrc?: string;
}

export default function AboutIntro({
  headingSmall,
  headingLarge,
  description,
  ctaLabel,
  ctaHref = '#',
  yearsOfExperience = 10,
  imageSrc,
  bgShapeSrc
}: AboutIntroProps) {
  return (
    <div className="relative py-[90px] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-[15px]">
        <div className="flex flex-wrap -mx-[15px]">
          <div className="w-full lg:w-1/2 px-[15px]">
            <div className="relative">
              <Image
                src={imageSrc}
                alt="about"
                width={500}
                height={400}
                data-tilt=""
                data-tilt-max="10"
                data-tilt-speed="1000"
                data-tilt-perspective="1000"
                style={{ transformStyle: 'preserve-3d' }}
                className="w-full h-auto rounded-[15px]"
              />
              
              {/* Experience Box - positioned exactly like original */}
              <div className="absolute bottom-[0px] left-[74px] flex items-center gap-[10px] pt-20">
                <p className="text-[50px] font-bold text-[#CD8973] leading-none">{yearsOfExperience}</p>
                <p className="text-[24px] font-semibold text-[#000] font-['Archivo']">Years of Experience</p>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 px-[15px]">
            <div className="py-1 pl-8">
              <h5 className="text-[18px] font-normal text-[#CD8973] pb-[3px] mb-[15px] tracking-wide transition-all duration-300 hover:text-[#2d5016]">
                {headingSmall}
              </h5>
              <h3 className="text-[32px] font-bold text-[#000] mb-[30px] leading-[1.2] transition-all duration-300 hover:text-[#CD8973]">
                {headingLarge}
              </h3>
              <p className="text-[16px] leading-[1.8] mb-[30px] text-[#666] transition-all duration-300 hover:text-[#000]">
                {description}
              </p>
              {ctaLabel ? (
                <a 
                  href={ctaHref} 
                  className="ayur-btn"
                >
                  {ctaLabel}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Decorative Shapes - Side Trees */}
      <div className="absolute pointer-events-none inset-0 -z-10">
        {/* Left side shape */}
        <div className="absolute -top-[20px] left-0">
          <Image 
            src="/assets/images/bg-shape2.png" 
            alt="bg shape" 
            width={400} 
            height={400}
            className="opacity-70"
          />
        </div>
        
        {/* Right side leaf with animation */}
        <div className="absolute -top-[20px] right-0">
          <Image 
            src="/assets/images/bg-leaf2.png" 
            alt="bg leaf" 
            width={320} 
            height={320}
            className="opacity-80 jump-three"
          />
        </div>
      </div>
    </div>
  );
}