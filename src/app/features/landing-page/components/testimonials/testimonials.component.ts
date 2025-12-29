import { Component, OnInit, OnDestroy, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare const gsap: any;
declare const Lenis: any;

interface Project {
  id: number;
  title: string;
  year: string;
  image: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: false,
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent {
  projects: Project[] = [
    {
      id: 1,
      title: "Silence",
      year: "2021",
      image: "https://cdn.cosmos.so/7d47d4e2-0eff-4e2f-9734-9d24a8ba067e?format=jpeg"
    },
    {
      id: 2,
      title: "Resonance",
      year: "2022",
      image: "https://cdn.cosmos.so/5eee2d2d-3d4d-4ae5-96d4-cdbae70a2387?format=jpeg"
    },
    {
      id: 3,
      title: "Essence",
      year: "2022",
      image: "https://cdn.cosmos.so/def30e8a-34b2-48b1-86e1-07ec5c28f225?format=jpeg"
    },
    {
      id: 4,
      title: "Void",
      year: "2023",
      image: "https://cdn.cosmos.so/44d7cb23-6759-49e4-9dc1-acf771b3a0d1?format=jpeg"
    },
    {
      id: 5,
      title: "Presence",
      year: "2023",
      image: "https://cdn.cosmos.so/7712fe42-42ca-4fc5-9590-c89f2db99978?format=jpeg"
    },
    {
      id: 6,
      title: "Flow",
      year: "2024",
      image: "https://cdn.cosmos.so/cbee1ec5-01b6-4ffe-9f34-7da7980454cf?format=jpeg"
    },
    {
      id: 7,
      title: "Clarity",
      year: "2024",
      image: "https://cdn.cosmos.so/2e91a9d1-db85-4499-ad37-6222a6fea23b?format=jpeg"
    },
    {
      id: 8,
      title: "Breath",
      year: "2024",
      image: "https://cdn.cosmos.so/ff2ac3d3-fa94-4811-89f6-0d008b27e439?format=jpeg"
    },
    {
      id: 9,
      title: "Stillness",
      year: "2025",
      image: "https://cdn.cosmos.so/c39a4043-f489-4406-8018-a103a3f89802?format=jpeg"
    },
    {
      id: 10,
      title: "Surrender",
      year: "2025",
      image: "https://cdn.cosmos.so/e5e399f2-4050-463b-a781-4f5a1615f28e?format=jpeg"
    }
  ];

  currentView: 'list' | 'grid' = 'list';
  isAnimating = false;
  popupImageSrc = '';
  isPopupVisible = false;

  private lenis: any;
  private popupHideTimeout: any = null;
  private popupShowTimeout: any = null;
  private currentHoveredItem: HTMLElement | null = null;
  private lastInteractionTime = 0;
  private mouseOverImageContainer = false;
  private isBrowser = false;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.forceImageLoad();
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    setTimeout(() => {
      this.initGSAP();
      this.initLenis();
      this.setupLogoAnimations();
      this.setupFooterAnimation();
      this.initialAnimation();
      this.setupGlobalEvents();
    }, 100);
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;

    if (this.lenis) {
      this.lenis.destroy();
    }
    if (this.popupHideTimeout) clearTimeout(this.popupHideTimeout);
    if (this.popupShowTimeout) clearTimeout(this.popupShowTimeout);
    
    document.removeEventListener('mousemove', this.handleGlobalMouseMove);
    document.removeEventListener('scroll', this.handleScroll);
  }

  private initGSAP(): void {
    if (typeof gsap !== 'undefined') {
      if (gsap.registerPlugin) {
        const win = window as any;
        gsap.registerPlugin(win.ScrollTrigger);
        gsap.registerPlugin(win.Flip);
        if (win.CustomEase) {
          gsap.registerPlugin(win.CustomEase);
          win.CustomEase.create("customEase", "0.6, 0.01, 0.05, 1");
        }
      }
    }
  }

  private initLenis(): void {
    if (typeof Lenis === 'undefined') return;

    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false
    });

    this.lenis.on('scroll', () => {
      const win = window as any;
      if (win.ScrollTrigger) {
        win.ScrollTrigger.update();
      }
    });

    const raf = (time: number) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    if (typeof gsap !== 'undefined') {
      gsap.ticker.add((time: number) => {
        this.lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  private setupLogoAnimations(): void {
    if (typeof gsap === 'undefined') return;

    // Animate header logo letters
    const headerLogoLetters = document.querySelectorAll('.header-logo .logo-letter');
    
    gsap.to('.header-logo', {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    });

    gsap.set(headerLogoLetters, {
      clipPath: 'inset(100% 0 0 0)',
      opacity: 1
    });

    gsap.to(headerLogoLetters, {
      clipPath: 'inset(0% 0 0 0)',
      duration: 1.2,
      ease: 'power2.out',
      stagger: 0.08,
      delay: 0.3
    });
  }

  private setupFooterAnimation(): void {
    if (typeof gsap === 'undefined') return;
    
    const win = window as any;
    if (!win.ScrollTrigger) return;

    const ScrollTrigger = win.ScrollTrigger;

    gsap.set('.footer-logo', { opacity: 1 });

    // Animate footer logo letters
    const footerLogoLetters = document.querySelectorAll('.footer-logo .logo-letter');

    gsap.set(footerLogoLetters, {
      clipPath: 'inset(100% 0 0 0)',
      opacity: 1
    });

    ScrollTrigger.create({
      trigger: '.footer-logo',
      start: 'top 80%',
      onEnter: () => {
        gsap.to(footerLogoLetters, {
          clipPath: 'inset(0% 0 0 0)',
          duration: 1.2,
          ease: 'power2.out',
          stagger: 0.08
        });
      },
      once: true
    });

    ScrollTrigger.batch('.footer-section', {
      start: 'top 90%',
      onEnter: (batch: any) => {
        gsap.from(batch, {
          opacity: 0,
          y: 30,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power2.out'
        });
      },
      once: true
    });

    ScrollTrigger.create({
      trigger: '.footer-header',
      start: 'top 85%',
      onEnter: () => {
        gsap.from('.light-text', {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: 'power2.out'
        });

        gsap.from('.bold-text', {
          opacity: 0,
          y: 20,
          duration: 0.8,
          delay: 0.2,
          ease: 'power2.out'
        });
      },
      once: true
    });
  }

  private initialAnimation(): void {
    if (typeof gsap === 'undefined') return;

    gsap.set('.project-item', { opacity: 0, y: 30 });
    gsap.to('.project-item', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: { each: 0.08, from: 'start' }
    });
  }

  private forceImageLoad(): void {
    this.projects.forEach(project => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = project.image;
    });
  }

  private setupGlobalEvents(): void {
    document.addEventListener('mousemove', this.handleGlobalMouseMove.bind(this));
    document.addEventListener('scroll', this.debounce(this.handleScroll.bind(this), 50), { passive: true });
  }

  private handleGlobalMouseMove = (e: MouseEvent): void => {
    this.lastInteractionTime = Date.now();

    if (this.currentView === 'grid') {
      this.handleGridViewMouseMove(e);
    } else if (this.currentView === 'list') {
      this.handleListViewMouseMove(e);
    }
  }

  private handleGridViewMouseMove(e: MouseEvent): void {
    const imageContainers = document.querySelectorAll('.grid-view .project-image-container');
    let foundContainer: Element | null = null;

    imageContainers.forEach(container => {
      const rect = container.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom) {
        foundContainer = container;
      }
    });

    if (foundContainer) {
      this.mouseOverImageContainer = true;
      if (this.popupHideTimeout) {
        clearTimeout(this.popupHideTimeout);
        this.popupHideTimeout = null;
      }

      const projectItem = (foundContainer as Element).closest('.project-item') as HTMLElement;
      if (projectItem !== this.currentHoveredItem) {
        this.currentHoveredItem = projectItem;
        this.updatePopupFromItem(projectItem);
      }
    } else {
      this.mouseOverImageContainer = false;
      if (this.isPopupVisible) {
        if (this.popupHideTimeout) clearTimeout(this.popupHideTimeout);
        this.popupHideTimeout = setTimeout(() => {
          if (!this.mouseOverImageContainer) {
            this.hidePopup();
            this.currentHoveredItem = null;
          }
        }, 150);
      }
    }
  }

  private handleListViewMouseMove(e: MouseEvent): void {
    const projectItems = document.querySelectorAll('.list-view .project-item');
    let foundItem: Element | null = null;

    projectItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      if (e.clientX >= rect.left - 2 && e.clientX <= rect.right + 2 &&
          e.clientY >= rect.top - 2 && e.clientY <= rect.bottom + 2) {
        foundItem = item;
      }
    });

    if (foundItem) {
      if (foundItem !== this.currentHoveredItem) {
        this.currentHoveredItem = foundItem as HTMLElement;

        if (this.popupHideTimeout) {
          clearTimeout(this.popupHideTimeout);
          this.popupHideTimeout = null;
        }

        if (this.popupShowTimeout) clearTimeout(this.popupShowTimeout);
        this.popupShowTimeout = setTimeout(() => {
          this.updatePopupFromItem(this.currentHoveredItem!);
        }, 10);
      }
    } else {
      if (this.popupHideTimeout) clearTimeout(this.popupHideTimeout);
      this.popupHideTimeout = setTimeout(() => {
        this.hidePopup();
        this.currentHoveredItem = null;
      }, 150);
    }
  }

  private handleScroll = (): void => {
    if (!this.isPopupVisible) return;

    const containers = this.currentView === 'grid'
      ? document.querySelectorAll('.project-image-container')
      : document.querySelectorAll('.project-item');

    const viewportHeight = window.innerHeight;
    const viewportCenter = viewportHeight / 2;

    let closestContainer: Element | null = null;
    let closestDistance = Infinity;

    containers.forEach(container => {
      const rect = container.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const distance = Math.abs(itemCenter - viewportCenter);

      if (distance < closestDistance && rect.top < viewportHeight && rect.bottom > 0) {
        closestDistance = distance;
        closestContainer = container;
      }
    });

    if (closestContainer) {
      const projectItem = (closestContainer as Element).closest('.project-item') as HTMLElement;
      if (projectItem !== this.currentHoveredItem) {
        this.currentHoveredItem = projectItem;
        this.updatePopupFromItem(projectItem);
      }
    }
  }

  private updatePopupFromItem(item: HTMLElement): void {
    if (!item) return;

    const projectId = parseInt(item.dataset['id'] || '0');
    const project = this.projects.find(p => p.id === projectId);

    if (project) {
      this.showPopup(project.image);
    }
  }

  private showPopup(src: string): void {
    if (!src || typeof gsap === 'undefined') return;

    const popupOverlay = document.getElementById('popup-overlay');
    const popupImage = document.querySelector('.popup-image') as HTMLImageElement;

    if (!popupOverlay || !popupImage) return;

    if (popupOverlay.style.display !== 'flex') {
      this.isPopupVisible = true;
      this.popupImageSrc = src;
      popupImage.src = src;
      popupOverlay.style.display = 'flex';
      gsap.fromTo(popupOverlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    } else if (popupImage.src !== src) {
      gsap.to(popupImage, {
        opacity: 0,
        duration: 0.1,
        ease: 'power2.out',
        onComplete: () => {
          this.popupImageSrc = src;
          popupImage.src = src;
          gsap.to(popupImage, {
            opacity: 1,
            duration: 0.1,
            ease: 'power2.out'
          });
        }
      });
    }
  }

  private hidePopup(): void {
    if (Date.now() - this.lastInteractionTime < 100) return;
    if (typeof gsap === 'undefined') return;

    const popupOverlay = document.getElementById('popup-overlay');
    if (!popupOverlay) return;

    this.isPopupVisible = false;

    gsap.to(popupOverlay, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        popupOverlay.style.display = 'none';
      }
    });
  }

  private debounce(func: Function, delay: number): EventListener {
    let timeout: any;
    return function(this: any, ...args: any[]) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    } as EventListener;
  }

  toggleView(viewType: 'list' | 'grid'): void {
    if (this.currentView === viewType || this.isAnimating || !this.isBrowser) return;
    this.isAnimating = true;

    this.hidePopup();
    this.currentHoveredItem = null;
    this.mouseOverImageContainer = false;

    if (this.popupHideTimeout) {
      clearTimeout(this.popupHideTimeout);
      this.popupHideTimeout = null;
    }

    if (this.popupShowTimeout) {
      clearTimeout(this.popupShowTimeout);
      this.popupShowTimeout = null;
    }

    const win = window as any;
    if (typeof gsap === 'undefined' || !win.Flip) {
      this.currentView = viewType;
      this.isAnimating = false;
      return;
    }

    const Flip = win.Flip;
    const projectsContainer = document.getElementById('projects-container');
    const projectItems = document.querySelectorAll('.project-item');
    const titleElements = document.querySelectorAll('.project-title');
    const yearElements = document.querySelectorAll('.project-year');
    const imageContainers = document.querySelectorAll('.project-image-container');
    const imageElements = document.querySelectorAll('.project-image');

    if (viewType === 'list') {
      imageContainers.forEach(container => 
        container.classList.add('transitioning-to-list')
      );
    }

    const state = Flip.getState([projectItems, titleElements, yearElements, imageContainers]);
    
    projectsContainer?.classList.remove(`${this.currentView}-view`);
    projectsContainer?.classList.add(`${viewType}-view`);
    this.currentView = viewType;

    if (viewType === 'grid') {
      gsap.set(imageContainers, {
        display: 'block',
        visibility: 'visible',
        opacity: 1
      });
      gsap.set(imageElements, { clipPath: 'inset(100% 0% 0% 0%)' });
    }

    Flip.from(state, {
      duration: 1,
      ease: 'power2.out',
      absolute: true,
      nested: true,
      onEnter: (elements: any) =>
        gsap.fromTo(elements,
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: 'power2.out' }
        ),
      onLeave: (elements: any) =>
        gsap.to(elements, { opacity: 0, duration: 0.5, ease: 'power2.out' }),
      onComplete: () => {
        viewType === 'grid' ? this.animateImagesIn() : this.animateImagesOut();
      }
    });
  }

  private animateImagesIn(): void {
    if (typeof gsap === 'undefined') {
      this.isAnimating = false;
      return;
    }

    const imageElements = document.querySelectorAll('.project-image');
    gsap.to(imageElements, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1,
      ease: 'power2.out',
      stagger: 0.06,
      onComplete: () => {
        this.isAnimating = false;
      }
    });
  }

  private animateImagesOut(): void {
    if (typeof gsap === 'undefined') {
      this.isAnimating = false;
      return;
    }

    const imageElements = document.querySelectorAll('.project-image');
    const imageContainers = document.querySelectorAll('.project-image-container');
    
    gsap.to(imageElements, {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 1,
      ease: 'power2.out',
      stagger: 0.06,
      onComplete: () => {
        imageContainers.forEach(container =>
          container.classList.remove('transitioning-to-list')
        );
        gsap.set(imageContainers, { display: 'none', visibility: 'hidden' });
        this.isAnimating = false;
      }
    });
  }
}