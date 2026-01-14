declare const gsap: any;
declare const ScrollTrigger: any;
declare const LocomotiveScroll: any;
declare const Flip: any;
declare const CustomEase: any;
declare const SplitText: any;

// Lenis type definitions
declare module 'lenis' {
  export interface LenisOptions {
    duration?: number;
    easing?: (t: number) => number;
    orientation?: 'vertical' | 'horizontal';
    gestureOrientation?: 'vertical' | 'horizontal' | 'both';
    smoothWheel?: boolean;
    wheelMultiplier?: number;
    touchMultiplier?: number;
    infinite?: boolean;
    autoResize?: boolean;
  }

  export interface LenisScrollToOptions {
    offset?: number;
    duration?: number;
    easing?: (t: number) => number;
    lock?: boolean;
    force?: boolean;
    onComplete?: () => void;
  }

  export default class Lenis {
    constructor(options?: LenisOptions);
    raf(time: number): void;
    scrollTo(target: number | string | HTMLElement, options?: LenisScrollToOptions): void;
    on(event: string, callback: (e: any) => void): void;
    destroy(): void;
    stop(): void;
    start(): void;
  }
}

// Window interface extensions
interface Window {
  gsap: any;
  ScrollTrigger: any;
  Flip: any;
  CustomEase: any;
  SplitText: any;
  Lenis: any;
}