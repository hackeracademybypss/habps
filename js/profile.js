/**
 * ============================================
 * HACKER ACADEMY — PROFILE CONTROLLER
 * Premium Cyberpunk Profile Management System
 * ============================================
 * 
 * Founded & Owned by Er. Priyanshu Sharma
 * File: js/profile.js
 * Version: 1.0.0
 * 
 * ARCHITECTURE:
 * - Namespace: HA.Profile
 * - Pattern: Module (IIFE)
 * - Dependencies: HA.Storage, HA.Utils
 * - Target Page: profile.html
 * 
 * FEATURES:
 * • Authentication check (redirect if not logged in)
 * • User profile display with photo/initials
 * • Edit profile form with validation
 * • Profile picture upload with circular preview
 * • Password change with strength meter
 * • Achievements grid (locked/unlocked states)
 * • Activity timeline
 * • Stats display (courses, certificates, points, rank)
 * • Skills & badges display
 * • Connected accounts management
 * • Form validation (real-time + submit)
 * • Photo upload with file validation
 * • Password requirements checklist
 * • Copy HABPS ID to clipboard
 * • Logout handler
 * • Loading screen
 * • Keyboard shortcuts
 * ============================================
 */

// Initialize namespace
window.HA = window.HA || {};

/**
 * HA.Profile Module
 * Profile management controller
 */
