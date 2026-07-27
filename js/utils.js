/**
 * ============================================
 * HACKER ACADEMY — UTILITY LIBRARY
 * Premium Helper Functions & Effects
 * ============================================
 * 
 * Founded & Owned by Er. Priyanshu Sharma
 * File: js/utils.js
 * Version: 1.0.0
 * 
 * ARCHITECTURE:
 * - Namespace: HA.Utils
 * - Pattern: Module (IIFE)
 * - Dependencies: HA.Storage
 * - CDN Libraries: Vanta.js, Typed.js, AOS, Three.js
 * 
 * FEATURES:
 * • DOM helpers (query, create, toggle)
 * • Format helpers (dates, numbers, currency)
 * • Validation helpers (email, phone, password)
 * • Animation helpers (counters, reveals)
 * • Matrix rain canvas effect
 * • Cursor glow effect
 * • Loading screen handler
 * • Toast notification system
 * • Modal system
 * • Smooth scroll
 * • Typed.js integration
 * • Vanta.js integration
 * • AOS integration
 * • Debounce/throttle
 * • String/Array/Object helpers
 * • URL helpers
 * • Clipboard helpers
 * • File helpers
 * ============================================
 */

// Initialize namespace
window.HA = window.HA || {};

/**
 * HA.Utils Module
 * Central utility library
 */
