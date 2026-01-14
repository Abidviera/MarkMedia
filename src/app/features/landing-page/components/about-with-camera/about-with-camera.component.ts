import { Component, OnInit, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

declare const gsap: any;
declare const ScrollTrigger: any;

@Component({
  selector: 'app-about-with-camera',
  standalone: false,
  templateUrl: './about-with-camera.component.html',
  styleUrl: './about-with-camera.component.scss'
})
export class AboutWithCameraComponent {
  isMobileMenuOpen = false;

  // Stats for Mark Media
  stats = [
    { number: 500, suffix: '+', label: 'Projects Completed' },
    { number: 10, suffix: '+', label: 'Years Experience' },
    { number: 450, suffix: '+', label: 'Happy Clients' },
    { number: 15, suffix: '+', label: 'Team Members' }
  ];

  constructor() {}

  ngOnInit(): void {
    if (typeof gsap !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
  }

  ngAfterViewInit(): void {
    this.setupScrollAnimations();
    
    if (typeof ScrollTrigger !== 'undefined') {
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    // Clean up handled by main component
  }

  @HostListener('window:resize')
  onResize(): void {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }

  toggleMobileNav(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  private runInitialAnimations(): void {
    if (typeof gsap === 'undefined') return;

    const onLoadTl = gsap.timeline({ defaults: { ease: "power2.out" } });

    onLoadTl
      .to("header", {
        "--border-width": "100%",
        duration: 3,
      }, 0)
      .from(".desktop-nav a, .social-sidebar a", {
        y: -100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      }, 0)
      .to(".social-sidebar", {
        "--border-height": "100%",
        duration: 10,
      }, 0)
      .to(".hero-content h1", {
        opacity: 1,
        duration: 1,
      }, 0)
      .to(".hero-content h1", {
        delay: 0.5,
        duration: 1.2,
        color: "#dc2626",
        "-webkit-text-stroke": "0px #dc2626",
      }, 0)
      .from(".hero-content .line", {
        x: 100,
        delay: 1,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      }, 0)
      .to(".hero-bottle-wrapper", {
        opacity: 1,
        scale: 1,
        delay: 1.5,
        duration: 1.3,
        ease: "power3.out",
      }, 0)
      .to(".hero-stamp", {
        opacity: 1,
        scale: 1,
        delay: 2,
        duration: 0.2,
        ease: "back.out(3)",
      }, 0)
      .to(".hero-stamp", {
        y: "+=5",
        x: "-=3",
        repeat: 2,
        yoyo: true,
        duration: 0.05,
        ease: "power1.inOut",
      }, 0);
  }

  private setupScrollAnimations(): void {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const header = document.querySelector("header");
    if (!header) return;

    const headerOffset = header.clientHeight - 1;

    const testHero = document.querySelector('.vintage-hero');
    if (!testHero) return;

    ScrollTrigger.create({
      trigger: testHero,
      start: "top 80%",
      once: true,
      onEnter: () => {
        this.runInitialAnimations();
        this.animateStats();
      }
    });

    ScrollTrigger.matchMedia({
      "(min-width: 769px)": () => {
        this.pinAndAnimate({
          trigger: ".vintage-hero",
          endTrigger: ".section-intro",
          pin: ".hero-bottle-wrapper",
          animations: [
            { target: ".hero-bottle", vars: { rotate: 0, scale: 0.8 } }
          ],
          headerOffset,
        });

        this.pinAndAnimate({
          trigger: ".section-intro",
          endTrigger: ".timeline-entry:nth-child(even)",
          pin: ".hero-bottle-wrapper",
          animations: [
            { target: ".hero-bottle", vars: { rotate: 10, scale: 0.7 } },
            { target: ".hero-bottle-wrapper", vars: { x: "30%" } }
          ],
          headerOffset,
        });

        this.pinAndAnimate({
          trigger: ".timeline-entry:nth-child(even)",
          endTrigger: ".timeline-entry:nth-child(odd)",
          pin: ".hero-bottle-wrapper",
          animations: [
            { target: ".hero-bottle", vars: { rotate: -10, scale: 0.7 } },
            { target: ".hero-bottle-wrapper", vars: { x: "-25%" } }
          ],
          headerOffset,
        });
      },

      "(max-width: 768px)": () => {
        ScrollTrigger.create({
          trigger: testHero,
          start: "bottom top",
          once: true,
          onEnter: () => {
            gsap.to(".hero-bottle-wrapper", {
              opacity: 1,
              duration: 1,
              delay: 0.5,
            });
          }
        });
      }
    });
  }

  private animateStats(): void {
    if (typeof gsap === 'undefined') return;

    ScrollTrigger.create({
      trigger: '.stats-grid',
      start: 'top 80%',
      once: true,
      onEnter: () => {
        this.stats.forEach((stat, index) => {
          const element = document.querySelector(`.stat-number-${index}`);
          if (element) {
            gsap.to({ value: 0 }, {
              value: stat.number,
              duration: 2.5,
              delay: index * 0.1,
              ease: 'power1.out',
              onUpdate: function() {
                const currentValue = Math.floor(this.targets()[0].value);
                element.textContent = currentValue + stat.suffix;
              },
              onComplete: () => {
                element.textContent = stat.number + stat.suffix;
                gsap.timeline()
                  .to(element, {
                    scale: 1.15,
                    color: '#dc2626',
                    duration: 0.2,
                    ease: 'power2.out'
                  })
                  .to(element, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'elastic.out(1, 0.5)'
                  });
              }
            });
          }
        });
      }
    });
  }

  private pinAndAnimate(config: {
    trigger: string;
    endTrigger: string;
    pin: string;
    animations: Array<{ target: string; vars: any }>;
    headerOffset: number;
    markers?: boolean;
  }): void {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: config.trigger,
        start: `top top+=${config.headerOffset}`,
        endTrigger: config.endTrigger,
        end: `top top+=${config.headerOffset}`,
        scrub: true,
        pin: config.pin,
        pinSpacing: false,
        markers: config.markers || false,
        invalidateOnRefresh: true,
      },
    });

    config.animations.forEach(({ target, vars }) => {
      tl.to(target, vars);
    });
  }
}