HA.Profile = (function() {
    'use strict';

    // ============================================
    // 1. PRIVATE STATE
    // ============================================
    let currentUser = null;
    let userProgress = null;
    let isEditing = false;
    let photoData = null;

    // ============================================
    // 2. DOM REFERENCES
    // ============================================
    const DOM = {
        loader: null,
        
        // Profile Header
        profileAvatar: null,
        profileAvatarImg: null,
        profileAvatarEdit: null,
        profileName: null,
        profileId: null,
        profileMeta: null,
        profileBadges: null,
        profileActions: null,
        
        // Stats
        statCourses: null,
        statCertificates: null,
        statPoints: null,
        statRank: null,
        
        // Edit Form
        editForm: null,
        fullName: null,
        fatherName: null,
        motherName: null,
        email: null,
        whatsapp: null,
        lastEducation: null,
        country: null,
        state: null,
        city: null,
        address: null,
        saveBtn: null,
        cancelBtn: null,
        
        // Password Change
        passwordForm: null,
        currentPassword: null,
        newPassword: null,
        confirmPassword: null,
        passwordToggle1: null,
        passwordToggle2: null,
        passwordToggle3: null,
        passwordStrength: null,
        changePasswordBtn: null,
        
        // Achievements
        achievementsGrid: null,
        
        // Activity Timeline
        activityTimeline: null,
        
        // Skills
        skillsGrid: null,
        
        // Connected Accounts
        connectedAccounts: null,
        
        // Photo Upload Modal
        photoUploadModal: null,
        photoUploadInput: null,
        photoUploadPreview: null,
        photoUploadSave: null,
        photoUploadCancel: null,
        photoUploadClose: null
    };

    // ============================================
    // 3. DEMO DATA
    // ============================================

    /**
     * Demo achievements
     */
    const ACHIEVEMENTS = [
        {
            id: 'ACH001',
            title: 'First Steps',
            description: 'Complete your first lesson',
            icon: 'fa-shoe-prints',
            unlocked: true,
            date: '2026-07-20'
        },
        {
            id: 'ACH002',
            title: 'Quiz Master',
            description: 'Pass 5 quizzes with 90%+',
            icon: 'fa-brain',
            unlocked: true,
            date: '2026-07-22'
        },
        {
            id: 'ACH003',
            title: 'Course Completer',
            description: 'Complete your first course',
            icon: 'fa-graduation-cap',
            unlocked: false,
            date: null
        },
        {
            id: 'ACH004',
            title: 'Night Owl',
            description: 'Complete 10 lessons after midnight',
            icon: 'fa-moon',
            unlocked: true,
            date: '2026-07-25'
        },
        {
            id: 'ACH005',
            title: 'Speed Runner',
            description: 'Complete a quiz in under 5 minutes',
            icon: 'fa-bolt',
            unlocked: false,
            date: null
        },
        {
            id: 'ACH006',
            title: 'Social Butterfly',
            description: 'Connect 3 social accounts',
            icon: 'fa-users',
            unlocked: false,
            date: null
        },
        {
            id: 'ACH007',
            title: 'Top 10',
            description: 'Reach top 10 on leaderboard',
            icon: 'fa-trophy',
            unlocked: true,
            date: '2026-07-26'
        },
        {
            id: 'ACH008',
            title: 'Century',
            description: 'Earn 100 points',
            icon: 'fa-star',
            unlocked: true,
            date: '2026-07-24'
        }
    ];

    /**
     * Demo activity timeline
     */
    const ACTIVITIES = [
        {
            id: 'ACT001',
            title: 'Completed Lesson',
            description: 'Introduction to Ethical Hacking',
            time: '2 hours ago',
            type: 'lesson'
        },
        {
            id: 'ACT002',
            title: 'Quiz Passed',
            description: 'Ethical Hacking Fundamentals - 95%',
            time: '5 hours ago',
            type: 'quiz'
        },
        {
            id: 'ACT003',
            title: 'Achievement Unlocked',
            description: 'Quiz Master',
            time: '1 day ago',
            type: 'achievement'
        },
        {
            id: 'ACT004',
            title: 'Course Enrolled',
            description: 'Python for Cyber Security',
            time: '2 days ago',
            type: 'course'
        },
        {
            id: 'ACT005',
            title: 'Profile Updated',
            description: 'Changed profile picture',
            time: '3 days ago',
            type: 'profile'
        }
    ];

    /**
     * Demo skills
     */
    const SKILLS = [
        { name: 'Ethical Hacking', level: 3 },
        { name: 'Network Security', level: 4 },
        { name: 'Python', level: 2 },
        { name: 'Linux', level: 3 },
        { name: 'Web Security', level: 2 },
        { name: 'Cryptography', level: 1 },
        { name: 'Forensics', level: 2 },
        { name: 'SOC Analysis', level: 3 }
    ];

    /**
     * Demo connected accounts
     */
    const CONNECTED_ACCOUNTS = [
        {
            id: 'ACC001',
            provider: 'google',
            name: 'Google',
            email: 'user@gmail.com',
            connected: true
        },
        {
            id: 'ACC002',
            provider: 'github',
            name: 'GitHub',
            email: 'user@github.com',
            connected: true
        },
        {
            id: 'ACC003',
            provider: 'twitter',
            name: 'Twitter',
            email: null,
            connected: false
        }
    ];

    // ============================================
    // 4. INITIALIZATION
    // ============================================

    /**
     * Cache DOM references
     */
    function _cacheDOM() {
        DOM.loader = document.getElementById('haLoader');
        
        // Profile Header
        DOM.profileAvatar = document.querySelector('.profile-avatar-large');
        DOM.profileAvatarImg = document.querySelector('.profile-avatar-large img');
        DOM.profileAvatarEdit = document.querySelector('.profile-avatar-edit');
        DOM.profileName = document.querySelector('.profile-name');
        DOM.profileId = document.querySelector('.profile-id');
        DOM.profileMeta = document.querySelector('.profile-meta');
        DOM.profileBadges = document.querySelector('.profile-badges');
        DOM.profileActions = document.querySelector('.profile-actions');
        
        // Stats
        DOM.statCourses = document.getElementById('statCourses');
        DOM.statCertificates = document.getElementById('statCertificates');
        DOM.statPoints = document.getElementById('statPoints');
        DOM.statRank = document.getElementById('statRank');
        
        // Edit Form
        DOM.editForm = document.getElementById('editProfileForm');
        DOM.fullName = document.getElementById('profileFullName');
        DOM.fatherName = document.getElementById('profileFatherName');
        DOM.motherName = document.getElementById('profileMotherName');
        DOM.email = document.getElementById('profileEmail');
        DOM.whatsapp = document.getElementById('profileWhatsapp');
        DOM.lastEducation = document.getElementById('profileEducation');
        DOM.country = document.getElementById('profileCountry');
        DOM.state = document.getElementById('profileState');
        DOM.city = document.getElementById('profileCity');
        DOM.address = document.getElementById('profileAddress');
        DOM.saveBtn = document.getElementById('saveProfileBtn');
        DOM.cancelBtn = document.getElementById('cancelEditBtn');
        
        // Password Change
        DOM.passwordForm = document.getElementById('changePasswordForm');
        DOM.currentPassword = document.getElementById('currentPassword');
        DOM.newPassword = document.getElementById('newPassword');
        DOM.confirmPassword = document.getElementById('confirmNewPassword');
        DOM.passwordToggle1 = document.getElementById('passwordToggle1');
        DOM.passwordToggle2 = document.getElementById('passwordToggle2');
        DOM.passwordToggle3 = document.getElementById('passwordToggle3');
        DOM.passwordStrength = document.querySelector('.password-strength');
        DOM.changePasswordBtn = document.getElementById('changePasswordBtn');
        
        // Achievements
        DOM.achievementsGrid = document.getElementById('achievementsGrid');
        
        // Activity Timeline
        DOM.activityTimeline = document.getElementById('activityTimeline');
        
        // Skills
        DOM.skillsGrid = document.getElementById('skillsGrid');
        
        // Connected Accounts
        DOM.connectedAccounts = document.getElementById('connectedAccounts');
        
        // Photo Upload Modal
        DOM.photoUploadModal = document.getElementById('photoUploadModal');
        DOM.photoUploadInput = document.getElementById('photoUploadInput');
        DOM.photoUploadPreview = document.querySelector('.profile-upload-preview-img');
        DOM.photoUploadSave = document.getElementById('photoUploadSave');
        DOM.photoUploadCancel = document.getElementById('photoUploadCancel');
        DOM.photoUploadClose = document.querySelector('.profile-upload-close');
        
        console.log('[HA.Profile] ✅ DOM references cached');
    }

    /**
     * Check authentication
     */
    function _checkAuth() {
        currentUser = HA.Storage.getCurrentUser();
        
        if (!currentUser) {
            console.warn('[HA.Profile] User not logged in, redirecting...');
            
            HA.Utils.toast({
                type: 'warning',
                title: 'Login Required',
                message: 'Please login to view your profile',
                duration: 3000
            });
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            
            return false;
        }
        
        // Load full user data
        const fullUser = HA.Storage.getStudent(currentUser.id);
        if (fullUser) {
            currentUser = { ...currentUser, ...fullUser };
        }
        
        // Load user progress
        userProgress = HA.Storage.getProgress(currentUser.id);
        
        console.log('[HA.Profile] ✅ User authenticated:', currentUser.habpsId);
        return true;
    }

    // ============================================
    // 5. PROFILE HEADER
    // ============================================

    /**
     * Render profile header
     */
    function _renderProfileHeader() {
        if (!currentUser) return;
        
        const initials = currentUser.fullName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        
        // Avatar
        if (DOM.profileAvatar) {
            if (currentUser.photo) {
                DOM.profileAvatar.innerHTML = `
                    <img src="${currentUser.photo}" alt="${currentUser.fullName}">
                    <div class="profile-avatar-edit">
                        <i class="fas fa-camera"></i>
                    </div>
                `;
                DOM.profileAvatarImg = DOM.profileAvatar.querySelector('img');
                DOM.profileAvatarEdit = DOM.profileAvatar.querySelector('.profile-avatar-edit');
            } else {
                DOM.profileAvatar.innerHTML = `
                    ${initials}
                    <div class="profile-avatar-edit">
                        <i class="fas fa-camera"></i>
                    </div>
                `;
                DOM.profileAvatarEdit = DOM.profileAvatar.querySelector('.profile-avatar-edit');
            }
        }
        
        // Name
        if (DOM.profileName) {
            DOM.profileName.textContent = currentUser.fullName;
        }
        
        // HABPS ID
        if (DOM.profileId) {
            DOM.profileId.innerHTML = `
                <i class="fas fa-id-card"></i>
                ${currentUser.habpsId}
            `;
        }
        
        // Meta info
        if (DOM.profileMeta) {
            DOM.profileMeta.innerHTML = `
                <div class="profile-meta-item">
                    <i class="fas fa-envelope"></i>
                    <span>${currentUser.email}</span>
                </div>
                <div class="profile-meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>Joined ${HA.Utils.formatDate(currentUser.joinedAt)}</span>
                </div>
                <div class="profile-meta-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${currentUser.city || 'Not specified'}, ${currentUser.country || 'Not specified'}</span>
                </div>
            `;
        }
        
        // Badges
        if (DOM.profileBadges) {
            DOM.profileBadges.innerHTML = `
                <div class="profile-tier-badge">
                    <i class="fas fa-crown"></i>
                    ${currentUser.tier.toUpperCase()} TIER
                </div>
            `;
        }
        
        // Actions
        if (DOM.profileActions) {
            DOM.profileActions.innerHTML = `
                <button class="btn btn-primary" id="editProfileBtn">
                    <i class="fas fa-edit"></i> Edit Profile
                </button>
                <button class="btn btn-ghost" id="copyHabpsBtn">
                    <i class="fas fa-copy"></i> Copy ID
                </button>
            `;
            
            // Initialize action buttons
            _initProfileActions();
        }
        
        console.log('[HA.Profile] ✅ Profile header rendered');
    }

    /**
     * Initialize profile action buttons
     */
    function _initProfileActions() {
        const editBtn = document.getElementById('editProfileBtn');
        const copyBtn = document.getElementById('copyHabpsBtn');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                _toggleEditMode(true);
            });
        }
        
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                const success = await HA.Utils.copyToClipboard(currentUser.habpsId);
                
                if (success) {
                    HA.Utils.toast({
                        type: 'success',
                        title: 'Copied!',
                        message: 'HABPS ID copied to clipboard',
                        duration: 2000
                    });
                }
            });
        }
        
        // Avatar edit button
        if (DOM.profileAvatarEdit) {
            DOM.profileAvatarEdit.addEventListener('click', () => {
                _openPhotoUploadModal();
            });
        }
    }

    // ============================================
    // 6. STATS
    // ============================================

    /**
     * Render profile stats
     */
    function _renderStats() {
        if (!currentUser || !userProgress) return;
        
        const enrolledCourses = currentUser.enrolledCourses?.length || 0;
        const certificates = HA.Storage.getCertificates(currentUser.id);
        const certCount = certificates.length;
        const points = userProgress.totalPoints || 0;
        
        // Get leaderboard rank
        const leaderboard = HA.Storage.getLeaderboard();
        const userIndex = leaderboard.findIndex(s => s.id === currentUser.id);
        const rank = userIndex >= 0 ? userIndex + 1 : '-';
        
        // Animate stats
        if (DOM.statCourses) _animateStat(DOM.statCourses, enrolledCourses);
        if (DOM.statCertificates) _animateStat(DOM.statCertificates, certCount);
        if (DOM.statPoints) _animateStat(DOM.statPoints, points);
        if (DOM.statRank) {
            DOM.statRank.textContent = rank === '-' ? '-' : `#${rank}`;
        }
        
        console.log('[HA.Profile] ✅ Stats rendered');
    }

    /**
     * Animate stat counter
     */
    function _animateStat(el, target) {
        const duration = 1500;
        const startTime = performance.now();
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * easeProgress);
            
            el.textContent = HA.Utils.formatNumber(current);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = HA.Utils.formatNumber(target);
            }
        };
        
        requestAnimationFrame(update);
    }

    // ============================================
    // 7. EDIT PROFILE FORM
    // ============================================

    /**
     * Populate edit form with current data
     */
    function _populateEditForm() {
        if (!currentUser) return;
        
        if (DOM.fullName) DOM.fullName.value = currentUser.fullName || '';
        if (DOM.fatherName) DOM.fatherName.value = currentUser.fatherName || '';
        if (DOM.motherName) DOM.motherName.value = currentUser.motherName || '';
        if (DOM.email) DOM.email.value = currentUser.email || '';
        if (DOM.whatsapp) DOM.whatsapp.value = currentUser.whatsapp || '';
        if (DOM.lastEducation) DOM.lastEducation.value = currentUser.lastEducation || '';
        if (DOM.country) DOM.country.value = currentUser.country || '';
        if (DOM.state) DOM.state.value = currentUser.state || '';
        if (DOM.city) DOM.city.value = currentUser.city || '';
        if (DOM.address) DOM.address.value = currentUser.address || '';
    }

    /**
     * Toggle edit mode
     */
    function _toggleEditMode(editing) {
        isEditing = editing;
        
        const formSection = document.querySelector('.profile-section-card');
        if (!formSection) return;
        
        if (editing) {
            _populateEditForm();
            
            // Enable inputs
            formSection.querySelectorAll('input, select, textarea').forEach(el => {
                el.disabled = false;
            });
            
            // Show save/cancel buttons
            if (DOM.saveBtn) DOM.saveBtn.style.display = 'inline-flex';
            if (DOM.cancelBtn) DOM.cancelBtn.style.display = 'inline-flex';
            
            HA.Utils.toast({
                type: 'info',
                title: 'Edit Mode',
                message: 'You can now edit your profile',
                duration: 2000
            });
        } else {
            // Disable inputs
            formSection.querySelectorAll('input, select, textarea').forEach(el => {
                el.disabled = true;
            });
            
            // Hide save/cancel buttons
            if (DOM.saveBtn) DOM.saveBtn.style.display = 'none';
            if (DOM.cancelBtn) DOM.cancelBtn.style.display = 'none';
        }
    }

    /**
     * Initialize edit form
     */
    function _initEditForm() {
        if (!DOM.editForm) return;
        
        // Disable inputs initially
        DOM.editForm.querySelectorAll('input, select, textarea').forEach(el => {
            el.disabled = true;
        });
        
        // Hide save/cancel buttons initially
        if (DOM.saveBtn) DOM.saveBtn.style.display = 'none';
        if (DOM.cancelBtn) DOM.cancelBtn.style.display = 'none';
        
        // Real-time validation
        [DOM.fullName, DOM.email, DOM.whatsapp].forEach(input => {
            if (!input) return;
            
            input.addEventListener('input', () => {
                _clearFieldError(input.id);
            });
            
            input.addEventListener('blur', () => {
                if (input.id === 'profileEmail' && input.value && !HA.Utils.isValidEmail(input.value)) {
                    _showFieldError(input.id, 'Invalid email format');
                }
                if (input.id === 'profileWhatsapp' && input.value && !HA.Utils.isValidPhone(input.value)) {
                    _showFieldError(input.id, 'Invalid WhatsApp number');
                }
            });
        });
        
        // Save button
        if (DOM.saveBtn) {
            DOM.saveBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await _saveProfile();
            });
        }
        
        // Cancel button
        if (DOM.cancelBtn) {
            DOM.cancelBtn.addEventListener('click', () => {
                _toggleEditMode(false);
                _populateEditForm(); // Reset to original values
                _clearAllErrors();
            });
        }
        
        console.log('[HA.Profile] ✅ Edit form initialized');
    }

    /**
     * Save profile
     */
    async function _saveProfile() {
        // Validate
        if (!_validateProfileForm()) return;
        
        // Set loading state
        DOM.saveBtn.classList.add('loading');
        DOM.saveBtn.disabled = true;
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
            const data = {
                fullName: DOM.fullName.value.trim(),
                fatherName: DOM.fatherName.value.trim(),
                motherName: DOM.motherName.value.trim(),
                whatsapp: DOM.whatsapp.value.trim(),
                lastEducation: DOM.lastEducation.value,
                country: DOM.country.value,
                state: DOM.state.value,
                city: DOM.city.value,
                address: DOM.address.value.trim()
            };
            
            const result = HA.Storage.updateStudent(currentUser.id, data);
            
            if (result.success) {
                currentUser = { ...currentUser, ...data };
                
                HA.Utils.toast({
                    type: 'success',
                    title: 'Profile Updated!',
                    message: 'Your profile has been saved successfully',
                    duration: 3000
                });
                
                _toggleEditMode(false);
                _renderProfileHeader(); // Re-render header with new data
                
                // Celebration
                _celebrateUpdate();
            } else {
                HA.Utils.toast({
                    type: 'error',
                    title: 'Update Failed',
                    message: result.error || 'Could not update profile',
                    duration: 3000
                });
            }
        } catch (error) {
            console.error('[HA.Profile] Save error:', error);
            HA.Utils.toast({
                type: 'error',
                title: 'Error',
                message: 'An unexpected error occurred',
                duration: 3000
            });
        } finally {
            DOM.saveBtn.classList.remove('loading');
            DOM.saveBtn.disabled = false;
        }
    }

    /**
     * Validate profile form
     */
    function _validateProfileForm() {
        _clearAllErrors();
        let isValid = true;
        
        if (!DOM.fullName.value.trim()) {
            _showFieldError('profileFullName', 'Full name is required');
            isValid = false;
        }
        
        if (!DOM.email.value.trim()) {
            _showFieldError('profileEmail', 'Email is required');
            isValid = false;
        } else if (!HA.Utils.isValidEmail(DOM.email.value)) {
            _showFieldError('profileEmail', 'Invalid email format');
            isValid = false;
        }
        
        if (DOM.whatsapp.value && !HA.Utils.isValidPhone(DOM.whatsapp.value)) {
            _showFieldError('profileWhatsapp', 'Invalid WhatsApp number');
            isValid = false;
        }
        
        if (!isValid) {
            HA.Utils.toast({
                type: 'error',
                title: 'Validation Error',
                message: 'Please fix the errors before saving',
                duration: 3000
            });
        }
        
        return isValid;
    }

    /**
     * Celebration animation
     */
    function _celebrateUpdate() {
        const colors = ['#00ff9d', '#00d4ff', '#b537f2'];
        
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
            }, i * 30);
        }
    }

    // ============================================
    // 8. PASSWORD CHANGE
    // ============================================

    /**
     * Initialize password change form
     */
    function _initPasswordForm() {
        if (!DOM.passwordForm) return;
        
        // Password toggles
        const toggles = [
            { toggle: DOM.passwordToggle1, input: DOM.currentPassword },
            { toggle: DOM.passwordToggle2, input: DOM.newPassword },
            { toggle: DOM.passwordToggle3, input: DOM.confirmPassword }
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
        
        // Password strength meter
        if (DOM.newPassword && DOM.passwordStrength) {
            DOM.newPassword.addEventListener('input', () => {
                const password = DOM.newPassword.value;
                const result = HA.Storage.validatePassword(password);
                
                DOM.passwordStrength.className = `password-strength ${result.strength}`;
                
                const textEl = DOM.passwordStrength.querySelector('.password-strength-text');
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
            });
        }
        
        // Form submission
        if (DOM.changePasswordBtn) {
            DOM.changePasswordBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await _changePassword();
            });
        }
        
        console.log('[HA.Profile] ✅ Password form initialized');
    }

    /**
     * Change password
     */
    async function _changePassword() {
        const currentPwd = DOM.currentPassword.value;
        const newPwd = DOM.newPassword.value;
        const confirmPwd = DOM.confirmPassword.value;
        
        // Validation
        if (!currentPwd || !newPwd || !confirmPwd) {
            HA.Utils.toast({
                type: 'error',
                title: 'Missing Fields',
                message: 'Please fill in all password fields',
                duration: 3000
            });
            return;
        }
        
        if (newPwd !== confirmPwd) {
            HA.Utils.toast({
                type: 'error',
                title: 'Password Mismatch',
                message: 'New passwords do not match',
                duration: 3000
            });
            return;
        }
        
        const strength = HA.Storage.validatePassword(newPwd);
        if (!strength.valid) {
            HA.Utils.toast({
                type: 'error',
                title: 'Weak Password',
                message: 'New password does not meet requirements',
                duration: 3000
            });
            return;
        }
        
        // Set loading state
        DOM.changePasswordBtn.classList.add('loading');
        DOM.changePasswordBtn.disabled = true;
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
            const result = HA.Storage.changePassword(currentUser.id, currentPwd, newPwd);
            
            if (result.success) {
                HA.Utils.toast({
                    type: 'success',
                    title: 'Password Changed!',
                    message: 'Your password has been updated successfully',
                    duration: 3000
                });
                
                // Reset form
                DOM.passwordForm.reset();
                DOM.passwordStrength.className = 'password-strength';
                document.querySelectorAll('.password-requirement').forEach(req => {
                    req.classList.remove('met');
                    const icon = req.querySelector('i');
                    if (icon) icon.className = 'fas fa-xmark';
                });
                
                _celebrateUpdate();
            } else {
                HA.Utils.toast({
                    type: 'error',
                    title: 'Change Failed',
                    message: result.error || 'Current password is incorrect',
                    duration: 3000
                });
            }
        } catch (error) {
            console.error('[HA.Profile] Password change error:', error);
            HA.Utils.toast({
                type: 'error',
                title: 'Error',
                message: 'An unexpected error occurred',
                duration: 3000
            });
        } finally {
            DOM.changePasswordBtn.classList.remove('loading');
            DOM.changePasswordBtn.disabled = false;
        }
    }

    // ============================================
    // 9. ACHIEVEMENTS
    // ============================================

    /**
     * Render achievements grid
     */
    function _renderAchievements() {
        if (!DOM.achievementsGrid) return;
        
        const html = ACHIEVEMENTS.map(achievement => {
            const lockedClass = achievement.unlocked ? '' : 'locked';
            const dateText = achievement.date 
                ? `Unlocked ${HA.Utils.formatDate(achievement.date)}`
                : 'Locked';
            
            return `
                <div class="achievement-card ${lockedClass}">
                    <div class="achievement-icon">
                        <i class="fas ${achievement.icon}"></i>
                    </div>
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                    <div class="achievement-date">${dateText}</div>
                </div>
            `;
        }).join('');
        
        DOM.achievementsGrid.innerHTML = html;
        
        console.log('[HA.Profile] ✅ Achievements rendered');
    }

    // ============================================
    // 10. ACTIVITY TIMELINE
    // ============================================

    /**
     * Render activity timeline
     */
    function _renderActivityTimeline() {
        if (!DOM.activityTimeline) return;
        
        const html = ACTIVITIES.map(activity => {
            const typeColors = {
                'lesson': 'blue',
                'quiz': 'purple',
                'achievement': 'yellow',
                'course': '',
                'profile': 'blue'
            };
            
            const dotClass = typeColors[activity.type] || '';
            
            return `
                <div class="activity-item">
                    <div class="activity-dot ${dotClass}"></div>
                    <div class="activity-content">
                        <div class="activity-time">${activity.time}</div>
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-desc">${activity.description}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        DOM.activityTimeline.innerHTML = html;
        
        console.log('[HA.Profile] ✅ Activity timeline rendered');
    }

    // ============================================
    // 11. SKILLS
    // ============================================

    /**
     * Render skills grid
     */
    function _renderSkills() {
        if (!DOM.skillsGrid) return;
        
        const html = SKILLS.map(skill => {
            return `
                <div class="skill-badge level-${skill.level}">
                    ${skill.name}
                </div>
            `;
        }).join('');
        
        DOM.skillsGrid.innerHTML = html;
        
        console.log('[HA.Profile] ✅ Skills rendered');
    }

    // ============================================
    // 12. CONNECTED ACCOUNTS
    // ============================================

    /**
     * Render connected accounts
     */
    function _renderConnectedAccounts() {
        if (!DOM.connectedAccounts) return;
        
        const html = CONNECTED_ACCOUNTS.map(account => {
            const statusClass = account.connected ? '' : 'disconnected';
            const statusText = account.connected ? 'Connected' : 'Not Connected';
            const emailText = account.email || 'Not connected';
            
            return `
                <div class="connected-account-item">
                    <div class="connected-account-icon ${account.provider}">
                        <i class="fab fa-${account.provider}"></i>
                    </div>
                    <div class="connected-account-info">
                        <div class="connected-account-name">${account.name}</div>
                        <div class="connected-account-email">${emailText}</div>
                    </div>
                    <div class="connected-account-status ${statusClass}">
                        ${statusText}
                    </div>
                </div>
            `;
        }).join('');
        
        DOM.connectedAccounts.innerHTML = html;
        
        console.log('[HA.Profile] ✅ Connected accounts rendered');
    }

    // ============================================
    // 13. PHOTO UPLOAD MODAL
    // ============================================

    /**
     * Open photo upload modal
     */
    function _openPhotoUploadModal() {
        if (!DOM.photoUploadModal) return;
        
        DOM.photoUploadModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Reset state
        photoData = null;
        if (DOM.photoUploadPreview) DOM.photoUploadPreview.src = '';
        if (DOM.photoUploadInput) DOM.photoUploadInput.value = '';
        
        const previewWrap = document.querySelector('.profile-upload-preview');
        if (previewWrap) previewWrap.classList.remove('active');
    }

    /**
     * Close photo upload modal
     */
    function _closePhotoUploadModal() {
        if (!DOM.photoUploadModal) return;
        
        DOM.photoUploadModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Initialize photo upload modal
     */
    function _initPhotoUploadModal() {
        if (!DOM.photoUploadModal) return;
        
        // File input change
        if (DOM.photoUploadInput) {
            DOM.photoUploadInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                // Validate
                const validation = HA.Utils.isValidImage(file, 5);
                if (!validation.valid) {
                    HA.Utils.toast({
                        type: 'error',
                        title: 'Invalid Image',
                        message: validation.error,
                        duration: 3500
                    });
                    DOM.photoUploadInput.value = '';
                    return;
                }
                
                try {
                    photoData = await HA.Utils.readFileAsDataURL(file);
                    
                    if (DOM.photoUploadPreview) {
                        DOM.photoUploadPreview.src = photoData;
                    }
                    
                    const previewWrap = document.querySelector('.profile-upload-preview');
                    if (previewWrap) previewWrap.classList.add('active');
                    
                } catch (error) {
                    console.error('[HA.Profile] Photo upload error:', error);
                    HA.Utils.toast({
                        type: 'error',
                        title: 'Upload Failed',
                        message: 'Could not read the image file',
                        duration: 3500
                    });
                }
            });
        }
        
        // Save button
        if (DOM.photoUploadSave) {
            DOM.photoUploadSave.addEventListener('click', async () => {
                if (!photoData) {
                    HA.Utils.toast({
                        type: 'warning',
                        title: 'No Photo',
                        message: 'Please select a photo first',
                        duration: 2500
                    });
                    return;
                }
                
                DOM.photoUploadSave.classList.add('loading');
                DOM.photoUploadSave.disabled = true;
                
                await new Promise(resolve => setTimeout(resolve, 800));
                
                try {
                    const result = HA.Storage.updateStudent(currentUser.id, { photo: photoData });
                    
                    if (result.success) {
                        currentUser.photo = photoData;
                        
                        HA.Utils.toast({
                            type: 'success',
                            title: 'Photo Updated!',
                            message: 'Your profile picture has been updated',
                            duration: 3000
                        });
                        
                        _closePhotoUploadModal();
                        _renderProfileHeader();
                        _celebrateUpdate();
                    } else {
                        HA.Utils.toast({
                            type: 'error',
                            title: 'Update Failed',
                            message: 'Could not update photo',
                            duration: 3000
                        });
                    }
                } catch (error) {
                    console.error('[HA.Profile] Photo save error:', error);
                    HA.Utils.toast({
                        type: 'error',
                        title: 'Error',
                        message: 'An unexpected error occurred',
                        duration: 3000
                    });
                } finally {
                    DOM.photoUploadSave.classList.remove('loading');
                    DOM.photoUploadSave.disabled = false;
                }
            });
        }
        
        // Cancel button
        if (DOM.photoUploadCancel) {
            DOM.photoUploadCancel.addEventListener('click', _closePhotoUploadModal);
        }
        
        // Close button
        if (DOM.photoUploadClose) {
            DOM.photoUploadClose.addEventListener('click', _closePhotoUploadModal);
        }
        
        // Close on overlay click
        DOM.photoUploadModal.addEventListener('click', (e) => {
            if (e.target === DOM.photoUploadModal) {
                _closePhotoUploadModal();
            }
        });
        
        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && DOM.photoUploadModal.classList.contains('active')) {
                _closePhotoUploadModal();
            }
        });
        
        console.log('[HA.Profile] ✅ Photo upload modal initialized');
    }

    // ============================================
    // 14. FORM HELPERS
    // ============================================

    /**
     * Show field error
     */
    function _showFieldError(fieldId, message) {
        const input = document.getElementById(fieldId);
        if (!input) return;
        
        const group = input.closest('.profile-form-group');
        if (!group) return;
        
        group.classList.add('has-error');
        
        const errorEl = group.querySelector('.profile-form-error');
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
        
        const group = input.closest('.profile-form-group');
        if (group) {
            group.classList.remove('has-error');
        }
    }

    /**
     * Clear all errors
     */
    function _clearAllErrors() {
        document.querySelectorAll('.profile-form-group.has-error').forEach(el => {
            el.classList.remove('has-error');
        });
    }

    // ============================================
    // 15. KEYBOARD SHORTCUTS
    // ============================================

    /**
     * Initialize keyboard shortcuts
     */
    function _initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + E to edit profile
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                if (!isEditing) {
                    _toggleEditMode(true);
                }
            }
            
            // Escape to cancel edit
            if (e.key === 'Escape' && isEditing) {
                _toggleEditMode(false);
                _populateEditForm();
                _clearAllErrors();
            }
        });
    }

    // ============================================
    // 16. LOADING SCREEN
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
            }, remaining);
        };
        
        if (document.readyState === 'complete') {
            hide();
        } else {
            window.addEventListener('load', hide);
        }
    }

    // ============================================
    // 17. ERROR HANDLING
    // ============================================

    /**
     * Initialize error handling
     */
    function _initErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('[HA.Profile] Global error:', e.message);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('[HA.Profile] Unhandled promise rejection:', e.reason);
        });
    }

    // ============================================
    // 18. PUBLIC API
    // ============================================

    return {
        /**
         * Initialize the profile page
         */
        init: function() {
            console.log('[HA.Profile] 🚀 Initializing Profile Page...');
            console.log('[HA.Profile] Founded by Er. Priyanshu Sharma');
            
            // Prevent double initialization
            if (window.__HA_PROFILE_INITIALIZED__) {
                console.warn('[HA.Profile] Already initialized');
                return;
            }
            window.__HA_PROFILE_INITIALIZED__ = true;
            
            // Cache DOM
            _cacheDOM();
            
            // Check authentication
            if (!_checkAuth()) return;
            
            // Initialize storage
            if (HA.Storage) {
                HA.Storage.init();
            }
            
            // Render profile
            _renderProfileHeader();
            _renderStats();
            _renderAchievements();
            _renderActivityTimeline();
            _renderSkills();
            _renderConnectedAccounts();
            
            // Initialize forms
            _initEditForm();
            _initPasswordForm();
            _initPhotoUploadModal();
            
            // Initialize utilities
            _initKeyboardShortcuts();
            _initErrorHandling();
            
            // Hide loader
            _hideLoader();
            
            console.log('[HA.Profile] ✅ Initialization complete');
            console.log('[HA.Profile] 👤 User:', currentUser.fullName);
            console.log('[HA.Profile] 🆔 HABPS ID:', currentUser.habpsId);
        },

        /**
         * Get current user
         */
        getCurrentUser: function() {
            return currentUser;
        },

        /**
         * Refresh profile data
         */
        refresh: function() {
            currentUser = HA.Storage.getStudent(currentUser.id);
            userProgress = HA.Storage.getProgress(currentUser.id);
            
            _renderProfileHeader();
            _renderStats();
            
            HA.Utils.toast({
                type: 'success',
                title: 'Refreshed',
                message: 'Profile data updated',
                duration: 2000
            });
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
    setTimeout(() => {
        HA.Profile.init();
    }, 100);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HA.Profile;
}