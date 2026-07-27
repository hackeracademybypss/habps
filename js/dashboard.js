/**
 * ============================================
 * HACKER ACADEMY — STUDENT DASHBOARD CONTROLLER
 * Premium Cyberpunk Dashboard System
 * ============================================
 * 
 * Founded & Owned by Er. Priyanshu Sharma
 * File: js/dashboard.js
 * Version: 1.0.0
 * 
 * ARCHITECTURE:
 * - Namespace: HA.Dashboard
 * - Pattern: Module (IIFE)
 * - Dependencies: HA.Storage, HA.Utils
 * - Target Page: dashboard.html
 * 
 * FEATURES:
 * • Authentication check (redirect if not logged in)
 * • User profile display with photo
 * • Live clock with real-time updates
 * • Today's Class widget with START button
 * • Course progress cards
 * • Assignments list
 * • Quizzes list
 * • Certificates display
 * • Announcements feed
 * • Notifications panel (slide-in)
 * • Leaderboard table
 * • AI Tutor preview
 * • Activity timeline
 * • Sidebar navigation
 * • Mobile drawer menu
 * • Search functionality
 * • Logout handler
 * • Stats counter animations
 * ============================================
 */

// Initialize namespace
window.HA = window.HA || {};

/**
 * HA.Dashboard Module
 * Student dashboard controller
 */
