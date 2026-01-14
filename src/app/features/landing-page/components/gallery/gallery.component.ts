import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

declare const gsap: any;
declare const ScrollTrigger: any;

interface GalleryImage {
  src: string;
  width: number;
  height: number;
}

interface GallerySection {
  images: GalleryImage[];
  rowHeight: number;
}

@Component({
  selector: 'app-gallery',
  standalone: false,
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent implements OnInit, AfterViewInit, OnDestroy {
  w = 1240;
  galleries: GallerySection[] = [];
  loadProgress = 0;
  isLoaded = false;
  private totalImages = 0;
  private loadedImages = 0;
  private isBrowser: boolean;

  private rowHeights = [600, 800, 700, 900];

 
  private galleryImages: string[] = [
    'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg',
    'https://images.pexels.com/photos/1144176/pexels-photo-1144176.jpeg',
    'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg', 
    'https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg', 
    'https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg', 
    'https://images.pexels.com/photos/1432675/pexels-photo-1432675.jpeg', 
    'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg', 
    'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg', 
    'https://images.pexels.com/photos/2531709/pexels-photo-2531709.jpeg', 
    'https://images.pexels.com/photos/1cosmos74/pexels-photo-1cosmos74.jpeg', 
    'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg', 
    'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg',
    'https://images.pexels.com/photos/1366630/pexels-photo-1366630.jpeg', 
    'https://images.pexels.com/photos/1320686/pexels-photo-1320686.jpeg', 
    'https://images.pexels.com/photos/1231265/pexels-photo-1231265.jpeg', 
  ];

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.waitForGsap();
      this.distributeImagesIntoGalleries();
      document.body.style.overflow = 'hidden';
    }
  }

  private distributeImagesIntoGalleries(): void {
    const shuffledImages = [...this.galleryImages].sort(() => Math.random() - 0.5);
    
    const sectionsCount = 4;
    const imagesPerSection = Math.ceil(shuffledImages.length / sectionsCount);
    
    for (let i = 0; i < sectionsCount; i++) {
      const startIndex = i * imagesPerSection;
      const endIndex = Math.min(startIndex + imagesPerSection, shuffledImages.length);
      const sectionImages = shuffledImages.slice(startIndex, endIndex);
      
      const rowHeight = this.rowHeights[i % this.rowHeights.length];
      
      const images: GalleryImage[] = sectionImages.map(src => ({
        src,
        width: this.w,
        height: rowHeight,
      }));
      
      this.galleries.push({ 
        images,
        rowHeight 
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

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    if (this.totalImages === 0) {
      this.showDemo();
    }
  }

  onImageLoad(): void {
    if (!this.isBrowser) return;

    this.loadedImages++;
    this.loadProgress = Math.round(
      (this.loadedImages * 100) / this.totalImages
    );

    if (this.loadedImages >= this.totalImages) {
      setTimeout(() => {
        this.showDemo();
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

      gsap.fromTo(
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
        }
      );
    });

    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      document.body.style.overflow = '';

      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
      }
    }
  }
  
}