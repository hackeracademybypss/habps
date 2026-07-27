/**
 * ============================================
 * HACKER ACADEMY — REGISTRATION CONTROLLER
 * Premium Cyberpunk Multi-Step Registration
 * ============================================
 * 
 * Founded & Owned by Er. Priyanshu Sharma
 * File: js/register.js
 * Version: 1.0.0
 * 
 * ARCHITECTURE:
 * - Namespace: HA.Register
 * - Pattern: Module (IIFE)
 * - Dependencies: HA.Storage, HA.Utils
 * - Target Page: register.html
 * 
 * FEATURES:
 * • 4-Step Registration Wizard
 * • Step 1: Personal Information
 * • Step 2: Account Credentials
 * • Step 3: Location & Education
 * • Step 4: Photo Upload & Terms
 * • Auto-generated 8-digit HABPS ID
 * • Photo upload with circular preview
 * • Password strength meter (5 levels)
 * • Password requirements checklist
 * • Country/State/City cascading selects
 * • Terms & conditions checkbox
 * • Success screen with HABPS ID display
 * • Copy HABPS ID to clipboard
 * • Matrix rain + cursor glow effects
 * • Floating particles
 * • Step validation with error messages
 * • Smooth step transitions
 * • Success celebration animation
 * • Redirect if already logged in
 * ============================================
 */

// Initialize namespace
window.HA = window.HA || {};

/**
 * HA.Register Module
 * Registration page controller
 */
