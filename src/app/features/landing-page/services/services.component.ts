import { Component, OnInit, OnDestroy, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare const gsap: any;
declare const ScrollTrigger: any;

@Component({
  selector: 'app-services',
  standalone: false,
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit, OnDestroy, AfterViewInit {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initializeScrollEffects();
    }
  }

  private initializeScrollEffects(): void {
    setTimeout(() => {
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        this.setupHorizontalScroll();
      }
    }, 100);
  }

  private setupHorizontalScroll(): void {
    const pinWrap = document.querySelector('.pin-wrap') as HTMLElement;
    const pinWrapWidth = pinWrap?.scrollWidth;
    
    if (pinWrap && pinWrapWidth) {
      const horizontalScrollLength = pinWrapWidth - window.innerWidth;

      gsap.to('.pin-wrap', {
        scrollTrigger: {
          trigger: '#sectionPin',
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => `+=${pinWrapWidth}`,
          anticipatePin: 1,
          invalidateOnRefresh: true
        },
        x: -horizontalScrollLength,
        ease: 'none'
      });
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser && typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
    }
  }
}