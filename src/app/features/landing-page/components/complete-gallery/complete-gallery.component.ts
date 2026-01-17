import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { gsap } from 'gsap';

interface MultipliersConfig {
  mouse: number;
  firefox: number;
}

interface WheelData {
  x: number;
  y: number;
}

interface MaxBounds {
  x: number;
  y: number;
}

interface OnPosition {
  x: number;
  y: number;
}
@Component({
  selector: 'app-complete-gallery',
  standalone: false,
  templateUrl: './complete-gallery.component.html',
  styleUrl: './complete-gallery.component.scss'
})
export class CompleteGalleryComponent {
private core: Core | null = null;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Initialize after view is ready
    setTimeout(() => {
      this.core = new Core();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.core) {
      this.core.destroy();
    }
  }
}

/** CORE CLASS **/
class Core {
  private tx = 0;
  private ty = 0;
  private cx = 0;
  private cy = 0;
  private diff = 0;
  
  private wheel: WheelData = { x: 0, y: 0 };
  private on: OnPosition = { x: 0, y: 0 };
  private max: MaxBounds = { x: 0, y: 0 };
  
  private isDragging = false;
  
  private el: HTMLElement | null = null;
  
  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private renderer!: THREE.WebGLRenderer;
  private planes: Plane[] = [];
  
  private ww = window.innerWidth;
  private wh = window.innerHeight;
  
  private isFirefox = navigator.userAgent.indexOf('Firefox') > -1;
  private isWindows = navigator.appVersion.indexOf("Win") !== -1;
  
  private multipliers: MultipliersConfig;
  
  private resizeHandler: () => void;
  private tickHandler: gsap.TickerCallback;
  private mouseMoveHandler: (e: MouseEvent) => void;
  private mouseDownHandler: (e: MouseEvent) => void;
  private mouseUpHandler: (e: MouseEvent) => void;
  private wheelHandler: (e: WheelEvent) => void;

  constructor() {
    const mouseMultiplier = 0.6;
    const firefoxMultiplier = 20;

    this.multipliers = {
      mouse: this.isWindows ? mouseMultiplier * 2 : mouseMultiplier,
      firefox: this.isWindows ? firefoxMultiplier * 2 : firefoxMultiplier
    };

    this.el = document.querySelector('.js-grid');
    
    // Initialize GL
    this.scene = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera(
      this.ww / -2, this.ww / 2, this.wh / 2, this.wh / -2, 1, 1000
    );
    this.camera.lookAt(this.scene.position);
    this.camera.position.z = 1;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.ww, this.wh);
    this.renderer.setPixelRatio(
      gsap.utils.clamp(1, 1.5, window.devicePixelRatio)
    );

    document.body.appendChild(this.renderer.domElement);
    
    // Bind methods
    this.resizeHandler = this.resize.bind(this);
    this.tickHandler = this.tick.bind(this);
    this.mouseMoveHandler = this.onMouseMove.bind(this);
    this.mouseDownHandler = this.onMouseDown.bind(this);
    this.mouseUpHandler = this.onMouseUp.bind(this);
    this.wheelHandler = this.onWheel.bind(this);
    
    this.addPlanes();
    this.addEvents();
    this.resize();
  }

  private addEvents(): void {
    gsap.ticker.add(this.tickHandler);

    window.addEventListener('mousemove', this.mouseMoveHandler);
    window.addEventListener('mousedown', this.mouseDownHandler);
    window.addEventListener('mouseup', this.mouseUpHandler);
    window.addEventListener('wheel', this.wheelHandler);
    window.addEventListener('resize', this.resizeHandler);
  }

  private removeEvents(): void {
    gsap.ticker.remove(this.tickHandler);

    window.removeEventListener('mousemove', this.mouseMoveHandler);
    window.removeEventListener('mousedown', this.mouseDownHandler);
    window.removeEventListener('mouseup', this.mouseUpHandler);
    window.removeEventListener('wheel', this.wheelHandler);
    window.removeEventListener('resize', this.resizeHandler);
  }

  private addPlanes(): void {
    const planeElements = Array.from(document.querySelectorAll('.js-plane'));
    
    this.planes = planeElements.map((el, i) => {
      const plane = new Plane();
      plane.init(el as HTMLElement, i, this.ww, this.wh);
      
      this.scene.add(plane);
      
      return plane;
    });
  }

  private tick(): void {
    const xDiff = this.tx - this.cx;
    const yDiff = this.ty - this.cy;
    
    this.cx += xDiff * 0.085;
    this.cx = Math.round(this.cx * 100) / 100;
    
    this.cy += yDiff * 0.085;
    this.cy = Math.round(this.cy * 100) / 100;
    
    this.diff = Math.max(
      Math.abs(yDiff * 0.0001), 
      Math.abs(xDiff * 0.0001)
    );
    
    if (this.planes.length) {
      this.planes.forEach(plane => 
        plane.update(this.cx, this.cy, this.max, this.diff)
      );
    }

    this.renderer.render(this.scene, this.camera);
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    
    this.tx = this.on.x + event.clientX * 2.5;
    this.ty = this.on.y - event.clientY * 2.5;
  }

  private onMouseDown(event: MouseEvent): void {
    if (this.isDragging) return;
    
    this.isDragging = true;
    
    this.on.x = this.tx - event.clientX * 2.5;
    this.on.y = this.ty + event.clientY * 2.5;
  }

  private onMouseUp(event: MouseEvent): void {
    if (!this.isDragging) return;
    
    this.isDragging = false;
  }

  private onWheel(e: WheelEvent): void {
    const { mouse, firefox } = this.multipliers;
    
    this.wheel.x = (e as any).wheelDeltaX || e.deltaX * -1;
    this.wheel.y = (e as any).wheelDeltaY || e.deltaY * -1;

    if (this.isFirefox && e.deltaMode === 1) {
      this.wheel.x *= firefox;
      this.wheel.y *= firefox;
    }

    this.wheel.y *= mouse;
    this.wheel.x *= mouse;
    
    this.tx += this.wheel.x;
    this.ty -= this.wheel.y;
  }

  private resize(): void {
    this.ww = window.innerWidth;
    this.wh = window.innerHeight;
    
    this.camera.left = this.ww / -2;
    this.camera.right = this.ww / 2;
    this.camera.top = this.wh / 2;
    this.camera.bottom = this.wh / -2;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(this.ww, this.wh);
    
    if (this.el) {
      const { bottom, right } = this.el.getBoundingClientRect();
      this.max.x = right;
      this.max.y = bottom;
    }

    if (this.planes.length) {
      this.planes.forEach(plane => plane.resize(this.ww, this.wh));
    }
  }

  public destroy(): void {
    this.removeEvents();
    
    this.planes.forEach(plane => {
      plane.dispose();
      this.scene.remove(plane);
    });
    
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}

