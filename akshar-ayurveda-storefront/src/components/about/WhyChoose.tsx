import React from 'react';
import Image from 'next/image';

interface WhyItem {
  title: string;
  description: string;
  iconSrc: string;
}

interface WhyChooseProps {
  headingSmall: string;
  headingLarge: string;
  description: string;
  items: WhyItem[];
  imageSrc: string;
  bgLeafSrc?: string;
}

export default function WhyChoose({ headingSmall, headingLarge, description, items, imageSrc, bgLeafSrc }: WhyChooseProps) {
  return (
    <div className="relative py-[10px] pb-[80px] bg-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-[15px]">
        <div className="flex flex-wrap -mx-[15px]">
          <div className="w-full lg:w-1/2 px-[15px]">
            <div className="py-2 pl-5">
              <h5 className="text-[18px] font-normal text-[#CD8973] pb-[3px] mb-[15px]">
                {headingSmall}
              </h5>
              <h3 className="text-[32px] font-bold text-[#000] mb-[30px]">
                {headingLarge}
              </h3>
              <p className="text-[16px] leading-[1.8] mb-[30px]">
                {description}
              </p>
              <div className="mt-[30px]">
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-[75px_1fr] items-center mb-[10px]">
                    <div className="w-[75px] h-[75px] flex items-center justify-center rounded-full">
                      <Image 
                        src={item.iconSrc} 
                        alt="checkmark" 
                        width={64} 
                        height={64}
                        className=""
                      />
                    </div>
                    <div>
                      <h3 className="text-[18px] font-semibold text-[#222222] mb-[5px]">
                        {item.title}
                      </h3>
                      <p className="p-0 m-0">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 px-[15px]">
            <div className="relative mb-0">
              <Image 
                src={imageSrc} 
                alt="why choose" 
                width={600} 
                height={600} 
                data-tilt="" 
                data-tilt-max="8" 
                data-tilt-speed="1000" 
                data-tilt-perspective="1000" 
                style={{ transformStyle: 'preserve-3d' }}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Decorative Shapes - Side Trees */}
      <div className="absolute pointer-events-none inset-0 -z-10">
        {/* Right side leaf with animation */}
        <div className="absolute -top-[35%] right-0 left-auto">
          <Image 
            src="/assets/images/bg-leaf2.png" 
            alt="bg leaf" 
            width={300} 
            height={300}
            className="opacity-20 jump-three"
          />
        </div>
      </div>
    </div>
  );
}


