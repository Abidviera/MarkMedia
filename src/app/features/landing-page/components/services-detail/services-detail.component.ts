import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, PLATFORM_ID, Inject, AfterViewInit, SimpleChanges } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare var gsap: any;
declare var THREE: any;


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
  selector: 'app-services-detail',
  standalone: false,
  templateUrl: './services-detail.component.html',
  styleUrl: './services-detail.component.scss'
})
export class ServicesDetailComponent {
@Input() isOpen = false;
  @Input() detailData: GalleryDetailData | null = null;
  @Output() closeDetail = new EventEmitter<void>();

  private isBrowser: boolean;
  private scene: any;
  private camera: any;
  private renderer: any;
  private particles: any;
  private animationFrameId: any;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
   
  }

   ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue && this.isBrowser) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        this.animateEntry();
        this.initThreeJS();
      }, 100);
    } else if (changes['isOpen'] && !changes['isOpen'].currentValue && this.isBrowser) {
      document.body.style.overflow = 'auto';
      this.cleanupThreeJS();
    }
  }

  ngAfterViewInit(): void {
 
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      document.body.style.overflow = 'auto';
      this.cleanupThreeJS();
    }
  }

  close(): void {
    this.animateExit();
  }

  private animateEntry(): void {
    if (typeof gsap === 'undefined') return;

    const timeline = gsap.timeline();

    timeline
      .to('.detail-overlay', {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
      })
      .from('.detail-container', {
        scale: 0.9,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      }, 0.2)
      .from('.detail-header', {
        y: -50,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      }, 0.4)
      .from('.detail-main-image', {
        scale: 1.1,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      }, 0.5)
      .from('.detail-content-section', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      }, 0.7)
      .from('.work-card', {
        y: 40,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out'
      }, 0.9);
  }

  private animateExit(): void {
    if (typeof gsap === 'undefined') {
      this.closeDetail.emit();
      return;
    }

    const timeline = gsap.timeline({
      onComplete: () => {
        this.closeDetail.emit();
      }
    });

    timeline
      .to('.detail-container', {
        scale: 0.95,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in'
      })
      .to('.detail-overlay', {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
      }, 0.2);
  }

  private initThreeJS(): void {
    if (typeof THREE === 'undefined' || !this.isBrowser) return;

    const container = document.getElementById('three-canvas-container');
    if (!container) return;

    // Scene setup
    this.scene = new THREE.Scene();
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xdc2626,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.particles);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xdc2626, 1);
    pointLight.position.set(2, 3, 4);
    this.scene.add(pointLight);

    // Animation
    this.animate();

    // Handle resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private animate = (): void => {
    if (!this.renderer || !this.scene || !this.camera) return;

    this.animationFrameId = requestAnimationFrame(this.animate);

    // Rotate particles
    if (this.particles) {
      this.particles.rotation.y += 0.001;
      this.particles.rotation.x += 0.0005;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    const container = document.getElementById('three-canvas-container');
    if (!container || !this.camera || !this.renderer) return;

    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  private cleanupThreeJS(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.renderer) {
      this.renderer.dispose();
      const container = document.getElementById('three-canvas-container');
      if (container && this.renderer.domElement) {
        container.removeChild(this.renderer.domElement);
      }
    }

    if (this.scene) {
      this.scene.clear();
    }

    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }
}
