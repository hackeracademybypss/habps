/**
 * ============================================
 * HACKER ACADEMY — MAIN APPLICATION CONTROLLER
 * Premium Cyberpunk Landing Page Logic
 * ============================================
 * 
 * Founded & Owned by Er. Priyanshu Sharma
 * File: js/app.js
 * Version: 1.0.0
 * 
 * ARCHITECTURE:
 * - Namespace: HA.App
 * - Pattern: Module (IIFE)
 * - Dependencies: HA.Storage, HA.Utils, CDN Libraries
 * - Target Page: index.html (Landing Page)
 * 
 * FEATURES:
 * • Vanta.js NET effect initialization
 * • Typed.js with cybersecurity strings
 * • Matrix rain canvas effect
 * • 30 Course cards dynamic rendering
 * • Course category filtering
 * • Contact form submission
 * • Smooth scroll navigation
 * • Stats counter animation
 * • FAQ accordion
 * • Mobile navigation
 * • Back to top button
 * • Loading screen handler
 * • Cursor glow effect
 * • Live clock
 * • Scroll-triggered animations
 * ============================================
 */

// Initialize namespace
window.HA = window.HA || {};

/**
 * HA.App Module
 * Main landing page controller
 */
HA.App = (function() {
    'use strict';

    // ============================================
    // 1. PRIVATE STATE
    // ============================================
    let vantaEffect = null;
    let typedInstance = null;
    let matrixInstance = null;
    let currentFilter = 'all';
    let courses = [];

    // ============================================
    // 2. DOM REFERENCES
    // ============================================
    const DOM = {
        loader: null,
        nav: null,
        navMenu: null,
        navToggle: null,
        coursesGrid: null,
        filterBtns: null,
        contactForm: null,
        backToTop: null,
        cursorGlow: null,
        matrixCanvas: null,
        vantaBg: null,
        typedOutput: null,
        liveTime: null
    };

    // ============================================
    // 3. INITIALIZATION
    // ============================================

    /**
     * Cache DOM references
     */
    function _cacheDOM() {
        DOM.loader = document.getElementById('haLoader');
        DOM.nav = document.getElementById('haNav');
        DOM.navMenu = document.getElementById('navMenu');
        DOM.navToggle = document.getElementById('navToggle');
        DOM.coursesGrid = document.getElementById('coursesGrid');
        DOM.filterBtns = document.querySelectorAll('.filter-btn');
        DOM.contactForm = document.getElementById('contactForm');
        DOM.backToTop = document.getElementById('backToTop');
        DOM.cursorGlow = document.getElementById('cursorGlow');
        DOM.matrixCanvas = document.getElementById('matrixCanvas');
        DOM.vantaBg = document.getElementById('vanta-bg');
        DOM.typedOutput = document.getElementById('typedOutput');
        DOM.liveTime = document.getElementById('liveTime');
        
        console.log('[HA.App] ✅ DOM references cached');
    }

    /**
     * Initialize Vanta.js NET effect
     */
    function _initVanta() {
        if (!DOM.vantaBg || typeof VANTA === 'undefined' || typeof THREE === 'undefined') {
            console.warn('[HA.App] Vanta.js or Three.js not available');
            return;
        }

        try {
            vantaEffect = VANTA.NET({
                el: '#vanta-bg',
                THREE: THREE,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                scale: 1.00,
                scaleMobile: 1.00,
                color: 0x00ff9d,
                backgroundColor: 0x05050a,
                points: 12.00,
                maxDistance: 28.00,
                spacing: 17.00,
                showDots: true
            });
            
            console.log('[HA.App] ✅ Vanta NET effect initialized');
        } catch (error) {
            console.error('[HA.App] Vanta initialization error:', error);
        }
    }

    /**
     * Initialize Typed.js effect
     */
    function _initTyped() {
        if (!DOM.typedOutput || typeof Typed === 'undefined') {
            console.warn('[HA.App] Typed.js not available');
            return;
        }

        try {
            typedInstance = new Typed('#typedOutput', {
                strings: [
                    'Ethical Hacking',
                    'SOC Analysis',
                    'Penetration Testing',
                    'Digital Forensics',
                    'AI-Powered Security',
                    'Bug Bounty Hunting',
                    'Cloud Security',
                    'Red Team Operations',
                    'Network Defence',
                    'Malware Analysis'
                ],
                typeSpeed: 55,
                backSpeed: 30,
                backDelay: 1800,
                startDelay: 600,
                loop: true,
                showCursor: true,
                cursorChar: '|',
                smartBackspace: true
            });
            
            console.log('[HA.App] ✅ Typed.js initialized');
        } catch (error) {
            console.error('[HA.App] Typed.js error:', error);
        }
    }

    /**
     * Initialize Matrix rain effect
     */
    function _initMatrix() {
        if (!DOM.matrixCanvas) return;
        
        const canvas = DOM.matrixCanvas;
        const ctx = canvas.getContext('2d');
        
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);
        
        const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01HACKERACADEMY@#$%&*';
        const fontSize = 14;
        let columns = Math.floor(canvas.width / fontSize);
        let drops = Array(columns).fill(1);
        
        const draw = () => {
            ctx.fillStyle = 'rgba(5, 5, 10, 0.06)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
            
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;
                
                // Head character brighter
                const alpha = 0.4 + Math.random() * 0.6;
                ctx.fillStyle = `rgba(0, 255, 157, ${alpha})`;
                ctx.fillText(text, x, y);
                
                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };
        
        const interval = setInterval(draw, 55);
        
        // Handle resize for columns
        window.addEventListener('resize', () => {
            const newColumns = Math.floor(canvas.width / fontSize);
            if (newColumns !== columns) {
                columns = newColumns;
                drops = Array(columns).fill(1);
            }
        });
        
        matrixInstance = { canvas, ctx, interval };
        console.log('[HA.App] ✅ Matrix rain initialized');
    }

    /**
     * Initialize cursor glow effect
     */
    function _initCursorGlow() {
        if (!DOM.cursorGlow) return;
        
        // Disable on touch devices
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            DOM.cursorGlow.style.display = 'none';
            return;
        }
        
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let glowX = mouseX;
        let glowY = mouseY;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        const animate = () => {
            // Smooth follow with lerp
            glowX += (mouseX - glowX) * 0.12;
            glowY += (mouseY - glowY) * 0.12;
            
            DOM.cursorGlow.style.left = glowX + 'px';
            DOM.cursorGlow.style.top = glowY + 'px';
            
            requestAnimationFrame(animate);
        };
        
        animate();
        console.log('[HA.App] ✅ Cursor glow initialized');
    }

    /**
     * Initialize live clock
     */
    function _initLiveClock() {
        if (!DOM.liveTime) return;
        
        const update = () => {
            const now = new Date();
            const h = now.getHours().toString().padStart(2, '0');
            const m = now.getMinutes().toString().padStart(2, '0');
            const s = now.getSeconds().toString().padStart(2, '0');
            DOM.liveTime.textContent = `${h}:${m}:${s}`;
        };
        
        update();
        setInterval(update, 1000);
    }

    // ============================================
    // 4. COURSE RENDERING
    // ============================================

    /**
     * Load courses from storage
     */
    function _loadCourses() {
        courses = HA.Storage.getCourses() || [];
        console.log(`[HA.App] ✅ Loaded ${courses.length} courses`);
    }

    /**
     * Create a single course card HTML
     * @param {Object} course - Course data
     * @returns {string} HTML string
     */
    function _createCourseCard(course) {
        const levelColors = {
            beginner: 'var(--neon-green)',
            intermediate: 'var(--neon-blue)',
            advanced: 'var(--neon-purple)'
        };
        
        const levelColor = levelColors[course.level] || 'var(--neon-green)';
        const badge = course.badge ? `<div class="course-badge">${course.badge}</div>` : '';
        
        return `
            <article class="course-card" data-category="${course.category}" data-aos="fade-up">
                <div class="course-image">
                    ${badge}
                    <div class="course-level" style="color: ${levelColor}; border-color: ${levelColor};">
                        ${course.level}
                    </div>
                    <img src="${course.image}" 
                         alt="${course.title} - ${course.category} course at Hacker Academy" 
                         loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80'">
                </div>
                <div class="course-body">
                    <div class="course-category">// ${course.category.toUpperCase()}</div>
                    <h3 class="course-title">${course.title}</h3>
                    <div class="course-meta">
                        <span><i class="fas fa-book"></i> ${course.lessons} Lessons</span>
                        <span><i class="fas fa-clock"></i> ${course.duration}</span>
                        <span><i class="fas fa-star" style="color: var(--neon-yellow);"></i> ${course.rating}</span>
                    </div>
                    <div class="course-footer">
                        <div class="course-price">
                            ₹${HA.Utils.formatNumber(course.price)}
                            <small>₹${HA.Utils.formatNumber(course.originalPrice)}</small>
                        </div>
                        <button class="course-enroll" data-course-id="${course.id}">
                            Enroll <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    /**
     * Render courses based on current filter
     */
    function _renderCourses() {
        if (!DOM.coursesGrid) return;
        
        // Filter courses
        const filtered = currentFilter === 'all' 
            ? courses 
            : courses.filter(c => c.category === currentFilter);
        
        // Generate HTML
        const html = filtered.map(_createCourseCard).join('');
        
        // Render with fade effect
        DOM.coursesGrid.style.opacity = '0';
        DOM.coursesGrid.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            DOM.coursesGrid.innerHTML = html;
            DOM.coursesGrid.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            DOM.coursesGrid.style.opacity = '1';
            DOM.coursesGrid.style.transform = 'translateY(0)';
            
            // Attach enroll button listeners
            _attachEnrollListeners();
            
            // Refresh AOS for new elements
            if (typeof AOS !== 'undefined') {
                setTimeout(() => AOS.refresh(), 100);
            }
        }, 150);
        
        console.log(`[HA.App] Rendered ${filtered.length} courses (filter: ${currentFilter})`);
    }

    /**
     * Attach event listeners to enroll buttons
     */
    function _attachEnrollListeners() {
        document.querySelectorAll('.course-enroll').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const courseId = btn.dataset.courseId;
                const course = courses.find(c => c.id === courseId);
                
                if (!course) return;
                
                // Check if logged in
                const user = HA.Storage.getCurrentUser();
                if (!user) {
                    HA.Utils.toast({
                        type: 'info',
                        title: 'Login Required',
                        message: `Please login to enroll in "${course.title}"`,
                        duration: 4000
                    });
                    
                    setTimeout(() => {
                        window.location.href = `login.html?course=${courseId}`;
                    }, 1200);
                    return;
                }
                
                // Enroll user
                HA.Storage.enrollInCourse(user.id, courseId);
                
                HA.Utils.toast({
                    type: 'success',
                    title: 'Enrolled Successfully!',
                    message: `You've been enrolled in "${course.title}"`,
                    duration: 4000
                });
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            });
        });
    }

    /**
     * Initialize course filter buttons
     */
    function _initCourseFilters() {
        if (!DOM.filterBtns || DOM.filterBtns.length === 0) return;
        
        DOM.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                if (filter === currentFilter) return;
                
                // Update active state
                DOM.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update filter and re-render
                currentFilter = filter;
                _renderCourses();
                
                HA.Utils.toast({
                    type: 'info',
                    title: 'Filter Applied',
                    message: `Showing ${filter === 'all' ? 'all courses' : filter + ' courses'}`,
                    duration: 2000
                });
            });
        });
        
        console.log('[HA.App] ✅ Course filters initialized');
    }

    // ============================================
    // 5. CONTACT FORM
    // ============================================

    /**
     * Initialize contact form
     */
    function _initContactForm() {
        if (!DOM.contactForm) return;
        
        DOM.contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const subject = document.getElementById('contactSubject').value.trim();
            const message = document.getElementById('contactMessage').value.trim();
            
            // Validation
            if (!name || !email || !subject || !message) {
                HA.Utils.toast({
                    type: 'error',
                    title: 'Missing Information',
                    message: 'Please fill in all fields',
                    duration: 3500
                });
                return;
            }
            
            if (!HA.Utils.isValidEmail(email)) {
                HA.Utils.toast({
                    type: 'error',
                    title: 'Invalid Email',
                    message: 'Please enter a valid email address',
                    duration: 3500
                });
                return;
            }
            
            if (message.length < 10) {
                HA.Utils.toast({
                    type: 'error',
                    title: 'Message Too Short',
                    message: 'Please write at least 10 characters',
                    duration: 3500
                });
                return;
            }
            
            // Submit to storage
            const result = HA.Storage.submitContact({ name, email, subject, message });
            
            if (result.success) {
                HA.Utils.toast({
                    type: 'success',
                    title: 'Message Sent!',
                    message: `Thank you ${name}, we'll get back to you soon.`,
                    duration: 4500
                });
                
                DOM.contactForm.reset();
                
                // Confetti-like celebration (subtle)
                _celebrateSubmission();
            } else {
                HA.Utils.toast({
                    type: 'error',
                    title: 'Submission Failed',
                    message: 'Please try again later',
                    duration: 3500
                });
            }
        });
        
        console.log('[HA.App] ✅ Contact form initialized');
    }

    /**
     * Subtle celebration effect on form submit
     */
    function _celebrateSubmission() {
        const colors = ['#00ff9d', '#00d4ff', '#b537f2', '#ff2e9a'];
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    width: 8px;
                    height: 8px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    left: 50%;
                    top: 50%;
                    box-shadow: 0 0 10px currentColor;
                `;
                
                document.body.appendChild(particle);
                
                const angle = (Math.PI * 2 * i) / 20;
                const velocity = 150 + Math.random() * 100;
                const dx = Math.cos(angle) * velocity;
                const dy = Math.sin(angle) * velocity;
                
                particle.animate([
                    { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                    { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 }
                ], {
                    duration: 1000,
                    easing: 'cubic-bezier(0, 0.5, 0.5, 1)'
                }).onfinish = () => particle.remove();
            }, i * 30);
        }
    }

    // ============================================
    // 6. NAVIGATION
    // ============================================

    /**
     * Initialize sticky navigation
     */
    function _initStickyNav() {
        if (!DOM.nav) return;
        
        let lastScroll = 0;
        
        window.addEventListener('scroll', HA.Utils.throttle(() => {
            const currentScroll = window.scrollY;
            
            if (currentScroll > 50) {
                DOM.nav.classList.add('scrolled');
            } else {
                DOM.nav.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        }, 100));
    }

    /**
     * Initialize mobile navigation
     */
    function _initMobileNav() {
        if (!DOM.navToggle || !DOM.navMenu) return;
        
        DOM.navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            DOM.navMenu.classList.toggle('active');
            DOM.navToggle.classList.toggle('active');
        });
        
        // Close on link click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                DOM.navMenu.classList.remove('active');
                DOM.navToggle.classList.remove('active');
            });
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!DOM.navMenu.contains(e.target) && !DOM.navToggle.contains(e.target)) {
                DOM.navMenu.classList.remove('active');
                DOM.navToggle.classList.remove('active');
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                DOM.navMenu.classList.remove('active');
                DOM.navToggle.classList.remove('active');
            }
        });
    }

    /**
     * Initialize smooth scroll for anchor links
     */
    function _initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href || href === '#' || href.length < 2) return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const offset = 80;
                    const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    
                    window.scrollTo({
                        top: top,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without scrolling
                    history.pushState(null, null, href);
                }
            });
        });
    }

    /**
     * Initialize back to top button
     */
    function _initBackToTop() {
        if (!DOM.backToTop) return;
        
        window.addEventListener('scroll', HA.Utils.throttle(() => {
            if (window.scrollY > 400) {
                DOM.backToTop.classList.add('visible');
            } else {
                DOM.backToTop.classList.remove('visible');
            }
        }, 100));
        
        DOM.backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ============================================
    // 7. FAQ ACCORDION
    // ============================================

    /**
     * Initialize FAQ accordion
     */
    function _initFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (!question || !answer) return;
            
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all others
                faqItems.forEach(other => {
                    if (other !== item) {
                        other.classList.remove('active');
                        const otherAnswer = other.querySelector('.faq-answer');
                        if (otherAnswer) otherAnswer.style.maxHeight = null;
                    }
                });
                
                // Toggle current
                item.classList.toggle('active', !isActive);
                if (!isActive) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    answer.style.maxHeight = null;
                }
            });
        });
        
        console.log('[HA.App] ✅ FAQ accordion initialized');
    }

    // ============================================
    // 8. STATS COUNTER ANIMATION
    // ============================================

    /**
     * Initialize animated counters
     */
    function _initCounters() {
        const counters = document.querySelectorAll('[data-count]');
        
        if (counters.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.count, 10);
                    _animateCounter(el, target);
                    observer.unobserve(el);
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '0px 0px -50px 0px'
        });
        
        counters.forEach(counter => observer.observe(counter));
    }

    /**
     * Animate a single counter
     */
    function _animateCounter(el, target) {
        const duration = 2000;
        const startTime = performance.now();
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * easeProgress);
            
            el.textContent = prefix + HA.Utils.formatNumber(current) + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = prefix + HA.Utils.formatNumber(target) + suffix;
            }
        };
        
        requestAnimationFrame(update);
    }

    // ============================================
    // 9. LOADING SCREEN
    // ============================================

    /**
     * Hide loading screen
     */
    function _hideLoader() {
        if (!DOM.loader) return;
        
        // Minimum display time for premium feel
        const minDisplayTime = 1200;
        const startTime = Date.now();
        
        const hide = () => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, minDisplayTime - elapsed);
            
            setTimeout(() => {
                DOM.loader.classList.add('hidden');
                document.body.style.overflow = '';
                
                // Remove from DOM after animation
                setTimeout(() => {
                    if (DOM.loader && DOM.loader.parentNode) {
                        DOM.loader.style.display = 'none';
                    }
                }, 800);
            }, remaining);
        };
        
        // Wait for window load event
        if (document.readyState === 'complete') {
            hide();
        } else {
            window.addEventListener('load', hide);
        }
    }

    // ============================================
    // 10. SCROLL EFFECTS
    // ============================================

    /**
     * Initialize scroll-triggered effects
     */
    function _initScrollEffects() {
        // Parallax effect on hero
        const hero = document.querySelector('.ha-hero');
        if (hero) {
            window.addEventListener('scroll', HA.Utils.throttle(() => {
                const scrolled = window.scrollY;
                const heroContent = hero.querySelector('.hero-content');
                
                if (heroContent && scrolled < window.innerHeight) {
                    heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                    heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.8;
                }
            }, 16));
        }
        
        // Active nav link based on scroll position
        const sections = document.querySelectorAll('section[id], header[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        window.addEventListener('scroll', HA.Utils.throttle(() => {
            const scrollPos = window.scrollY + 120;
            
            sections.forEach(section => {
                const top = section.offsetTop;
                const height = section.offsetHeight;
                const id = section.getAttribute('id');
                
                if (scrollPos >= top && scrollPos < top + height) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, 100));
    }

    // ============================================
    // 11. AOS INITIALIZATION
    // ============================================

    /**
     * Initialize AOS (Animate on Scroll)
     */
    function _initAOS() {
        if (typeof AOS === 'undefined') {
            console.warn('[HA.App] AOS library not loaded');
            return;
        }
        
        AOS.init({
            duration: 900,
            easing: 'ease-out-cubic',
            once: true,
            offset: 80,
            delay: 0,
            anchorPlacement: 'top-bottom',
            disable: 'mobile'
        });
        
        console.log('[HA.App] ✅ AOS initialized');
    }

    // ============================================
    // 12. KEYBOARD SHORTCUTS
    // ============================================

    /**
     * Initialize keyboard shortcuts
     */
    function _initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K = Focus search (if exists)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const search = document.querySelector('.dash-search-input, .admin-table-search-input');
                if (search) search.focus();
            }
            
            // Escape = Close modals/menus
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.active').forEach(m => {
                    m.classList.remove('active');
                });
                document.body.style.overflow = '';
            }
        });
    }

    // ============================================
    // 13. PERFORMANCE MONITORING
    // ============================================

    /**
     * Log performance metrics
     */
    function _logPerformance() {
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const timing = window.performance.timing;
                    const loadTime = timing.loadEventEnd - timing.navigationStart;
                    const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
                    
                    console.log('[HA.App] 📊 Performance Metrics:');
                    console.log(`  • DOM Ready: ${domReady}ms`);
                    console.log(`  • Full Load: ${loadTime}ms`);
                    console.log(`  • Courses: ${courses.length}`);
                    console.log(`  • Device: ${HA.Utils.getDeviceType()}`);
                }, 100);
            });
        }
    }

    // ============================================
    // 14. ERROR HANDLING
    // ============================================

    /**
     * Global error handler
     */
    function _initErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('[HA.App] Global error:', e.message, 'at', e.filename, ':', e.lineno);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('[HA.App] Unhandled promise rejection:', e.reason);
        });
    }

    // ============================================
    // 15. CLEANUP
    // ============================================

    /**
     * Cleanup on page unload
     */
    function _initCleanup() {
        window.addEventListener('beforeunload', () => {
            if (vantaEffect && typeof vantaEffect.destroy === 'function') {
                try {
                    vantaEffect.destroy();
                } catch (e) {
                    console.warn('[HA.App] Vanta cleanup error:', e);
                }
            }
            
            if (typedInstance && typeof typedInstance.destroy === 'function') {
                try {
                    typedInstance.destroy();
                } catch (e) {
                    console.warn('[HA.App] Typed cleanup error:', e);
                }
            }
            
            if (matrixInstance && matrixInstance.interval) {
                clearInterval(matrixInstance.interval);
            }
        });
    }

    // ============================================
    // 16. PUBLIC API
    // ============================================

    return {
        /**
         * Initialize the entire application
         */
        init: function() {
            console.log('[HA.App] 🚀 Initializing Hacker Academy...');
            console.log('[HA.App] Founded by Er. Priyanshu Sharma');
            
            // Prevent double initialization
            if (window.__HA_APP_INITIALIZED__) {
                console.warn('[HA.App] Already initialized');
                return;
            }
            window.__HA_APP_INITIALIZED__ = true;
            
            // Cache DOM
            _cacheDOM();
            
            // Initialize storage
            if (HA.Storage) {
                HA.Storage.init();
            }
            
            // Initialize effects
            _initVanta();
            _initTyped();
            _initMatrix();
            _initCursorGlow();
            _initLiveClock();
            
            // Initialize UI components
            _initAOS();
            _initStickyNav();
            _initMobileNav();
            _initSmoothScroll();
            _initBackToTop();
            _initFAQ();
            _initCounters();
            _initScrollEffects();
            
            // Load and render courses
            _loadCourses();
            _renderCourses();
            _initCourseFilters();
            
            // Initialize forms
            _initContactForm();
            
            // Initialize utilities
            _initKeyboardShortcuts();
            _initErrorHandling();
            _initCleanup();
            _logPerformance();
            
            // Hide loader
            _hideLoader();
            
            console.log('[HA.App] ✅ Initialization complete');
            console.log('[HA.App] 📊 Total courses:', courses.length);
            console.log('[HA.App] 🎨 Design: Premium Cyberpunk');
        },

        /**
         * Get current filter
         */
        getCurrentFilter: function() {
            return currentFilter;
        },

        /**
         * Get all courses
         */
        getCourses: function() {
            return courses;
        },

        /**
         * Re-render courses (useful after data changes)
         */
        refreshCourses: function() {
            _loadCourses();
            _renderCourses();
        },

        /**
         * Set filter programmatically
         */
        setFilter: function(filter) {
            currentFilter = filter;
            _renderCourses();
        },

        /**
         * Destroy Vanta effect
         */
        destroyVanta: function() {
            if (vantaEffect && typeof vantaEffect.destroy === 'function') {
                vantaEffect.destroy();
                vantaEffect = null;
            }
        },

        /**
         * Version info
         */
        version: '1.0.0',
        founder: 'Er. Priyanshu Sharma'
    };
})();

// ============================================
// AUTO-INITIALIZE ON DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure all CDN scripts are loaded
    setTimeout(() => {
        HA.App.init();
    }, 100);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HA.App;
}