HA.Utils = (function() {
    'use strict';

    // ============================================
    // 1. DOM HELPERS
    // ============================================

    /**
     * Query selector shorthand
     * @param {string} selector - CSS selector
     * @param {Element} context - Parent element
     * @returns {Element|null}
     */
    const $ = (selector, context = document) => context.querySelector(selector);

    /**
     * Query all selector shorthand
     * @param {string} selector - CSS selector
     * @param {Element} context - Parent element
     * @returns {NodeList}
     */
    const $$ = (selector, context = document) => context.querySelectorAll(selector);

    /**
     * Create DOM element
     * @param {string} tag - HTML tag
     * @param {Object} attrs - Attributes
     * @param {string|Element} content - Inner content
     * @returns {Element}
     */
    const createElement = (tag, attrs = {}, content = null) => {
        const el = document.createElement(tag);
        
        Object.entries(attrs).forEach(([key, value]) => {
            if (key === 'className') el.className = value;
            else if (key === 'style' && typeof value === 'object') {
                Object.assign(el.style, value);
            }
            else if (key.startsWith('on') && typeof value === 'function') {
                el.addEventListener(key.slice(2).toLowerCase(), value);
            }
            else if (key === 'dataset' && typeof value === 'object') {
                Object.entries(value).forEach(([k, v]) => el.dataset[k] = v);
            }
            else el.setAttribute(key, value);
        });
        
        if (content !== null) {
            if (typeof content === 'string') el.innerHTML = content;
            else if (content instanceof Element) el.appendChild(content);
            else if (Array.isArray(content)) {
                content.forEach(c => {
                    if (typeof c === 'string') el.insertAdjacentHTML('beforeend', c);
                    else if (c instanceof Element) el.appendChild(c);
                });
            }
        }
        
        return el;
    };

    /**
     * Toggle class on element
     */
    const toggleClass = (el, className, force) => {
        if (typeof el === 'string') el = $(el);
        if (el) el.classList.toggle(className, force);
    };

    /**
     * Add class to element
     */
    const addClass = (el, ...classNames) => {
        if (typeof el === 'string') el = $(el);
        if (el) el.classList.add(...classNames);
    };

    /**
     * Remove class from element
     */
    const removeClass = (el, ...classNames) => {
        if (typeof el === 'string') el = $(el);
        if (el) el.classList.remove(...classNames);
    };

    /**
     * Check if element has class
     */
    const hasClass = (el, className) => {
        if (typeof el === 'string') el = $(el);
        return el ? el.classList.contains(className) : false;
    };

    /**
     * Show element
     */
    const show = (el, display = 'block') => {
        if (typeof el === 'string') el = $(el);
        if (el) el.style.display = display;
    };

    /**
     * Hide element
     */
    const hide = (el) => {
        if (typeof el === 'string') el = $(el);
        if (el) el.style.display = 'none';
    };

    /**
     * Toggle element visibility
     */
    const toggle = (el, display = 'block') => {
        if (typeof el === 'string') el = $(el);
        if (el) el.style.display = el.style.display === 'none' ? display : 'none';
    };

    /**
     * Fade in element
     */
    const fadeIn = (el, duration = 300) => {
        if (typeof el === 'string') el = $(el);
        if (!el) return;
        
        el.style.opacity = '0';
        el.style.display = 'block';
        el.style.transition = `opacity ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            el.style.opacity = '1';
        });
        
        setTimeout(() => {
            el.style.transition = '';
        }, duration);
    };

    /**
     * Fade out element
     */
    const fadeOut = (el, duration = 300) => {
        if (typeof el === 'string') el = $(el);
        if (!el) return;
        
        el.style.transition = `opacity ${duration}ms ease`;
        el.style.opacity = '0';
        
        setTimeout(() => {
            el.style.display = 'none';
            el.style.transition = '';
        }, duration);
    };

    // ============================================
    // 2. FORMAT HELPERS
    // ============================================

    /**
     * Format date
     * @param {string|Date} date - Date to format
     * @param {Object} options - Intl.DateTimeFormat options
     * @returns {string} Formatted date
     */
    const formatDate = (date, options = {}) => {
        if (!date) return '';
        
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        
        return d.toLocaleDateString('en-US', { ...defaultOptions, ...options });
    };

    /**
     * Format date time
     */
    const formatDateTime = (date) => {
        return formatDate(date, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * Format relative time (e.g., "2 hours ago")
     */
    const formatRelativeTime = (date) => {
        if (!date) return '';
        
        const d = date instanceof Date ? date : new Date(date);
        const now = new Date();
        const diff = Math.floor((now - d) / 1000);
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
        if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
        if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
        return `${Math.floor(diff / 31536000)} years ago`;
    };

    /**
     * Format number with commas
     */
    const formatNumber = (num) => {
        if (num === null || num === undefined) return '0';
        return Number(num).toLocaleString('en-US');
    };

    /**
     * Format currency (INR)
     */
    const formatCurrency = (amount, currency = 'INR') => {
        if (amount === null || amount === undefined) return '₹0';
        
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    /**
     * Format file size
     */
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    /**
     * Format duration (seconds to mm:ss or hh:mm:ss)
     */
    const formatDuration = (seconds) => {
        if (!seconds || seconds < 0) return '00:00';
        
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        
        const pad = (n) => n.toString().padStart(2, '0');
        
        return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
    };

    /**
     * Format percentage
     */
    const formatPercent = (value, decimals = 0) => {
        if (value === null || value === undefined) return '0%';
        return `${Number(value).toFixed(decimals)}%`;
    };

    /**
     * Truncate text
     */
    const truncate = (text, length = 100, suffix = '...') => {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length).trim() + suffix;
    };

    /**
     * Capitalize first letter
     */
    const capitalize = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    /**
     * Title case
     */
    const titleCase = (str) => {
        if (!str) return '';
        return str.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    };

    /**
     * Slugify string
     */
    const slugify = (str) => {
        if (!str) return '';
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    // ============================================
    // 3. VALIDATION HELPERS
    // ============================================

    /**
     * Validate email
     */
    const isValidEmail = (email) => {
        if (!email) return false;
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    /**
     * Validate phone (Indian)
     */
    const isValidPhone = (phone) => {
        if (!phone) return false;
        const re = /^(\+91[\-\s]?)?[6789]\d{9}$/;
        return re.test(phone.replace(/\s/g, ''));
    };

    /**
     * Validate URL
     */
    const isValidURL = (url) => {
        if (!url) return false;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    /**
     * Validate HABPS ID
     */
    const isValidHABPSId = (id) => {
        if (!id) return false;
        return /^HABPS-\d{8}$/.test(id);
    };

    /**
     * Check if string is empty or whitespace
     */
    const isEmpty = (value) => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    };

    // ============================================
    // 4. ANIMATION HELPERS
    // ============================================

    /**
     * Animate counter
     * @param {Element} el - Element to animate
     * @param {number} target - Target number
     * @param {number} duration - Animation duration (ms)
     */
    const animateCounter = (el, target, duration = 2000) => {
        if (!el) return;
        
        const start = 0;
        const startTime = performance.now();
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeProgress);
            
            el.textContent = prefix + formatNumber(current) + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    };

    /**
     * Animate all counters on page
     */
    const animateAllCounters = () => {
        const counters = $$('[data-count]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.count, 10);
                    animateCounter(el, target);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => observer.observe(counter));
    };

    /**
     * Scroll to element
     */
    const scrollTo = (selector, offset = 80) => {
        const el = typeof selector === 'string' ? $(selector) : selector;
        if (!el) return;
        
        const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    };

    /**
     * Scroll to top
     */
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ============================================
    // 5. MATRIX RAIN EFFECT
    // ============================================

    /**
     * Initialize Matrix rain canvas
     * @param {string} canvasId - Canvas element ID
     */
    const initMatrixRain = (canvasId = 'matrixCanvas') => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);
        
        const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*';
        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = Array(columns).fill(1);
        
        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#00ff9d';
            ctx.font = `${fontSize}px monospace`;
            
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;
                
                // Vary color slightly
                const alpha = 0.5 + Math.random() * 0.5;
                ctx.fillStyle = `rgba(0, 255, 157, ${alpha})`;
                ctx.fillText(text, x, y);
                
                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };
        
        const interval = setInterval(draw, 50);
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => clearInterval(interval));
        
        return { canvas, ctx, interval };
    };

    // ============================================
    // 6. CURSOR GLOW EFFECT
    // ============================================

    /**
     * Initialize cursor glow
     * @param {string} elementId - Glow element ID
     */
    const initCursorGlow = (elementId = 'cursorGlow') => {
        const glow = document.getElementById(elementId);
        if (!glow) return;
        
        // Only on non-touch devices
        if ('ontouchstart' in window) {
            glow.style.display = 'none';
            return;
        }
        
        let mouseX = 0, mouseY = 0;
        let glowX = 0, glowY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        const animate = () => {
            glowX += (mouseX - glowX) * 0.1;
            glowY += (mouseY - glowY) * 0.1;
            
            glow.style.left = glowX + 'px';
            glow.style.top = glowY + 'px';
            
            requestAnimationFrame(animate);
        };
        
        animate();
    };

    // ============================================
    // 7. LOADING SCREEN
    // ============================================

    /**
     * Hide loading screen
     */
    const hideLoader = (delay = 500) => {
        setTimeout(() => {
            const loader = $('#haLoader');
            if (loader) {
                loader.classList.add('hidden');
                setTimeout(() => {
                    loader.style.display = 'none';
                    document.body.style.overflow = '';
                }, 800);
            }
        }, delay);
    };

    /**
     * Show loading screen
     */
    const showLoader = () => {
        const loader = $('#haLoader');
        if (loader) {
            loader.style.display = 'flex';
            loader.classList.remove('hidden');
        }
    };

    // ============================================
    // 8. TOAST NOTIFICATION SYSTEM
    // ============================================

    /**
     * Initialize toast container
     */
    const initToastContainer = () => {
        if ($('#toastContainer')) return;
        
        const container = createElement('div', {
            className: 'toast-container',
            id: 'toastContainer'
        });
        document.body.appendChild(container);
    };

    /**
     * Show toast notification
     * @param {Object} options - Toast options
     */
    const toast = (options = {}) => {
        initToastContainer();
        
        const {
            type = 'info',
            title = '',
            message = '',
            duration = 4000,
            icon = null
        } = options;
        
        const icons = {
            success: 'fa-circle-check',
            error: 'fa-circle-xmark',
            warning: 'fa-triangle-exclamation',
            info: 'fa-circle-info'
        };
        
        const container = $('#toastContainer');
        if (!container) return;
        
        const toastEl = createElement('div', {
            className: `toast toast-${type}`
        });
        
        toastEl.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${icon || icons[type]}"></i>
            </div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            <button class="toast-close" aria-label="Close">
                <i class="fas fa-xmark"></i>
            </button>
        `;
        
        container.appendChild(toastEl);
        
        // Close button
        const closeBtn = toastEl.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => removeToast(toastEl));
        
        // Auto remove
        if (duration > 0) {
            setTimeout(() => removeToast(toastEl), duration);
        }
        
        return toastEl;
    };

    /**
     * Remove toast
     */
    const removeToast = (toastEl) => {
        if (!toastEl) return;
        
        toastEl.classList.add('hiding');
        setTimeout(() => {
            if (toastEl.parentNode) {
                toastEl.parentNode.removeChild(toastEl);
            }
        }, 300);
    };

    /**
     * Success toast shortcut
     */
    const toastSuccess = (title, message) => toast({ type: 'success', title, message });

    /**
     * Error toast shortcut
     */
    const toastError = (title, message) => toast({ type: 'error', title, message });

    /**
     * Warning toast shortcut
     */
    const toastWarning = (title, message) => toast({ type: 'warning', title, message });

    /**
     * Info toast shortcut
     */
    const toastInfo = (title, message) => toast({ type: 'info', title, message });

    // ============================================
    // 9. MODAL SYSTEM
    // ============================================

    /**
     * Open modal
     * @param {string} modalId - Modal element ID
     */
    const openModal = (modalId) => {
        const modal = typeof modalId === 'string' ? $(`#${modalId}`) : modalId;
        if (!modal) return;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    /**
     * Close modal
     */
    const closeModal = (modalId) => {
        const modal = typeof modalId === 'string' ? $(`#${modalId}`) : modalId;
        if (!modal) return;
        
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    /**
     * Confirm dialog
     * @param {Object} options - Dialog options
     * @returns {Promise<boolean>}
     */
    const confirm = (options = {}) => {
        return new Promise((resolve) => {
            const {
                title = 'Are you sure?',
                message = 'This action cannot be undone.',
                confirmText = 'Confirm',
                cancelText = 'Cancel',
                type = 'warning'
            } = options;
            
            const icons = {
                warning: 'fa-triangle-exclamation',
                danger: 'fa-circle-xmark',
                success: 'fa-circle-check',
                info: 'fa-circle-info'
            };
            
            const overlay = createElement('div', {
                className: 'modal-overlay active'
            });
            
            overlay.innerHTML = `
                <div class="modal" style="max-width: 480px;">
                    <div class="modal-body">
                        <div class="admin-confirm-dialog">
                            <div class="admin-confirm-icon ${type}">
                                <i class="fas ${icons[type]}"></i>
                            </div>
                            <h3 class="admin-confirm-title">${title}</h3>
                            <p class="admin-confirm-text">${message}</p>
                            <div class="admin-confirm-actions">
                                <button class="btn btn-ghost cancel-btn">${cancelText}</button>
                                <button class="btn btn-primary confirm-btn">${confirmText}</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';
            
            const close = (result) => {
                overlay.classList.remove('active');
                setTimeout(() => {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                    document.body.style.overflow = '';
                }, 300);
                resolve(result);
            };
            
            overlay.querySelector('.cancel-btn').addEventListener('click', () => close(false));
            overlay.querySelector('.confirm-btn').addEventListener('click', () => close(true));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) close(false);
            });
        });
    };

    // ============================================
    // 10. CLIPBOARD HELPERS
    // ============================================

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>}
     */
    const copyToClipboard = async (text) => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textarea);
                return success;
            }
        } catch (error) {
            console.error('[HA.Utils] Copy failed:', error);
            return false;
        }
    };

    // ============================================
    // 11. DEBOUNCE & THROTTLE
    // ============================================

    /**
     * Debounce function
     */
    const debounce = (fn, delay = 300) => {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    };

    /**
     * Throttle function
     */
    const throttle = (fn, limit = 300) => {
        let inThrottle = false;
        return function(...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // ============================================
    // 12. STRING HELPERS
    // ============================================

    /**
     * Generate random string
     */
    const randomString = (length = 8, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') => {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    /**
     * Generate random number in range
     */
    const randomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    /**
     * Escape HTML
     */
    const escapeHTML = (str) => {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    /**
     * Unescape HTML
     */
    const unescapeHTML = (str) => {
        if (!str) return '';
        const doc = new DOMParser().parseFromString(str, 'text/html');
        return doc.documentElement.textContent;
    };

    // ============================================
    // 13. ARRAY/OBJECT HELPERS
    // ============================================

    /**
     * Shuffle array
     */
    const shuffle = (array) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    /**
     * Group array by key
     */
    const groupBy = (array, key) => {
        return array.reduce((groups, item) => {
            const value = item[key];
            (groups[value] = groups[value] || []).push(item);
            return groups;
        }, {});
    };

    /**
     * Unique array values
     */
    const unique = (array) => [...new Set(array)];

    /**
     * Deep clone object
     */
    const deepClone = (obj) => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (Array.isArray(obj)) return obj.map(deepClone);
        
        const clone = {};
        Object.keys(obj).forEach(key => {
            clone[key] = deepClone(obj[key]);
        });
        return clone;
    };

    // ============================================
    // 14. URL HELPERS
    // ============================================

    /**
     * Get URL parameter
     */
    const getURLParam = (name) => {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    };

    /**
     * Set URL parameter
     */
    const setURLParam = (name, value) => {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    };

    /**
     * Remove URL parameter
     */
    const removeURLParam = (name) => {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.pushState({}, '', url);
    };

    // ============================================
    // 15. FILE HELPERS
    // ============================================

    /**
     * Read file as Data URL (for image preview)
     * @param {File} file - File object
     * @returns {Promise<string>} Data URL
     */
    const readFileAsDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    };

    /**
     * Validate image file
     */
    const isValidImage = (file, maxSizeMB = 5) => {
        if (!file) return { valid: false, error: 'No file selected' };
        
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            return { valid: false, error: 'Invalid file type. Use JPG, PNG, WebP or GIF.' };
        }
        
        const maxSize = maxSizeMB * 1024 * 1024;
        if (file.size > maxSize) {
            return { valid: false, error: `File too large. Max ${maxSizeMB}MB.` };
        }
        
        return { valid: true };
    };

    // ============================================
    // 16. DEVICE & BROWSER DETECTION
    // ============================================

    /**
     * Check if mobile device
     */
    const isMobile = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    /**
     * Check if touch device
     */
    const isTouchDevice = () => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };

    /**
     * Get device type
     */
    const getDeviceType = () => {
        const width = window.innerWidth;
        if (width < 576) return 'mobile';
        if (width < 992) return 'tablet';
        return 'desktop';
    };

    // ============================================
    // 17. LIBRARY INTEGRATIONS
    // ============================================

    /**
     * Initialize AOS (Animate on Scroll)
     */
    const initAOS = () => {
        if (typeof AOS === 'undefined') {
            console.warn('[HA.Utils] AOS library not loaded');
            return;
        }
        
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 80,
            delay: 0,
            anchorPlacement: 'top-bottom'
        });
        
        console.log('[HA.Utils] ✅ AOS initialized');
    };

    /**
     * Initialize Typed.js
     * @param {string} elementId - Target element ID
     * @param {Array} strings - Strings to type
     * @param {Object} options - Typed.js options
     */
    const initTyped = (elementId = 'typedOutput', strings = [], options = {}) => {
        if (typeof Typed === 'undefined') {
            console.warn('[HA.Utils] Typed.js library not loaded');
            return;
        }
        
        const defaultStrings = [
            'Ethical Hacking',
            'SOC Analysis',
            'Penetration Testing',
            'Digital Forensics',
            'AI-Powered Security',
            'Bug Bounty Hunting',
            'Cloud Security',
            'Red Team Operations'
        ];
        
        const defaultOptions = {
            strings: strings.length ? strings : defaultStrings,
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            startDelay: 500,
            loop: true,
            showCursor: true,
            cursorChar: '|',
            ...options
        };
        
        const el = document.getElementById(elementId);
        if (!el) return;
        
        return new Typed(`#${elementId}`, defaultOptions);
    };

    /**
     * Initialize Vanta.js background
     * @param {string} elementId - Target element ID
     * @param {string} effect - Vanta effect name (net, fog, globe, etc.)
     * @param {Object} options - Vanta options
     */
    const initVanta = (elementId = 'vanta-bg', effect = 'NET', options = {}) => {
        if (typeof VANTA === 'undefined') {
            console.warn('[HA.Utils] Vanta.js library not loaded');
            return null;
        }
        
        const effects = {
            NET: VANTA.NET || null,
            FOG: VANTA.FOG || null,
            GLOBE: VANTA.GLOBE || null,
            WAVES: VANTA.WAVES || null,
            CLOUDS: VANTA.CLOUDS || null,
            CELLS: VANTA.CELLS || null
        };
        
        const effectFn = effects[effect.toUpperCase()];
        if (!effectFn) {
            console.warn(`[HA.Utils] Vanta effect "${effect}" not available`);
            return null;
        }
        
        const el = document.getElementById(elementId);
        if (!el) return null;
        
        const defaultOptions = {
            el: `#${elementId}`,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200,
            minWidth: 200,
            scale: 1,
            scaleMobile: 1,
            backgroundColor: 0x05050a,
            color: 0x00ff9d,
            ...options
        };
        
        // NET effect specific options
        if (effect.toUpperCase() === 'NET') {
            Object.assign(defaultOptions, {
                color: 0x00ff9d,
                backgroundColor: 0x05050a,
                points: 10,
                maxDistance: 25,
                spacing: 18,
                showDots: true
            });
        }
        
        try {
            const vantaEffect = effectFn(defaultOptions);
            console.log(`[HA.Utils] ✅ Vanta ${effect} initialized`);
            return vantaEffect;
        } catch (error) {
            console.error('[HA.Utils] Vanta initialization error:', error);
            return null;
        }
    };

    // ============================================
    // 18. NAVIGATION HELPERS
    // ============================================

    /**
     * Initialize smooth scroll for anchor links
     */
    const initSmoothScroll = () => {
        $$('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#' || href.length < 2) return;
                
                const target = $(href);
                if (target) {
                    e.preventDefault();
                    scrollTo(href, 80);
                    
                    // Close mobile menu if open
                    const navMenu = $('#navMenu');
                    if (navMenu && navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                    }
                }
            });
        });
    };

    /**
     * Initialize sticky navigation
     */
    const initStickyNav = () => {
        const nav = $('#haNav');
        if (!nav) return;
        
        const handleScroll = throttle(() => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }, 100);
        
        window.addEventListener('scroll', handleScroll);
    };

    /**
     * Initialize mobile navigation toggle
     */
    const initMobileNav = () => {
        const toggle = $('#navToggle');
        const menu = $('#navMenu');
        
        if (!toggle || !menu) return;
        
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            toggle.classList.toggle('active');
        });
        
        // Close on link click
        $$('.nav-link', menu).forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
                toggle.classList.remove('active');
            });
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !toggle.contains(e.target)) {
                menu.classList.remove('active');
                toggle.classList.remove('active');
            }
        });
    };

    /**
     * Initialize back to top button
     */
    const initBackToTop = () => {
        const btn = $('#backToTop');
        if (!btn) return;
        
        const handleScroll = throttle(() => {
            if (window.scrollY > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }, 100);
        
        window.addEventListener('scroll', handleScroll);
        
        btn.addEventListener('click', scrollToTop);
    };

    // ============================================
    // 19. FAQ ACCORDION
    // ============================================

    /**
     * Initialize FAQ accordion
     */
    const initFAQ = () => {
        $$('.faq-item').forEach(item => {
            const question = $('.faq-question', item);
            const answer = $('.faq-answer', item);
            
            if (!question || !answer) return;
            
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all others
                $$('.faq-item.active').forEach(other => {
                    if (other !== item) {
                        other.classList.remove('active');
                        const otherAnswer = $('.faq-answer', other);
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
    };

    // ============================================
    // 20. LIVE CLOCK
    // ============================================

    /**
     * Initialize live clock
     */
    const initLiveClock = (elementId = 'liveTime') => {
        const el = document.getElementById(elementId);
        if (!el) return;
        
        const update = () => {
            const now = new Date();
            const h = now.getHours().toString().padStart(2, '0');
            const m = now.getMinutes().toString().padStart(2, '0');
            const s = now.getSeconds().toString().padStart(2, '0');
            el.textContent = `${h}:${m}:${s}`;
        };
        
        update();
        setInterval(update, 1000);
    };

    // ============================================
    // 21. AUTH HELPERS
    // ============================================

    /**
     * Check if user is logged in
     */
    const isLoggedIn = () => {
        return HA.Storage && HA.Storage.getCurrentUser() !== null;
    };

    /**
     * Check if admin is logged in
     */
    const isAdminLoggedIn = () => {
        return HA.Storage && HA.Storage.getAdminSession() !== null;
    };

    /**
     * Require authentication (redirect if not logged in)
     */
    const requireAuth = (redirectTo = 'login.html') => {
        if (!isLoggedIn()) {
            window.location.href = redirectTo;
            return false;
        }
        return true;
    };

    /**
     * Require admin authentication
     */
    const requireAdmin = (redirectTo = 'admin/admin-login.html') => {
        if (!isAdminLoggedIn()) {
            window.location.href = redirectTo;
            return false;
        }
        return true;
    };

    /**
     * Redirect if already logged in
     */
    const redirectIfLoggedIn = (redirectTo = 'dashboard.html') => {
        if (isLoggedIn()) {
            window.location.href = redirectTo;
            return true;
        }
        return false;
    };

    // ============================================
    // 22. FORM HELPERS
    // ============================================

    /**
     * Get form data as object
     */
    const getFormData = (formId) => {
        const form = typeof formId === 'string' ? $(`#${formId}`) : formId;
        if (!form) return {};
        
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            if (data[key]) {
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }
        
        return data;
    };

    /**
     * Reset form
     */
    const resetForm = (formId) => {
        const form = typeof formId === 'string' ? $(`#${formId}`) : formId;
        if (form) form.reset();
    };

    /**
     * Show field error
     */
    const showFieldError = (inputId, message) => {
        const input = typeof inputId === 'string' ? $(`#${inputId}`) : inputId;
        if (!input) return;
        
        const group = input.closest('.form-group, .auth-form-group, .register-form-group, .profile-form-group, .admin-form-group');
        if (!group) return;
        
        group.classList.add('has-error');
        const errorEl = $('.form-error, .auth-form-error, .register-form-error, .profile-form-error, .admin-form-error', group);
        if (errorEl) {
            errorEl.innerHTML = `<i class="fas fa-circle-exclamation"></i> ${message}`;
        }
    };

    /**
     * Clear field error
     */
    const clearFieldError = (inputId) => {
        const input = typeof inputId === 'string' ? $(`#${inputId}`) : inputId;
        if (!input) return;
        
        const group = input.closest('.form-group, .auth-form-group, .register-form-group, .profile-form-group, .admin-form-group');
        if (group) {
            group.classList.remove('has-error');
        }
    };

    /**
     * Clear all form errors
     */
    const clearAllErrors = (formId) => {
        const form = typeof formId === 'string' ? $(`#${formId}`) : formId;
        if (!form) return;
        
        $$('.has-error', form).forEach(el => el.classList.remove('has-error'));
    };

    // ============================================
    // 23. PASSWORD STRENGTH METER
    // ============================================

    /**
     * Initialize password strength meter
     * @param {string} inputId - Password input ID
     * @param {string} meterId - Strength meter container ID
     */
    const initPasswordStrength = (inputId, meterId) => {
        const input = $(`#${inputId}`);
        const meter = $(`#${meterId}`);
        
        if (!input || !meter) return;
        
        input.addEventListener('input', () => {
            const password = input.value;
            const result = HA.Storage.validatePassword(password);
            
            // Update visual strength
            meter.className = `password-strength ${result.strength}`;
            
            // Update text
            const textEl = $('.password-strength-text', meter) || 
                          $('.register-password-strength-text', meter);
            if (textEl) {
                const labels = {
                    'weak': 'Weak Password',
                    'medium': 'Medium Strength',
                    'strong': 'Strong Password',
                    'very-strong': 'Very Strong'
                };
                textEl.textContent = password ? labels[result.strength] : '';
            }
            
            // Update requirements if present
            const requirements = $$('.password-requirement', meter.closest('.form-group') || meter.parentElement);
            requirements.forEach(req => {
                const check = req.dataset.check;
                if (check && result.checks[check] !== undefined) {
                    if (result.checks[check]) {
                        req.classList.add('met');
                        const icon = $('i', req);
                        if (icon) {
                            icon.className = 'fas fa-check';
                        }
                    } else {
                        req.classList.remove('met');
                        const icon = $('i', req);
                        if (icon) {
                            icon.className = 'fas fa-xmark';
                        }
                    }
                }
            });
        });
    };

    // ============================================
    // 24. EVENT BUS (Simple Pub/Sub)
    // ============================================

    const EventBus = {
        _events: {},
        
        on(event, callback) {
            if (!this._events[event]) this._events[event] = [];
            this._events[event].push(callback);
        },
        
        off(event, callback) {
            if (!this._events[event]) return;
            this._events[event] = this._events[event].filter(cb => cb !== callback);
        },
        
        emit(event, data) {
            if (!this._events[event]) return;
            this._events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[HA.Utils] Event "${event}" handler error:`, error);
                }
            });
        }
    };

    // ============================================
    // 25. PUBLIC API
    // ============================================

    return {
        // DOM
        $, $$, createElement, toggleClass, addClass, removeClass, hasClass,
        show, hide, toggle, fadeIn, fadeOut,
        
        // Format
        formatDate, formatDateTime, formatRelativeTime, formatNumber,
        formatCurrency, formatFileSize, formatDuration, formatPercent,
        truncate, capitalize, titleCase, slugify,
        
        // Validation
        isValidEmail, isValidPhone, isValidURL, isValidHABPSId, isEmpty,
        
        // Animation
        animateCounter, animateAllCounters, scrollTo, scrollToTop,
        
        // Effects
        initMatrixRain, initCursorGlow,
        
        // Loading
        hideLoader, showLoader,
        
        // Toast
        toast, toastSuccess, toastError, toastWarning, toastInfo, removeToast,
        
        // Modal
        openModal, closeModal, confirm,
        
        // Clipboard
        copyToClipboard,
        
        // Performance
        debounce, throttle,
        
        // String
        randomString, randomInt, escapeHTML, unescapeHTML,
        
        // Array/Object
        shuffle, groupBy, unique, deepClone,
        
        // URL
        getURLParam, setURLParam, removeURLParam,
        
        // File
        readFileAsDataURL, isValidImage,
        
        // Device
        isMobile, isTouchDevice, getDeviceType,
        
        // Libraries
        initAOS, initTyped, initVanta,
        
        // Navigation
        initSmoothScroll, initStickyNav, initMobileNav, initBackToTop,
        
        // FAQ
        initFAQ,
        
        // Clock
        initLiveClock,
        
        // Auth
        isLoggedIn, isAdminLoggedIn, requireAuth, requireAdmin, redirectIfLoggedIn,
        
        // Form
        getFormData, resetForm, showFieldError, clearFieldError, clearAllErrors,
        
        // Password
        initPasswordStrength,
        
        // Event Bus
        EventBus,
        
        // Version
        version: '1.0.0'
    };
})();

// ============================================
// AUTO-INITIALIZE ON DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const Utils = HA.Utils;
    
    // Initialize core effects
    Utils.initCursorGlow();
    Utils.initMatrixRain();
    
    // Initialize libraries
    Utils.initAOS();
    Utils.initSmoothScroll();
    Utils.initStickyNav();
    Utils.initMobileNav();
    Utils.initBackToTop();
    Utils.initFAQ();
    Utils.initLiveClock();
    
    // Animate counters when visible
    Utils.animateAllCounters();
    
    // Hide loader after everything is ready
    window.addEventListener('load', () => {
        Utils.hideLoader(800);
    });
    
    console.log('[HA] Utils library ready');
    console.log('[HA] Founder: Er. Priyanshu Sharma');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HA.Utils;
}