HA.Dashboard = (function() {
    'use strict';

    // ============================================
    // 1. PRIVATE STATE
    // ============================================
    let currentUser = null;
    let userProgress = null;
    let clockInterval = null;
    let notificationsOpen = false;

    // ============================================
    // 2. DOM REFERENCES
    // ============================================
    const DOM = {
        loader: null,
        sidebar: null,
        sidebarToggle: null,
        sidebarOverlay: null,
        
        // Header
        searchInput: null,
        clockDisplay: null,
        notificationBtn: null,
        userMenu: null,
        userName: null,
        userRole: null,
        userAvatar: null,
        
        // Sidebar
        sidebarUserName: null,
        sidebarUserId: null,
        sidebarUserAvatar: null,
        logoutBtn: null,
        
        // Main Content
        welcomeName: null,
        welcomeTier: null,
        
        // Stats
        statCourses: null,
        statProgress: null,
        statCertificates: null,
        statRank: null,
        
        // Today's Class
        todayClassCard: null,
        todayClassTitle: null,
        todayClassCourse: null,
        todayClassInstructor: null,
        todayClassTime: null,
        todayClassDuration: null,
        todayClassStatus: null,
        startClassBtn: null,
        
        // Course Progress
        courseProgressList: null,
        
        // Assignments
        assignmentsList: null,
        
        // Quizzes
        quizzesList: null,
        
        // Certificates
        certificatesGrid: null,
        
        // Announcements
        announcementsFeed: null,
        
        // Notifications
        notificationPanel: null,
        notificationList: null,
        notificationClose: null,
        
        // Leaderboard
        leaderboardList: null,
        
        // AI Tutor
        aiTutorBtn: null
    };

    // ============================================
    // 3. INITIALIZATION
    // ============================================

    /**
     * Cache DOM references
     */
    function _cacheDOM() {
        DOM.loader = document.getElementById('haLoader');
        DOM.sidebar = document.querySelector('.dash-sidebar');
        DOM.sidebarToggle = document.querySelector('.sidebar-toggle');
        DOM.sidebarOverlay = document.querySelector('.sidebar-overlay');
        
        // Header
        DOM.searchInput = document.querySelector('.dash-search-input');
        DOM.clockDisplay = document.getElementById('dashClock');
        DOM.notificationBtn = document.getElementById('notificationBtn');
        DOM.userMenu = document.querySelector('.dash-user-menu');
        DOM.userName = document.querySelector('.dash-user-menu-name');
        DOM.userRole = document.querySelector('.dash-user-menu-role');
        DOM.userAvatar = document.querySelector('.dash-user-menu-avatar');
        
        // Sidebar
        DOM.sidebarUserName = document.querySelector('.sidebar-user-name');
        DOM.sidebarUserId = document.querySelector('.sidebar-user-id');
        DOM.sidebarUserAvatar = document.querySelector('.sidebar-user-avatar');
        DOM.logoutBtn = document.getElementById('logoutBtn');
        
        // Main Content
        DOM.welcomeName = document.getElementById('welcomeName');
        DOM.welcomeTier = document.getElementById('welcomeTier');
        
        // Stats
        DOM.statCourses = document.getElementById('statCourses');
        DOM.statProgress = document.getElementById('statProgress');
        DOM.statCertificates = document.getElementById('statCertificates');
        DOM.statRank = document.getElementById('statRank');
        
        // Today's Class
        DOM.todayClassCard = document.querySelector('.today-class-card');
        DOM.todayClassTitle = document.getElementById('todayClassTitle');
        DOM.todayClassCourse = document.getElementById('todayClassCourse');
        DOM.todayClassInstructor = document.getElementById('todayClassInstructor');
        DOM.todayClassTime = document.getElementById('todayClassTime');
        DOM.todayClassDuration = document.getElementById('todayClassDuration');
        DOM.todayClassStatus = document.getElementById('todayClassStatus');
        DOM.startClassBtn = document.getElementById('startClassBtn');
        
        // Lists
        DOM.courseProgressList = document.getElementById('courseProgressList');
        DOM.assignmentsList = document.getElementById('assignmentsList');
        DOM.quizzesList = document.getElementById('quizzesList');
        DOM.certificatesGrid = document.getElementById('certificatesGrid');
        DOM.announcementsFeed = document.getElementById('announcementsFeed');
        DOM.leaderboardList = document.getElementById('leaderboardList');
        
        // Notifications
        DOM.notificationPanel = document.getElementById('notificationPanel');
        DOM.notificationList = document.getElementById('notificationList');
        DOM.notificationClose = document.getElementById('notificationClose');
        
        // AI Tutor
        DOM.aiTutorBtn = document.getElementById('aiTutorBtn');
        
        console.log('[HA.Dashboard] ✅ DOM references cached');
    }

    /**
     * Check authentication
     */
    function _checkAuth() {
        currentUser = HA.Storage.getCurrentUser();
        
        if (!currentUser) {
            console.warn('[HA.Dashboard] User not logged in, redirecting to login...');
            
            HA.Utils.toast({
                type: 'warning',
                title: 'Login Required',
                message: 'Please login to access your dashboard',
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
        
        console.log('[HA.Dashboard] ✅ User authenticated:', currentUser.habpsId);
        return true;
    }

    /**
     * Initialize live clock
     */
    function _initClock() {
        if (!DOM.clockDisplay) return;
        
        const updateClock = () => {
            const now = new Date();
            const h = now.getHours().toString().padStart(2, '0');
            const m = now.getMinutes().toString().padStart(2, '0');
            const s = now.getSeconds().toString().padStart(2, '0');
            DOM.clockDisplay.textContent = `${h}:${m}:${s}`;
        };
        
        updateClock();
        clockInterval = setInterval(updateClock, 1000);
        
        console.log('[HA.Dashboard] ✅ Live clock initialized');
    }

    // ============================================
    // 4. USER PROFILE
    // ============================================

    /**
     * Render user profile
     */
    function _renderUserProfile() {
        if (!currentUser) return;
        
        const initials = currentUser.fullName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        
        // Header user menu
        if (DOM.userName) DOM.userName.textContent = currentUser.fullName;
        if (DOM.userRole) DOM.userRole.textContent = currentUser.tier.toUpperCase();
        
        if (DOM.userAvatar) {
            if (currentUser.photo) {
                DOM.userAvatar.innerHTML = `<img src="${currentUser.photo}" alt="${currentUser.fullName}">`;
            } else {
                DOM.userAvatar.textContent = initials;
            }
        }
        
        // Sidebar user card
        if (DOM.sidebarUserName) DOM.sidebarUserName.textContent = currentUser.fullName;
        if (DOM.sidebarUserId) DOM.sidebarUserId.textContent = currentUser.habpsId;
        
        if (DOM.sidebarUserAvatar) {
            if (currentUser.photo) {
                DOM.sidebarUserAvatar.innerHTML = `<img src="${currentUser.photo}" alt="${currentUser.fullName}">`;
            } else {
                DOM.sidebarUserAvatar.textContent = initials;
            }
        }
        
        // Welcome section
        if (DOM.welcomeName) {
            DOM.welcomeName.textContent = `Welcome, ${currentUser.fullName.split(' ')[0]}`;
        }
        if (DOM.welcomeTier) {
            DOM.welcomeTier.textContent = currentUser.tier.toUpperCase() + ' TIER';
        }
        
        console.log('[HA.Dashboard] ✅ User profile rendered');
    }

    // ============================================
    // 5. STATS
    // ============================================

    /**
     * Render dashboard stats
     */
    function _renderStats() {
        if (!currentUser || !userProgress) return;
        
        const enrolledCourses = currentUser.enrolledCourses?.length || 0;
        const completedLessons = userProgress.completedLessons?.length || 0;
        const totalLessons = enrolledCourses * 40; // Approximate
        const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        
        const certificates = HA.Storage.getCertificates(currentUser.id);
        const certCount = certificates.length;
        
        // Get leaderboard rank
        const leaderboard = HA.Storage.getLeaderboard();
        const userIndex = leaderboard.findIndex(s => s.id === currentUser.id);
        const rank = userIndex >= 0 ? userIndex + 1 : '-';
        
        // Animate stats
        if (DOM.statCourses) _animateStat(DOM.statCourses, enrolledCourses);
        if (DOM.statProgress) _animateStat(DOM.statProgress, progressPercent, '%');
        if (DOM.statCertificates) _animateStat(DOM.statCertificates, certCount);
        if (DOM.statRank) {
            DOM.statRank.textContent = rank === '-' ? '-' : `#${rank}`;
        }
        
        console.log('[HA.Dashboard] ✅ Stats rendered');
    }

    /**
     * Animate stat counter
     */
    function _animateStat(el, target, suffix = '') {
        const duration = 1500;
        const startTime = performance.now();
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * easeProgress);
            
            el.textContent = current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target + suffix;
            }
        };
        
        requestAnimationFrame(update);
    }

    // ============================================
    // 6. TODAY'S CLASS
    // ============================================

    /**
     * Render Today's Class widget
     */
    function _renderTodayClass() {
        const todayClass = HA.Storage.getTodayClass();
        
        if (!todayClass || !DOM.todayClassCard) {
            if (DOM.todayClassCard) {
                DOM.todayClassCard.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <i class="fas fa-calendar-xmark" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 16px;"></i>
                        <h3 style="font-family: var(--font-display); font-size: 1.2rem; margin-bottom: 8px;">No Class Today</h3>
                        <p style="color: var(--text-secondary);">Check back tomorrow for your next lesson</p>
                    </div>
                `;
            }
            return;
        }
        
        if (DOM.todayClassTitle) DOM.todayClassTitle.textContent = todayClass.lessonTitle;
        if (DOM.todayClassCourse) DOM.todayClassCourse.textContent = todayClass.courseName;
        if (DOM.todayClassInstructor) DOM.todayClassInstructor.textContent = todayClass.instructor;
        if (DOM.todayClassTime) DOM.todayClassTime.textContent = todayClass.time;
        if (DOM.todayClassDuration) DOM.todayClassDuration.textContent = todayClass.duration;
        
        if (DOM.todayClassStatus) {
            const statusMap = {
                'live': { text: 'LIVE NOW', class: 'live' },
                'upcoming': { text: 'UPCOMING', class: 'upcoming' },
                'completed': { text: 'COMPLETED', class: 'completed' }
            };
            const status = statusMap[todayClass.status] || statusMap.upcoming;
            DOM.todayClassStatus.textContent = status.text;
            DOM.todayClassStatus.className = `today-class-status ${status.class}`;
        }
        
        console.log('[HA.Dashboard] ✅ Today\'s class rendered');
    }

    /**
     * Initialize Today's Class button
     */
    function _initTodayClassButton() {
        if (!DOM.startClassBtn) return;
        
        DOM.startClassBtn.addEventListener('click', () => {
            const todayClass = HA.Storage.getTodayClass();
            
            if (!todayClass) {
                HA.Utils.toast({
                    type: 'info',
                    title: 'No Class Today',
                    message: 'Check back tomorrow for your next lesson',
                    duration: 3000
                });
                return;
            }
            
            HA.Utils.toast({
                type: 'success',
                title: 'Starting Class...',
                message: `Loading "${todayClass.lessonTitle}"`,
                duration: 2000
            });
            
            // Redirect to lesson page
            setTimeout(() => {
                window.location.href = `lesson.html?course=${todayClass.courseId}&lesson=${todayClass.lessonId}`;
            }, 1500);
        });
    }

    // ============================================
    // 7. COURSE PROGRESS
    // ============================================

    /**
     * Render course progress list
     */
    function _renderCourseProgress() {
        if (!DOM.courseProgressList || !currentUser) return;
        
        const enrolledCourses = currentUser.enrolledCourses || [];
        
        if (enrolledCourses.length === 0) {
            DOM.courseProgressList.innerHTML = `
                <div style="padding: 40px; text-align: center;">
                    <i class="fas fa-book-open" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 12px;"></i>
                    <p style="color: var(--text-secondary); margin-bottom: 16px;">No courses enrolled yet</p>
                    <a href="index.html#courses" class="btn btn-primary btn-sm">
                        <i class="fas fa-rocket"></i> Browse Courses
                    </a>
                </div>
            `;
            return;
        }
        
        const courses = enrolledCourses.map(courseId => {
            const course = HA.Storage.getCourse(courseId);
            if (!course) return null;
            
            const progress = userProgress.courseProgress?.[courseId];
            const percent = progress ? Math.round((progress.completed / 40) * 100) : 0;
            
            return { ...course, progress: percent };
        }).filter(Boolean);
        
        const html = courses.map(course => `
            <div class="course-progress-card" data-course-id="${course.id}">
                <div class="course-progress-thumb">
                    <img src="${course.image}" alt="${course.title}" loading="lazy">
                </div>
                <div class="course-progress-info">
                    <div class="course-progress-category">// ${course.category.toUpperCase()}</div>
                    <div class="course-progress-title">${course.title}</div>
                    <div class="course-progress-bar">
                        <div class="progress">
                            <div class="progress-bar" style="width: ${course.progress}%;"></div>
                        </div>
                    </div>
                    <div class="course-progress-stats">
                        <span>${course.progress}% Complete</span>
                        <span class="course-progress-percent">${course.progress}%</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        DOM.courseProgressList.innerHTML = html;
        
        // Add click handlers
        document.querySelectorAll('.course-progress-card').forEach(card => {
            card.addEventListener('click', () => {
                const courseId = card.dataset.courseId;
                window.location.href = `lesson.html?course=${courseId}`;
            });
        });
        
        console.log('[HA.Dashboard] ✅ Course progress rendered');
    }

    // ============================================
    // 8. ASSIGNMENTS
    // ============================================

    /**
     * Render assignments list
     */
    function _renderAssignments() {
        if (!DOM.assignmentsList) return;
        
        // Demo assignments
        const assignments = [
            {
                id: 'A1',
                title: 'Nmap Scanning Lab',
                course: 'Ethical Hacking Mastery',
                dueDate: '2026-07-30',
                status: 'pending',
                icon: 'fa-terminal'
            },
            {
                id: 'A2',
                title: 'SQL Injection Report',
                course: 'Web Application Security',
                dueDate: '2026-08-02',
                status: 'pending',
                icon: 'fa-database'
            },
            {
                id: 'A3',
                title: 'Python Script Automation',
                course: 'Python for Cyber Security',
                dueDate: '2026-07-25',
                status: 'completed',
                icon: 'fa-code'
            }
        ];
        
        if (assignments.length === 0) {
            DOM.assignmentsList.innerHTML = `
                <div style="padding: 40px; text-align: center;">
                    <i class="fas fa-clipboard-check" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 12px;"></i>
                    <p style="color: var(--text-secondary);">No assignments yet</p>
                </div>
            `;
            return;
        }
        
        const html = assignments.map(assignment => {
            const statusClass = assignment.status === 'completed' ? 'completed' : 'pending';
            const statusText = assignment.status === 'completed' ? 'Completed' : 'Pending';
            
            return `
                <div class="dash-list-item">
                    <div class="dash-list-item-icon">
                        <i class="fas ${assignment.icon}"></i>
                    </div>
                    <div class="dash-list-item-content">
                        <div class="dash-list-item-title">${assignment.title}</div>
                        <div class="dash-list-item-meta">
                            <span><i class="fas fa-book"></i> ${assignment.course}</span>
                            <span><i class="fas fa-calendar"></i> ${HA.Utils.formatDate(assignment.dueDate)}</span>
                        </div>
                    </div>
                    <div class="dash-list-item-status status-${statusClass}">
                        ${statusText}
                    </div>
                </div>
            `;
        }).join('');
        
        DOM.assignmentsList.innerHTML = html;
        
        console.log('[HA.Dashboard] ✅ Assignments rendered');
    }

    // ============================================
    // 9. QUIZZES
    // ============================================

    /**
     * Render quizzes list
     */
    function _renderQuizzes() {
        if (!DOM.quizzesList) return;
        
        const quizzes = HA.Storage.getQuizzes();
        const attempts = HA.Storage.getUserQuizAttempts(currentUser.id);
        
        if (quizzes.length === 0) {
            DOM.quizzesList.innerHTML = `
                <div style="padding: 40px; text-align: center;">
                    <i class="fas fa-question-circle" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 12px;"></i>
                    <p style="color: var(--text-secondary);">No quizzes available</p>
                </div>
            `;
            return;
        }
        
        const html = quizzes.slice(0, 5).map(quiz => {
            const attempt = attempts.find(a => a.quizId === quiz.id);
            const status = attempt ? (attempt.passed ? 'completed' : 'pending') : 'pending';
            const statusText = attempt ? (attempt.passed ? `Passed (${attempt.score}%)` : 'Retry') : 'Not Attempted';
            const statusClass = attempt ? (attempt.passed ? 'completed' : 'pending') : 'pending';
            
            return `
                <div class="dash-list-item" data-quiz-id="${quiz.id}">
                    <div class="dash-list-item-icon blue">
                        <i class="fas fa-brain"></i>
                    </div>
                    <div class="dash-list-item-content">
                        <div class="dash-list-item-title">${quiz.title}</div>
                        <div class="dash-list-item-meta">
                            <span><i class="fas fa-question"></i> ${quiz.questions.length} Questions</span>
                            <span><i class="fas fa-clock"></i> ${quiz.duration} min</span>
                        </div>
                    </div>
                    <div class="dash-list-item-status status-${statusClass}">
                        ${statusText}
                    </div>
                </div>
            `;
        }).join('');
        
        DOM.quizzesList.innerHTML = html;
        
        // Add click handlers
        document.querySelectorAll('.dash-list-item[data-quiz-id]').forEach(item => {
            item.addEventListener('click', () => {
                const quizId = item.dataset.quizId;
                window.location.href = `quiz.html?id=${quizId}`;
            });
        });
        
        console.log('[HA.Dashboard] ✅ Quizzes rendered');
    }

    // ============================================
    // 10. CERTIFICATES
    // ============================================

    /**
     * Render certificates grid
     */
    function _renderCertificates() {
        if (!DOM.certificatesGrid) return;
        
        const certificates = HA.Storage.getCertificates(currentUser.id);
        
        if (certificates.length === 0) {
            DOM.certificatesGrid.innerHTML = `
                <div style="padding: 40px; text-align: center; grid-column: 1 / -1;">
                    <i class="fas fa-award" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 12px;"></i>
                    <p style="color: var(--text-secondary); margin-bottom: 16px;">No certificates earned yet</p>
                    <p style="color: var(--text-muted); font-size: 0.85rem;">Complete courses to earn certificates</p>
                </div>
            `;
            return;
        }
        
        const html = certificates.map(cert => `
            <div class="certificate-card" data-cert-id="${cert.id}">
                <div class="certificate-preview">
                    <div class="certificate-icon">
                        <i class="fas fa-certificate"></i>
                    </div>
                    <div class="certificate-ribbon">VERIFIED</div>
                </div>
                <div class="certificate-body">
                    <div class="certificate-title">${cert.courseName}</div>
                    <div class="certificate-course">CERTIFICATE OF COMPLETION</div>
                    <div class="certificate-footer">
                        <div class="certificate-date">
                            <i class="fas fa-calendar"></i> ${HA.Utils.formatDate(cert.issuedAt)}
                        </div>
                        <button class="certificate-btn" data-cert-id="${cert.id}">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        DOM.certificatesGrid.innerHTML = html;
        
        // Add click handlers
        document.querySelectorAll('.certificate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const certId = btn.dataset.certId;
                window.location.href = `certificate.html?id=${certId}`;
            });
        });
        
        console.log('[HA.Dashboard] ✅ Certificates rendered');
    }

    // ============================================
    // 11. ANNOUNCEMENTS
    // ============================================

    /**
     * Render announcements feed
     */
    function _renderAnnouncements() {
        if (!DOM.announcementsFeed) return;
        
        const announcements = HA.Storage.getAnnouncements();
        
        if (announcements.length === 0) {
            DOM.announcementsFeed.innerHTML = `
                <div style="padding: 40px; text-align: center;">
                    <i class="fas fa-bullhorn" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 12px;"></i>
                    <p style="color: var(--text-secondary);">No announcements</p>
                </div>
            `;
            return;
        }
        
        const html = announcements.slice(0, 5).map(announcement => {
            const typeClass = announcement.type === 'urgent' ? 'urgent' : (announcement.type === 'info' ? 'info' : '');
            const tagClass = announcement.type === 'urgent' ? 'urgent' : (announcement.type === 'info' ? 'info' : '');
            
            const initials = announcement.author
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
            
            return `
                <div class="announcement-card ${typeClass}">
                    <div class="announcement-header">
                        <div class="announcement-tag ${tagClass}">
                            ${announcement.type.toUpperCase()}
                        </div>
                        <div class="announcement-date">
                            ${HA.Utils.formatRelativeTime(announcement.date)}
                        </div>
                    </div>
                    <h3 class="announcement-title">${announcement.title}</h3>
                    <p class="announcement-text">${announcement.content}</p>
                    <div class="announcement-footer">
                        <div class="announcement-author">
                            <div class="announcement-author-avatar">${initials}</div>
                            <span>${announcement.author}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        DOM.announcementsFeed.innerHTML = html;
        
        console.log('[HA.Dashboard] ✅ Announcements rendered');
    }

    // ============================================
    // 12. NOTIFICATIONS
    // ============================================

    /**
     * Initialize notifications panel
     */
    function _initNotifications() {
        if (!DOM.notificationBtn || !DOM.notificationPanel) return;
        
        // Open panel
        DOM.notificationBtn.addEventListener('click', () => {
            DOM.notificationPanel.classList.add('active');
            notificationsOpen = true;
            _renderNotifications();
        });
        
        // Close panel
        if (DOM.notificationClose) {
            DOM.notificationClose.addEventListener('click', () => {
                DOM.notificationPanel.classList.remove('active');
                notificationsOpen = false;
            });
        }
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (notificationsOpen && 
                !DOM.notificationPanel.contains(e.target) && 
                !DOM.notificationBtn.contains(e.target)) {
                DOM.notificationPanel.classList.remove('active');
                notificationsOpen = false;
            }
        });
        
        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && notificationsOpen) {
                DOM.notificationPanel.classList.remove('active');
                notificationsOpen = false;
            }
        });
        
        // Render initial notifications
        _renderNotifications();
        
        console.log('[HA.Dashboard] ✅ Notifications initialized');
    }

    /**
     * Render notifications
     */
    function _renderNotifications() {
        if (!DOM.notificationList) return;
        
        // Demo notifications
        const notifications = [
            {
                id: 'N1',
                title: 'Welcome to Hacker Academy!',
                text: 'Start your cybersecurity journey today',
                time: 'Just now',
                icon: 'fa-hand-wave',
                unread: true
            },
            {
                id: 'N2',
                title: 'New Course Available',
                text: 'AI & Machine Learning for Security is now live',
                time: '2 hours ago',
                icon: 'fa-rocket',
                unread: true
            },
            {
                id: 'N3',
                title: 'Assignment Due Soon',
                text: 'Nmap Scanning Lab due in 3 days',
                time: '5 hours ago',
                icon: 'fa-clock',
                unread: false
            }
        ];
        
        const html = notifications.map(notification => `
            <div class="notification-item ${notification.unread ? 'unread' : ''}">
                <div class="notification-item-icon">
                    <i class="fas ${notification.icon}"></i>
                </div>
                <div class="notification-item-content">
                    <div class="notification-item-title">${notification.title}</div>
                    <div class="notification-item-text">${notification.text}</div>
                    <div class="notification-item-time">${notification.time}</div>
                </div>
            </div>
        `).join('');
        
        DOM.notificationList.innerHTML = html;
    }

    // ============================================
    // 13. LEADERBOARD
    // ============================================

    /**
     * Render leaderboard
     */
    function _renderLeaderboard() {
        if (!DOM.leaderboardList) return;
        
        const leaderboard = HA.Storage.getLeaderboard();
        
        if (leaderboard.length === 0) {
            DOM.leaderboardList.innerHTML = `
                <div style="padding: 40px; text-align: center;">
                    <i class="fas fa-trophy" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 12px;"></i>
                    <p style="color: var(--text-secondary);">No leaderboard data yet</p>
                </div>
            `;
            return;
        }
        
        const html = leaderboard.slice(0, 10).map((student, index) => {
            const rank = index + 1;
            const topClass = rank === 1 ? 'top-1' : (rank === 2 ? 'top-2' : (rank === 3 ? 'top-3' : ''));
            const selfClass = student.id === currentUser.id ? 'self' : '';
            
            const initials = student.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
            
            return `
                <div class="leaderboard-item ${topClass} ${selfClass}">
                    <div class="leaderboard-rank">${rank}</div>
                    <div class="leaderboard-avatar">
                        ${student.photo ? `<img src="${student.photo}" alt="${student.name}">` : initials}
                    </div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${student.name}</div>
                        <div class="leaderboard-tier">${student.tier.toUpperCase()}</div>
                    </div>
                    <div>
                        <div class="leaderboard-score">${HA.Utils.formatNumber(student.points)}</div>
                        <div class="leaderboard-score-label">POINTS</div>
                    </div>
                </div>
            `;
        }).join('');
        
        DOM.leaderboardList.innerHTML = html;
        
        console.log('[HA.Dashboard] ✅ Leaderboard rendered');
    }

    // ============================================
    // 14. SIDEBAR NAVIGATION
    // ============================================

    /**
     * Initialize sidebar navigation
     */
    function _initSidebar() {
        if (!DOM.sidebarToggle || !DOM.sidebar) return;
        
        // Toggle sidebar on mobile
        DOM.sidebarToggle.addEventListener('click', () => {
            DOM.sidebar.classList.toggle('active');
            if (DOM.sidebarOverlay) DOM.sidebarOverlay.classList.toggle('active');
        });
        
        // Close on overlay click
        if (DOM.sidebarOverlay) {
            DOM.sidebarOverlay.addEventListener('click', () => {
                DOM.sidebar.classList.remove('active');
                DOM.sidebarOverlay.classList.remove('active');
            });
        }
        
        // Set active link
        const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
        document.querySelectorAll('.sidebar-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath) {
                link.classList.add('active');
            }
        });
        
        console.log('[HA.Dashboard] ✅ Sidebar initialized');
    }

    // ============================================
    // 15. SEARCH
    // ============================================

    /**
     * Initialize search
     */
    function _initSearch() {
        if (!DOM.searchInput) return;
        
        DOM.searchInput.addEventListener('input', HA.Utils.debounce((e) => {
            const query = e.target.value.trim().toLowerCase();
            
            if (query.length < 2) return;
            
            console.log('[HA.Dashboard] 🔍 Searching:', query);
            
            // Demo search - in production, this would search courses, lessons, etc.
            HA.Utils.toast({
                type: 'info',
                title: 'Search',
                message: `Searching for "${query}"...`,
                duration: 2000
            });
        }, 500));
        
        // Keyboard shortcut (Ctrl/Cmd + K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                DOM.searchInput.focus();
            }
        });
        
        console.log('[HA.Dashboard] ✅ Search initialized');
    }

    // ============================================
    // 16. LOGOUT
    // ============================================

    /**
     * Initialize logout
     */
    function _initLogout() {
        if (!DOM.logoutBtn) return;
        
        DOM.logoutBtn.addEventListener('click', async () => {
            const confirmed = await HA.Utils.confirm({
                title: 'Logout Confirmation',
                message: 'Are you sure you want to logout?',
                confirmText: 'Logout',
                cancelText: 'Cancel',
                type: 'warning'
            });
            
            if (confirmed) {
                HA.Storage.logout();
                
                HA.Utils.toast({
                    type: 'success',
                    title: 'Logged Out',
                    message: 'You have been successfully logged out',
                    duration: 2500
                });
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            }
        });
        
        console.log('[HA.Dashboard] ✅ Logout initialized');
    }

    // ============================================
    // 17. AI TUTOR
    // ============================================

    /**
     * Initialize AI Tutor button
     */
    function _initAITutor() {
        if (!DOM.aiTutorBtn) return;
        
        DOM.aiTutorBtn.addEventListener('click', () => {
            HA.Utils.toast({
                type: 'info',
                title: 'AI Tutor',
                message: 'AI Tutor feature coming soon!',
                duration: 3000
            });
            
            // In production, this would open the AI Tutor chat interface
            // window.location.href = 'ai-tutor.html';
        });
        
        console.log('[HA.Dashboard] ✅ AI Tutor initialized');
    }

    // ============================================
    // 18. LOADING SCREEN
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
    // 19. ERROR HANDLING
    // ============================================

    /**
     * Initialize error handling
     */
    function _initErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('[HA.Dashboard] Global error:', e.message);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('[HA.Dashboard] Unhandled promise rejection:', e.reason);
        });
    }

    /**
     * Initialize cleanup
     */
    function _initCleanup() {
        window.addEventListener('beforeunload', () => {
            if (clockInterval) {
                clearInterval(clockInterval);
            }
        });
    }

    // ============================================
    // 20. PUBLIC API
    // ============================================

    return {
        /**
         * Initialize the dashboard
         */
        init: function() {
            console.log('[HA.Dashboard] 🚀 Initializing Student Dashboard...');
            console.log('[HA.Dashboard] Founded by Er. Priyanshu Sharma');
            
            // Prevent double initialization
            if (window.__HA_DASHBOARD_INITIALIZED__) {
                console.warn('[HA.Dashboard] Already initialized');
                return;
            }
            window.__HA_DASHBOARD_INITIALIZED__ = true;
            
            // Cache DOM
            _cacheDOM();
            
            // Check authentication
            if (!_checkAuth()) return;
            
            // Initialize storage
            if (HA.Storage) {
                HA.Storage.init();
            }
            
            // Initialize clock
            _initClock();
            
            // Render user profile
            _renderUserProfile();
            
            // Render stats
            _renderStats();
            
            // Render Today's Class
            _renderTodayClass();
            _initTodayClassButton();
            
            // Render course progress
            _renderCourseProgress();
            
            // Render assignments
            _renderAssignments();
            
            // Render quizzes
            _renderQuizzes();
            
            // Render certificates
            _renderCertificates();
            
            // Render announcements
            _renderAnnouncements();
            
            // Initialize notifications
            _initNotifications();
            
            // Render leaderboard
            _renderLeaderboard();
            
            // Initialize sidebar
            _initSidebar();
            
            // Initialize search
            _initSearch();
            
            // Initialize logout
            _initLogout();
            
            // Initialize AI Tutor
            _initAITutor();
            
            // Initialize utilities
            _initErrorHandling();
            _initCleanup();
            
            // Hide loader
            _hideLoader();
            
            console.log('[HA.Dashboard] ✅ Initialization complete');
            console.log('[HA.Dashboard] 👤 User:', currentUser.fullName);
            console.log('[HA.Dashboard] 🆔 HABPS ID:', currentUser.habpsId);
        },

        /**
         * Get current user
         */
        getCurrentUser: function() {
            return currentUser;
        },

        /**
         * Refresh dashboard data
         */
        refresh: function() {
            currentUser = HA.Storage.getCurrentUser();
            userProgress = HA.Storage.getProgress(currentUser.id);
            
            _renderStats();
            _renderCourseProgress();
            _renderAssignments();
            _renderQuizzes();
            _renderCertificates();
            _renderAnnouncements();
            _renderLeaderboard();
            
            HA.Utils.toast({
                type: 'success',
                title: 'Refreshed',
                message: 'Dashboard data updated',
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
        HA.Dashboard.init();
    }, 100);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HA.Dashboard;
}