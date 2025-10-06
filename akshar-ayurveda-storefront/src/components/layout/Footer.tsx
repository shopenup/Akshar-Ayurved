import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCategoriesList } from '@lib/shopenup/categories';
import { blogService, type BlogArticle } from '../../lib/shopenup/blog';
import { sdk } from '../../lib/config';

interface Category {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentPosts, setRecentPosts] = useState<Array<{ id: string; title: string; date: string; image: string }>>([]);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategoriesList();
        
        // Filter and limit to first 5 categories for footer
        const filteredCategories = categoriesData
          ?.product_categories?.filter((cat: Category) => cat.is_active !== false)
          ?.slice(0, 5) || [];
        
        setCategories(filteredCategories);
      } catch (error) {
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const articles = await blogService.getPublishedArticles();
        const posts = articles.slice(0, 2).map((a: BlogArticle) => ({
          id: a.id,
          title: a.title,
          date: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          image: a.thumbnail_image || '/assets/images/footer-blog1.png'
        }));
        setRecentPosts(posts);
      } catch (e) {
        setRecentPosts([]);
      }
    };
    fetchBlogs();
  }, []);


  const handleSubscribe = async () => {
  setIsSubmitting(true);
  setSuccess(false);
  setError("");

  try {
    const res = await sdk.client.fetch<{ success: boolean; error?: string }>(
      "/store/custom/contact",
      {
        method: "POST",
        body: { email }, // send email
        next: { tags: ["newsletter-subscribe"] },
      }
    );

    if (res.success) {
      setSuccess(true);
      setEmail(""); // clear input
    } else {
      setError(res.error || "Failed to subscribe");
    }
  } catch (err: any) {
    setError(err.message || "Failed to subscribe");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <footer className="relative bg-[#20120D] text-slate-100 pt-10">
      {/* Newsletter Signup */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 px-0">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white leading-snug text-center md:text-left">Sign Up To Get Updates & <br/> News About Us..</h3>
          <form className="w-full md:flex-1 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="w-full sm:flex-1">
              <input type="email" placeholder="Enter Your Email..."  value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 sm:px-7 py-3 sm:py-4 rounded-full bg-white/95 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C77B62] shadow-md text-sm sm:text-base" />
            </div>
            <button type="button" onClick={handleSubscribe} className="w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full bg-[#C77B62] hover:bg-[#b5725f] text-white font-semibold shadow-md flex-shrink-0 text-sm sm:text-base">Subscribe</button>
          </form>
        </div>
        <div className="mt-6 h-px w-full bg-[#3A2A23]"></div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
            <div className="lg:col-span-1">
            <div className="mb-4">
              <h3 className="text-3xl md:text-4xl font-semibold text-[#CD8973] leading-tight">
                Akshar<br />Ayurveda
              </h3>
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed text-sm">
              Akshar Ayurved was established in 2002 with the vision of delivering pure and authentic Classical and Patent Ayurvedic Medicines, embodying two decades of excellence in holistic healthcare.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="facebook" className="w-9 h-9 grid place-items-center rounded-full bg-transparent">
                <svg width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.74157 20V10.8777H9.80231L10.2615 7.32156H6.74157V5.05147C6.74157 4.0222 7.02622 3.32076 8.50386 3.32076L10.3854 3.31999V0.13923C10.06 0.0969453 8.94308 0 7.64308 0C4.92848 0 3.07002 1.65697 3.07002 4.69927V7.32156H0V10.8777H3.07002V20H6.74157Z" fill="#C77B62"/></svg>
              </a>
              <a href="#" aria-label="x" className="w-9 h-9 grid place-items-center rounded-full bg-transparent">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.8138 8.46864L19.0991 0H17.3727L11.0469 7.3532L5.9944 0H0.166992L7.8073 11.1193L0.166992 20H1.89349L8.57377 12.2348L13.9095 20H19.7369L11.8133 8.46864H11.8138ZM9.4491 11.2173L8.67498 10.1101L2.51557 1.29967H5.16736L10.1381 8.40994L10.9122 9.51718L17.3735 18.7594H14.7218L9.4491 11.2177V11.2173Z" fill="#C77B62"/></svg>
              </a>
              <a href="#" aria-label="pinterest" className="w-9 h-9 grid place-items-center rounded-full bg-transparent">
                <svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.89667 0C3.41417 0.000833333 0.5 3.51333 0.5 7.34333C0.5 9.11917 1.4925 11.335 3.08167 12.0375C3.535 12.2417 3.475 11.9925 3.865 10.5008C3.88295 10.4406 3.88454 10.3766 3.8696 10.3156C3.85466 10.2545 3.82374 10.1985 3.78 10.1533C1.50833 7.52583 3.33667 2.12417 8.5725 2.12417C16.15 2.12417 14.7342 12.6092 9.89083 12.6092C8.6425 12.6092 7.7125 11.6292 8.00667 10.4167C8.36333 8.9725 9.06167 7.42 9.06167 6.37917C9.06167 3.75583 5.15333 4.145 5.15333 7.62083C5.15333 8.695 5.53333 9.42 5.53333 9.42C5.53333 9.42 4.27583 14.5 4.0425 15.4492C3.6475 17.0558 4.09583 19.6567 4.135 19.8808C4.15917 20.0042 4.2975 20.0433 4.375 19.9417C4.49917 19.7792 6.01917 17.6108 6.445 16.0433C6.6 15.4725 7.23583 13.1558 7.23583 13.1558C7.655 13.9125 8.86333 14.5458 10.1508 14.5458C13.9808 14.5458 16.7492 11.1792 16.7492 7.00167C16.7358 2.99667 13.3083 0 8.89667 0Z" fill="#C77B62"/></svg>
              </a>
              <a href="#" aria-label="instagram" className="w-9 h-9 grid place-items-center rounded-full bg-transparent">
                <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.4996 0H5.49988C2.75019 0 0.5 2.25019 0.5 4.99988V15.0001C0.5 17.7491 2.75019 20 5.49988 20H15.4996C18.2493 20 20.4995 17.7491 20.4995 15.0001V4.99988C20.4995 2.25019 18.2493 0 15.4996 0ZM18.8328 15.0001C18.8328 16.8376 17.3381 18.3333 15.4996 18.3333H5.49988C3.66218 18.3333 2.16671 16.8376 2.16671 15.0001V4.99988C2.16671 3.16193 3.66218 1.66671 5.49988 1.66671H15.4996C17.3381 1.66671 18.8328 3.16193 18.8328 4.99988V15.0001Z" fill="#C77B62"/><path d="M15.9172 5.83295C16.6075 5.83295 17.1672 5.27332 17.1672 4.58298C17.1672 3.89264 16.6075 3.33301 15.9172 3.33301C15.2269 3.33301 14.6672 3.89264 14.6672 4.58298C14.6672 5.27332 15.2269 5.83295 15.9172 5.83295Z" fill="#C77B62"/><path d="M10.4999 5C7.73793 5 5.5 7.23818 5.5 9.99988C5.5 12.7606 7.73793 15.0002 10.4999 15.0002C13.261 15.0002 15.4998 12.7606 15.4998 9.99988C15.4998 7.23818 13.261 5 10.4999 5ZM10.4999 13.3335C8.65915 13.3335 7.16671 11.8411 7.16671 9.99988C7.16671 8.15866 8.65915 6.66671 10.4999 6.66671C12.3406 6.66671 13.833 8.15866 13.833 9.99988C13.833 11.8411 12.3406 13.3335 10.4999 13.3335Z" fill="#C77B62"/></svg>
              </a>
            </div>
          </div>

          {/* Categories (replaces Useful Links) */}
          <div>
            <h4 className="text-lg md:text-xl font-semibold text-white mb-3">Product Categories</h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link href={`/products/category/${category.id}`} className="text-gray-300 hover:text-[#C77B62] transition-colors text-sm">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg md:text-xl font-semibold text-white mb-3">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Image src="/assets/images/location.png" alt="location" width={20} height={20} />
                <p className="text-gray-300 text-sm">D 14 15 INDUSTRIAL AREA,UPSIDC<br />FIROZABAD-283203 UP INDIA</p>
              </li>
              <li className="flex items-center gap-3">
                <Image src="/assets/images/mobile.png" alt="phone" width={20} height={20} />
                <p className="text-gray-300 text-sm">+919412721980</p>
              </li>
              <li className="flex items-center gap-3">
                <Image src="/assets/images/email.png" alt="email" width={20} height={20} />
                <p className="text-gray-300 text-sm">aksharayurved@rediffmail.com</p>
              </li>
            </ul>
          </div>

          {/* Recent Blog */}
          <div className="px-0">
            <h4 className="text-lg md:text-xl font-semibold text-white mb-3">Recent Blog</h4>
            <ul className="space-y-4">
              {recentPosts.map((post) => (
                <li key={post.id} className="flex items-center gap-3">
                  <div className="relative w-20 h-16 rounded-md overflow-hidden flex-shrink-0">
                    <Image src={post.image} alt={post.title} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{post.date}</p>
                    <Link href={`/blogs/${post.id}`} className="text-sm text-slate-100 hover:text-[#C77B62] leading-snug">
                      {post.title}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 mt-8 border-t border-[#3A2A23] text-center text-gray-300 text-xs">
          <p>Copyright © {currentYear}. All Right Reserved. Akshar Ayurveda</p>
        </div>
      </div>

      {/* Background shapes */}
      <div className="pointer-events-none select-none absolute inset-0 z-0">
        <Image src="/assets/images/footer-left.png" alt="bg left" width={320} height={260} className="hidden md:block absolute left-0 bottom-0 object-contain" />
        <Image src="/assets/images/footer-right.png" alt="bg right" width={420} height={820} className="hidden md:block absolute right-0 top-0 h-full w-auto object-contain" />
      </div>
    </footer>
  );
}
