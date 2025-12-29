import { Component, OnInit, OnDestroy, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Lenis from 'lenis';

declare var gsap: any;
declare var ScrollTrigger: any;
declare var SplitText: any;

interface SplitTextInstance {
  words: HTMLElement[];
}

interface VideoSection {
  service: string;
  featured: string;
  category: string;
  videoUrl: string;
  posterUrl?: string;
}

interface GalleryItem {
  image: string;
  title: string;
  category: string;
}

interface GalleryDetailData {
  title: string;
  category: string;
  image: string;
  description: string;
  longDescription: string;
  stats: {
    label: string;
    value: string;
  }[];
  completedWorks: {
    image: string;
    title: string;
    description: string;
  }[];
  features: string[];
}
@Component({
  selector: 'app-container',
  standalone: false,
  templateUrl: './container.component.html',
  styleUrl: './container.component.scss'
})
export class ContainerComponent  {
  private lenis: Lenis | null = null;
  private soundManager: any;
  private splitTexts: { [key: string]: SplitTextInstance } = {};
  private currentSection = 0;
  private isAnimating = false;
  private isSnapping = false;
  private lastProgress = 0;
  private scrollDirection = 0;
  private sectionPositions: number[] = [];
  private mainScrollTrigger: any;
  private isBrowser: boolean;
  private videoElements: HTMLVideoElement[] = [];
  private videosLoaded = 0;
  private totalVideos = 6;
  private textAnimations: any[] = [];
  isDetailOpen = false;
  selectedDetail: GalleryDetailData | null = null;


private setupTextRevealAnimations(): void {
  if (typeof gsap === 'undefined' || typeof SplitText === 'undefined') return;

  // HERO SECTION - Company name already animated in loading screen, skip here
  
 
  // Tagline - Simple elegant fade
  this.animateSimpleFade('.about-tagline p', 0.2);
  
  // Description main - Character wave effect for elegance
  this.animateWaveEffect('.desc-main', 0.4);
  
  // Description secondary - Word scale for emphasis
  this.animateScaleFade('.desc-secondary', 0.5);
  
  // Stat labels - Elastic bounce for playfulness
  this.animateElasticBounce('.stat-label', 0.1);
  
  // SERVICES SECTION ANIMATIONS
  // Intro heading - Line by line reveal
  this.animateLineSlideUp('.intro-content h2', 0);
  
  // Intro description - Character rotation for modern feel
  this.animateCharRotation('.intro-description', 0.3);
  
  // Scroll hint - Simple fade
  this.animateSimpleFade('.scroll-hint', 0.5);
  
  // Gallery category - Masked slide
  this.animateMaskedSlide('.gallery-category', 0);
  
  // Gallery title - 3D rotation for impact
  this.animate3DRotation('.gallery-title', 0.1);
  
  // CTA SECTION
  // CTA heading - Line slide for emphasis
  this.animateLineSlideUp('.cta-content h4', 0);
  
  // CTA paragraph - Word scale
  this.animateScaleFade('.cta-content p', 0.3);
}

private animateSimpleFade(selector: string, delay: number = 0): void {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach((element) => {
    gsap.set(element, { opacity: 0, y: 30 });
    
    ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(element, {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: delay,
          ease: 'power3.out'
        });
      },
      once: true
    });
  });
}

private animateLineSlideUp(selector: string, delay: number = 0): void {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach((element) => {
    const childSplit = new SplitText(element, {
      type: 'lines',
      linesClass: 'split-child'
    });
    
    const parentSplit = new SplitText(element, {
      linesClass: 'split-parent'
    });
    
    gsap.set('.split-parent', { overflow: 'hidden' });
    gsap.set('.split-child', { display: 'inline-block' });
    
    gsap.set(childSplit.lines, { yPercent: 100, opacity: 0 });
    
    ScrollTrigger.create({
      trigger: element,
      start: 'top 85%', // Better timing
      onEnter: () => {
        gsap.to(childSplit.lines, {
          duration: 1.2,
          yPercent: 0,
          opacity: 1,
          ease: 'power4.out',
          stagger: 0.1,
          delay: delay
        });
      },
      once: true
    });
    
    this.textAnimations.push({ element, splits: [childSplit, parentSplit] });
  });
}
private animate3DRotation(selector: string, delay: number = 0): void {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach((element: any) => {
    gsap.set(element, { perspective: 800 });
    
    const split = new SplitText(element, { type: 'lines' });
    
    gsap.set(split.lines, {
      opacity: 0,
      rotationX: -90,
      transformOrigin: '50% 100%',
      y: 20
    });
    
    ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(split.lines, {
          duration: 1,
          opacity: 1,
          rotationX: 0,
          y: 0,
          ease: 'power3.out',
          stagger: 0.1,
          delay: delay
        });
      },
      once: true
    });
    
    this.textAnimations.push({ element, splits: [split] });
  });
}

private animateWaveEffect(selector: string, delay: number = 0): void {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach((element) => {
    const split = new SplitText(element, { type: 'chars' });
    
    gsap.set(split.chars, {
      opacity: 0,
      y: 50,
      rotationX: -90
    });
    
    ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(split.chars, {
          duration: 0.6,
          opacity: 1,
          y: 0,
          rotationX: 0,
          stagger: {
            each: 0.02,
            from: 'start'
          },
          ease: 'power2.out',
          delay: delay
        });
      },
      once: true
    });
    
    this.textAnimations.push({ element, splits: [split] });
  });
}

private animateScaleFade(selector: string, delay: number = 0): void {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach((element) => {
    const split = new SplitText(element, { type: 'words' });
    
    gsap.set(split.words, {
      scale: 0.8,
      opacity: 0
    });
    
    ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(split.words, {
          duration: 0.8,
          scale: 1,
          opacity: 1,
          ease: 'back.out(1.4)',
          stagger: 0.03,
          delay: delay
        });
      },
      once: true
    });
    
    this.textAnimations.push({ element, splits: [split] });
  });
}

