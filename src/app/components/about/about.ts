import { Component, OnInit, AfterViewInit,OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  styleUrls: ['./about.css']
})
export class About implements OnInit, AfterViewInit {

 private observer!: IntersectionObserver;
  private lastScrollY = 0;
  private ticking = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initScrollAnimations();
    this.initSmoothScroll();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.handleScrollDirection();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  private handleScrollDirection(): void {
    const currentScrollY = window.scrollY;
    
    // Add direction-based classes
    const aboutPage = document.querySelector('.about-page');
    if (aboutPage) {
      const elements = aboutPage.querySelectorAll('[data-aos]');
      elements.forEach(el => {
        if (currentScrollY < this.lastScrollY) {
          // Scrolling up
          el.classList.add('aos-scroll-up');
          el.classList.remove('aos-scroll-down');
        } else {
          // Scrolling down
          el.classList.add('aos-scroll-down');
          el.classList.remove('aos-scroll-up');
        }
      });
    }

    this.lastScrollY = currentScrollY;
  }

  private initScrollAnimations(): void {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          
          // Add animation class based on scroll direction
          if (element.classList.contains('aos-scroll-up')) {
            element.classList.add('aos-animate-up');
            element.classList.remove('aos-animate-down');
          } else {
            element.classList.add('aos-animate-down');
            element.classList.remove('aos-animate-up');
          }
          
          element.classList.add('aos-animate');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe all elements with data-aos attribute within about-page
    const aboutPage = document.querySelector('.about-page');
    if (aboutPage) {
      const elements = aboutPage.querySelectorAll('[data-aos]');
      elements.forEach(el => {
        this.observer.observe(el);
      });
    }
  }

  private initSmoothScroll(): void {
    const smoothScroll = document.querySelector('.about-page .smoothscroll');
    if (smoothScroll) {
      smoothScroll.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector('#next');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }
}