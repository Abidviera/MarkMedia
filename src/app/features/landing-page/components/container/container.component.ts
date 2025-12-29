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

interface FeaturedProject {
  image: string;
  title: string;
  category: string;
  year: string;
  description: string;
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
    this.setupScrollTriggers();
    this.setupHorizontalGalleryScroll();
    this.setupPortfolioAnimations();
    
    if (this.videoElements[0]) {
      this.videoElements[0].play().catch(() => {});
    }
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
    const content = document.querySelector('.content');
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
          
          const moveY = (-(self.progress - 0.1) / 0.9) * 200;
          gsap.to(header, { y: moveY * 1.5, duration: 0.1, ease: 'power1.out' });
          gsap.to(content, { y: `calc(${moveY}px + (-50%))`, duration: 0.1, ease: 'power1.out' });
          gsap.to(footer, { y: moveY * 0.5, duration: 0.1, ease: 'power1.out' });
        } else {
          footer?.classList.remove('blur');
          leftColumn?.classList.remove('blur');
          rightColumn?.classList.remove('blur');
          featured?.classList.remove('blur');
          
          gsap.to(fixedContainer, { height: '100vh', duration: 0.1, ease: 'power1.out' });
          gsap.to(header, { y: 0, duration: 0.1, ease: 'power1.out' });
          gsap.to(content, { y: '-50%', duration: 0.1, ease: 'power1.out' });
          gsap.to(footer, { y: 0, duration: 0.1, ease: 'power1.out' });
        }
      }
    });

    this.updateProgressNumbers();
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