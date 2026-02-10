import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  PLATFORM_ID,
  Inject,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Lenis, { LenisOptions } from 'lenis';
interface GalleryImage {
  src: string;
  width: number;
  height: number;
}

interface GallerySection {
  images: GalleryImage[];
  rowHeight: number;
}

interface SplitTextInstance {
  words: HTMLElement[];
  chars?: HTMLElement[];
  lines?: HTMLElement[];
  revert?: () => void;
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

declare const gsap: any;
declare const ScrollTrigger: any;
declare const SplitText: any;
@Component({
  selector: 'app-container',
  standalone: false,
  templateUrl: './container.component.html',
  styleUrl: './container.component.scss',
})
export class ContainerComponent {
  @ViewChild('demoWrapper') demoWrapper!: ElementRef;
  @ViewChild('demoGalleryContainer') demoGalleryContainer!: ElementRef;
  private demoScrollTriggers: any[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private isDemoAnimating = false;
  private lastScrollTime = 0;
  private scrollThrottleDelay = 16;

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

  private w = 1240;
  galleries: GallerySection[] = [];
  loadProgress = 0;
  isLoaded = false;
  private totalImages = 0;
  private loadedImages = 0;

  private totalAssetsToLoad = 0;
  private loadedAssets = 0;

  isDetailOpen = false;
  selectedDetail: GalleryDetailData | null = null;

  private rowHeights = [600, 800, 700, 900];
  private galleryImages: string[] = [
    'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/1144176/pexels-photo-1144176.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/1432675/pexels-photo-1432675.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/2531709/pexels-photo-2531709.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/1cosmos74/pexels-photo-1cosmos74.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/1366630/pexels-photo-1366630.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/1231265/pexels-photo-1231265.jpeg?auto=compress&w=800',
  ];

  private setupTextRevealAnimations(): void {
    if (typeof gsap === 'undefined' || typeof SplitText === 'undefined') return;

    this.animateSimpleFade('.about-tagline p', 0.2);

    this.animateWaveEffect('.desc-main', 0.4);

    this.animateScaleFade('.desc-secondary', 0.5);

    this.animateElasticBounce('.stat-label', 0.1);

    this.animateLineSlideUp('.intro-content h2', 0);

    this.animateCharRotation('.intro-description', 0.3);

    this.animateSimpleFade('.scroll-hint', 0.5);

    this.animateMaskedSlide('.gallery-category', 0);

    this.animate3DRotation('.gallery-title', 0.1);

    this.animateLineSlideUp('.cta-content h4', 0);

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
            ease: 'power3.out',
          });
        },
        once: true,
      });
    });
  }

  private animateLineSlideUp(selector: string, delay: number = 0): void {
    const elements = document.querySelectorAll(selector);

    elements.forEach((element) => {
      const childSplit = new SplitText(element, {
        type: 'lines',
        linesClass: 'split-child',
      });

      const parentSplit = new SplitText(element, {
        linesClass: 'split-parent',
      });

      gsap.set('.split-parent', { overflow: 'hidden' });
      gsap.set('.split-child', { display: 'inline-block' });

      gsap.set(childSplit.lines, { yPercent: 100, opacity: 0 });

      ScrollTrigger.create({
        trigger: element,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(childSplit.lines, {
            duration: 1.2,
            yPercent: 0,
            opacity: 1,
            ease: 'power4.out',
            stagger: 0.1,
            delay: delay,
          });
        },
        once: true,
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
        y: 20,
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
            delay: delay,
          });
        },
        once: true,
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
        rotationX: -90,
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
              from: 'start',
            },
            ease: 'power2.out',
            delay: delay,
          });
        },
        once: true,
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
        opacity: 0,
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
            delay: delay,
          });
        },
        once: true,
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
        scale: 0.5,
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
            delay: delay,
          });
        },
        once: true,
      });

      this.textAnimations.push({ element, splits: [split] });
    });
  }

  private animateTypewriter(selector: string, delay: number = 0): void {
    const elements = document.querySelectorAll(selector);

    elements.forEach((element) => {
      const split = new SplitText(element, { type: 'chars' });

      gsap.set(split.chars, { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          once: true,
        },
        delay: delay,
      });

      split.chars.forEach((char: HTMLElement, i: number) => {
        tl.to(
          char,
          {
            opacity: 1,
            duration: 0.05,
            ease: 'none',
          },
          i * 0.05,
        );
      });

      this.textAnimations.push({ element, splits: [split] });
    });
  }

  private animateMaskedSlide(selector: string, delay: number = 0): void {
    const elements = document.querySelectorAll(selector);

    elements.forEach((element: any) => {
      gsap.set(element, {
        clipPath: 'inset(0 100% 0 0)',
        opacity: 1,
      });

      ScrollTrigger.create({
        trigger: element,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(element, {
            clipPath: 'inset(0 0% 0 0)',
            duration: 1.2,
            ease: 'power3.inOut',
            delay: delay,
          });
        },
        once: true,
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
        transformOrigin: '50% 50%',
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
            delay: delay,
          });
        },
        once: true,
      });

      this.textAnimations.push({ element, splits: [split] });
    });
  }

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
      posterUrl: 'HERO/event.jpg',
    },
    {
      service: 'Hospital',
      featured: 'Medical Excellence',
      category: 'Hospital',
      videoUrl: 'HERO/hospital.mp4',
      posterUrl:
        'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&q=80',
    },
    {
      service: 'Fashion',
      featured: 'Style Stories',
      category: 'Modeling',
      videoUrl: 'HERO/fashion.mp4',
      posterUrl:
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=80',
    },
    {
      service: 'Sports',
      featured: 'Action Shots',
      category: 'Athletics',
      videoUrl: 'HERO/F1.mp4',
      posterUrl:
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1920&q=80',
    },
    {
      service: 'Product',
      featured: 'Commercial Vision',
      category: 'Advertisement',
      videoUrl: 'HERO/advertisement.mp4',
      posterUrl:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&q=80',
    },
    {
      service: 'Weddings',
      featured: 'Love Stories',
      category: 'Celebrations',
      videoUrl: 'HERO/Wedding.mp4',
      posterUrl:
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80',
    },
  ];

  galleryItems: GalleryItem[] = [
    {
      image:
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&q=80',
      title: 'Events Coverage',
      category: 'Corporate & Social Events',
    },
    {
      image:
        'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&q=80',
      title: 'Hospital Shoots',
      category: 'Medical & Healthcare Photography',
    },
    {
      image:
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1920&q=80',
      title: 'Sports Photography',
      category: 'Action & Athletic Coverage',
    },
    {
      image:
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=80',
      title: 'Fashion Photography',
      category: 'Editorial & Runway Shoots',
    },
    {
      image:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&q=80',
      title: 'Commercial & Product Shoots',
      category: 'Advertising & E-commerce',
    },
    {
      image:
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1920&q=80',
      title: 'Portraits & Lifestyle',
      category: 'Personal & Professional Portraits',
    },
    {
      image:
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80',
      title: 'Weddings & Engagements',
      category: 'Celebration Photography',
    },
    {
      image:
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80',
      title: 'Real Estate & Architecture',
      category: 'Property & Interior Photography',
    },
    {
      image:
        'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&q=80',
      title: 'Professional Editing & Retouching',
      category: 'Post-Production Services',
    },
  ];

  galleryDetailsData: { [key: string]: GalleryDetailData } = {
    'Events Coverage': {
      title: 'Events Coverage',
      category: 'Corporate & Social Events',
      image:
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&q=80',
      description:
        'Professional event photography capturing every significant moment',
      longDescription:
        "Our event coverage service specializes in documenting corporate gatherings, social events, conferences, and exhibitions. With years of experience and cutting-edge equipment, we ensure every crucial moment is captured with precision and artistry. From candid shots to formal photography, we deliver comprehensive coverage that tells your event's complete story.",
      stats: [
        { label: 'Events Covered', value: '150+' },
        { label: 'Client Satisfaction', value: '98%' },
        { label: 'Team Members', value: '8' },
        { label: 'Years Experience', value: '10+' },
      ],
      completedWorks: [
        {
          image:
            'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80',
          title: 'Tech Summit 2024',
          description: 'Dubai International Conference Center',
        },
        {
          image:
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
          title: 'Corporate Gala',
          description: 'Annual Awards Ceremony',
        },
        {
          image:
            'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800&q=80',
          title: 'Product Launch',
          description: 'Luxury Brand Event',
        },
        {
          image:
            'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
          title: 'Trade Exhibition',
          description: 'International Expo 2024',
        },
        {
          image:
            'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
          title: 'Networking Evening',
          description: 'Business Connect',
        },
        {
          image:
            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
          title: 'Charity Fundraiser',
          description: 'Community Event',
        },
      ],
      features: [
        'Full event documentation from setup to conclusion',
        'Professional lighting and audio-visual equipment',
        'Real-time photo sharing and instant social media uploads',
        'Dedicated team of 2-4 photographers depending on event size',
        'High-resolution edited photos delivered within 48 hours',
        'Drone photography for outdoor events',
        '360-degree virtual tour creation',
        'Custom photo albums and digital galleries',
      ],
    },
    'Hospital Shoots': {
      title: 'Hospital & Medical Photography',
      category: 'Medical & Healthcare Photography',
      image:
        'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&q=80',
      description: 'Specialized medical and healthcare facility documentation',
      longDescription:
        'We provide comprehensive medical photography services for hospitals, clinics, and healthcare facilities. Our expertise includes surgical documentation, facility photography, staff portraits, and patient care imagery. We understand the sensitivity and professionalism required in medical environments and deliver images that meet both marketing and documentation needs.',
      stats: [
        { label: 'Medical Facilities', value: '45+' },
        { label: 'Surgeries Documented', value: '200+' },
        { label: 'Certified Photographers', value: '5' },
        { label: 'Compliance Rate', value: '100%' },
      ],
      completedWorks: [
        {
          image:
            'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
          title: 'Sheikh Khalifa Hospital',
          description: 'Complete facility documentation',
        },
        {
          image:
            'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80',
          title: 'Cardiac Surgery Center',
          description: 'Operating room photography',
        },
        {
          image:
            'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&q=80',
          title: 'Pediatric Ward',
          description: 'Patient care documentation',
        },
        {
          image:
            'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&q=80',
          title: 'Medical Equipment',
          description: 'Product photography for catalogs',
        },
        {
          image:
            'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
          title: 'Staff Portraits',
          description: 'Professional headshots for website',
        },
        {
          image:
            'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&q=80',
          title: 'Emergency Department',
          description: 'Facility marketing imagery',
        },
      ],
      features: [
        'HIPAA and medical privacy compliance',
        'Sterile equipment and proper sanitization protocols',
        'Surgical procedure documentation',
        'Before and after medical photography',
        'Facility and equipment photography for marketing',
        'Staff and doctor professional portraits',
        'Patient testimonial photography (with consent)',
        'Medical research and publication imagery',
      ],
    },
    'Sports Photography': {
      title: 'Sports & Action Photography',
      category: 'Action & Athletic Coverage',
      image:
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1920&q=80',
      description: 'Dynamic sports action and athletic event photography',
      longDescription:
        'Capture the intensity, emotion, and peak moments of athletic competition with our specialized sports photography services. From motorsports to football, tennis to extreme sports, we use high-speed cameras and expert techniques to freeze action at its most dramatic. Perfect for athletes, teams, sponsors, and sports publications.',
      stats: [
        { label: 'Sporting Events', value: '300+' },
        { label: 'Action Shots', value: '50K+' },
        { label: 'Sports Covered', value: '25+' },
        { label: 'Pro Athletes', value: '100+' },
      ],
      completedWorks: [
        {
          image:
            'https://images.unsplash.com/photo-1547941126-3d5322b218b0?w=800&q=80',
          title: 'F1 Abu Dhabi GP',
          description: 'High-speed motorsports coverage',
        },
        {
          image:
            'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
          title: 'Football Championship',
          description: 'Match day action shots',
        },
        {
          image:
            'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
          title: 'Tennis Open',
          description: 'Tournament photography',
        },
        {
          image:
            'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&q=80',
          title: 'Marathon Event',
          description: 'Endurance sports coverage',
        },
        {
          image:
            'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
          title: 'Basketball Finals',
          description: 'Indoor sports photography',
        },
        {
          image:
            'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80',
          title: 'Extreme Sports',
          description: 'Adventure photography',
        },
      ],
      features: [
        'High-speed camera equipment (up to 20fps burst mode)',
        'Telephoto lenses for distant action capture',
        'Low-light and indoor sports photography expertise',
        'Waterproof and weather-resistant equipment',
        'Real-time action shot delivery during events',
        'Athlete portraits and team photography',
        'Sponsor and promotional imagery',
        'Slow-motion video capture capabilities',
      ],
    },
    'Fashion Photography': {
      title: 'Fashion & Editorial Photography',
      category: 'Editorial & Runway Shoots',
      image:
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=80',
      description: 'High-end fashion editorial and runway photography',
      longDescription:
        'Elevate your fashion brand with stunning editorial photography that showcases clothing, accessories, and style in the most captivating way. Our fashion photography services include runway coverage, lookbook creation, editorial shoots, and e-commerce product photography. We work with designers, models, and brands to create imagery that sells and inspires.',
      stats: [
        { label: 'Fashion Shows', value: '80+' },
        { label: 'Lookbooks Created', value: '120+' },
        { label: 'Brand Collaborations', value: '60+' },
        { label: 'Editorial Features', value: '40+' },
      ],
      completedWorks: [
        {
          image:
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
          title: 'Luxury Fashion Week',
          description: 'Runway photography Dubai',
        },
        {
          image:
            'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
          title: 'Spring Collection 2024',
          description: 'Editorial lookbook shoot',
        },
        {
          image:
            'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
          title: 'Haute Couture',
          description: 'Designer collection photography',
        },
        {
          image:
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
          title: 'Streetwear Campaign',
          description: 'Urban fashion editorial',
        },
        {
          image:
            'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800&q=80',
          title: 'Model Portfolio',
          description: 'Professional model comp cards',
        },
        {
          image:
            'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=800&q=80',
          title: 'Accessories Shoot',
          description: 'Jewelry and accessories photography',
        },
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
        'Creative direction and styling consultation',
      ],
    },
    'Commercial & Product Shoots': {
      title: 'Commercial & Product Photography',
      category: 'Advertising & E-commerce',
      image:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&q=80',
      description:
        'Professional product and commercial advertising photography',
      longDescription:
        'Transform your products into visual masterpieces that drive sales and engagement. Our commercial photography services cater to e-commerce businesses, advertising agencies, and brands looking for high-quality product imagery. From simple white background shots to complex lifestyle photography, we create images that convert browsers into buyers.',
      stats: [
        { label: 'Products Shot', value: '5K+' },
        { label: 'E-commerce Clients', value: '90+' },
        { label: 'Ad Campaigns', value: '150+' },
        { label: 'Conversion Increase', value: '35%' },
      ],
      completedWorks: [
        {
          image:
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
          title: 'Tech Product Launch',
          description: 'Electronics advertising campaign',
        },
        {
          image:
            'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=800&q=80',
          title: 'Luxury Watches',
          description: 'High-end product photography',
        },
        {
          image:
            'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80',
          title: 'Cosmetics Campaign',
          description: 'Beauty product advertising',
        },
        {
          image:
            'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
          title: 'E-commerce Catalog',
          description: 'Multi-product photography session',
        },
        {
          image:
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
          title: 'Footwear Collection',
          description: 'Lifestyle product shots',
        },
        {
          image:
            'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80',
          title: 'Food & Beverage',
          description: 'Culinary product photography',
        },
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
        'Batch processing for large catalogs',
      ],
    },
    'Portraits & Lifestyle': {
      title: 'Portrait & Lifestyle Photography',
      category: 'Personal & Professional Portraits',
      image:
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1920&q=80',
      description: 'Professional portraits and lifestyle photography sessions',
      longDescription:
        'Capture your personality, brand, or special moments with our professional portrait and lifestyle photography. Whether you need corporate headshots, family portraits, personal branding images, or lifestyle photography for social media, we create authentic and compelling imagery that tells your unique story.',
      stats: [
        { label: 'Portraits Created', value: '2K+' },
        { label: 'Family Sessions', value: '500+' },
        { label: 'Corporate Clients', value: '120+' },
        { label: 'Satisfaction Rate', value: '99%' },
      ],
      completedWorks: [
        {
          image:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
          title: 'Executive Portraits',
          description: 'C-suite professional headshots',
        },
        {
          image:
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
          title: 'Personal Branding',
          description: 'Entrepreneur lifestyle shoot',
        },
        {
          image:
            'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800&q=80',
          title: 'Family Portraits',
          description: 'Multi-generational family session',
        },
        {
          image:
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80',
          title: 'Artist Portraits',
          description: 'Creative professional photography',
        },
        {
          image:
            'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=800&q=80',
          title: 'Lifestyle Session',
          description: 'Authentic daily life moments',
        },
        {
          image:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
          title: 'Professional Headshots',
          description: 'LinkedIn and corporate profiles',
        },
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
        'Print-ready and digital delivery formats',
      ],
    },
    'Weddings & Engagements': {
      title: 'Wedding & Engagement Photography',
      category: 'Celebration Photography',
      image:
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80',
      description: 'Timeless wedding and engagement photography',
      longDescription:
        "Your wedding day deserves to be captured with artistry, emotion, and precision. Our wedding photography services document every precious moment—from intimate preparations to grand celebrations. We blend documentary-style coverage with artistic portraits to create a complete visual story of your special day that you'll treasure forever.",
      stats: [
        { label: 'Weddings Captured', value: '400+' },
        { label: 'Happy Couples', value: '400+' },
        { label: 'Countries Covered', value: '8' },
        { label: 'Average Rating', value: '5.0' },
      ],
      completedWorks: [
        {
          image:
            'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80',
          title: 'Luxury Beach Wedding',
          description: 'Dubai destination wedding',
        },
        {
          image:
            'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
          title: 'Palace Wedding',
          description: 'Grand traditional ceremony',
        },
        {
          image:
            'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
          title: 'Garden Engagement',
          description: 'Romantic outdoor session',
        },
        {
          image:
            'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80',
          title: 'Desert Wedding',
          description: 'Unique UAE landscape wedding',
        },
        {
          image:
            'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80',
          title: 'Cultural Celebration',
          description: 'Multi-cultural wedding ceremony',
        },
        {
          image:
            'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80',
          title: 'Intimate Ceremony',
          description: 'Small private wedding',
        },
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
        'Destination wedding packages available',
      ],
    },
    'Real Estate & Architecture': {
      title: 'Real Estate & Architecture Photography',
      category: 'Property & Interior Photography',
      image:
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80',
      description: 'Professional property and architectural photography',
      longDescription:
        'Showcase properties and architectural designs at their absolute best with our specialized real estate photography. We create stunning images that highlight spaces, capture light, and present properties in the most appealing way. Perfect for real estate agents, property developers, architects, and interior designers.',
      stats: [
        { label: 'Properties Shot', value: '800+' },
        { label: 'Sq Meters Covered', value: '2M+' },
        { label: 'Real Estate Agents', value: '150+' },
        { label: 'Faster Sales', value: '40%' },
      ],
      completedWorks: [
        {
          image:
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
          title: 'Luxury Villa',
          description: 'High-end residential property',
        },
        {
          image:
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
          title: 'Modern Apartment',
          description: 'Contemporary interior photography',
        },
        {
          image:
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
          title: 'Architectural Design',
          description: 'New development showcase',
        },
        {
          image:
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
          title: 'Commercial Space',
          description: 'Office building photography',
        },
        {
          image:
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
          title: 'Hotel Interior',
          description: 'Hospitality photography',
        },
        {
          image:
            'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
          title: 'Construction Progress',
          description: 'Development documentation',
        },
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
        'Video walkthroughs and cinematic tours',
      ],
    },
    'Professional Editing & Retouching': {
      title: 'Professional Editing & Retouching',
      category: 'Post-Production Services',
      image:
        'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&q=80',
      description: 'Expert photo editing and post-production services',
      longDescription:
        'Transform your images with our professional editing and retouching services. Using industry-standard software and techniques, we enhance, retouch, and perfect your photographs to meet the highest standards. From basic color correction to advanced compositing and beauty retouching, we deliver polished, publication-ready images.',
      stats: [
        { label: 'Images Edited', value: '100K+' },
        { label: 'Retouching Projects', value: '3K+' },
        { label: 'Turnaround Time', value: '24-48h' },
        { label: 'Client Return Rate', value: '92%' },
      ],
      completedWorks: [
        {
          image:
            'https://images.unsplash.com/photo-1591779051696-1c3fa1469a79?w=800&q=80',
          title: 'Beauty Retouching',
          description: 'High-end skin retouching',
        },
        {
          image:
            'https://images.unsplash.com/photo-1626863905121-3b0c0ed7b94c?w=800&q=80',
          title: 'Color Grading',
          description: 'Cinematic color treatment',
        },
        {
          image:
            'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&q=80',
          title: 'Composite Imaging',
          description: 'Creative photo manipulation',
        },
        {
          image:
            'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80',
          title: 'Product Enhancement',
          description: 'Commercial retouching',
        },
        {
          image:
            'https://images.unsplash.com/photo-1555421689-3f034debb7a6?w=800&q=80',
          title: 'Restoration',
          description: 'Old photo restoration and colorization',
        },
        {
          image:
            'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&q=80',
          title: 'Batch Editing',
          description: 'Large volume color correction',
        },
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
        'Print file preparation',
      ],
    },
  };

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.initSoundManager();
    this.distributeImagesIntoGalleries();

    this.totalAssetsToLoad = this.totalVideos + this.totalImages;

    if (this.isBrowser) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    setTimeout(() => {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          this.preloadVideos();
          this.optimizeGalleryImages();
          this.setupPerformanceOptimizations();
        });
      } else {
        this.preloadVideos();
        this.optimizeGalleryImages();
        this.setupPerformanceOptimizations();
      }
    }, 500);
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;

    this.cleanupTextAnimations();
    this.cleanupDemoAnimations();

    if (this.lenis) {
      this.lenis.destroy();
      this.lenis = null;
    }

    this.videoElements.forEach((video) => {
      if (video) {
        video.pause();
        video.src = '';
        video.load();
      }
    });

    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
    }

    if (typeof gsap !== 'undefined') {
      gsap.ticker.lagSmoothing(1000);
      gsap.ticker.fps(60);
    }

    if (this.isBrowser) {
      document.body.style.overflow = '';
    }

    if (this.mainScrollTrigger) {
      this.mainScrollTrigger.kill();
    }
  }
  private setupPerformanceOptimizations(): void {
    if (!this.isBrowser) return;

    let resizeTimeout: any;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
        console.log('Viewport resized, refreshing animations');
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    setTimeout(handleResize, 1000);

    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 300);
    });
  }

  openGalleryDetail(item: GalleryItem): void {
    const detailData = this.galleryDetailsData[item.title];
    if (detailData) {
      this.selectedDetail = detailData;
      this.isDetailOpen = true;
    }
  }

  closeGalleryDetail(): void {
    this.isDetailOpen = false;
    setTimeout(() => {
      this.selectedDetail = null;
    }, 500);
  }

  private preloadVideos(): void {
    const loadingCounter = document.getElementById('loading-counter');

    this.sections.forEach((section, index) => {
      const video = document.getElementById(
        `background-video-${index}`,
      ) as HTMLVideoElement;
      if (!video) return;

      this.videoElements[index] = video;

      video.preload = 'auto';
      video.playsInline = true;
      video.muted = true;
      video.loop = true;

      const onCanPlay = () => {
        this.onAssetLoaded();

        const progress = Math.floor(
          (this.loadedAssets * 100) / this.totalAssetsToLoad,
        );
        if (loadingCounter) {
          loadingCounter.textContent = `[${progress
            .toString()
            .padStart(2, '0')}]`;
        }

        video.removeEventListener('canplaythrough', onCanPlay);
      };

      video.addEventListener('canplaythrough', onCanPlay);

      const onError = () => {
        console.error(`Failed to load video ${index}`);
        this.onAssetLoaded();

        if (loadingCounter) {
          const progress = Math.floor(
            (this.loadedAssets * 100) / this.totalAssetsToLoad,
          );
          loadingCounter.textContent = `[${progress
            .toString()
            .padStart(2, '0')}]`;
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
        this.isLoaded = true;
        document.body.style.overflow = 'auto';
        document.documentElement.scrollTo(0, 0);

        this.initLenis();
        this.initPage();

        setTimeout(() => {
          this.initScrollAnimations();
        }, 600);
      },
    });
    timeline
      .to(
        '.logo-mask',
        {
          scaleY: 0,
          duration: 1.2,
          ease: 'power4.inOut',
        },
        0,
      )
      .to(
        '.logo-image',
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
        },
        0.3,
      )
      .to(
        '.glow-effect',
        {
          opacity: 1,
          scale: 1.2,
          duration: 1.5,
          ease: 'power2.out',
        },
        0.4,
      );

    const chars = document.querySelectorAll('.char');
    timeline.to(
      chars,
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: {
          each: 0.05,
          from: 'start',
        },
        ease: 'power3.out',
      },
      0.8,
    );

    timeline.to(
      '.company-tagline',
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
      },
      1.2,
    );

    timeline.to(
      '.loading-progress',
      {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
      },
      1.4,
    );

    timeline.to(
      '.progress-bar',
      {
        width: '100%',
        duration: 0.8,
        ease: 'power2.inOut',
      },
      1.6,
    );

    timeline
      .to(
        '.loading-content',
        {
          scale: 0.95,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.inOut',
        },
        2.6,
      )
      .to(
        loadingOverlay,
        {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.inOut',
        },
        2.8,
      );
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
        if (
          this.soundManager.isEnabled &&
          this.soundManager.sounds[soundName]
        ) {
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
      },
    };

    this.soundManager.loadSound(
      'hover',
      'https://assets.codepen.io/7558/click-reverb-001.mp3',
      1,
    );
    this.soundManager.loadSound(
      'click',
      'https://assets.codepen.io/7558/shutter-fx-001.mp3',
      1,
    );
    this.soundManager.loadSound(
      'textChange',
      'https://assets.codepen.io/7558/whoosh-fx-001.mp3',
      1,
    );
  }

  private initLenis(): void {
    if (!this.isBrowser) return;

    try {
      const lenisOptions: any = {
        duration: 1.2, // Reduced from 1.8 for smoother response
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1, // Increased from 0.8 for better control
        touchMultiplier: 2, // Increased from 1.5
        infinite: false,
        smooth: true,
        direction: 'vertical',
        // CRITICAL ADDITIONS:
        syncTouch: true, // Sync touch events
        syncTouchLerp: 0.1, // Smooth touch lerp
        touchInertiaMultiplier: 35, // Better touch inertia
      };

      this.lenis = new Lenis(lenisOptions);

      if (this.lenis) {
        // Use RAF for smoother updates
        const raf = (time: number) => {
          if (this.lenis) {
            this.lenis.raf(time);
          }
          requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);

        // CRITICAL: Debounced scroll update
        this.lenis.on('scroll', ScrollTrigger.update);
      }
    } catch (error) {
      console.error('Failed to initialize Lenis:', error);
    }
  }

  private setupNativeScrollingFallback(): void {
    console.warn('Lenis failed, using native scrolling');
  }

  private initPage(): void {
    if (
      typeof gsap === 'undefined' ||
      typeof ScrollTrigger === 'undefined' ||
      typeof SplitText === 'undefined'
    ) {
      console.error('GSAP libraries not loaded');
      return;
    }

    gsap.registerPlugin(ScrollTrigger, SplitText);

    gsap.registerEase('customEase', function (t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    });

    this.optimizeFrameRate();

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

    const headerLetters = document.querySelectorAll('.header-letter');

    gsap.set(headerLetters, {
      clipPath: 'inset(100% 0 0 0)',
      opacity: 1,
    });

    gsap.to(headerLetters, {
      clipPath: 'inset(0% 0 0 0)',
      duration: 1.2,
      ease: 'power2.out',
      stagger: 0.05,
      delay: 0.3,
    });

    const footerLetters = document.querySelectorAll('.footer-letter');

    gsap.set(footerLetters, {
      clipPath: 'inset(100% 0 0 0)',
      opacity: 1,
    });

    ScrollTrigger.create({
      trigger: '.footer',
      start: 'top 80%',
      onEnter: () => {
        gsap.to(footerLetters, {
          clipPath: 'inset(0% 0 0 0)',
          duration: 1.2,
          ease: 'power2.out',
          stagger: 0.05,
        });
      },
      once: true,
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
      setTimeout(
        () => {
          item.classList.add('loaded');
        },
        index * 60 + 200,
      );
    });
  }

  private setupScrollTriggers(): void {
    const fixedContainer = document.getElementById('fixed-container');
    const fixedSectionElement = document.querySelector(
      '.fixed-section',
    ) as HTMLElement;
    const header = document.querySelector('.header');
    const content = document.querySelector('.content') as HTMLElement;
    const footer = document.getElementById('footer');
    const leftColumn = document.getElementById('left-column');
    const rightColumn = document.getElementById('right-column');
    const featured = document.getElementById('featured');
    const progressFill = document.getElementById('progress-fill');

    // SETUP FEATURED CONTENT SPLITS
    const featuredContents = document.querySelectorAll('.featured-content');
    featuredContents.forEach((content, index) => {
      const h3 = content.querySelector('h3');
      if (h3) {
        const split = new SplitText(h3, {
          type: 'words',
          wordsClass: 'split-word',
        });
        this.splitTexts[`featured-${index}`] = split;

        split.words.forEach((word: HTMLElement) => {
          const wrapper = document.createElement('div');
          wrapper.className = 'word-mask';
          wrapper.style.cssText = 'display:inline-block;overflow:hidden;';
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

    // Calculate section positions
    for (let i = 0; i < 6; i++) {
      this.sectionPositions.push(
        fixedSectionTop + (fixedSectionHeight * i) / 6,
      );
    }

    // CRITICAL: OPTIMIZED MAIN SCROLL TRIGGER
    this.mainScrollTrigger = ScrollTrigger.create({
      trigger: '.fixed-section',
      start: 'top top',
      end: 'bottom bottom',
      pin: '.fixed-container',
      pinSpacing: true,

      // PERFORMANCE OPTIMIZATIONS
      anticipatePin: 1,
      fastScrollEnd: true,
      preventOverlaps: true,
      refreshPriority: 1,
      invalidateOnRefresh: true,

      // THROTTLED UPDATE
      onUpdate: this.throttle((self: any) => {
        if (this.isSnapping) return;

        const progress = self.progress;
        const progressDelta = progress - this.lastProgress;

        // Only update if significant change (reduced checks)
        if (Math.abs(progressDelta) > 0.008) {
          this.scrollDirection = progressDelta > 0 ? 1 : -1;
        }

        const targetSection = Math.min(5, Math.floor(progress * 6));

        if (targetSection !== this.currentSection && !this.isAnimating) {
          const nextSection =
            this.currentSection +
            (targetSection > this.currentSection ? 1 : -1);

          // Use RAF for smooth section change
          requestAnimationFrame(() => {
            this.snapToSection(nextSection);
          });
        }

        this.lastProgress = progress;

        // RAF for progress bar
        requestAnimationFrame(() => {
          const sectionProgress = this.currentSection / 5;
          if (progressFill) {
            progressFill.style.width = `${sectionProgress * 100}%`;
          }
        });
      }, 16), // ~60fps throttle
    });

    // OPTIMIZED END SECTION TRIGGER
    ScrollTrigger.create({
      trigger: '.end-section',
      start: 'top center',
      end: 'bottom bottom',

      // PERFORMANCE
      fastScrollEnd: true,
      anticipatePin: 1,

      onUpdate: this.throttle((self: any) => {
        if (self.progress > 0.1) {
          // Batch DOM updates with RAF
          requestAnimationFrame(() => {
            footer?.classList.add('blur');
            leftColumn?.classList.add('blur');
            rightColumn?.classList.add('blur');
            featured?.classList.add('blur');
          });

          const newHeight = Math.max(
            0,
            100 - ((self.progress - 0.1) / 0.9) * 100,
          );

          // Use GSAP for smooth height transition
          gsap.to(fixedContainer, {
            height: `${newHeight}vh`,
            duration: 0.1,
            ease: 'none',
            overwrite: 'auto',
          });

          const isMobile = window.innerWidth <= 768;
          const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

          let moveYMultiplier = 200;
          if (isMobile) {
            moveYMultiplier = 100;
          } else if (isTablet) {
            moveYMultiplier = 150;
          }

          const moveY = (-(self.progress - 0.1) / 0.9) * moveYMultiplier;

          // Batch GSAP animations
          gsap.set(header, {
            y: moveY * 1.5,
            force3D: true,
          });

          gsap.set(content, {
            y: moveY,
            force3D: true,
          });

          gsap.set(footer, {
            y: moveY * 0.5,
            force3D: true,
          });
        } else {
          requestAnimationFrame(() => {
            footer?.classList.remove('blur');
            leftColumn?.classList.remove('blur');
            rightColumn?.classList.remove('blur');
            featured?.classList.remove('blur');
          });

          gsap.to(fixedContainer, {
            height: '100vh',
            duration: 0.1,
            ease: 'none',
          });

          gsap.set([header, content, footer], {
            y: 0,
            force3D: true,
            clearProps: 'transform',
          });
        }
      }, 16),

      invalidateOnRefresh: true,
    });

    this.updateProgressNumbers();
  }

  private setupAboutSectionAnimations(): void {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined')
      return;

    gsap.from('.about-logo', {
      scrollTrigger: {
        trigger: '.about-logo-section',
        start: 'top 80%',
        end: 'top 50%',
        toggleActions: 'play none none reverse',
      },
      scale: 0.5,
      opacity: 0,
      rotation: -15,
      duration: 1.2,
      ease: 'back.out(1.7)',
    });

    gsap.from('.about-tagline', {
      scrollTrigger: {
        trigger: '.about-tagline',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    });

    gsap.from('.desc-main', {
      scrollTrigger: {
        trigger: '.about-description',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      },
      y: 60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    });

    gsap.from('.desc-secondary', {
      scrollTrigger: {
        trigger: '.about-description',
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
      y: 60,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: 'power3.out',
    });

    const statItems = document.querySelectorAll('.stat-item');

    statItems.forEach((item, index) => {
      gsap.from(item, {
        scrollTrigger: {
          trigger: '.about-stats',
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
        y: 50,
        opacity: 0,
        scale: 0.8,
        duration: 0.8,
        delay: index * 0.15,
        ease: 'back.out(1.7)',
      });

      const statNumber = item.querySelector('.stat-number') as HTMLElement;
      if (statNumber) {
        const dataTarget = statNumber.getAttribute('data-target');

        if (dataTarget) {
          const targetValue = parseInt(dataTarget);
          const suffix = statNumber.textContent?.replace(/[0-9]/g, '') || '';

          statNumber.textContent = '0' + suffix;

          ScrollTrigger.create({
            trigger: '.about-stats',
            start: 'top 70%',
            onEnter: () => {
              gsap.to(
                { value: 0 },
                {
                  value: targetValue,
                  duration: 2.5,
                  delay: index * 0.1,
                  ease: 'power1.out',
                  onUpdate: function () {
                    const currentValue = Math.floor(this.targets()[0].value);
                    statNumber.textContent = currentValue + suffix;
                  },
                  onComplete: () => {
                    statNumber.textContent = targetValue + suffix;

                    gsap
                      .timeline()
                      .to(statNumber, {
                        scale: 1.15,
                        color: '#dc2626',
                        duration: 0.2,
                        ease: 'power2.out',
                      })
                      .to(statNumber, {
                        scale: 1,
                        color: '#dc2626',
                        duration: 0.3,
                        ease: 'elastic.out(1, 0.5)',
                      });
                  },
                },
              );
            },
            once: true,
          });
        }
      }

      const statLabel = item.querySelector('.stat-label') as HTMLElement;
      if (statLabel) {
        gsap.from(statLabel, {
          scrollTrigger: {
            trigger: '.about-stats',
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          y: 20,
          duration: 0.6,
          delay: index * 0.1 + 0.4,
          ease: 'power2.out',
        });
      }
    });

    gsap.from('.stat-divider', {
      scrollTrigger: {
        trigger: '.about-stats',
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
      scaleY: 0,
      opacity: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power2.out',
    });

    gsap.to('.circle-1', {
      scrollTrigger: {
        trigger: '.about-container',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
      y: -100,
      rotation: 45,
      ease: 'none',
    });

    gsap.to('.circle-2', {
      scrollTrigger: {
        trigger: '.about-container',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
      y: 100,
      rotation: -45,
      ease: 'none',
    });

    gsap.from('.bg-grid', {
      scrollTrigger: {
        trigger: '.about-container',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0,
      duration: 1.5,
      ease: 'power2.out',
    });
  }
  private setupPerformanceMonitoring(): void {
    if (!this.isBrowser) return;

    let frameCount = 0;
    let lastTime = performance.now();

    const checkPerformance = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

        // Adjust quality based on FPS
        if (fps < 30) {
          console.warn('Low FPS detected, reducing animation quality');
          // Reduce animation complexity
          gsap.ticker.fps(30);
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(checkPerformance);
    };

    requestAnimationFrame(checkPerformance);
  }

  private setupHorizontalGalleryScroll(): void {
    const galleryPinWrap = document.querySelector(
      '.gallery-pin-wrap',
    ) as HTMLElement;

    if (galleryPinWrap) {
      const galleryWidth = galleryPinWrap.scrollWidth;
      const horizontalScrollLength = galleryWidth - window.innerWidth;

      // Optimize with will-change
      galleryPinWrap.style.willChange = 'transform';

      gsap.to('.gallery-pin-wrap', {
        scrollTrigger: {
          trigger: '.gallery-section',
          pin: true,
          scrub: 0.5, // Reduced from 1 for smoother response
          start: 'top top',
          end: () => `+=${galleryWidth}`,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true, // Prevent jumping
        },
        x: -horizontalScrollLength,
        ease: 'none',
        force3D: true, // Hardware acceleration
      });
    }
  }
  private setupPortfolioAnimations(): void {
    gsap.from('.intro-content h2 span', {
      scrollTrigger: {
        trigger: '.portfolio-intro',
        start: 'top 80%',
      },
      y: 60,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'power3.out',
    });

    gsap.from('.project-card', {
      scrollTrigger: {
        trigger: '.featured-projects',
        start: 'top 70%',
      },
      y: 80,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: 'power3.out',
    });

    gsap.from('.cta-content h4', {
      scrollTrigger: {
        trigger: '.portfolio-cta',
        start: 'top 70%',
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    });
  }

  private snapToSection(targetSection: number): void {
    if (
      targetSection < 0 ||
      targetSection > 5 ||
      targetSection === this.currentSection ||
      this.isAnimating ||
      !this.lenis
    ) {
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
      },
    });
  }

  navigateToSection(index: number): void {
    if (
      index === this.currentSection ||
      this.isAnimating ||
      this.isSnapping ||
      !this.lenis
    )
      return;

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
      },
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

    // Immediate progress update
    requestAnimationFrame(() => {
      this.updateProgressNumbers();

      const progressFill = document.getElementById('progress-fill');
      const sectionProgress = this.currentSection / 5;
      if (progressFill) {
        progressFill.style.width = `${sectionProgress * 100}%`;
      }
    });

    const duration = 0.56; // Reduced from 0.64 for snappier feel
    const parallaxAmount = 5;

    const featuredContents = document.querySelectorAll('.featured-content');

    // Hide non-active sections immediately
    featuredContents.forEach((content, i) => {
      if (i !== newSection && i !== previousSection) {
        content.classList.remove('active');
        gsap.set(content, { visibility: 'hidden', opacity: 0 });
      }
    });

    // ANIMATE OUT PREVIOUS SECTION
    if (previousSection !== null) {
      const prevWords = this.splitTexts[`featured-${previousSection}`]?.words;
      if (prevWords) {
        gsap.to(prevWords, {
          yPercent: isScrollingDown ? -100 : 100,
          opacity: 0,
          duration: duration * 0.5, // Faster exit
          stagger: isScrollingDown ? 0.02 : -0.02, // Reduced stagger
          ease: 'power2.in', // Faster ease
          onComplete: () => {
            featuredContents[previousSection].classList.remove('active');
            gsap.set(featuredContents[previousSection], {
              visibility: 'hidden',
            });
          },
        });
      }
    }

    // ANIMATE IN NEW SECTION
    const newWords = this.splitTexts[`featured-${newSection}`]?.words;
    if (newWords) {
      this.soundManager.play('textChange', 200); // Reduced delay

      featuredContents[newSection].classList.add('active');
      gsap.set(featuredContents[newSection], {
        visibility: 'visible',
        opacity: 1,
      });

      gsap.set(newWords, {
        yPercent: isScrollingDown ? 100 : -100,
        opacity: 0,
      });

      gsap.to(newWords, {
        yPercent: 0,
        opacity: 1,
        duration: duration * 0.8,
        stagger: isScrollingDown ? 0.03 : -0.03, // Reduced stagger
        ease: 'power2.out',
      });
    }

    // VIDEO MANAGEMENT
    requestAnimationFrame(() => {
      this.videoElements.forEach((video, i) => {
        if (i === newSection) {
          video.play().catch(() => {});
        } else if (i === previousSection) {
          setTimeout(() => video.pause(), duration * 800);
        } else {
          video.pause();
        }
      });
    });

    // OPTIMIZED VIDEO TRANSITIONS
    const videos = document.querySelectorAll('.background-video');
    videos.forEach((vid: any, i) => {
      vid.classList.remove('previous', 'active');

      if (i === newSection) {
        vid.classList.add('active');

        if (isScrollingDown) {
          gsap.set(vid, { opacity: 1, y: 0, clipPath: 'inset(100% 0 0 0)' });
          gsap.to(vid, {
            clipPath: 'inset(0% 0 0 0)',
            duration: duration,
            ease: 'power2.out',
          });
        } else {
          gsap.set(vid, { opacity: 1, y: 0, clipPath: 'inset(0 0 100% 0)' });
          gsap.to(vid, {
            clipPath: 'inset(0 0 0% 0)',
            duration: duration,
            ease: 'power2.out',
          });
        }
      } else if (i === previousSection) {
        vid.classList.add('previous');

        gsap.to(vid, {
          y: isScrollingDown ? `${parallaxAmount}%` : `-${parallaxAmount}%`,
          duration: duration,
          ease: 'power2.out',
        });

        gsap.to(vid, {
          opacity: 0,
          delay: duration * 0.4,
          duration: duration * 0.4,
          ease: 'power2.out',
          onComplete: () => {
            vid.classList.remove('previous');
            gsap.set(vid, { y: 0 });
            this.isAnimating = false;
          },
        });
      } else {
        gsap.to(vid, {
          opacity: 0,
          duration: duration * 0.2,
          ease: 'power2.out',
        });
      }
    });

    // BATCH SERVICE/CATEGORY UPDATES
    requestAnimationFrame(() => {
      const services = document.querySelectorAll('.service');
      const categories = document.querySelectorAll('.category');

      services.forEach((service, i) => {
        if (i === newSection) {
          service.classList.add('active');
          gsap.to(service, { opacity: 1, duration: 0.25, ease: 'power2.out' });
        } else {
          service.classList.remove('active');
          gsap.to(service, {
            opacity: 0.3,
            duration: 0.25,
            ease: 'power2.out',
          });
        }
      });

      categories.forEach((category, i) => {
        if (i === newSection) {
          category.classList.add('active');
          gsap.to(category, { opacity: 1, duration: 0.25, ease: 'power2.out' });
        } else {
          category.classList.remove('active');
          gsap.to(category, {
            opacity: 0.3,
            duration: 0.25,
            ease: 'power2.out',
          });
        }
      });
    });
  }

  private lastScrollUpdateTime = 0;
  private scrollUpdateDelay = 16;
  private onScrollUpdate = () => {
    const now = performance.now();

    if (now - this.lastScrollUpdateTime >= this.scrollUpdateDelay) {
      this.lastScrollUpdateTime = now;

      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.update();
      }
    }
  };
  private updateProgressNumbers(): void {
    const currentSectionDisplay = document.getElementById('current-section');
    if (currentSectionDisplay) {
      currentSectionDisplay.textContent = (this.currentSection + 1)
        .toString()
        .padStart(2, '0');
    }
  }

  private distributeImagesIntoGalleries(): void {
    const optimizedImages = this.galleryImages.map((url) =>
      url.includes('?') ? url : `${url}?auto=compress&w=800`,
    );
    const shuffledImages = [...optimizedImages].sort(() => Math.random() - 0.5);

    const isMobile = this.isBrowser && window.innerWidth < 768;
    const maxImages = isMobile ? 8 : 15;
    const limitedImages = shuffledImages.slice(0, maxImages);
    const sectionsCount = 4;
    const imagesPerSection = Math.ceil(shuffledImages.length / sectionsCount);

    for (let i = 0; i < sectionsCount; i++) {
      const startIndex = i * imagesPerSection;
      const endIndex = Math.min(
        startIndex + imagesPerSection,
        shuffledImages.length,
      );
      const sectionImages = shuffledImages.slice(startIndex, endIndex);

      const rowHeight = this.rowHeights[i % this.rowHeights.length];

      const images: GalleryImage[] = sectionImages.map((src) => ({
        src,
        width: this.w,
        height: rowHeight,
      }));

      this.galleries.push({
        images,
        rowHeight,
      });
      this.totalImages += images.length;
    }
  }

  private waitForGsap(): void {
    const checkGsap = () => {
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        console.log('GSAP and ScrollTrigger loaded successfully');
      } else {
        setTimeout(checkGsap, 50);
      }
    };
    checkGsap();
  }

  onImageLoad(): void {
    if (!this.isBrowser) return;
    this.onAssetLoaded();
  }

  private onAssetLoaded(): void {
    if (!this.isBrowser) return;

    this.loadedAssets++;
    this.loadProgress = Math.round(
      (this.loadedAssets * 100) / this.totalAssetsToLoad,
    );

    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
      (progressBar as HTMLElement).style.width = `${this.loadProgress}%`;
    }

    if (this.loadedAssets >= this.totalAssetsToLoad) {
      setTimeout(() => {
        this.hideLoadingScreen();
      }, 300);
    }
  }

  private showDemo(): void {
    if (!this.isBrowser) return;

    this.isLoaded = true;
    document.body.style.overflow = 'auto';
    document.documentElement.scrollTo(0, 0);

    setTimeout(() => {
      this.initScrollAnimations();
    }, 600);
  }

  private optimizeFrameRate(): void {
    if (!this.isBrowser) return;

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      // CRITICAL GSAP OPTIMIZATIONS:
      gsap.ticker.lagSmoothing(0); // Disable lag smoothing
      gsap.ticker.fps(60); // Lock to 60fps for all devices

      // Optimize ScrollTrigger
      ScrollTrigger.config({
        limitCallbacks: true,
        ignoreMobileResize: true,
        autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
        syncInterval: 16.7, // ~60fps sync
      });

      // Normalize scroll behavior
      ScrollTrigger.normalizeScroll({
        allowNestedScroll: true,
        momentum: (self: any) => Math.min(1, self.velocityY / 1000),
        type: 'pointer,touch,wheel',
      });
    }
  }

  private initScrollAnimations(): void {
    if (!this.isBrowser || typeof gsap === 'undefined') return;

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    const sections = document.querySelectorAll('section');

    sections.forEach((section, index) => {
      const wrapper = section.querySelector('.wrapper') as HTMLElement;
      if (!wrapper) return;

      const isEven = index % 2 === 0;
      const scrollWidth = wrapper.scrollWidth;
      const offsetWidth = section.offsetWidth;

      let xStart: number;
      let xEnd: number;

      if (isEven) {
        xStart = scrollWidth * -1;
        xEnd = 0;
      } else {
        xStart = offsetWidth;
        xEnd = (scrollWidth - offsetWidth) * -1;
      }

      gsap.set(wrapper, { willChange: 'transform' });

      const animation = gsap.fromTo(
        wrapper,
        {
          x: xStart,
          force3D: true,
        },
        {
          x: xEnd,
          ease: 'none',
          force3D: true,
          scrollTrigger: {
            trigger: section,
            scrub: 0.3,
            start: 'top bottom',
            end: 'bottom top',
            anticipatePin: 1,
            fastScrollEnd: true,
            markers: false,
          },
        },
      );

      this.demoScrollTriggers.push(animation.scrollTrigger);
    });

    setTimeout(() => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh(true);
        ScrollTrigger.sort();
      }
    }, 100);
  }
  private setupDemoTextAnimations(): void {
    if (!this.isBrowser) return;

    const header = this.demoWrapper?.nativeElement.querySelector('header');
    if (header) {
      gsap.from(header, {
        scrollTrigger: {
          trigger: header,
          start: 'top 80%',
          once: true,
        },
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
      });
    }

    const footer = this.demoWrapper?.nativeElement.querySelector('footer');
    if (footer) {
      gsap.from(footer, {
        scrollTrigger: {
          trigger: footer,
          start: 'top 90%',
          once: true,
        },
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
    }
  }

  private optimizeGalleryImages(): void {
    if (!this.isBrowser) return;

    this.galleries.forEach((gallery) => {
      gallery.images.forEach((image) => {
        const img = new Image();
        img.src = image.src;
        img.loading = 'eager';

        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = image.src;
        document.head.appendChild(link);
      });
    });
  }
  private setupDemoAnimations(): void {
    if (!this.demoWrapper?.nativeElement) return;

    const sections = this.demoWrapper.nativeElement.querySelectorAll('section');

    sections.forEach((section: HTMLElement, index: number) => {
      const wrapper = section.querySelector('.wrapper') as HTMLElement;
      if (!wrapper) return;

      const isEven = index % 2 === 0;
      const scrollWidth = wrapper.scrollWidth;
      const offsetWidth = section.offsetWidth;

      let xStart: number;
      let xEnd: number;

      if (isEven) {
        xStart = scrollWidth * -1;
        xEnd = 0;
      } else {
        xStart = offsetWidth;
        xEnd = (scrollWidth - offsetWidth) * -1;
      }

      const animation = gsap.fromTo(
        wrapper,
        { x: xStart },
        {
          x: xEnd,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            scrub: 0.5,
            start: 'top bottom',
            end: 'bottom top',
          },
        },
      );

      const trigger = ScrollTrigger.getById(animation.scrollTrigger?.id);
      if (trigger) {
        this.demoScrollTriggers.push(trigger);
      }
    });
  }

  private throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number,
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    let lastResult: any;

    return (...args: Parameters<T>): void => {
      if (!inThrottle) {
        inThrottle = true;
        lastResult = func.apply(this, args);
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  private onDemoScrollUpdate(): void {
    const now = Date.now();

    if (now - this.lastScrollTime >= this.scrollThrottleDelay) {
      this.lastScrollTime = now;

      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.update();
      }
    }
  }

  private setupResizeObserver(): void {
    if (
      !this.isBrowser ||
      !this.demoWrapper?.nativeElement ||
      typeof ResizeObserver === 'undefined'
    )
      return;

    let resizeTimeout: any = null;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      resizeTimeout = setTimeout(() => {
        this.refreshDemoAnimations();
      }, 150);
    };

    this.resizeObserver = new ResizeObserver(handleResize);
    this.resizeObserver.observe(this.demoWrapper.nativeElement);

    if (this.isBrowser) {
      window.addEventListener('orientationchange', () => {
        setTimeout(() => this.refreshDemoAnimations(), 300);
      });
    }
  }
  private refreshDemoAnimations(): void {
    if (typeof ScrollTrigger !== 'undefined') {
      this.demoScrollTriggers.forEach((trigger) => {
        if (trigger && typeof trigger.refresh === 'function') {
          trigger.refresh();
        }
      });
    }
  }

  private cleanupDemoAnimations(): void {
    this.demoScrollTriggers.forEach((trigger) => {
      if (trigger && typeof trigger.kill === 'function') {
        trigger.kill();
      }
    });
    this.demoScrollTriggers = [];

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
}
