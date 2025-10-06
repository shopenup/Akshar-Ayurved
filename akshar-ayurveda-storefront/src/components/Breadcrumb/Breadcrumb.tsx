import React from 'react';
import Link from 'next/link';
type Crumb = {
  label: string;
  href?: string;
};
interface BreadcrumbProps {
  title: string;
  crumbs: Crumb[];
  imageSrc: string;
}
export default function Breadcrumb({ title, crumbs, imageSrc }: BreadcrumbProps) {
  return (
    <div
      className="z-10 top-0 left-0 w-full h-[400px] bg-cover bg-center bg-no-repeat py-[170px] px-0 flex items-center justify-center -my-[80px]"
      style={{
        backgroundImage: `url('${imageSrc}')`
      }}
    >
      <div className="relative z-[2]">
        <div className="max-w-[1200px] mx-auto px-[15px]">
          <div className="flex flex-wrap -mx-[15px]">
            <div className="w-full px-[15px]">
              <div className="text-center">
                <h2 className="text-[30px] font-bold text-white pb-2 capitalize">
                  {title}
                </h2>
                <div className="font-medium text-white inline-flex flex-wrap items-center gap-[10px] text-[18px]">
                  {crumbs.map((c, idx) => (
                    <span key={idx} className={idx === crumbs.length - 1 ? 'text-[#CD8973]' : 'text-white'}>
                      {c.href ? (
                        <Link href={c.href} className="text-[#CD8973] capitalize">
                          {c.label}
                        </Link>
                      ) : (
                        c.label
                      )}
                      {idx < crumbs.length - 1 && (
                        <span className="ml-[10px]">
                          <img src="/assets/images/arrow-svg.svg" alt="arrow" className="inline" />
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}