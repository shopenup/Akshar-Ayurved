import React from 'react';
import Breadcrumb from '@components/about/Breadcrumb';
import AboutIntro from '@components/about/AboutIntro';
import WhyChoose from '@components/about/WhyChoose';
import Achievements from '@components/about/Achievements';
import WhySection from '@components/about/WhySection';
import NewsletterStrip from '@components/about/NewsletterStrip';
import AboutPageScript from '@components/about/AboutPageScript';
import AboutPageHead from '@components/about/AboutPageHead';

export default function AboutPage() {
  return (
    <>
      <AboutPageHead />

      {/* Breadcrumb */}
      <Breadcrumb title="About Us" crumbs={[{ label: 'Home', href: '/' }, { label: 'About Us' }]} imageSrc="/assets/images/bredcrumb-bg.jpg" />

      {/* Intro (Mission + Vision condensed) */}
      <AboutIntro
        headingSmall="Who We Are"
        headingLarge="The Natural Way To Achieving Balance And Optimal Health"
        description="To become a global ayurvedic healthcare organization and to be recognized as domestic and internationally by providing research based, affordable quality pure and genuine ayurvedic products for larger global population. Along with the progress of science, it is our endeavor to provide the best Ayurvedic medicine to the patient according to today's circumstances by converting the old principles of Ayurveda medicines into new forms for new diseases, so that we can present formulations through our continuous research work. While doing so, we can contribute to the service of the suffering human being."
        ctaLabel="Know More"
        ctaHref="/about"
        yearsOfExperience={10}
        imageSrc="/assets/images_New/why-choose.png"
        bgShapeSrc="/assets/images/bg-shape2.png"
      />

      {/* Why Choose Us */}
      <WhyChoose
        headingSmall="Why Choose Us"
        headingLarge="Nature's secret for your truly health"
        description="Bridging ancient wisdom with modern wellness for a healthier tomorrow"
        items={[
          { title: 'Authentic Products', description: 'Sourced from traditional manufacturers', iconSrc: '/assets/images/checkmark.png' },
          { title: 'Expert Guidance', description: 'Certified Ayurvedic practitioners', iconSrc: '/assets/images/checkmark.png' }
        ]}
        imageSrc="/assets/images/why-choose.png"
        bgLeafSrc="/assets/images/bg-leaf2.png"
      />

      {/* Achievements */}
      <Achievements
        headingSmall="Our Recent Achievements"
        headingLarge="Benefit From Choosing The Best"
        stats={[
          { iconSrc: '/assets/images/achieve-icon1.png', value: '25', label: 'Years Experience' },
          { iconSrc: '/assets/images/achieve-icon2.png', value: '60 +', label: 'Happy Customers' },
          { iconSrc: '/assets/images/achieve-icon3.png', value: '800 +', label: 'Our Products' },
          { iconSrc: '/assets/images/achieve-icon4.png', value: '100%', label: 'Product Purity' }
        ]}
      />

      {/* Why Section + video */}
      <WhySection
        headingSmall="Best For You"
        headingLarge="Why Pure Ayurveda"
        leftItems={[
          { iconSrc: '/assets/images/why-icon1.png', title: '100 % Organic', subtitle: 'Duis aute irure dolor in reprehenderit in voluptate velit' },
          { iconSrc: '/assets/images/why-icon2.png', title: 'Best Quality', subtitle: 'Duis aute irure dolor in reprehenderit in voluptate velit' },
          { iconSrc: '/assets/images/why-icon3.png', title: 'Hygienic Product', subtitle: 'Duis aute irure dolor in reprehenderit in voluptate velit' },
          { iconSrc: '/assets/images/why-icon4.png', title: 'Health Care', subtitle: 'Duis aute irure dolor in reprehenderit in voluptate velit' }
        ]}
        title="Solve Your Problem with The Power of Nature"
        paragraphTop="What started as a small family business has grown into a trusted destination for Ayurvedic wellness, serving thousands of customers across India. We remain committed to our roots while embracing innovation to better serve our community."
        points={[
          { text: 'Authentic Products — Sourced from traditional manufacturers' },
          { text: 'Expert Guidance — Certified Ayurvedic practitioners' },
          { text: 'Quality Assurance — Rigorous testing and certification' },
          { text: 'Personalized Care — Tailored to your dosha profile' }
        ]}
        paragraphBottom="Every product we offer is carefully selected and tested to ensure it meets our high standards for quality, safety, and effectiveness. We work directly with certified Ayurvedic practitioners and traditional manufacturers to bring you the best of Ayurveda."
        videoThumbSrc="/assets/images_New/bredcrumb-bg.jpg"
        videoUrl="https://www.youtube.com/embed/_eq7kgVsliE"
        bgShapes={["/assets/images_New/bg-shape4.png", "/assets/images_New/bg-leaf4.png"]}
      />

      {/* Newsletter strip */}
      {/* <div className="bg-[#1a3d0f] py-[80px] relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-[15px]">
          <NewsletterStrip title="Sign Up To Get Updates & News About Us.." />
            </div>
          </div> */}
      
      {/* Initialize page scripts */}
      <AboutPageScript />
    </>
  );
}
