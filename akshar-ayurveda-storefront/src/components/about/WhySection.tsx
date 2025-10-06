import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface WhyPoint {
  text: string;
}

interface WhySectionProps {
  headingSmall: string;
  headingLarge: string;
  leftItems: { iconSrc: string; title: string; subtitle: string }[];
  title: string;
  paragraphTop: string;
  points: WhyPoint[];
  paragraphBottom: string;
  videoThumbSrc: string;
  videoUrl: string;
  bgShapes?: string[];
}

export default function WhySection({
  headingSmall,
  headingLarge,
  leftItems,
  title,
  paragraphTop,
  points,
  paragraphBottom,
  videoThumbSrc,
  videoUrl,
  bgShapes
}: WhySectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative py-[80px] pb-[100px] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-[15px]">
        <div className="flex flex-wrap -mx-[15px]">
          <div className="w-full px-[15px]">
            <div className="text-center mb-[22px]">
              <h5 className="text-[18px] font-normal text-[#CD8973] pb-[3px] mb-[15px]">
                {headingSmall}
              </h5>
              <h3 className="text-[32px] font-bold text-[#000] mb-0 leading-[1.2]">
                {headingLarge}
              </h3>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap -mx-[15px] items-start">
          <div className="w-full lg:w-1/2 px-[15px] py-5">
            <div className="flex flex-wrap gap-[25px] justify-center">
              {leftItems.map((it, idx) => (
                <div key={idx} className="group max-w-[265px] p-[30px_15px] bg-white border border-[#FFEBE4] text-center rounded-[10px] transition-all duration-300 hover:shadow-[3px_4px_29.6px_0px_rgba(0,0,0,0.1)] hover:-translate-y-[5px]">
                  <div className="w-[65px] h-[65px] flex items-center justify-center rounded-full bg-[#CD8973] shadow-[4px_4px_10.5px_0px_rgba(205,137,115,0.3)] text-center mx-auto mb-[10px] transition-all duration-300 group-hover:rotate-y-360">
                    <Image src={it.iconSrc} alt="icon" width={48} height={48} />
                  </div>
                  <div>
                    <h4 className="text-[18px] font-semibold text-[#222222] mb-[5px]">
                      {it.title}
                    </h4>
                    <p className="text-[#797979] text-[16px] leading-[1.6] m-0">
                      {it.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full lg:w-1/2 px-[15px]">
            <div className="py-5">
              <h3 className="text-[24px] font-bold text-[#000] mb-[15px] leading-[1.3]">
                {title}
              </h3>
              <p className="text-[#797979] text-[16px] leading-[1.6] mb-[19px]">
                {paragraphTop}
              </p>
              <ul className="flex flex-wrap gap-x-4 justify-center sm:justify-between mb-[19px]">
                {points.map((p, idx) => (
                  <li key={idx} className="flex items-center p-[10px_0] gap-[5px]">
                    <Image src="/assets/images/tick.png" alt="icon" width={18} height={18} />
                    <p className="text-[#797979] text-[16px] m-0">{p.text}</p>
                  </li>
                ))}
              </ul>
              <p className="text-[#797979] text-[16px] leading-[1.6] mb-[10px]">
                {paragraphBottom}
              </p>
              <div className="p-[10px_0_0]">
                <Link 
                  href="/services" 
                  className="ayur-btn"
                >
                  Read More
                </Link>
              </div>
            </div>
          </div>
          <div className="w-full px-[15px]">
            <div className="p-[50px_0_0] rounded-[10px]">
              <div className="relative">
                <Image src={videoThumbSrc} alt="video" width={1200} height={520} className="w-full h-auto rounded-[10px]" />
                <a 
                  href="#" 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] flex items-center justify-center rounded-full bg-[#CD8973] transition-all duration-300 hover:scale-110"
                  onClick={(e) => { e.preventDefault(); setOpen(true); }}
                >
                  <Image src="/assets/images/play-icon.svg" alt="play" width={24} height={24} />
                </a>
                {open ? (
                  <div 
                    className="fixed top-0 left-0 w-full h-full bg-black/60 z-[999] flex items-center justify-center"
                    onClick={() => setOpen(false)}
                  >
                    <div 
                      className="relative max-w-[600px] w-full mx-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span 
                        className="absolute -top-3 -right-6 text-[24px] text-[#000] bg-white cursor-pointer h-[30px] w-[30px] flex items-center justify-center rounded-full z-[10000]"
                        onClick={() => setOpen(false)}
                      >
                        ×
                      </span>
                      <iframe 
                        src={videoUrl} 
                        frameBorder="0" 
                        allowFullScreen 
                        className="w-full h-[400px] rounded-[8px]"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Background Decorative Shapes - Side Trees */}
      <div className="absolute pointer-events-none inset-0 -z-10">
        {/* Right side shape */}
        <div className="absolute bottom-[2%] right-0">
          <Image 
            src="/assets/images/bg-shape4.png" 
            alt="bg shape" 
            width={400} 
            height={400}
            className="opacity-70"
          />
        </div>
        
        {/* Left side leaf with animation */}
        <div className="absolute bottom-[26%] left-0">
          <Image 
            src="/assets/images/bg-leaf4.png" 
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