/**
 * ============================================
 * HACKER ACADEMY — LOGIN CONTROLLER
 * Premium Cyberpunk Authentication System
 * ============================================
 * 
 * Founded & Owned by Er. Priyanshu Sharma
 * File: js/login.js
 * Version: 1.0.0
 * 
 * ARCHITECTURE:
 * - Namespace: HA.Login
 * - Pattern: Module (IIFE)
 * - Dependencies: HA.Storage, HA.Utils
 * - Target Page: login.html
 * 
 * FEATURES:
 * • Dual login modes (Email / HABPS ID)
 * • Password show/hide toggle
 * • Remember me functionality
 * • Forgot password modal
 * • Form validation with real-time feedback
 * • Loading states with spinners
 * • Matrix rain background
 * • Cursor glow effect
 * • Floating particles
 * • Redirect if already logged in
 * • Course enrollment redirect after login
 * • Premium animations & transitions
 * • Keyboard shortcuts (Enter to submit)
 * ============================================
 */

// Initialize namespace
window.HA = window.HA || {};

/**
 * HA.Login Module
 * Login page controller
 */
HA.Login = (function() {
    'use strict';

    // ============================================
    // 1. PRIVATE STATE
    // ============================================
    let currentMode = 'email'; // 'email' or 'habps'
    let isSubmitting = false;
    let matrixInstance = null;

    // ============================================
    // 2. DOM REFERENCES
    // ============================================
    const DOM = {
        loader: null,
        loginForm: null,
        emailModeBtn: null,
        habpsModeBtn: null,
        emailModeContent: null,
        habpsModeContent: null,
        emailInput: null,
        habpsInput: null,
        passwordInput: null,
        passwordToggle: null,
        rememberMe: null,
        submitBtn: null,
        forgotLink: null,
        forgotModal: null,
        forgotForm: null,
        forgotClose: null,
        forgotEmail: null,
        forgotSubmit: null,
        forgotSuccess: null,
        forgotFormWrap: null,
        cursorGlow: null,
        matrixCanvas: null,
        alertBox: null
    };

    // ============================================
    // 3. INITIALIZATION
    // ============================================

    /**
     * Cache DOM references
     */
    function _cacheDOM() {
        DOM.loader = document.getElementById('haLoader');
        DOM.loginForm = document.getElementById('loginForm');
        DOM.emailModeBtn = document.getElementById('emailModeBtn');
        DOM.habpsModeBtn = document.getElementById('habpsModeBtn');
        DOM.emailModeContent = document.getElementById('emailModeContent');
        DOM.habpsModeContent = document.getElementById('habpsModeContent');
        DOM.emailInput = document.getElementById('emailInput');
        DOM.habpsInput = document.getElementById('habpsInput');
        DOM.passwordInput = document.getElementById('passwordInput');
        DOM.passwordToggle = document.getElementById('passwordToggle');
        DOM.rememberMe = document.getElementById('rememberMe');
        DOM.submitBtn = document.getElementById('submitBtn');
        DOM.forgotLink = document.getElementById('forgotLink');
        DOM.forgotModal = document.getElementById('forgotModal');
        DOM.forgotForm = document.getElementById('forgotForm');
        DOM.forgotClose = document.getElementById('forgotClose');
        DOM.forgotEmail = document.getElementById('forgotEmail');
        DOM.forgotSubmit = document.getElementById('forgotSubmit');
        DOM.forgotSuccess = document.getElementById('forgotSuccess');
        DOM.forgotFormWrap = document.getElementById('forgotFormWrap');
        DOM.cursorGlow = document.getElementById('cursorGlow');
        DOM.matrixCanvas = document.getElementById('matrixCanvas');
        DOM.alertBox = document.getElementById('loginAlert');
        
        console.log('[HA.Login] ✅ DOM references cached');
    }

    /**
     * Check if already logged in
     */
    function _checkAuth() {
        const user = HA.Storage.getCurrentUser();
        if (user) {
            console.log('[HA.Login] User already logged in, redirecting...');
            
            // Check for course enrollment redirect
            const courseParam = HA.Utils.getURLParam('course');
            const redirectUrl = courseParam ? 'dashboard.html' : 'dashboard.html';
            
            HA.Utils.toast({
                type: 'info',
                title: 'Welcome Back!',
                message: `Redirecting to dashboard...`,
                duration: 2000
            });
            
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1000);
            
            return true;
        }
        return false;
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
        
        window.addEventListener('resize', () => {
            const newColumns = Math.floor(canvas.width / fontSize);
            if (newColumns !== columns) {
                columns = newColumns;
                drops = Array(columns).fill(1);
            }
        });
        
        matrixInstance = { canvas, ctx, interval };
        console.log('[HA.Login] ✅ Matrix rain initialized');
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
            glowX += (mouseX - glowX) * 0.12;
            glowY += (mouseY - glowY) * 0.12;
            
            DOM.cursorGlow.style.left = glowX + 'px';
            DOM.cursorGlow.style.top = glowY + 'px';
            
            requestAnimationFrame(animate);
        };
        
        animate();
        console.log('[HA.Login] ✅ Cursor glow initialized');
    }

    /**
     * Initialize floating particles
     */
    function _initParticles() {
        const particles = document.querySelectorAll('.auth-particle');
        if (particles.length === 0) return;
        
        // Particles are animated via CSS, just ensure they're visible
        console.log('[HA.Login] ✅ Floating particles initialized');
    }

    // ============================================
    // 4. MODE TOGGLE
    // ============================================

    /**
     * Initialize login mode toggle
     */
    function _initModeToggle() {
        if (!DOM.emailModeBtn || !DOM.habpsModeBtn) return;
        
        DOM.emailModeBtn.addEventListener('click', () => {
            if (currentMode === 'email') return;
            
            currentMode = 'email';
            DOM.emailModeBtn.classList.add('active');
            DOM.habpsModeBtn.classList.remove('active');
            DOM.emailModeContent.classList.add('active');
            DOM.habpsModeContent.classList.remove('active');
            
            // Clear validation errors
            _clearAllErrors();
            
            // Focus email input
            if (DOM.emailInput) {
                setTimeout(() => DOM.emailInput.focus(), 100);
            }
            
            console.log('[HA.Login] Switched to Email mode');
        });
        
        DOM.habpsModeBtn.addEventListener('click', () => {
            if (currentMode === 'habps') return;
            
            currentMode = 'habps';
            DOM.habpsModeBtn.classList.add('active');
            DOM.emailModeBtn.classList.remove('active');
            DOM.habpsModeContent.classList.add('active');
            DOM.emailModeContent.classList.remove('active');
            
            // Clear validation errors
            _clearAllErrors();
            
            // Focus HABPS input
            if (DOM.habpsInput) {
                setTimeout(() => DOM.habpsInput.focus(), 100);
            }
            
            console.log('[HA.Login] Switched to HABPS ID mode');
        });
    }

    // ============================================
    // 5. PASSWORD TOGGLE
    // ============================================

    /**
     * Initialize password show/hide toggle
     */
    function _initPasswordToggle() {
        if (!DOM.passwordToggle || !DOM.passwordInput) return;
        
        DOM.passwordToggle.addEventListener('click', () => {
            const isPassword = DOM.passwordInput.type === 'password';
            DOM.passwordInput.type = isPassword ? 'text' : 'password';
            
            const icon = DOM.passwordToggle.querySelector('i');
            if (icon) {
                icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
            }
        });
    }

    // ============================================
    // 6. FORM VALIDATION
    // ============================================

    /**
     * Validate email login form
     * @returns {Object} {valid: boolean, errors: Array}
     */
    function _validateEmailForm() {
        const errors = [];
        
        const email = DOM.emailInput.value.trim();
        const password = DOM.passwordInput.value;
        
        if (!email) {
            errors.push({ field: 'emailInput', message: 'Email is required' });
        } else if (!HA.Utils.isValidEmail(email)) {
            errors.push({ field: 'emailInput', message: 'Invalid email format' });
        }
        
        if (!password) {
            errors.push({ field: 'passwordInput', message: 'Password is required' });
        } else if (password.length < 6) {
            errors.push({ field: 'passwordInput', message: 'Password too short' });
        }
        
        return {
            valid: errors.length === 0,
            errors,
            data: { email, password }
        };
    }

    /**
     * Validate HABPS ID login form
     * @returns {Object} {valid: boolean, errors: Array}
     */
    function _validateHABPSForm() {
        const errors = [];
        
        const habpsId = DOM.habpsInput.value.trim().toUpperCase();
        const password = DOM.passwordInput.value;
        
        if (!habpsId) {
            errors.push({ field: 'habpsInput', message: 'HABPS ID is required' });
        } else if (!HA.Utils.isValidHABPSId(habpsId)) {
            errors.push({ field: 'habpsInput', message: 'Invalid HABPS ID format (HABPS-XXXXXXXX)' });
        }
        
        if (!password) {
            errors.push({ field: 'passwordInput', message: 'Password is required' });
        } else if (password.length < 6) {
            errors.push({ field: 'passwordInput', message: 'Password too short' });
        }
        
        return {
            valid: errors.length === 0,
            errors,
            data: { habpsId, password }
        };
    }

    /**
     * Show field error
     */
    function _showFieldError(fieldId, message) {
        const input = document.getElementById(fieldId);
        if (!input) return;
        
        const group = input.closest('.auth-form-group');
        if (!group) return;
        
        group.classList.add('has-error');
        
        const errorEl = group.querySelector('.auth-form-error');
        if (errorEl) {
            errorEl.innerHTML = `<i class="fas fa-circle-exclamation"></i> ${message}`;
        }
    }

    /**
     * Clear field error
     */
    function _clearFieldError(fieldId) {
        const input = document.getElementById(fieldId);
        if (!input) return;
        
        const group = input.closest('.auth-form-group');
        if (group) {
            group.classList.remove('has-error');
        }
    }

    /**
     * Clear all errors
     */
    function _clearAllErrors() {
        document.querySelectorAll('.auth-form-group.has-error').forEach(el => {
            el.classList.remove('has-error');
        });
        
        if (DOM.alertBox) {
            DOM.alertBox.style.display = 'none';
        }
    }

    /**
     * Show alert message
     */
    function _showAlert(type, message) {
        if (!DOM.alertBox) return;
        
        const icons = {
            success: 'fa-circle-check',
            error: 'fa-circle-xmark',
            warning: 'fa-triangle-exclamation',
            info: 'fa-circle-info'
        };
        
        DOM.alertBox.className = `auth-alert ${type}`;
        DOM.alertBox.innerHTML = `
            <i class="fas ${icons[type]} auth-alert-icon"></i>
            <div class="auth-alert-content">${message}</div>
        `;
        DOM.alertBox.style.display = 'flex';
        
        // Auto-hide after 6 seconds
        setTimeout(() => {
            if (DOM.alertBox) {
                DOM.alertBox.style.display = 'none';
            }
        }, 6000);
    }

    // ============================================
    // 7. FORM SUBMISSION
    // ============================================

    /**
     * Initialize login form submission
     */
    function _initLoginForm() {
        if (!DOM.loginForm) return;
        
        // Real-time validation on input
        [DOM.emailInput, DOM.habpsInput, DOM.passwordInput].forEach(input => {
            if (!input) return;
            
            input.addEventListener('input', () => {
                _clearFieldError(input.id);
            });
            
            input.addEventListener('blur', () => {
                if (input.value.trim()) {
                    if (input.id === 'emailInput' && !HA.Utils.isValidEmail(input.value)) {
                        _showFieldError(input.id, 'Invalid email format');
                    } else if (input.id === 'habpsInput' && !HA.Utils.isValidHABPSId(input.value)) {
                        _showFieldError(input.id, 'Invalid HABPS ID format');
                    }
                }
            });
        });
        
        // Form submission
        DOM.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (isSubmitting) return;
            
            _clearAllErrors();
            
            // Validate based on current mode
            const validation = currentMode === 'email' 
                ? _validateEmailForm() 
                : _validateHABPSForm();
            
            if (!validation.valid) {
                validation.errors.forEach(err => {
                    _showFieldError(err.field, err.message);
                });
                
                HA.Utils.toast({
                    type: 'error',
                    title: 'Validation Error',
                    message: validation.errors[0].message,
                    duration: 3000
                });
                
                // Shake animation on submit button
                _shakeElement(DOM.submitBtn);
                return;
            }
            
            // Submit login
            await _submitLogin(validation.data);
        });
        
        console.log('[HA.Login] ✅ Login form initialized');
    }

    /**
     * Submit login request
     */
    async function _submitLogin(data) {
        isSubmitting = true;
        _setLoadingState(true);
        
        // Simulate network delay for premium feel
        await new Promise(resolve => setTimeout(resolve, 800));
        
        try {
            const rememberMe = DOM.rememberMe ? DOM.rememberMe.checked : false;
            
            const credentials = currentMode === 'email'
                ? { email: data.email, password: data.password }
                : { habpsId: data.habpsId, password: data.password };
            
            const result = HA.Storage.login(credentials, rememberMe);
            
            if (result.success) {
                _handleLoginSuccess(result.user);
            } else {
                _handleLoginError(result.error);
            }
        } catch (error) {
            console.error('[HA.Login] Login error:', error);
            _handleLoginError('An unexpected error occurred. Please try again.');
        } finally {
            isSubmitting = false;
            _setLoadingState(false);
        }
    }

    /**
     * Handle successful login
     */
    function _handleLoginSuccess(user) {
        HA.Utils.toast({
            type: 'success',
            title: 'Welcome Back!',
            message: `Hello ${user.fullName}, redirecting to dashboard...`,
            duration: 3000,
            icon: 'fa-circle-check'
        });
        
        // Success animation
        _successAnimation();
        
        // Determine redirect URL
        const courseParam = HA.Utils.getURLParam('course');
        const redirectUrl = courseParam ? 'dashboard.html' : 'dashboard.html';
        
        // Redirect after animation
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1800);
    }

    /**
     * Handle login error
     */
    function _handleLoginError(errorMessage) {
        HA.Utils.toast({
            type: 'error',
            title: 'Login Failed',
            message: errorMessage,
            duration: 4000,
            icon: 'fa-circle-xmark'
        });
        
        _showAlert('error', errorMessage);
        _shakeElement(DOM.submitBtn);
        
        // Focus on first input
        if (currentMode === 'email' && DOM.emailInput) {
            DOM.emailInput.focus();
        } else if (DOM.habpsInput) {
            DOM.habpsInput.focus();
        }
    }

    /**
     * Set loading state on submit button
     */
    function _setLoadingState(loading) {
        if (!DOM.submitBtn) return;
        
        if (loading) {
            DOM.submitBtn.classList.add('loading');
            DOM.submitBtn.disabled = true;
        } else {
            DOM.submitBtn.classList.remove('loading');
            DOM.submitBtn.disabled = false;
        }
    }

    /**
     * Shake animation element
     */
    function _shakeElement(el) {
        if (!el) return;
        
        el.style.animation = 'none';
        el.offsetHeight; // Trigger reflow
        
        el.style.animation = 'shake 0.5s ease';
        
        setTimeout(() => {
            el.style.animation = '';
        }, 500);
    }

    /**
     * Success animation (subtle celebration)
     */
    function _successAnimation() {
        const colors = ['#00ff9d', '#00d4ff', '#b537f2'];
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    width: 6px;
                    height: 6px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    left: 50%;
                    top: 50%;
                    box-shadow: 0 0 10px currentColor;
                `;
                
                document.body.appendChild(particle);
                
                const angle = (Math.PI * 2 * i) / 15;
                const velocity = 120 + Math.random() * 80;
                const dx = Math.cos(angle) * velocity;
                const dy = Math.sin(angle) * velocity;
                
                particle.animate([
                    { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                    { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 }
                ], {
                    duration: 1000,
                    easing: 'cubic-bezier(0, 0.5, 0.5, 1)'
                }).onfinish = () => particle.remove();
            }, i * 40);
        }
    }

    // ============================================
    // 8. FORGOT PASSWORD MODAL
    // ============================================

    /**
     * Initialize forgot password modal
     */
    function _initForgotPassword() {
        if (!DOM.forgotLink || !DOM.forgotModal) return;
        
        // Open modal
        DOM.forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            _openForgotModal();
        });
        
        // Close modal
        if (DOM.forgotClose) {
            DOM.forgotClose.addEventListener('click', _closeForgotModal);
        }
        
        // Close on overlay click
        DOM.forgotModal.addEventListener('click', (e) => {
            if (e.target === DOM.forgotModal) {
                _closeForgotModal();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && DOM.forgotModal.classList.contains('active')) {
                _closeForgotModal();
            }
        });
        
        // Forgot form submission
        if (DOM.forgotForm) {
            DOM.forgotForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await _handleForgotPassword();
            });
        }
        
        console.log('[HA.Login] ✅ Forgot password modal initialized');
    }

    /**
     * Open forgot password modal
     */
    function _openForgotModal() {
        if (!DOM.forgotModal) return;
        
        DOM.forgotModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Reset form state
        if (DOM.forgotEmail) DOM.forgotEmail.value = '';
        if (DOM.forgotSuccess) DOM.forgotSuccess.classList.remove('active');
        if (DOM.forgotFormWrap) DOM.forgotFormWrap.style.display = 'block';
        
        // Focus email input
        setTimeout(() => {
            if (DOM.forgotEmail) DOM.forgotEmail.focus();
        }, 300);
    }

    /**
     * Close forgot password modal
     */
    function _closeForgotModal() {
        if (!DOM.forgotModal) return;
        
        DOM.forgotModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Handle forgot password submission
     */
    async function _handleForgotPassword() {
        const email = DOM.forgotEmail.value.trim();
        
        if (!email) {
            HA.Utils.toast({
                type: 'error',
                title: 'Email Required',
                message: 'Please enter your registered email',
                duration: 3000
            });
            return;
        }
        
        if (!HA.Utils.isValidEmail(email)) {
            HA.Utils.toast({
                type: 'error',
                title: 'Invalid Email',
                message: 'Please enter a valid email address',
                duration: 3000
            });
            return;
        }
        
        // Set loading state
        DOM.forgotSubmit.classList.add('loading');
        DOM.forgotSubmit.disabled = true;
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Check if email exists
        const students = HA.Storage.getStudents();
        const student = students.find(s => s.email.toLowerCase() === email.toLowerCase());
        
        // Reset loading state
        DOM.forgotSubmit.classList.remove('loading');
        DOM.forgotSubmit.disabled = false;
        
        // Always show success (security best practice - don't reveal if email exists)
        if (DOM.forgotFormWrap) DOM.forgotFormWrap.style.display = 'none';
        if (DOM.forgotSuccess) DOM.forgotSuccess.classList.add('active');
        
        HA.Utils.toast({
            type: 'success',
            title: 'Reset Link Sent',
            message: 'Check your email for password reset instructions',
            duration: 4000
        });
        
        // Log for demo purposes
        if (student) {
            console.log(`[HA.Login] Password reset requested for: ${email}`);
        } else {
            console.log(`[HA.Login] Password reset requested for non-existent email: ${email}`);
        }
    }

    // ============================================
    // 9. KEYBOARD SHORTCUTS
    // ============================================

    /**
     * Initialize keyboard shortcuts
     */
    function _initKeyboardShortcuts() {
        // Enter key submits form (already handled by form submit)
        // Tab key navigation (default behavior)
        
        // Ctrl/Cmd + Enter to submit
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                if (DOM.loginForm) {
                    DOM.loginForm.dispatchEvent(new Event('submit'));
                }
            }
        });
        
        // Alt + E to switch to email mode
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'e') {
                if (DOM.emailModeBtn) DOM.emailModeBtn.click();
            }
        });
        
        // Alt + H to switch to HABPS mode
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'h') {
                if (DOM.habpsModeBtn) DOM.habpsModeBtn.click();
            }
        });
    }

    // ============================================
    // 10. LOADING SCREEN
    // ============================================

    /**
     * Hide loading screen
     */
    function _hideLoader() {
        if (!DOM.loader) return;
        
        const minDisplayTime = 1000;
        const startTime = Date.now();
        
        const hide = () => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, minDisplayTime - elapsed);
            
            setTimeout(() => {
                DOM.loader.classList.add('hidden');
                document.body.style.overflow = '';
                
                setTimeout(() => {
                    if (DOM.loader && DOM.loader.parentNode) {
                        DOM.loader.style.display = 'none';
                    }
                }, 800);
                
                // Focus first input after loader hides
                setTimeout(() => {
                    if (DOM.emailInput) DOM.emailInput.focus();
                }, 900);
            }, remaining);
        };
        
        if (document.readyState === 'complete') {
            hide();
        } else {
            window.addEventListener('load', hide);
        }
    }

    // ============================================
    // 11. PREFILL FROM URL PARAMS
    // ============================================

    /**
     * Prefill form from URL parameters
     */
    function _prefillFromURL() {
        const email = HA.Utils.getURLParam('email');
        const habps = HA.Utils.getURLParam('habps');
        
        if (email && DOM.emailInput) {
            DOM.emailInput.value = email;
            console.log('[HA.Login] Prefilled email from URL');
        }
        
        if (habps && DOM.habpsInput) {
            DOM.habpsInput.value = habps;
            if (DOM.habpsModeBtn) DOM.habpsModeBtn.click();
            console.log('[HA.Login] Prefilled HABPS ID from URL');
        }
    }

    // ============================================
    // 12. REMEMBER ME PERSISTENCE
    // ============================================

    /**
     * Initialize remember me persistence
     */
    function _initRememberMe() {
        if (!DOM.rememberMe) return;
        
        // Load saved email if remember me was checked
        const rememberedEmail = localStorage.getItem('ha_last_email');
        if (rememberedEmail && DOM.emailInput) {
            DOM.emailInput.value = rememberedEmail;
            DOM.rememberMe.checked = true;
        }
        
        // Save email on change if remember me is checked
        DOM.rememberMe.addEventListener('change', () => {
            if (DOM.rememberMe.checked && DOM.emailInput && DOM.emailInput.value) {
                localStorage.setItem('ha_last_email', DOM.emailInput.value);
            } else {
                localStorage.removeItem('ha_last_email');
            }
        });
        
        // Save on form submit
        if (DOM.loginForm) {
            DOM.loginForm.addEventListener('submit', () => {
                if (DOM.rememberMe.checked && DOM.emailInput && DOM.emailInput.value) {
                    localStorage.setItem('ha_last_email', DOM.emailInput.value);
                }
            });
        }
    }

    // ============================================
    // 13. DEMO CREDENTIALS HELPER
    // ============================================

    /**
     * Show demo credentials info
     */
    function _showDemoInfo() {
        const stats = HA.Storage.getStats();
        
        console.log('[HA.Login] 📊 System Status:');
        console.log(`  • Registered Students: ${stats.students}`);
        console.log(`  • Available Courses: ${stats.courses}`);
        console.log(`  • Total Certificates: ${stats.certificates}`);
        console.log('');
        console.log('[HA.Login] 🔐 Demo Credentials:');
        console.log('  • Register a new account at register.html');
        console.log('  • Or use any registered email + password');
        console.log('');
        console.log('[HA.Login] 💡 Tip: Press Alt+E for Email mode, Alt+H for HABPS mode');
    }

    // ============================================
    // 14. ERROR HANDLING
    // ============================================

    /**
     * Initialize error handling
     */
    function _initErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('[HA.Login] Global error:', e.message);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('[HA.Login] Unhandled promise rejection:', e.reason);
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
         * Initialize the login page
         */
        init: function() {
            console.log('[HA.Login] 🚀 Initializing Login Page...');
            console.log('[HA.Login] Founded by Er. Priyanshu Sharma');
            
            // Prevent double initialization
            if (window.__HA_LOGIN_INITIALIZED__) {
                console.warn('[HA.Login] Already initialized');
                return;
            }
            window.__HA_LOGIN_INITIALIZED__ = true;
            
            // Cache DOM
            _cacheDOM();
            
            // Check if already logged in
            if (_checkAuth()) return;
            
            // Initialize storage
            if (HA.Storage) {
                HA.Storage.init();
            }
            
            // Initialize effects
            _initMatrix();
            _initCursorGlow();
            _initParticles();
            
            // Initialize UI
            _initModeToggle();
            _initPasswordToggle();
            _initLoginForm();
            _initForgotPassword();
            _initKeyboardShortcuts();
            _initRememberMe();
            
            // Prefill from URL
            _prefillFromURL();
            
            // Initialize utilities
            _initErrorHandling();
            _initCleanup();
            
            // Hide loader
            _hideLoader();
            
            // Show demo info
            _showDemoInfo();
            
            console.log('[HA.Login] ✅ Initialization complete');
        },

        /**
         * Get current login mode
         */
        getCurrentMode: function() {
            return currentMode;
        },

        /**
         * Set login mode programmatically
         */
        setMode: function(mode) {
            if (mode === 'email' && DOM.emailModeBtn) {
                DOM.emailModeBtn.click();
            } else if (mode === 'habps' && DOM.habpsModeBtn) {
                DOM.habpsModeBtn.click();
            }
        },

        /**
         * Open forgot password modal
         */
        openForgotModal: _openForgotModal,

        /**
         * Close forgot password modal
         */
        closeForgotModal: _closeForgotModal,

        /**
         * Version info
         */
        version: '1.0.0',
        founder: 'Er. Priyanshu Sharma'
    };
})();

// ============================================
// SHAKE ANIMATION KEYFRAMES (injected via JS)
// ============================================
(function injectShakeAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
})();

// ============================================
// AUTO-INITIALIZE ON DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure all CDN scripts are loaded
    setTimeout(() => {
        HA.Login.init();
    }, 100);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HA.Login;
}