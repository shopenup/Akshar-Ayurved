import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Map } from '../ui';
import { getCategoriesList } from '@lib/shopenup/categories';

interface Category {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategoriesList();
        ////console.log('Footer - Categories data:', categoriesData);
        
        // Filter and limit to first 5 categories for footer
        const filteredCategories = categoriesData
          ?.product_categories?.filter((cat: Category) => cat.is_active !== false)
          ?.slice(0, 5) || [];
        
        setCategories(filteredCategories);
      } catch (error) {
        console.error('Error fetching categories for footer:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);


  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-green-400 mb-4">AKSHAR AYURVED</h3>
            <p className="text-gray-300 mb-6 max-w-md">
              Akshar Ayurved was established in 2002 with the vision of delivering pure and authentic Classical and Patent Ayurvedic Medicines, embodying two decades of excellence in holistic healthcare.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-300">
                  D 14 15 INDUSTRIAL AREA,UPSIDC<br />
                  FIROZABAD-283203 UP INDIA
                </span>
              </div>
              
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-300">+919412721980</span>
              </div>
              
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-300">aksharayurved@rediffmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-green-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-green-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-300 hover:text-green-400 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="text-gray-300 hover:text-green-400 transition-colors">
                  Blogs
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-300 hover:text-green-400 transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-green-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Product Categories</h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link 
                    href={`/products/category/${category.id}`} 
                    className="text-gray-300 hover:text-green-400 transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 border-t border-gray-700 pt-8">
          <h4 className="text-lg font-semibold mb-4">Find Us</h4>
          <Map 
            address="D 14 15 INDUSTRIAL AREA,UPSIDC FIROZABAD-283203 UP INDIA"
            height="h-64"
            lat={27.1519}
            lng={78.3957}
            zoom={16}
          />
        </div>

        {/* Social Media & Legal Links */}
        <div className="mt-8 border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Social Media */}
            {/* <div className="flex space-x-4 mb-4 md:mb-0">
              {socialMediaLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div> */}

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center space-x-6 text-sm">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-green-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/return-refund" className="text-gray-400 hover:text-green-400 transition-colors">
                Return & Refund
              </Link>
              <Link href="/terms-conditions" className="text-gray-400 hover:text-green-400 transition-colors">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-gray-950 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400 text-sm">
            <p>&copy; {currentYear} ShopenUp Ayurveda. All rights reserved.</p>
            <p className="mt-1">Authentic Ayurvedic Medicines & Wellness Products</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
