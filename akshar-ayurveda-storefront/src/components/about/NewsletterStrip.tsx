import React from 'react';

interface NewsletterStripProps {
  title: string;
  onSubmit?: (email: string) => void;
}

export default function NewsletterStrip({ title, onSubmit }: NewsletterStripProps) {
  const [email, setEmail] = React.useState('');
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit?.(email);
  }
  return (
    <div className="mb-[60px]">
      <div className="flex flex-wrap -mx-[15px] items-center">
        <div className="w-full md:w-1/3 px-[15px]">
          <div className="py-5">
            <h3 className="text-[32px] font-bold text-white mb-0 leading-[1.2]">
              {title}
            </h3>
          </div>
        </div>
        <div className="w-full md:w-2/3 px-[15px]">
          <form className="flex flex-wrap -mx-[15px] items-center" onSubmit={handleSubmit}>
            <div className="flex-1 px-[15px]">
              <input 
                type="email" 
                className="w-full h-[60px] px-5 py-3 text-white bg-transparent border border-white/30 rounded-[10px] text-[16px] placeholder:text-white/70 focus:border-[#CD8973] focus:outline-none"
                placeholder="Enter Your Email..." 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="px-[15px]">
              <button 
                type="submit" 
                className="bg-[#ffd700] text-[#2d5016] py-[18px] px-[40px] rounded-[50px] font-semibold text-[16px] transition-all duration-300 border-2 border-[#ffd700] uppercase tracking-[1px] hover:bg-transparent hover:text-[#ffd700] whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


