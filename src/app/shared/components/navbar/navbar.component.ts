import {
  Component,
  OnInit,
  HostListener,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare var gsap: any;

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  isScrolled = false;
  isMenuOpen = false;
  private isBrowser: boolean;

  navItems = [
    { label: 'Home', link: '#home' },
    { label: 'About', link: '#about' },
    { label: 'Services', link: '#services' },
    { label: 'Gallery', link: '/Completegallery' },
    { label: 'Contact', link: '#contact' },
  ];

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {}

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (this.isBrowser) {
      const fixedSection = document.querySelector(
        '.fixed-section'
      ) as HTMLElement;
      const scrollPosition = window.pageYOffset;

      if (fixedSection) {
        const fixedSectionHeight = fixedSection.offsetHeight;

        this.isScrolled = scrollPosition > fixedSectionHeight * 0.9;
      } else {
        this.isScrolled = scrollPosition > 50;
      }
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isBrowser) {
      document.body.style.overflow = this.isMenuOpen ? 'hidden' : 'auto';
    }
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    if (this.isBrowser) {
      document.body.style.overflow = 'auto';
    }
  }

  scrollToSection(sectionId: string): void {
    this.closeMenu();

    if (this.isBrowser) {
      const element = document.querySelector(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  }
}