/** PLANE CLASS **/
class Plane extends THREE.Object3D {
  private el!: HTMLElement;
  private x = 0;
  private y = 0;
  private my = 1;
  private geometry!: THREE.PlaneGeometry;
  private material!: THREE.ShaderMaterial;
  private mesh!: THREE.Mesh;
  private texture!: THREE.Texture;
  private rect!: DOMRect;
  private xOffset = 0;
  private yOffset = 0;
  private ww = 0;
  private wh = 0;

  private static loader = new THREE.TextureLoader();

  private static vertexShader = `
    precision mediump float;

    uniform float u_diff;

    varying vec2 vUv;

    void main(){
      vec3 pos = position;
      
      pos.y *= 1. - u_diff;
      pos.x *= 1. - u_diff;

      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
    }
  `;

  private static fragmentShader = `
    precision mediump float;

    uniform vec2 u_res;
    uniform vec2 u_size;
    uniform sampler2D u_texture;

    vec2 cover(vec2 screenSize, vec2 imageSize, vec2 uv) {
      float screenRatio = screenSize.x / screenSize.y;
      float imageRatio = imageSize.x / imageSize.y;

      vec2 newSize = screenRatio < imageRatio 
          ? vec2(imageSize.x * (screenSize.y / imageSize.y), screenSize.y)
          : vec2(screenSize.x, imageSize.y * (screenSize.x / imageSize.x));
      vec2 newOffset = (screenRatio < imageRatio 
          ? vec2((newSize.x - screenSize.x) / 2.0, 0.0) 
          : vec2(0.0, (newSize.y - screenSize.y) / 2.0)) / newSize;

      return uv * screenSize / newSize + newOffset;
    }

    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;

      vec2 uvCover = cover(u_res, u_size, uv);
      vec4 texture = texture2D(u_texture, uvCover);
      
      gl_FragColor = texture;
    }
  `;

  private static sharedGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);

  init(el: HTMLElement, i: number, ww: number, wh: number): void {
    this.el = el;
    this.ww = ww;
    this.wh = wh;
    
    this.my = 1 - ((i % 5) * 0.1);

    this.geometry = Plane.sharedGeometry;
    this.material = new THREE.ShaderMaterial({
      fragmentShader: Plane.fragmentShader,
      vertexShader: Plane.vertexShader,
      uniforms: {
        u_texture: { value: null },
        u_res: { value: new THREE.Vector2(1, 1) },
        u_size: { value: new THREE.Vector2(1, 1) }, 
        u_diff: { value: 0 }
      }
    });

    const src = this.el.dataset['src'];
    if (src) {
      this.texture = Plane.loader.load(src, (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        const { naturalWidth, naturalHeight } = texture.image;
        const { u_size, u_texture } = this.material.uniforms;

        u_texture.value = texture;
        u_size.value.x = naturalWidth;
        u_size.value.y = naturalHeight;
      });
    }

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.add(this.mesh);
    
    this.resize(ww, wh);
  }

  update(x: number, y: number, max: MaxBounds, diff: number): void {
    const { right, bottom } = this.rect;
    const { u_diff } = this.material.uniforms;
    
    this.y = gsap.utils.wrap(
      -(max.y - bottom), 
      bottom, 
      y * this.my
    ) - this.yOffset;
    
    this.x = gsap.utils.wrap(
      -(max.x - right), 
      right, 
      x
    ) - this.xOffset;
    
    u_diff.value = diff;
    
    this.position.x = this.x;
    this.position.y = this.y;
  }

  resize(ww: number, wh: number): void {
    this.ww = ww;
    this.wh = wh;
    this.rect = this.el.getBoundingClientRect();

    const { left, top, width, height } = this.rect;
    const { u_res } = this.material.uniforms;

    this.xOffset = (left + (width / 2)) - (ww / 2);
    this.yOffset = (top + (height / 2)) - (wh / 2);

    this.position.x = this.xOffset;
    this.position.y = this.yOffset;
    
    u_res.value.x = width;
    u_res.value.y = height;
    
    this.mesh.scale.set(width, height, 1);
  }

  dispose(): void {
    if (this.material) {
      this.material.dispose();
    }
    if (this.texture) {
      this.texture.dispose();
    }
  }
}