private animateElasticBounce(selector: string, delay: number = 0): void {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach((element) => {
    const split = new SplitText(element, { type: 'chars' });
    
    gsap.set(split.chars, {
      opacity: 0,
      y: 30,
      scale: 0.5
    });
    
    ScrollTrigger.create({
      trigger: element,
      start: 'top 90%',
      onEnter: () => {
        gsap.to(split.chars, {
          duration: 1,
          opacity: 1,
          y: 0,
          scale: 1,
          ease: 'elastic.out(1, 0.6)',
          stagger: 0.03,
          delay: delay
        });
      },
      once: true
    });
    
    this.textAnimations.push({ element, splits: [split] });
  });
}

// 6. Typewriter Animation
private animateTypewriter(selector: string, delay: number = 0): void {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach((element) => {
    const split = new SplitText(element, { type: 'chars' });
    
    gsap.set(split.chars, { opacity: 0 });
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        once: true
      },
      delay: delay
    });
    
    split.chars.forEach((char: HTMLElement, i: number) => {
      tl.to(char, {
        opacity: 1,
        duration: 0.05,
        ease: 'none'
      }, i * 0.05);
    });
    
    this.textAnimations.push({ element, splits: [split] });
  });
}

private animateMaskedSlide(selector: string, delay: number = 0): void {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach((element: any) => {
    gsap.set(element, {
      clipPath: 'inset(0 100% 0 0)',
      opacity: 1
    });
    
    ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(element, {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.2,
          ease: 'power3.inOut',
          delay: delay
        });
      },
      once: true
    });
  });
}

private animateCharRotation(selector: string, delay: number = 0): void {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach((element) => {
    const split = new SplitText(element, { type: 'chars' });
    
    gsap.set(split.chars, {
      opacity: 0,
      rotationY: 90,
      transformOrigin: '50% 50%'
    });
    
    ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(split.chars, {
          duration: 0.8,
          opacity: 1,
          rotationY: 0,
          ease: 'back.out(1.4)',
          stagger: 0.02,
          delay: delay
        });
      },
      once: true
    });
    
    this.textAnimations.push({ element, splits: [split] });
  });
}

