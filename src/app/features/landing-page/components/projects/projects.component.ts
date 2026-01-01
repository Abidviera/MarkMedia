import { Component, OnInit, OnDestroy, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';

@Component({
  selector: 'app-projects',
  standalone: false,
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  private smoother: any;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      // Register GSAP plugins
      gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initScrollSmoother();
    }
  }

  private initScrollSmoother(): void {
    // Create the smooth scroller
    this.smoother = ScrollSmoother.create({
      wrapper: "#wrapper",
      content: "#content",
      smooth: 1.5,
      normalizeScroll: true,
      ignoreMobileResize: true,
      effects: true
    });

    // Animate heading
    gsap.set(".heading", {
      yPercent: -150,
      opacity: 1
    });

    // Split text animation for "capture..."
    const splitElement = document.querySelector("#split-stagger");
    if (splitElement) {
      const mySplitText = new SplitText("#split-stagger", { type: "words,chars" });
      const chars = mySplitText.chars;
      
      chars.forEach((char: any, i: number) => {
        this.smoother.effects(char, { speed: 1, lag: (i + 1) * 0.1 });
      });
    }

    // Bar animation for photography categories
    const bars = document.querySelectorAll('.bar');
    bars.forEach((bar: any) => {
      gsap.to(bar, {
        height: '60%',
        scrollTrigger: {
          trigger: bar,
          start: 'top 80%',
          end: 'top 30%',
          scrub: true
        }
      });
    });
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.smoother) {
      this.smoother.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }
  }
}