HA.Register = (function() {
    'use strict';

    // ============================================
    // 1. PRIVATE STATE
    // ============================================
    let currentStep = 1;
    const totalSteps = 4;
    let isSubmitting = false;
    let matrixInstance = null;
    let photoData = null;
    let registeredStudent = null;

    // ============================================
    // 2. DOM REFERENCES
    // ============================================
    const DOM = {
        loader: null,
        cursorGlow: null,
        matrixCanvas: null,
        
        // Steps
        steps: null,
        stepProgress: null,
        stepContents: null,
        stepCircles: null,
        
        // Navigation
        prevBtn: null,
        nextBtn: null,
        submitBtn: null,
        
        // Step 1: Personal
        fullName: null,
        fatherName: null,
        motherName: null,
        email: null,
        whatsapp: null,
        
        // Step 2: Credentials
        password: null,
        confirmPassword: null,
        passwordToggle1: null,
        passwordToggle2: null,
        passwordStrength: null,
        
        // Step 3: Location
        lastEducation: null,
        country: null,
        state: null,
        city: null,
        address: null,
        
        // Step 4: Photo & Terms
        photoInput: null,
        photoPreview: null,
        photoUpload: null,
        photoRemove: null,
        termsCheckbox: null,
        
        // Success
        successScreen: null,
        habpsIdValue: null,
        habpsIdCopy: null,
        goToLoginBtn: null,
        goToDashboardBtn: null
    };

    // ============================================
    // 3. COUNTRY DATA (Simplified - Top 20)
    // ============================================
    const COUNTRIES = {
        'IN': {
            name: 'India',
            states: {
                'DL': { name: 'Delhi', cities: ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'] },
                'MH': { name: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'] },
                'KA': { name: 'Karnataka', cities: ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum'] },
                'TN': { name: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'] },
                'UP': { name: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Noida'] },
                'RJ': { name: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'] },
                'WB': { name: 'West Bengal', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'] },
                'GJ': { name: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'] },
                'TS': { name: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'] },
                'AP': { name: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Nellore'] }
            }
        },
        'US': {
            name: 'United States',
            states: {
                'CA': { name: 'California', cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento'] },
                'NY': { name: 'New York', cities: ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse'] },
                'TX': { name: 'Texas', cities: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'] },
                'FL': { name: 'Florida', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale'] },
                'WA': { name: 'Washington', cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue'] }
            }
        },
        'UK': {
            name: 'United Kingdom',
            states: {
                'EN': { name: 'England', cities: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds'] },
                'SC': { name: 'Scotland', cities: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness'] },
                'WL': { name: 'Wales', cities: ['Cardiff', 'Swansea', 'Newport', 'Bangor', 'St Davids'] }
            }
        },
        'CA': {
            name: 'Canada',
            states: {
                'ON': { name: 'Ontario', cities: ['Toronto', 'Ottawa', 'Hamilton', 'Mississauga', 'Brampton'] },
                'BC': { name: 'British Columbia', cities: ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Kelowna'] },
                'QC': { name: 'Quebec', cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil'] }
            }
        },
        'AU': {
            name: 'Australia',
            states: {
                'NSW': { name: 'New South Wales', cities: ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast', 'Coffs Harbour'] },
                'VIC': { name: 'Victoria', cities: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton'] }
            }
        }
    };

    // ============================================
    // 4. INITIALIZATION
    // ============================================

    /**
     * Cache DOM references
     */
    function _cacheDOM() {
        DOM.loader = document.getElementById('haLoader');
        DOM.cursorGlow = document.getElementById('cursorGlow');
        DOM.matrixCanvas = document.getElementById('matrixCanvas');
        
        // Steps
        DOM.steps = document.querySelectorAll('.register-step');
        DOM.stepProgress = document.querySelector('.register-steps-progress');
        DOM.stepContents = document.querySelectorAll('.register-step-content');
        DOM.stepCircles = document.querySelectorAll('.register-step-circle');
        
        // Navigation
        DOM.prevBtn = document.getElementById('prevBtn');
        DOM.nextBtn = document.getElementById('nextBtn');
        DOM.submitBtn = document.getElementById('submitBtn');
        
        // Step 1
        DOM.fullName = document.getElementById('fullName');
        DOM.fatherName = document.getElementById('fatherName');
        DOM.motherName = document.getElementById('motherName');
        DOM.email = document.getElementById('regEmail');
        DOM.whatsapp = document.getElementById('whatsapp');
        
        // Step 2
        DOM.password = document.getElementById('regPassword');
        DOM.confirmPassword = document.getElementById('confirmPassword');
        DOM.passwordToggle1 = document.getElementById('passwordToggle1');
        DOM.passwordToggle2 = document.getElementById('passwordToggle2');
        DOM.passwordStrength = document.querySelector('.register-password-strength');
        
        // Step 3
        DOM.lastEducation = document.getElementById('lastEducation');
        DOM.country = document.getElementById('country');
        DOM.state = document.getElementById('state');
        DOM.city = document.getElementById('city');
        DOM.address = document.getElementById('address');
        
        // Step 4
        DOM.photoInput = document.getElementById('photoInput');
        DOM.photoPreview = document.querySelector('.register-photo-preview img');
        DOM.photoUpload = document.querySelector('.register-photo-upload');
        DOM.photoRemove = document.querySelector('.register-photo-remove');
        DOM.termsCheckbox = document.getElementById('termsCheckbox');
        
        // Success
        DOM.successScreen = document.querySelector('.register-success');
        DOM.habpsIdValue = document.querySelector('.habps-id-value');
        DOM.habpsIdCopy = document.querySelector('.habps-id-copy');
        DOM.goToLoginBtn = document.getElementById('goToLoginBtn');
        DOM.goToDashboardBtn = document.getElementById('goToDashboardBtn');
        
        console.log('[HA.Register] ✅ DOM references cached');
    }

    /**
     * Check if already logged in
     */
    function _checkAuth() {
        const user = HA.Storage.getCurrentUser();
        if (user) {
            console.log('[HA.Register] User already logged in, redirecting...');
            
            HA.Utils.toast({
                type: 'info',
                title: 'Already Registered',
                message: 'Redirecting to dashboard...',
                duration: 2000
            });
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
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
        console.log('[HA.Register] ✅ Matrix rain initialized');
    }

    /**
     * Initialize cursor glow effect
     */
    function _initCursorGlow() {
        if (!DOM.cursorGlow) return;
        
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
        console.log('[HA.Register] ✅ Cursor glow initialized');
    }

    // ============================================
    // 5. STEP NAVIGATION
    // ============================================

    /**
     * Update step progress indicator
     */
    function _updateStepProgress() {
        // Update progress bar width
        const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
        if (DOM.stepProgress) {
            DOM.stepProgress.style.width = `${progressPercent}%`;
        }
        
        // Update step circles
        DOM.steps.forEach((step, index) => {
            const stepNum = index + 1;
            
            step.classList.remove('active', 'completed');
            
            if (stepNum < currentStep) {
                step.classList.add('completed');
                const circle = DOM.stepCircles[index];
                if (circle) {
                    circle.innerHTML = '<i class="fas fa-check"></i>';
                }
            } else if (stepNum === currentStep) {
                step.classList.add('active');
                const circle = DOM.stepCircles[index];
                if (circle) {
                    circle.textContent = stepNum;
                }
            } else {
                const circle = DOM.stepCircles[index];
                if (circle) {
                    circle.textContent = stepNum;
                }
            }
        });
        
        // Update step content visibility
        DOM.stepContents.forEach((content, index) => {
            content.classList.toggle('active', index + 1 === currentStep);
        });
        
        // Update button visibility
        if (DOM.prevBtn) {
            DOM.prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';
        }
        
        if (DOM.nextBtn && DOM.submitBtn) {
            if (currentStep === totalSteps) {
                DOM.nextBtn.style.display = 'none';
                DOM.submitBtn.style.display = 'inline-flex';
            } else {
                DOM.nextBtn.style.display = 'inline-flex';
                DOM.submitBtn.style.display = 'none';
            }
        }
    }

    /**
     * Go to next step
     */
    function _nextStep() {
        if (!_validateCurrentStep()) return;
        
        if (currentStep < totalSteps) {
            currentStep++;
            _updateStepProgress();
            
            // Scroll to top of form
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            HA.Utils.toast({
                type: 'info',
                title: `Step ${currentStep} of ${totalSteps}`,
                message: _getStepMessage(currentStep),
                duration: 2000
            });
        }
    }

    /**
     * Go to previous step
     */
    function _prevStep() {
        if (currentStep > 1) {
            currentStep--;
            _updateStepProgress();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    /**
     * Get step message for toast
     */
    function _getStepMessage(step) {
        const messages = {
            1: 'Tell us about yourself',
            2: 'Create a secure password',
            3: 'Where are you located?',
            4: 'Upload photo & accept terms'
        };
        return messages[step] || '';
    }

    /**
     * Initialize step navigation
     */
    function _initStepNavigation() {
        if (DOM.nextBtn) {
            DOM.nextBtn.addEventListener('click', _nextStep);
        }
        
        if (DOM.prevBtn) {
            DOM.prevBtn.addEventListener('click', _prevStep);
        }
        
        // Allow clicking on completed steps to go back
        DOM.steps.forEach((step, index) => {
            step.addEventListener('click', () => {
                const stepNum = index + 1;
                if (stepNum < currentStep) {
                    currentStep = stepNum;
                    _updateStepProgress();
                }
            });
        });
        
        // Initialize progress
        _updateStepProgress();
        
        console.log('[HA.Register] ✅ Step navigation initialized');
    }

    // ============================================
    // 6. STEP VALIDATION
    // ============================================

    /**
     * Validate current step
     * @returns {boolean} Valid status
     */
    function _validateCurrentStep() {
        _clearAllErrors();
        
        let isValid = true;
        
        switch (currentStep) {
            case 1:
                isValid = _validateStep1();
                break;
            case 2:
                isValid = _validateStep2();
                break;
            case 3:
                isValid = _validateStep3();
                break;
            case 4:
                isValid = _validateStep4();
                break;
        }
        
        if (!isValid) {
            HA.Utils.toast({
                type: 'error',
                title: 'Validation Error',
                message: 'Please fix the errors before continuing',
                duration: 3000
            });
            
            // Shake next button
            if (DOM.nextBtn) _shakeElement(DOM.nextBtn);
        }
        
        return isValid;
    }

    /**
     * Validate Step 1: Personal Information
     */
    function _validateStep1() {
        let isValid = true;
        
        // Full Name (required)
        if (!DOM.fullName.value.trim()) {
            _showFieldError('fullName', 'Full name is required');
            isValid = false;
        } else if (DOM.fullName.value.trim().length < 2) {
            _showFieldError('fullName', 'Name must be at least 2 characters');
            isValid = false;
        }
        
        // Email (required + valid format)
        if (!DOM.email.value.trim()) {
            _showFieldError('regEmail', 'Email is required');
            isValid = false;
        } else if (!HA.Utils.isValidEmail(DOM.email.value)) {
            _showFieldError('regEmail', 'Invalid email format');
            isValid = false;
        } else {
            // Check if email already registered
            const students = HA.Storage.getStudents();
            if (students.some(s => s.email.toLowerCase() === DOM.email.value.toLowerCase())) {
                _showFieldError('regEmail', 'This email is already registered');
                isValid = false;
            }
        }
        
        // WhatsApp (required + valid format)
        if (!DOM.whatsapp.value.trim()) {
            _showFieldError('whatsapp', 'WhatsApp number is required');
            isValid = false;
        } else if (!HA.Utils.isValidPhone(DOM.whatsapp.value)) {
            _showFieldError('whatsapp', 'Invalid WhatsApp number (10 digits starting with 6-9)');
            isValid = false;
        }
        
        return isValid;
    }

    /**
     * Validate Step 2: Credentials
     */
    function _validateStep2() {
        let isValid = true;
        
        const password = DOM.password.value;
        const confirmPassword = DOM.confirmPassword.value;
        
        // Password validation
        if (!password) {
            _showFieldError('regPassword', 'Password is required');
            isValid = false;
        } else {
            const strength = HA.Storage.validatePassword(password);
            if (!strength.valid) {
                _showFieldError('regPassword', 'Password too weak. Meet at least 4 requirements.');
                isValid = false;
            }
        }
        
        // Confirm password
        if (!confirmPassword) {
            _showFieldError('confirmPassword', 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            _showFieldError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }
        
        return isValid;
    }

    /**
     * Validate Step 3: Location
     */
    function _validateStep3() {
        let isValid = true;
        
        if (!DOM.lastEducation.value) {
            _showFieldError('lastEducation', 'Please select your education level');
            isValid = false;
        }
        
        if (!DOM.country.value) {
            _showFieldError('country', 'Please select your country');
            isValid = false;
        }
        
        if (!DOM.state.value) {
            _showFieldError('state', 'Please select your state');
            isValid = false;
        }
        
        if (!DOM.city.value) {
            _showFieldError('city', 'Please select your city');
            isValid = false;
        }
        
        return isValid;
    }

    /**
     * Validate Step 4: Photo & Terms
     */
    function _validateStep4() {
        let isValid = true;
        
        if (!DOM.termsCheckbox.checked) {
            const termsWrap = DOM.termsCheckbox.closest('.register-terms');
            if (termsWrap) termsWrap.classList.add('has-error');
            
            HA.Utils.toast({
                type: 'error',
                title: 'Terms Required',
                message: 'Please accept the terms and conditions',
                duration: 3000
            });
            
            isValid = false;
        }
        
        return isValid;
    }

    /**
     * Show field error
     */
    function _showFieldError(fieldId, message) {
        const input = document.getElementById(fieldId);
        if (!input) return;
        
        const group = input.closest('.register-form-group');
        if (!group) return;
        
        group.classList.add('has-error');
        
        const errorEl = group.querySelector('.register-form-error');
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
        
        const group = input.closest('.register-form-group');
        if (group) {
            group.classList.remove('has-error');
        }
    }

    /**
     * Clear all errors
     */
    function _clearAllErrors() {
        document.querySelectorAll('.register-form-group.has-error').forEach(el => {
            el.classList.remove('has-error');
        });
        
        const termsWrap = document.querySelector('.register-terms.has-error');
        if (termsWrap) termsWrap.classList.remove('has-error');
    }

    /**
     * Shake animation
     */
    function _shakeElement(el) {
        if (!el) return;
        
        el.style.animation = 'none';
        el.offsetHeight;
        el.style.animation = 'shake 0.5s ease';
        
        setTimeout(() => {
            el.style.animation = '';
        }, 500);
    }

    // ============================================
    // 7. REAL-TIME VALIDATION
    // ============================================

    /**
     * Initialize real-time validation
     */
    function _initRealTimeValidation() {
        // Clear errors on input
        const inputs = [
            DOM.fullName, DOM.fatherName, DOM.motherName,
            DOM.email, DOM.whatsapp, DOM.password,
            DOM.confirmPassword, DOM.lastEducation,
            DOM.country, DOM.state, DOM.city, DOM.address
        ];
        
        inputs.forEach(input => {
            if (!input) return;
            
            input.addEventListener('input', () => {
                _clearFieldError(input.id);
            });
        });
        
        // Email validation on blur
        if (DOM.email) {
            DOM.email.addEventListener('blur', () => {
                if (DOM.email.value && !HA.Utils.isValidEmail(DOM.email.value)) {
                    _showFieldError('regEmail', 'Invalid email format');
                }
            });
        }
        
        // WhatsApp validation on blur
        if (DOM.whatsapp) {
            DOM.whatsapp.addEventListener('blur', () => {
                if (DOM.whatsapp.value && !HA.Utils.isValidPhone(DOM.whatsapp.value)) {
                    _showFieldError('whatsapp', 'Invalid WhatsApp number');
                }
            });
        }
        
        // Terms checkbox
        if (DOM.termsCheckbox) {
            DOM.termsCheckbox.addEventListener('change', () => {
                const termsWrap = DOM.termsCheckbox.closest('.register-terms');
                if (termsWrap) termsWrap.classList.remove('has-error');
            });
        }
        
        console.log('[HA.Register] ✅ Real-time validation initialized');
    }

    // ============================================
    // 8. PASSWORD STRENGTH METER
    // ============================================

    /**
     * Initialize password strength meter
     */
    function _initPasswordStrength() {
        if (!DOM.password || !DOM.passwordStrength) return;
        
        DOM.password.addEventListener('input', () => {
            const password = DOM.password.value;
            const result = HA.Storage.validatePassword(password);
            
            // Update strength class
            DOM.passwordStrength.className = `register-password-strength ${result.strength}`;
            
            // Update text
            const textEl = DOM.passwordStrength.querySelector('.register-password-strength-text');
            if (textEl) {
                const labels = {
                    'weak': 'Weak Password',
                    'medium': 'Medium Strength',
                    'strong': 'Strong Password',
                    'very-strong': 'Very Strong'
                };
                textEl.textContent = password ? labels[result.strength] : '';
            }
            
            // Update requirements
            const requirements = document.querySelectorAll('.password-requirement');
            requirements.forEach(req => {
                const check = req.dataset.check;
                if (check && result.checks[check] !== undefined) {
                    const icon = req.querySelector('i');
                    if (result.checks[check]) {
                        req.classList.add('met');
                        if (icon) icon.className = 'fas fa-check';
                    } else {
                        req.classList.remove('met');
                        if (icon) icon.className = 'fas fa-xmark';
                    }
                }
            });
            
            // Check password match in real-time
            if (DOM.confirmPassword.value) {
                if (DOM.password.value === DOM.confirmPassword.value) {
                    _clearFieldError('confirmPassword');
                }
            }
        });
        
        // Confirm password match check
        if (DOM.confirmPassword) {
            DOM.confirmPassword.addEventListener('input', () => {
                if (DOM.confirmPassword.value && DOM.password.value !== DOM.confirmPassword.value) {
                    // Don't show error while typing, only on blur
                }
            });
            
            DOM.confirmPassword.addEventListener('blur', () => {
                if (DOM.confirmPassword.value && DOM.password.value !== DOM.confirmPassword.value) {
                    _showFieldError('confirmPassword', 'Passwords do not match');
                }
            });
        }
        
        console.log('[HA.Register] ✅ Password strength meter initialized');
    }

    /**
     * Initialize password toggle
     */
    function _initPasswordToggles() {
        const toggles = [
            { toggle: DOM.passwordToggle1, input: DOM.password },
            { toggle: DOM.passwordToggle2, input: DOM.confirmPassword }
        ];
        
        toggles.forEach(({ toggle, input }) => {
            if (!toggle || !input) return;
            
            toggle.addEventListener('click', () => {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                
                const icon = toggle.querySelector('i');
                if (icon) {
                    icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
                }
            });
        });
    }

    // ============================================
    // 9. COUNTRY/STATE/CITY CASCADE
    // ============================================

    /**
     * Initialize cascading selects
     */
    function _initCascadingSelects() {
        if (!DOM.country) return;
        
        // Populate countries
        _populateCountries();
        
        // Country change
        DOM.country.addEventListener('change', () => {
            const countryCode = DOM.country.value;
            _populateStates(countryCode);
            _populateCities(countryCode, null);
        });
        
        // State change
        if (DOM.state) {
            DOM.state.addEventListener('change', () => {
                const countryCode = DOM.country.value;
                const stateCode = DOM.state.value;
                _populateCities(countryCode, stateCode);
            });
        }
        
        console.log('[HA.Register] ✅ Cascading selects initialized');
    }

    /**
     * Populate countries dropdown
     */
    function _populateCountries() {
        if (!DOM.country) return;
        
        // Clear existing options except first
        DOM.country.innerHTML = '<option value="">Select Country</option>';
        
        Object.entries(COUNTRIES).forEach(([code, data]) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = data.name;
            DOM.country.appendChild(option);
        });
    }

    /**
     * Populate states dropdown
     */
    function _populateStates(countryCode) {
        if (!DOM.state) return;
        
        DOM.state.innerHTML = '<option value="">Select State</option>';
        
        if (!countryCode || !COUNTRIES[countryCode]) return;
        
        const states = COUNTRIES[countryCode].states;
        Object.entries(states).forEach(([code, data]) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = data.name;
            DOM.state.appendChild(option);
        });
    }

    /**
     * Populate cities dropdown
     */
    function _populateCities(countryCode, stateCode) {
        if (!DOM.city) return;
        
        DOM.city.innerHTML = '<option value="">Select City</option>';
        
        if (!countryCode || !stateCode) return;
        if (!COUNTRIES[countryCode] || !COUNTRIES[countryCode].states[stateCode]) return;
        
        const cities = COUNTRIES[countryCode].states[stateCode].cities;
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            DOM.city.appendChild(option);
        });
    }

    // ============================================
    // 10. PHOTO UPLOAD
    // ============================================

    /**
     * Initialize photo upload
     */
    function _initPhotoUpload() {
        if (!DOM.photoInput || !DOM.photoUpload) return;
        
        DOM.photoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Validate file
            const validation = HA.Utils.isValidImage(file, 5);
            if (!validation.valid) {
                HA.Utils.toast({
                    type: 'error',
                    title: 'Invalid Image',
                    message: validation.error,
                    duration: 3500
                });
                DOM.photoInput.value = '';
                return;
            }
            
            try {
                // Read as data URL
                photoData = await HA.Utils.readFileAsDataURL(file);
                
                // Show preview
                if (DOM.photoPreview) {
                    DOM.photoPreview.src = photoData;
                }
                
                DOM.photoUpload.classList.add('has-image');
                
                HA.Utils.toast({
                    type: 'success',
                    title: 'Photo Uploaded',
                    message: 'Your photo has been uploaded successfully',
                    duration: 2500
                });
                
            } catch (error) {
                console.error('[HA.Register] Photo upload error:', error);
                HA.Utils.toast({
                    type: 'error',
                    title: 'Upload Failed',
                    message: 'Could not read the image file',
                    duration: 3500
                });
            }
        });
        
        // Remove photo
        if (DOM.photoRemove) {
            DOM.photoRemove.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                photoData = null;
                if (DOM.photoPreview) DOM.photoPreview.src = '';
                if (DOM.photoInput) DOM.photoInput.value = '';
                DOM.photoUpload.classList.remove('has-image');
                
                HA.Utils.toast({
                    type: 'info',
                    title: 'Photo Removed',
                    message: 'You can upload a new photo anytime',
                    duration: 2000
                });
            });
        }
        
        console.log('[HA.Register] ✅ Photo upload initialized');
    }

    // ============================================
    // 11. FORM SUBMISSION
    // ============================================

    /**
     * Initialize form submission
     */
    function _initFormSubmission() {
        if (!DOM.submitBtn) return;
        
        DOM.submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (isSubmitting) return;
            
            if (!_validateCurrentStep()) return;
            
            await _submitRegistration();
        });
        
        console.log('[HA.Register] ✅ Form submission initialized');
    }

    /**
     * Submit registration
     */
    async function _submitRegistration() {
        isSubmitting = true;
        _setLoadingState(true);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        try {
            // Collect all form data
            const data = {
                fullName: DOM.fullName.value.trim(),
                fatherName: DOM.fatherName ? DOM.fatherName.value.trim() : '',
                motherName: DOM.motherName ? DOM.motherName.value.trim() : '',
                email: DOM.email.value.trim(),
                password: DOM.password.value,
                confirmPassword: DOM.confirmPassword.value,
                whatsapp: DOM.whatsapp.value.trim(),
                lastEducation: DOM.lastEducation.value,
                country: DOM.country.value,
                state: DOM.state.value,
                city: DOM.city.value,
                address: DOM.address ? DOM.address.value.trim() : '',
                photo: photoData,
                termsAccepted: DOM.termsCheckbox.checked
            };
            
            // Register via storage
            const result = HA.Storage.register(data);
            
            if (result.success) {
                registeredStudent = result.student;
                _handleRegistrationSuccess(result);
            } else {
                _handleRegistrationError(result.error);
            }
            
        } catch (error) {
            console.error('[HA.Register] Registration error:', error);
            _handleRegistrationError('An unexpected error occurred. Please try again.');
        } finally {
            isSubmitting = false;
            _setLoadingState(false);
        }
    }

    /**
     * Handle successful registration
     */
    function _handleRegistrationSuccess(result) {
        // Hide form, show success screen
        DOM.stepContents.forEach(content => content.classList.remove('active'));
        if (DOM.successScreen) DOM.successScreen.classList.add('active');
        
        // Hide navigation buttons
        if (DOM.prevBtn) DOM.prevBtn.style.display = 'none';
        if (DOM.nextBtn) DOM.nextBtn.style.display = 'none';
        if (DOM.submitBtn) DOM.submitBtn.style.display = 'none';
        
        // Update step progress to complete
        DOM.steps.forEach(step => {
            step.classList.remove('active');
            step.classList.add('completed');
        });
        if (DOM.stepProgress) DOM.stepProgress.style.width = '100%';
        
        // Display HABPS ID
        if (DOM.habpsIdValue) {
            _animateHABPSId(result.habpsId);
        }
        
        // Celebration animation
        _celebrateRegistration();
        
        // Success toast
        HA.Utils.toast({
            type: 'success',
            title: 'Registration Successful!',
            message: `Welcome to Hacker Academy, ${result.student.fullName}!`,
            duration: 5000
        });
        
        // Initialize success actions
        _initSuccessActions();
        
        // Auto-login the user
        HA.Storage.login({
            email: result.student.email,
            password: DOM.password.value
        }, true);
        
        console.log(`[HA.Register] ✅ Registration successful: ${result.habpsId}`);
    }

    /**
     * Handle registration error
     */
    function _handleRegistrationError(errorMessage) {
        HA.Utils.toast({
            type: 'error',
            title: 'Registration Failed',
            message: errorMessage,
            duration: 4000
        });
        
        _shakeElement(DOM.submitBtn);
    }

    /**
     * Set loading state
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
     * Animate HABPS ID display
     */
    function _animateHABPSId(habpsId) {
        if (!DOM.habpsIdValue) return;
        
        // Typing animation
        let index = 0;
        const interval = setInterval(() => {
            if (index <= habpsId.length) {
                DOM.habpsIdValue.textContent = habpsId.substring(0, index);
                index++;
            } else {
                clearInterval(interval);
            }
        }, 80);
    }

    /**
     * Celebration animation
     */
    function _celebrateRegistration() {
        const colors = ['#00ff9d', '#00d4ff', '#b537f2', '#ff2e9a', '#ffd60a'];
        
        for (let i = 0; i < 40; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    left: 50%;
                    top: 40%;
                    box-shadow: 0 0 15px currentColor;
                `;
                
                document.body.appendChild(particle);
                
                const angle = (Math.PI * 2 * i) / 40;
                const velocity = 200 + Math.random() * 150;
                const dx = Math.cos(angle) * velocity;
                const dy = Math.sin(angle) * velocity - 100;
                
                particle.animate([
                    { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                    { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 }
                ], {
                    duration: 1500,
                    easing: 'cubic-bezier(0, 0.5, 0.5, 1)'
                }).onfinish = () => particle.remove();
            }, i * 30);
        }
    }

    // ============================================
    // 12. SUCCESS ACTIONS
    // ============================================

    /**
     * Initialize success screen actions
     */
    function _initSuccessActions() {
        // Copy HABPS ID
        if (DOM.habpsIdCopy && registeredStudent) {
            DOM.habpsIdCopy.addEventListener('click', async () => {
                const success = await HA.Utils.copyToClipboard(registeredStudent.habpsId);
                
                if (success) {
                    DOM.habpsIdCopy.classList.add('copied');
                    DOM.habpsIdCopy.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    
                    HA.Utils.toast({
                        type: 'success',
                        title: 'Copied!',
                        message: 'HABPS ID copied to clipboard',
                        duration: 2000
                    });
                    
                    setTimeout(() => {
                        DOM.habpsIdCopy.classList.remove('copied');
                        DOM.habpsIdCopy.innerHTML = '<i class="fas fa-copy"></i> Copy ID';
                    }, 2500);
                }
            });
        }
        
        // Go to login
        if (DOM.goToLoginBtn) {
            DOM.goToLoginBtn.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }
        
        // Go to dashboard
        if (DOM.goToDashboardBtn) {
            DOM.goToDashboardBtn.addEventListener('click', () => {
                window.location.href = 'dashboard.html';
            });
        }
    }

    // ============================================
    // 13. LOADING SCREEN
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
                
                // Focus first input
                setTimeout(() => {
                    if (DOM.fullName) DOM.fullName.focus();
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
    // 14. KEYBOARD SHORTCUTS
    // ============================================

    /**
     * Initialize keyboard shortcuts
     */
    function _initKeyboardShortcuts() {
        // Enter to go next (when not in textarea)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                
                if (currentStep < totalSteps) {
                    _nextStep();
                } else if (DOM.submitBtn) {
                    DOM.submitBtn.click();
                }
            }
        });
        
        // Escape to go back
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && currentStep > 1) {
                _prevStep();
            }
        });
        
        // Ctrl/Cmd + Enter to submit
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                if (currentStep === totalSteps && DOM.submitBtn) {
                    DOM.submitBtn.click();
                }
            }
        });
    }

    // ============================================
    // 15. ERROR HANDLING
    // ============================================

    /**
     * Initialize error handling
     */
    function _initErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('[HA.Register] Global error:', e.message);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('[HA.Register] Unhandled promise rejection:', e.reason);
        });
    }

    /**
     * Initialize cleanup
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
         * Initialize the registration page
         */
        init: function() {
            console.log('[HA.Register] 🚀 Initializing Registration Page...');
            console.log('[HA.Register] Founded by Er. Priyanshu Sharma');
            
            // Prevent double initialization
            if (window.__HA_REGISTER_INITIALIZED__) {
                console.warn('[HA.Register] Already initialized');
                return;
            }
            window.__HA_REGISTER_INITIALIZED__ = true;
            
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
            
            // Initialize UI
            _initStepNavigation();
            _initRealTimeValidation();
            _initPasswordStrength();
            _initPasswordToggles();
            _initCascadingSelects();
            _initPhotoUpload();
            _initFormSubmission();
            _initKeyboardShortcuts();
            
            // Initialize utilities
            _initErrorHandling();
            _initCleanup();
            
            // Hide loader
            _hideLoader();
            
            console.log('[HA.Register] ✅ Initialization complete');
            console.log('[HA.Register] 📝 4-step wizard ready');
        },

        /**
         * Get current step
         */
        getCurrentStep: function() {
            return currentStep;
        },

        /**
         * Go to specific step
         */
        goToStep: function(step) {
            if (step >= 1 && step <= totalSteps) {
                currentStep = step;
                _updateStepProgress();
            }
        },

        /**
         * Reset form
         */
        reset: function() {
            currentStep = 1;
            photoData = null;
            registeredStudent = null;
            
            // Reset all inputs
            document.querySelectorAll('input, select, textarea').forEach(el => {
                if (el.type === 'checkbox') el.checked = false;
                else el.value = '';
            });
            
            // Reset photo
            if (DOM.photoUpload) DOM.photoUpload.classList.remove('has-image');
            if (DOM.photoPreview) DOM.photoPreview.src = '';
            
            // Reset success screen
            if (DOM.successScreen) DOM.successScreen.classList.remove('active');
            
            _updateStepProgress();
            _clearAllErrors();
        },

        /**
         * Get total steps
         */
        getTotalSteps: function() {
            return totalSteps;
        },

        /**
         * Version info
         */
        version: '1.0.0',
        founder: 'Er. Priyanshu Sharma'
    };
})();

// ============================================
// SHAKE ANIMATION KEYFRAMES
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
    setTimeout(() => {
        HA.Register.init();
    }, 100);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HA.Register;
}