// Clean up method - call this in ngOnDestroy
private cleanupTextAnimations(): void {
  this.textAnimations.forEach(({ element, splits }) => {
    splits.forEach((split: any) => {
      if (split && split.revert) {
        split.revert();
      }
    });
  });
  this.textAnimations = [];
}
  
  sections: VideoSection[] = [
    { 
      service: 'Events', 
      featured: 'Captured Moments', 
      category: 'Exhibitions',
      videoUrl: 'HERO/exhibition.mp4',
      posterUrl: 'HERO/event.jpg'
    },
    { 
      service: 'Hospital', 
      featured: 'Medical Excellence', 
      category: 'Hospital',
      videoUrl: 'HERO/hospital.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&q=80'
    },
    { 
      service: 'Fashion', 
      featured: 'Style Stories', 
      category: 'Modeling',
      videoUrl: 'HERO/fashion.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=80'
    },
    { 
      service: 'Sports', 
      featured: 'Action Shots', 
      category: 'Athletics',
      videoUrl: 'HERO/F1.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1920&q=80'
    },
    { 
      service: 'Product', 
      featured: 'Commercial Vision', 
      category: 'Advertisement',
      videoUrl: 'HERO/advertisement.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&q=80'
    },
    { 
      service: 'Weddings', 
      featured: 'Love Stories', 
      category: 'Celebrations',
      videoUrl: 'HERO/Wedding.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80'
    }
  ];

  galleryItems: GalleryItem[] = [
    {
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&q=80',
      title: 'Events Coverage',
      category: 'Corporate & Social Events'
    },
    {
      image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&q=80',
      title: 'Hospital Shoots',
      category: 'Medical & Healthcare Photography'
    },
    {
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1920&q=80',
      title: 'Sports Photography',
      category: 'Action & Athletic Coverage'
    },
    {
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=80',
      title: 'Fashion Photography',
      category: 'Editorial & Runway Shoots'
    },
    {
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&q=80',
      title: 'Commercial & Product Shoots',
      category: 'Advertising & E-commerce'
    },
    {
      image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1920&q=80',
      title: 'Portraits & Lifestyle',
      category: 'Personal & Professional Portraits'
    },
    {
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80',
      title: 'Weddings & Engagements',
      category: 'Celebration Photography'
    },
    {
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80',
      title: 'Real Estate & Architecture',
      category: 'Property & Interior Photography'
    },
    {
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&q=80',
      title: 'Professional Editing & Retouching',
      category: 'Post-Production Services'
    }
  ];

  galleryDetailsData: { [key: string]: GalleryDetailData } = {
    'Events Coverage': {
      title: 'Events Coverage',
      category: 'Corporate & Social Events',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&q=80',
      description: 'Professional event photography capturing every significant moment',
      longDescription: 'Our event coverage service specializes in documenting corporate gatherings, social events, conferences, and exhibitions. With years of experience and cutting-edge equipment, we ensure every crucial moment is captured with precision and artistry. From candid shots to formal photography, we deliver comprehensive coverage that tells your event\'s complete story.',
      stats: [
        { label: 'Events Covered', value: '150+' },
        { label: 'Client Satisfaction', value: '98%' },
        { label: 'Team Members', value: '8' },
        { label: 'Years Experience', value: '10+' }
      ],
      completedWorks: [
        { image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80', title: 'Tech Summit 2024', description: 'Dubai International Conference Center' },
        { image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80', title: 'Corporate Gala', description: 'Annual Awards Ceremony' },
        { image: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800&q=80', title: 'Product Launch', description: 'Luxury Brand Event' },
        { image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80', title: 'Trade Exhibition', description: 'International Expo 2024' },
        { image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80', title: 'Networking Evening', description: 'Business Connect' },
        { image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80', title: 'Charity Fundraiser', description: 'Community Event' }
      ],
      features: [
        'Full event documentation from setup to conclusion',
        'Professional lighting and audio-visual equipment',
        'Real-time photo sharing and instant social media uploads',
        'Dedicated team of 2-4 photographers depending on event size',
        'High-resolution edited photos delivered within 48 hours',
        'Drone photography for outdoor events',
        '360-degree virtual tour creation',
        'Custom photo albums and digital galleries'
      ]
    },
    'Hospital Shoots': {
      title: 'Hospital & Medical Photography',
      category: 'Medical & Healthcare Photography',
      image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&q=80',
      description: 'Specialized medical and healthcare facility documentation',
      longDescription: 'We provide comprehensive medical photography services for hospitals, clinics, and healthcare facilities. Our expertise includes surgical documentation, facility photography, staff portraits, and patient care imagery. We understand the sensitivity and professionalism required in medical environments and deliver images that meet both marketing and documentation needs.',
      stats: [
        { label: 'Medical Facilities', value: '45+' },
        { label: 'Surgeries Documented', value: '200+' },
        { label: 'Certified Photographers', value: '5' },
        { label: 'Compliance Rate', value: '100%' }
      ],
      completedWorks: [
        { image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80', title: 'Sheikh Khalifa Hospital', description: 'Complete facility documentation' },
        { image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80', title: 'Cardiac Surgery Center', description: 'Operating room photography' },
        { image: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&q=80', title: 'Pediatric Ward', description: 'Patient care documentation' },
        { image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&q=80', title: 'Medical Equipment', description: 'Product photography for catalogs' },
        { image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80', title: 'Staff Portraits', description: 'Professional headshots for website' },
        { image: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&q=80', title: 'Emergency Department', description: 'Facility marketing imagery' }
      ],
      features: [
        'HIPAA and medical privacy compliance',
        'Sterile equipment and proper sanitization protocols',
        'Surgical procedure documentation',
        'Before and after medical photography',
        'Facility and equipment photography for marketing',
        'Staff and doctor professional portraits',
        'Patient testimonial photography (with consent)',
        'Medical research and publication imagery'
      ]
    },
    'Sports Photography': {
      title: 'Sports & Action Photography',
      category: 'Action & Athletic Coverage',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1920&q=80',
      description: 'Dynamic sports action and athletic event photography',
      longDescription: 'Capture the intensity, emotion, and peak moments of athletic competition with our specialized sports photography services. From motorsports to football, tennis to extreme sports, we use high-speed cameras and expert techniques to freeze action at its most dramatic. Perfect for athletes, teams, sponsors, and sports publications.',
      stats: [
        { label: 'Sporting Events', value: '300+' },
        { label: 'Action Shots', value: '50K+' },
        { label: 'Sports Covered', value: '25+' },
        { label: 'Pro Athletes', value: '100+' }
      ],
      completedWorks: [
        { image: 'https://images.unsplash.com/photo-1547941126-3d5322b218b0?w=800&q=80', title: 'F1 Abu Dhabi GP', description: 'High-speed motorsports coverage' },
        { image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80', title: 'Football Championship', description: 'Match day action shots' },
        { image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80', title: 'Tennis Open', description: 'Tournament photography' },
        { image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&q=80', title: 'Marathon Event', description: 'Endurance sports coverage' },
        { image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80', title: 'Basketball Finals', description: 'Indoor sports photography' },
        { image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80', title: 'Extreme Sports', description: 'Adventure photography' }
      ],
      features: [
        'High-speed camera equipment (up to 20fps burst mode)',
        'Telephoto lenses for distant action capture',
        'Low-light and indoor sports photography expertise',
        'Waterproof and weather-resistant equipment',
        'Real-time action shot delivery during events',
        'Athlete portraits and team photography',
        'Sponsor and promotional imagery',
        'Slow-motion video capture capabilities'
      ]
    },
    'Fashion Photography': {
      title: 'Fashion & Editorial Photography',
      category: 'Editorial & Runway Shoots',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=80',
      description: 'High-end fashion editorial and runway photography',
      longDescription: 'Elevate your fashion brand with stunning editorial photography that showcases clothing, accessories, and style in the most captivating way. Our fashion photography services include runway coverage, lookbook creation, editorial shoots, and e-commerce product photography. We work with designers, models, and brands to create imagery that sells and inspires.',
      stats: [
        { label: 'Fashion Shows', value: '80+' },
        { label: 'Lookbooks Created', value: '120+' },
        { label: 'Brand Collaborations', value: '60+' },
        { label: 'Editorial Features', value: '40+' }
      ],
      completedWorks: [
        { image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80', title: 'Luxury Fashion Week', description: 'Runway photography Dubai' },
        { image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80', title: 'Spring Collection 2024', description: 'Editorial lookbook shoot' },
        { image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80', title: 'Haute Couture', description: 'Designer collection photography' },
        { image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', title: 'Streetwear Campaign', description: 'Urban fashion editorial' },
        { image: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800&q=80', title: 'Model Portfolio', description: 'Professional model comp cards' },
        { image: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=800&q=80', title: 'Accessories Shoot', description: 'Jewelry and accessories photography' }
      ],
      features: [
        'Studio and on-location fashion shoots',
        'Professional lighting and backdrop setup',
        'Collaboration with makeup artists and stylists',
        'High-resolution retouching and color grading',
        'Runway and backstage event coverage',
        'Model portfolio development',
        'E-commerce product photography',
        'Lookbook and catalog creation',
        'Creative direction and styling consultation'
      ]
    },
    'Commercial & Product Shoots': {
      title: 'Commercial & Product Photography',
      category: 'Advertising & E-commerce',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&q=80',
      description: 'Professional product and commercial advertising photography',
      longDescription: 'Transform your products into visual masterpieces that drive sales and engagement. Our commercial photography services cater to e-commerce businesses, advertising agencies, and brands looking for high-quality product imagery. From simple white background shots to complex lifestyle photography, we create images that convert browsers into buyers.',
      stats: [
        { label: 'Products Shot', value: '5K+' },
        { label: 'E-commerce Clients', value: '90+' },
        { label: 'Ad Campaigns', value: '150+' },
        { label: 'Conversion Increase', value: '35%' }
      ],
      completedWorks: [
        { image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', title: 'Tech Product Launch', description: 'Electronics advertising campaign' },
        { image: 'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=800&q=80', title: 'Luxury Watches', description: 'High-end product photography' },
        { image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80', title: 'Cosmetics Campaign', description: 'Beauty product advertising' },
        { image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80', title: 'E-commerce Catalog', description: 'Multi-product photography session' },
        { image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', title: 'Footwear Collection', description: 'Lifestyle product shots' },
        { image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80', title: 'Food & Beverage', description: 'Culinary product photography' }
      ],
      features: [
        '360-degree product photography',
        'White background and lifestyle shots',
        'Packshot photography for e-commerce',
        'Detailed macro photography',
        'Light painting and creative product styling',
        'CGI and composite imaging',
        'Amazon and marketplace-compliant images',
        'Infographic and size comparison shots',
        'Video product demonstrations',
        'Batch processing for large catalogs'
      ]
    },
    'Portraits & Lifestyle': {
      title: 'Portrait & Lifestyle Photography',
      category: 'Personal & Professional Portraits',
      image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1920&q=80',
      description: 'Professional portraits and lifestyle photography sessions',
      longDescription: 'Capture your personality, brand, or special moments with our professional portrait and lifestyle photography. Whether you need corporate headshots, family portraits, personal branding images, or lifestyle photography for social media, we create authentic and compelling imagery that tells your unique story.',
      stats: [
        { label: 'Portraits Created', value: '2K+' },
        { label: 'Family Sessions', value: '500+' },
        { label: 'Corporate Clients', value: '120+' },
        { label: 'Satisfaction Rate', value: '99%' }
      ],
      completedWorks: [
        { image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', title: 'Executive Portraits', description: 'C-suite professional headshots' },
        { image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80', title: 'Personal Branding', description: 'Entrepreneur lifestyle shoot' },
        { image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800&q=80', title: 'Family Portraits', description: 'Multi-generational family session' },
        { image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80', title: 'Artist Portraits', description: 'Creative professional photography' },
        { image: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=800&q=80', title: 'Lifestyle Session', description: 'Authentic daily life moments' },
        { image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80', title: 'Professional Headshots', description: 'LinkedIn and corporate profiles' }
      ],
      features: [
        'Studio and environmental portrait sessions',
        'Professional makeup and styling guidance',
        'Multiple outfit and background changes',
        'Natural and studio lighting options',
        'Personal branding consultation',
        'Family and group photography',
        'Pet portrait sessions',
        'Maternity and newborn photography',
        'High-end retouching and editing',
        'Print-ready and digital delivery formats'
      ]
    },
    'Weddings & Engagements': {
      title: 'Wedding & Engagement Photography',
      category: 'Celebration Photography',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80',
      description: 'Timeless wedding and engagement photography',
      longDescription: 'Your wedding day deserves to be captured with artistry, emotion, and precision. Our wedding photography services document every precious moment—from intimate preparations to grand celebrations. We blend documentary-style coverage with artistic portraits to create a complete visual story of your special day that you\'ll treasure forever.',
      stats: [
        { label: 'Weddings Captured', value: '400+' },
        { label: 'Happy Couples', value: '400+' },
        { label: 'Countries Covered', value: '8' },
        { label: 'Average Rating', value: '5.0' }
      ],
      completedWorks: [
        { image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80', title: 'Luxury Beach Wedding', description: 'Dubai destination wedding' },
        { image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80', title: 'Palace Wedding', description: 'Grand traditional ceremony' },
        { image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80', title: 'Garden Engagement', description: 'Romantic outdoor session' },
        { image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80', title: 'Desert Wedding', description: 'Unique UAE landscape wedding' },
        { image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80', title: 'Cultural Celebration', description: 'Multi-cultural wedding ceremony' },
        { image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80', title: 'Intimate Ceremony', description: 'Small private wedding' }
      ],
      features: [
        'Full-day wedding coverage (8-12 hours)',
        'Engagement and pre-wedding sessions',
        'Bridal preparation and detail shots',
        'Ceremony and reception documentation',
        'Drone photography for aerial views',
        'Second photographer for comprehensive coverage',
        'Same-day sneak peek images',
        'Professionally edited high-resolution gallery',
        'Custom wedding albums and prints',
        'Destination wedding packages available'
      ]
    },
    'Real Estate & Architecture': {
      title: 'Real Estate & Architecture Photography',
      category: 'Property & Interior Photography',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80',
      description: 'Professional property and architectural photography',
      longDescription: 'Showcase properties and architectural designs at their absolute best with our specialized real estate photography. We create stunning images that highlight spaces, capture light, and present properties in the most appealing way. Perfect for real estate agents, property developers, architects, and interior designers.',
      stats: [
        { label: 'Properties Shot', value: '800+' },
        { label: 'Sq Meters Covered', value: '2M+' },
        { label: 'Real Estate Agents', value: '150+' },
        { label: 'Faster Sales', value: '40%' }
      ],
      completedWorks: [
        { image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80', title: 'Luxury Villa', description: 'High-end residential property' },
        { image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', title: 'Modern Apartment', description: 'Contemporary interior photography' },
        { image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', title: 'Architectural Design', description: 'New development showcase' },
        { image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', title: 'Commercial Space', description: 'Office building photography' },
        { image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80', title: 'Hotel Interior', description: 'Hospitality photography' },
        { image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80', title: 'Construction Progress', description: 'Development documentation' }
      ],
      features: [
        'HDR photography for balanced exposures',
        'Twilight and blue hour photography',
        'Drone aerial photography and videography',
        '360-degree virtual tours',
        'Professional interior staging guidance',
        'Floor plan photography',
        'Detail shots of key features',
        'Fast turnaround (24-48 hours)',
        'MLS-compliant image sizes',
        'Video walkthroughs and cinematic tours'
      ]
    },
    'Professional Editing & Retouching': {
      title: 'Professional Editing & Retouching',
      category: 'Post-Production Services',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&q=80',
      description: 'Expert photo editing and post-production services',
      longDescription: 'Transform your images with our professional editing and retouching services. Using industry-standard software and techniques, we enhance, retouch, and perfect your photographs to meet the highest standards. From basic color correction to advanced compositing and beauty retouching, we deliver polished, publication-ready images.',
      stats: [
        { label: 'Images Edited', value: '100K+' },
        { label: 'Retouching Projects', value: '3K+' },
        { label: 'Turnaround Time', value: '24-48h' },
        { label: 'Client Return Rate', value: '92%' }
      ],
      completedWorks: [
        { image: 'https://images.unsplash.com/photo-1591779051696-1c3fa1469a79?w=800&q=80', title: 'Beauty Retouching', description: 'High-end skin retouching' },
        { image: 'https://images.unsplash.com/photo-1626863905121-3b0c0ed7b94c?w=800&q=80', title: 'Color Grading', description: 'Cinematic color treatment' },
        { image: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&q=80', title: 'Composite Imaging', description: 'Creative photo manipulation' },
        { image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80', title: 'Product Enhancement', description: 'Commercial retouching' },
        { image: 'https://images.unsplash.com/photo-1555421689-3f034debb7a6?w=800&q=80', title: 'Restoration', description: 'Old photo restoration and colorization' },
        { image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&q=80', title: 'Batch Editing', description: 'Large volume color correction' }
      ],
      features: [
        'Professional color correction and grading',
        'Skin retouching and beauty enhancement',
        'Background removal and replacement',
        'Object removal and cleanup',
        'HDR processing and exposure blending',
        'Frequency separation retouching',
        'Dodge and burn techniques',
        'Sharpening and noise reduction',
        'Format conversion and resizing',
        'RAW file processing',
        'Batch processing for large volumes',
        'Print file preparation'
      ]
    }
  };

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    
    this.initSoundManager();
    
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    setTimeout(() => {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          this.preloadVideos();
        });
      } else {
        this.preloadVideos();
      }
    }, 500);
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;

 this.cleanupTextAnimations();
    this.videoElements.forEach(video => {
      video.pause();
      video.src = '';
      video.load();
    });

    if (this.lenis) {
      this.lenis.destroy();
    }
    if (this.mainScrollTrigger) {
      this.mainScrollTrigger.kill();
    }
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
    }
  }

openGalleryDetail(item: GalleryItem): void {
  console.log('Opening detail for:', item); // Debug log
  const detailData = this.galleryDetailsData[item.title];
  console.log('Detail data found:', detailData); // Debug log
  
  if (detailData) {
    this.selectedDetail = detailData;
    this.isDetailOpen = true;
    console.log('Modal should be open:', this.isDetailOpen); // Debug log
  } else {
    console.error('No detail data found for:', item.title); // Error log
  }
}
 closeGalleryDetail(): void {
  console.log('Closing detail'); // Debug log
  this.isDetailOpen = false;
  setTimeout(() => {
    this.selectedDetail = null;
  }, 500);
}

  private preloadVideos(): void {
    const loadingCounter = document.getElementById('loading-counter');
    let loadedCount = 0;

    this.sections.forEach((section, index) => {
      const video = document.getElementById(`background-video-${index}`) as HTMLVideoElement;
      if (!video) return;

      this.videoElements[index] = video;
      
      video.preload = 'auto';
      video.playsInline = true;
      video.muted = true;
      video.loop = true;
      
      const onCanPlay = () => {
        loadedCount++;
        const progress = Math.floor((loadedCount / this.totalVideos) * 100);
        if (loadingCounter) {
          loadingCounter.textContent = `[${progress.toString().padStart(2, '0')}]`;
        }
        
        if (loadedCount === this.totalVideos) {
          this.onAllVideosLoaded();
        }
        
        video.removeEventListener('canplaythrough', onCanPlay);
      };

      video.addEventListener('canplaythrough', onCanPlay);
      
      const onError = () => {
        console.error(`Failed to load video ${index}`);
        loadedCount++;
        if (loadedCount === this.totalVideos) {
          this.onAllVideosLoaded();
        }
        video.removeEventListener('error', onError);
      };
      
      video.addEventListener('error', onError);
      
      video.load();
    });
  }

  private onAllVideosLoaded(): void {
    setTimeout(() => {
      this.hideLoadingScreen();
    }, 300);
  }

  private hideLoadingScreen(): void {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (!loadingOverlay) return;

    const timeline = gsap.timeline({
      onComplete: () => {
        loadingOverlay.style.display = 'none';
        this.initLenis();
        this.initPage();
      }
    });

    timeline
      .to('.logo-mask', {
        scaleY: 0,
        duration: 1.2,
        ease: 'power4.inOut'
      }, 0)
      .to('.logo-image', {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'power3.out'
      }, 0.3)
      .to('.glow-effect', {
        opacity: 1,
        scale: 1.2,
        duration: 1.5,
        ease: 'power2.out'
      }, 0.4);

    const chars = document.querySelectorAll('.char');
    timeline.to(chars, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: {
        each: 0.05,
        from: 'start'
      },
      ease: 'power3.out'
    }, 0.8);

    timeline.to('.company-tagline', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, 1.2);

    timeline.to('.loading-progress', {
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out'
    }, 1.4);

    timeline.to('.progress-bar', {
      width: '100%',
      duration: 0.8,
      ease: 'power2.inOut'
    }, 1.6);

    timeline.to('.loading-content', {
      scale: 0.95,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.inOut'
    }, 2.6)
    .to(loadingOverlay, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut'
    }, 2.8);
  }

  private initSoundManager(): void {
    this.soundManager = {
      sounds: {},
      isEnabled: false,
      loadSound: (name: string, url: string, volume = 1) => {
        const audio = new Audio(url);
        audio.preload = 'auto';
        audio.volume = volume;
        this.soundManager.sounds[name] = audio;
      },
      enableAudio: () => {
        if (!this.soundManager.isEnabled) {
          this.soundManager.isEnabled = true;
        }
      },
      play: (soundName: string, delay = 0) => {
        if (this.soundManager.isEnabled && this.soundManager.sounds[soundName]) {
          if (delay > 0) {
            setTimeout(() => {
              this.soundManager.sounds[soundName].currentTime = 0;
              this.soundManager.sounds[soundName].play().catch(() => {});
            }, delay);
          } else {
            this.soundManager.sounds[soundName].currentTime = 0;
            this.soundManager.sounds[soundName].play().catch(() => {});
          }
        }
      }
    };

    this.soundManager.loadSound('hover', 'https://assets.codepen.io/7558/click-reverb-001.mp3', 1);
    this.soundManager.loadSound('click', 'https://assets.codepen.io/7558/shutter-fx-001.mp3', 1);
    this.soundManager.loadSound('textChange', 'https://assets.codepen.io/7558/whoosh-fx-001.mp3', 1);
  }

  private initLenis(): void {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false
    });

    this.lenis.on('scroll', ScrollTrigger.update);
    
    gsap.ticker.add((time: number) => {
      if (this.lenis) {
        this.lenis.raf(time * 1000);
      }
    });
    gsap.ticker.lagSmoothing(0);
  }

private initPage(): void {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof SplitText === 'undefined') {
    console.error('GSAP libraries not loaded');
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);
  
  gsap.registerEase("customEase", function(t: number) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  });

  this.animateColumns();
  this.setupHeaderFooterAnimations(); 
  this.setupScrollTriggers();
  this.setupHorizontalGalleryScroll();
  this.setupPortfolioAnimations();
   this.setupAboutSectionAnimations();
    this.setupTextRevealAnimations();
  
  if (this.videoElements[0]) {
    this.videoElements[0].play().catch(() => {});
  }
}

private setupHeaderFooterAnimations(): void {
  if (typeof gsap === 'undefined') return;

  // Animate header letters
  const headerLetters = document.querySelectorAll('.header-letter');
  
  gsap.set(headerLetters, {
    clipPath: 'inset(100% 0 0 0)',
    opacity: 1
  });

  gsap.to(headerLetters, {
    clipPath: 'inset(0% 0 0 0)',
    duration: 1.2,
    ease: 'power2.out',
    stagger: 0.05,
    delay: 0.3
  });

  // Animate footer letters with ScrollTrigger
  const footerLetters = document.querySelectorAll('.footer-letter');

  gsap.set(footerLetters, {
    clipPath: 'inset(100% 0 0 0)',
    opacity: 1
  });

  ScrollTrigger.create({
    trigger: '.footer',
    start: 'top 80%',
    onEnter: () => {
      gsap.to(footerLetters, {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.2,
        ease: 'power2.out',
        stagger: 0.05
      });
    },
    once: true
  });
}

  private animateColumns(): void {
    const serviceItems = document.querySelectorAll('.service');
    const categoryItems = document.querySelectorAll('.category');
    
    serviceItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('loaded');
      }, index * 60);
    });
    
    categoryItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('loaded');
      }, index * 60 + 200);
    });
  }

 private setupScrollTriggers(): void {
  const duration = 0.64;
  const fixedContainer = document.getElementById('fixed-container');
  const fixedSectionElement = document.querySelector('.fixed-section') as HTMLElement;
  const header = document.querySelector('.header');
  const content = document.querySelector('.content') as HTMLElement;
  const footer = document.getElementById('footer');
  const leftColumn = document.getElementById('left-column');
  const rightColumn = document.getElementById('right-column');
  const featured = document.getElementById('featured');
  const progressFill = document.getElementById('progress-fill');

  const featuredContents = document.querySelectorAll('.featured-content');
  featuredContents.forEach((content, index) => {
    const h3 = content.querySelector('h3');
    if (h3) {
      const split = new SplitText(h3, {
        type: 'words',
        wordsClass: 'split-word'
      });
      this.splitTexts[`featured-${index}`] = split;
      
      split.words.forEach((word: HTMLElement) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'word-mask';
        wrapper.style.display = 'inline-block';
        wrapper.style.overflow = 'hidden';
        word.parentNode!.insertBefore(wrapper, word);
        wrapper.appendChild(word);
        
        if (index !== 0) {
          gsap.set(word, { yPercent: 100, opacity: 0 });
        } else {
          gsap.set(word, { yPercent: 0, opacity: 1 });
        }
      });
    }
  });

  gsap.set(fixedContainer, { height: '100vh' });

  const fixedSectionTop = fixedSectionElement.offsetTop;
  const fixedSectionHeight = fixedSectionElement.offsetHeight;
  
  for (let i = 0; i < 6; i++) {
    this.sectionPositions.push(fixedSectionTop + (fixedSectionHeight * i) / 6);
  }

  this.mainScrollTrigger = ScrollTrigger.create({
    trigger: '.fixed-section',
    start: 'top top',
    end: 'bottom bottom',
    pin: '.fixed-container',
    pinSpacing: true,
    onUpdate: (self: any) => {
      if (this.isSnapping) return;
      
      const progress = self.progress;
      const progressDelta = progress - this.lastProgress;
      
      if (Math.abs(progressDelta) > 0.001) {
        this.scrollDirection = progressDelta > 0 ? 1 : -1;
      }
      
      const targetSection = Math.min(5, Math.floor(progress * 6));
      
      if (targetSection !== this.currentSection && !this.isAnimating) {
        const nextSection = this.currentSection + (targetSection > this.currentSection ? 1 : -1);
        this.snapToSection(nextSection);
      }
      
      this.lastProgress = progress;
      const sectionProgress = this.currentSection / 5;
      if (progressFill) {
        progressFill.style.width = `${sectionProgress * 100}%`;
      }
    }
  });

  // FIX: Improved end section scroll trigger with proper content centering for all resolutions
  ScrollTrigger.create({
    trigger: '.end-section',
    start: 'top center',
    end: 'bottom bottom',
    onUpdate: (self: any) => {
      if (self.progress > 0.1) {
        footer?.classList.add('blur');
        leftColumn?.classList.add('blur');
        rightColumn?.classList.add('blur');
        featured?.classList.add('blur');
        
        const newHeight = Math.max(0, 100 - ((self.progress - 0.1) / 0.9) * 100);
        gsap.to(fixedContainer, {
          height: `${newHeight}vh`,
          duration: 0.1,
          ease: 'power1.out'
        });
        
        // Responsive moveY calculation based on screen size
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
        
        let moveYMultiplier = 200; // Desktop default
        if (isMobile) {
          moveYMultiplier = 100; // Reduced movement for mobile
        } else if (isTablet) {
          moveYMultiplier = 150; // Medium movement for tablet
        }
        
        const moveY = (-(self.progress - 0.1) / 0.9) * moveYMultiplier;
        
        // FIX: Proper content positioning that maintains center alignment
        gsap.to(header, { 
          y: moveY * 1.5, 
          duration: 0.1, 
          ease: 'power1.out',
          force3D: true
        });
        
        // FIX: Keep content perfectly centered on all devices
        gsap.to(content, { 
          y: moveY, 
          duration: 0.1, 
          ease: 'power1.out',
          force3D: true,
          clearProps: 'transform' // Prevents transform accumulation
        });
        
        gsap.to(footer, { 
          y: moveY * 0.5, 
          duration: 0.1, 
          ease: 'power1.out',
          force3D: true
        });
      } else {
        footer?.classList.remove('blur');
        leftColumn?.classList.remove('blur');
        rightColumn?.classList.remove('blur');
        featured?.classList.remove('blur');
        
        gsap.to(fixedContainer, { 
          height: '100vh', 
          duration: 0.1, 
          ease: 'power1.out' 
        });
        
        gsap.to(header, { 
          y: 0, 
          duration: 0.1, 
          ease: 'power1.out',
          force3D: true,
          clearProps: 'transform'
        });
        
        // FIX: Reset content to center position
        gsap.to(content, { 
          y: 0, 
          duration: 0.1, 
          ease: 'power1.out',
          force3D: true,
          clearProps: 'transform'
        });
        
        gsap.to(footer, { 
          y: 0, 
          duration: 0.1, 
          ease: 'power1.out',
          force3D: true,
          clearProps: 'transform'
        });
      }
    },
    invalidateOnRefresh: true // Recalculates on window resize
  });

  this.updateProgressNumbers();
}


// Add this method to your ContainerComponent class

private setupAboutSectionAnimations(): void {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Logo Animation - Scale and Fade In
  gsap.from('.about-logo', {
    scrollTrigger: {
      trigger: '.about-logo-section',
      start: 'top 80%',
      end: 'top 50%',
      toggleActions: 'play none none reverse'
    },
    scale: 0.5,
    opacity: 0,
    rotation: -15,
    duration: 1.2,
    ease: 'back.out(1.7)'
  });

 
  // Tagline Animation - Fade and Slide
  gsap.from('.about-tagline', {
    scrollTrigger: {
      trigger: '.about-tagline',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    y: 30,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  // Description Paragraphs - Staggered Reveal
  gsap.from('.desc-main', {
    scrollTrigger: {
      trigger: '.about-description',
      start: 'top 75%',
      toggleActions: 'play none none reverse'
    },
    y: 60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  });

  gsap.from('.desc-secondary', {
    scrollTrigger: {
      trigger: '.about-description',
      start: 'top 70%',
      toggleActions: 'play none none reverse'
    },
    y: 60,
    opacity: 0,
    duration: 1,
    delay: 0.2,
    ease: 'power3.out'
  });

  // Stats Section - Counting Number Animation from 0 to Target
  const statItems = document.querySelectorAll('.stat-item');
  
  statItems.forEach((item, index) => {
    // Animate the container
    gsap.from(item, {
      scrollTrigger: {
        trigger: '.about-stats',
        start: 'top 70%',
        toggleActions: 'play none none reverse'
      },
      y: 50,
      opacity: 0,
      scale: 0.8,
      duration: 0.8,
      delay: index * 0.15,
      ease: 'back.out(1.7)'
    });

    // NUMBER COUNTING ANIMATION - 0 to Real Value
    const statNumber = item.querySelector('.stat-number') as HTMLElement;
    if (statNumber) {
      const dataTarget = statNumber.getAttribute('data-target');
      
      if (dataTarget) {
        const targetValue = parseInt(dataTarget);
        const suffix = statNumber.textContent?.replace(/[0-9]/g, '') || '';
        
        // Start from 0
        statNumber.textContent = '0' + suffix;
        
        ScrollTrigger.create({
          trigger: '.about-stats',
          start: 'top 70%',
          onEnter: () => {
            // Animate counting from 0 to target number
            gsap.to({ value: 0 }, {
              value: targetValue,
              duration: 2.5,
              delay: index * 0.1,
              ease: 'power1.out',
              onUpdate: function() {
                const currentValue = Math.floor(this.targets()[0].value);
                statNumber.textContent = currentValue + suffix;
              },
              onComplete: () => {
                // Final exact value
                statNumber.textContent = targetValue + suffix;
                
                // Pulse effect on completion
                gsap.timeline()
                  .to(statNumber, { 
                    scale: 1.15, 
                    color: '#dc2626',
                    duration: 0.2, 
                    ease: 'power2.out' 
                  })
                  .to(statNumber, { 
                    scale: 1, 
                    color: '#dc2626',
                    duration: 0.3, 
                    ease: 'elastic.out(1, 0.5)' 
                  });
              }
            });
          },
          once: true
        });
      }
    }

    // Animate the label
    const statLabel = item.querySelector('.stat-label') as HTMLElement;
    if (statLabel) {
      gsap.from(statLabel, {
        scrollTrigger: {
          trigger: '.about-stats',
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: index * 0.1 + 0.4,
        ease: 'power2.out'
      });
    }
  });

  // Stat Dividers - Grow Animation
  gsap.from('.stat-divider', {
    scrollTrigger: {
      trigger: '.about-stats',
      start: 'top 70%',
      toggleActions: 'play none none reverse'
    },
    scaleY: 0,
    opacity: 0,
    duration: 0.6,
    stagger: 0.15,
    ease: 'power2.out'
  });

  // Background Elements - Parallax Effect
  gsap.to('.circle-1', {
    scrollTrigger: {
      trigger: '.about-container',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1
    },
    y: -100,
    rotation: 45,
    ease: 'none'
  });

  gsap.to('.circle-2', {
    scrollTrigger: {
      trigger: '.about-container',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1
    },
    y: 100,
    rotation: -45,
    ease: 'none'
  });

  // Grid Background Fade
  gsap.from('.bg-grid', {
    scrollTrigger: {
      trigger: '.about-container',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    duration: 1.5,
    ease: 'power2.out'
  });
}




  private setupHorizontalGalleryScroll(): void {
    const galleryPinWrap = document.querySelector('.gallery-pin-wrap') as HTMLElement;
    
    if (galleryPinWrap) {
      const galleryWidth = galleryPinWrap.scrollWidth;
      const horizontalScrollLength = galleryWidth - window.innerWidth;

      gsap.to('.gallery-pin-wrap', {
        scrollTrigger: {
          trigger: '.gallery-section',
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => `+=${galleryWidth}`,
          anticipatePin: 1,
          invalidateOnRefresh: true
        },
        x: -horizontalScrollLength,
        ease: 'none'
      });
    }
  }

  private setupPortfolioAnimations(): void {
    gsap.from('.intro-content h2 span', {
      scrollTrigger: {
        trigger: '.portfolio-intro',
        start: 'top 80%'
      },
      y: 60,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'power3.out'
    });

    gsap.from('.project-card', {
      scrollTrigger: {
        trigger: '.featured-projects',
        start: 'top 70%'
      },
      y: 80,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: 'power3.out'
    });

    gsap.from('.cta-content h4', {
      scrollTrigger: {
        trigger: '.portfolio-cta',
        start: 'top 70%'
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  }

  private snapToSection(targetSection: number): void {
    if (targetSection < 0 || targetSection > 5 || targetSection === this.currentSection || this.isAnimating || !this.lenis) {
      return;
    }
    
    this.isSnapping = true;
    this.changeSection(targetSection);
    
    const targetPosition = this.sectionPositions[targetSection];
    this.lenis.scrollTo(targetPosition, {
      duration: 0.6,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      lock: true,
      onComplete: () => {
        this.isSnapping = false;
      }
    });
  }

  navigateToSection(index: number): void {
    if (index === this.currentSection || this.isAnimating || this.isSnapping || !this.lenis) return;
    
    this.soundManager.enableAudio();
    this.soundManager.play('click');
    
    this.isSnapping = true;
    const targetPosition = this.sectionPositions[index];
    
    this.changeSection(index);
    
    this.lenis.scrollTo(targetPosition, {
      duration: 0.8,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      lock: true,
      onComplete: () => {
        this.isSnapping = false;
      }
    });
  }

  onItemHover(): void {
    this.soundManager.enableAudio();
    this.soundManager.play('hover');
  }

  private changeSection(newSection: number): void {
    if (newSection === this.currentSection || this.isAnimating) return;
    
    this.isAnimating = true;
    const isScrollingDown = newSection > this.currentSection;
    const previousSection = this.currentSection;
    this.currentSection = newSection;
    
    this.updateProgressNumbers();
    
    const duration = 0.64;
    const parallaxAmount = 5;
    const progressFill = document.getElementById('progress-fill');
    const sectionProgress = this.currentSection / 5;
    if (progressFill) {
      progressFill.style.width = `${sectionProgress * 100}%`;
    }
    
    const featuredContents = document.querySelectorAll('.featured-content');
    featuredContents.forEach((content, i) => {
      if (i !== newSection && i !== previousSection) {
        content.classList.remove('active');
        gsap.set(content, { visibility: 'hidden', opacity: 0 });
      }
    });
    
    if (previousSection !== null) {
      const prevWords = this.splitTexts[`featured-${previousSection}`]?.words;
      if (prevWords) {
        gsap.to(prevWords, {
          yPercent: isScrollingDown ? -100 : 100,
          opacity: 0,
          duration: duration * 0.6,
          stagger: isScrollingDown ? 0.03 : -0.03,
          ease: 'customEase',
          onComplete: () => {
            featuredContents[previousSection].classList.remove('active');
            gsap.set(featuredContents[previousSection], { visibility: 'hidden' });
          }
        });
      }
    }
    
    const newWords = this.splitTexts[`featured-${newSection}`]?.words;
    if (newWords) {
      this.soundManager.play('textChange', 250);
      
      featuredContents[newSection].classList.add('active');
      gsap.set(featuredContents[newSection], { visibility: 'visible', opacity: 1 });
      gsap.set(newWords, { yPercent: isScrollingDown ? 100 : -100, opacity: 0 });
      gsap.to(newWords, {
        yPercent: 0,
        opacity: 1,
        duration: duration,
        stagger: isScrollingDown ? 0.05 : -0.05,
        ease: 'customEase'
      });
    }
    
    this.videoElements.forEach((video, i) => {
      if (i === newSection) {
        video.play().catch(() => {});
      } else if (i === previousSection) {
        setTimeout(() => {
          video.pause();
        }, duration * 1000);
      } else {
        video.pause();
      }
    });
    
    const videos = document.querySelectorAll('.background-video');
    videos.forEach((vid: any, i) => {
      vid.classList.remove('previous', 'active');
      if (i === newSection) {
        if (isScrollingDown) {
          gsap.set(vid, { opacity: 1, y: 0, clipPath: 'inset(100% 0 0 0)' });
          gsap.to(vid, { clipPath: 'inset(0% 0 0 0)', duration: duration, ease: 'customEase' });
        } else {
          gsap.set(vid, { opacity: 1, y: 0, clipPath: 'inset(0 0 100% 0)' });
          gsap.to(vid, { clipPath: 'inset(0 0 0% 0)', duration: duration, ease: 'customEase' });
        }
        vid.classList.add('active');
      } else if (i === previousSection) {
        vid.classList.add('previous');
        gsap.to(vid, {
          y: isScrollingDown ? `${parallaxAmount}%` : `-${parallaxAmount}%`,
          duration: duration,
          ease: 'customEase'
        });
        gsap.to(vid, {
          opacity: 0,
          delay: duration * 0.5,
          duration: duration * 0.5,
          ease: 'customEase',
          onComplete: () => {
            vid.classList.remove('previous');
            gsap.set(vid, { y: 0 });
            this.isAnimating = false;
          }
        });
      } else {
        gsap.to(vid, { opacity: 0, duration: duration * 0.3, ease: 'customEase' });
      }
    });
    
    const services = document.querySelectorAll('.service');
    services.forEach((service, i) => {
      if (i === newSection) {
        service.classList.add('active');
        gsap.to(service, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      } else {
        service.classList.remove('active');
        gsap.to(service, { opacity: 0.3, duration: 0.3, ease: 'power2.out' });
      }
    });
    
    const categories = document.querySelectorAll('.category');
    categories.forEach((category, i) => {
      if (i === newSection) {
        category.classList.add('active');
        gsap.to(category, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      } else {
        category.classList.remove('active');
        gsap.to(category, { opacity: 0.3, duration: 0.3, ease: 'power2.out' });
      }
    });
  }

  private updateProgressNumbers(): void {
    const currentSectionDisplay = document.getElementById('current-section');
    if (currentSectionDisplay) {
      currentSectionDisplay.textContent = (this.currentSection + 1).toString().padStart(2, '0');
    }
  }
}