import React from 'react';
import Image from 'next/image';

interface StatItem {
  iconSrc: string;
  value: string; // allow suffixes like 60 +, 100%
  label: string;
}

interface AchievementsProps {
  headingSmall: string;
  headingLarge: string;
  stats: StatItem[];
}

export default function Achievements({ headingSmall, headingLarge, stats }: AchievementsProps) {
  return (
    <div 
      className="py-[50px] sm:py-[80px] max-w-[1820px] mx-auto"
      style={{
        backgroundImage: "url('/assets/images/achievement-bg.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      <div className="max-w-[1200px] mx-auto px-[15px]">
        <div className="flex flex-wrap -mx-[15px] items-center">
          <div className="w-full lg:w-1/3 px-[15px]">
            <div className="py-5">
              <h5 className="text-[16px] sm:text-[18px] font-normal text-[#CD8973] pb-[3px] mb-[12px] sm:mb-[15px]">
                {headingSmall}
              </h5>
              <h3 className="text-[24px] sm:text-[32px] font-bold text-[#000] mb-0 leading-[1.2]">
                {headingLarge}
              </h3>
            </div>
          </div>
          <div className="w-full lg:w-2/3 px-[15px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] sm:gap-[30px] w-full">
              {stats.map((s, idx) => (
                <div 
                  key={idx} 
                  className="group w-full max-w-[370px] rounded-[5px] bg-white border border-[#FFEBE4] grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] p-[16px] sm:p-[24px] transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
                >
                  <div className="w-[60px] h-[60px] sm:w-[75px] sm:h-[75px] rounded-full flex items-center justify-center bg-[#CD8973] shadow-[4px_4px_10.5px_0px_rgba(205,137,115,0.3)] transition-all duration-300 group-hover:rotate-y-360">
                    <Image src={s.iconSrc} alt="icon" width={40} height={40} className="sm:w-[48px] sm:h-[48px]" />
                  </div>
                  <div className="relative border-l border-[#F0F0F0] pl-[16px] sm:pl-[29px]">
                    <h2 
                      className="text-[22px] sm:text-[30px] leading-tight font-extrabold text-[#222222] mb-0 ayur-counting break-words" 
                      data-to={s.value.replace(/[^0-9]/g, '')}
                    >
                      {s.value}
                    </h2>
                    <p className="text-[#797979] text-[14px] sm:text-[16px] m-0 font-normal">
                      {s.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}