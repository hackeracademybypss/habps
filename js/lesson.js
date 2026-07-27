/**
 * ============================================
 * HACKER ACADEMY — LESSON CONTROLLER
 * Premium Cyberpunk Lesson Learning System
 * ============================================
 * 
 * Founded & Owned by Er. Priyanshu Sharma
 * File: js/lesson.js
 * Version: 1.0.0
 * 
 * ARCHITECTURE:
 * - Namespace: HA.Lesson
 * - Pattern: Module (IIFE)
 * - Dependencies: HA.Storage, HA.Utils
 * - Target Page: lesson.html
 * 
 * FEATURES:
 * • Authentication check (redirect if not logged in)
 * • URL parameter parsing (course & lesson IDs)
 * • Course sidebar with collapsible modules
 * • Lesson list with active/completed/locked states
 * • Video player placeholder with play button
 * • Lesson content rendering (title, description, notes)
 * • Code blocks with copy-to-clipboard
 * • Resources section with download buttons
 * • Previous/Next lesson navigation
 * • Mark lesson complete with celebration
 * • Progress tracking & percentage update
 * • Mobile sidebar drawer
 * • Keyboard shortcuts (← → navigation)
 * • Breadcrumb navigation
 * • Course progress bar in sidebar
 * • Loading screen
 * ============================================
 */

// Initialize namespace
window.HA = window.HA || {};

/**
 * HA.Lesson Module
 * Lesson page controller
 */
HA.Lesson = (function() {
    'use strict';

    // ============================================
    // 1. PRIVATE STATE
    // ============================================
    let currentUser = null;
    let currentCourse = null;
    let currentLesson = null;
    let courseModules = [];
    let allLessons = [];
    let currentLessonIndex = 0;
    let sidebarOpen = false;

    // ============================================
    // 2. DOM REFERENCES
    // ============================================
    const DOM = {
        loader: null,
        
        // Sidebar
        sidebar: null,
        sidebarToggle: null,
        sidebarOverlay: null,
        sidebarBack: null,
        sidebarCourseTitle: null,
        sidebarCourseCategory: null,
        sidebarProgressBar: null,
        sidebarProgressText: null,
        modulesContainer: null,
        
        // Main Content
        breadcrumb: null,
        lessonTitle: null,
        lessonMeta: null,
        lessonDescription: null,
        
        // Video Player
        videoContainer: null,
        videoPlayBtn: null,
        videoTitle: null,
        videoSubtitle: null,
        videoProgressFill: null,
        videoTimeCurrent: null,
        videoTimeTotal: null,
        
        // Notes
        notesContent: null,
        
        // Resources
        resourcesGrid: null,
        
        // Navigation
        prevLessonCard: null,
        nextLessonCard: null,
        
        // Mark Complete
        markCompleteBtn: null,
        completeSection: null
    };

    // ============================================
    // 3. DEMO LESSON DATA
    // ============================================
    
    /**
     * Generate course modules and lessons
     * @param {string} courseId - Course ID
     * @returns {Object} Modules and lessons
     */
    function _generateCourseContent(courseId) {
        const courseTemplates = {
            'C001': {
                name: 'Ethical Hacking Mastery',
                category: 'hacking',
                modules: [
                    {
                        id: 'M001',
                        title: 'Introduction to Ethical Hacking',
                        lessons: [
                            { id: 'L001', title: 'What is Ethical Hacking?', duration: '12:30', type: 'video' },
                            { id: 'L002', title: 'Types of Hackers', duration: '09:45', type: 'video' },
                            { id: 'L003', title: 'Legal & Ethical Boundaries', duration: '15:20', type: 'video' },
                            { id: 'L004', title: 'Hacking Phases Overview', duration: '18:10', type: 'video' },
                            { id: 'L005', title: 'Module 1 Quiz', duration: '10:00', type: 'quiz' }
                        ]
                    },
                    {
                        id: 'M002',
                        title: 'Reconnaissance & Footprinting',
                        lessons: [
                            { id: 'L006', title: 'Passive Reconnaissance', duration: '14:20', type: 'video' },
                            { id: 'L007', title: 'Active Reconnaissance', duration: '16:45', type: 'video' },
                            { id: 'L008', title: 'OSINT Techniques', duration: '22:30', type: 'video' },
                            { id: 'L009', title: 'Lab: Footprinting a Target', duration: '25:00', type: 'lab' },
                            { id: 'L010', title: 'Module 2 Quiz', duration: '10:00', type: 'quiz' }
                        ]
                    },
                    {
                        id: 'M003',
                        title: 'Scanning & Enumeration',
                        lessons: [
                            { id: 'L011', title: 'Network Scanning Basics', duration: '15:40', type: 'video' },
                            { id: 'L012', title: 'Nmap Deep Dive', duration: '28:15', type: 'video' },
                            { id: 'L013', title: 'Port Scanning Techniques', duration: '20:30', type: 'video' },
                            { id: 'L014', title: 'Lab: Scanning with Nmap', duration: '30:00', type: 'lab' }
                        ]
                    },
                    {
                        id: 'M004',
                        title: 'Vulnerability Analysis',
                        lessons: [
                            { id: 'L015', title: 'Understanding Vulnerabilities', duration: '18:20', type: 'video' },
                            { id: 'L016', title: 'Vulnerability Scanning Tools', duration: '24:10', type: 'video' },
                            { id: 'L017', title: 'CVSS Scoring System', duration: '16:45', type: 'video' },
                            { id: 'L018', title: 'Lab: Vulnerability Assessment', duration: '35:00', type: 'lab' }
                        ]
                    }
                ]
            },
            'default': {
                name: 'Cyber Security Course',
                category: 'security',
                modules: [
                    {
                        id: 'M001',
                        title: 'Getting Started',
                        lessons: [
                            { id: 'L001', title: 'Course Introduction', duration: '10:00', type: 'video' },
                            { id: 'L002', title: 'Setting Up Your Lab', duration: '15:30', type: 'video' },
                            { id: 'L003', title: 'Core Concepts', duration: '20:00', type: 'video' }
                        ]
                    },
                    {
                        id: 'M002',
                        title: 'Fundamentals',
                        lessons: [
                            { id: 'L004', title: 'Basic Principles', duration: '18:00', type: 'video' },
                            { id: 'L005', title: 'Tools Overview', duration: '22:15', type: 'video' },
                            { id: 'L006', title: 'Hands-on Practice', duration: '25:00', type: 'lab' }
                        ]
                    }
                ]
            }
        };
        
        return courseTemplates[courseId] || courseTemplates['default'];
    }

    /**
     * Generate lesson content
     * @param {Object} lesson - Lesson object
     * @param {Object} course - Course object
     * @returns {Object} Lesson content
     */
    function _generateLessonContent(lesson, course) {
        return {
            title: lesson.title,
            description: `Master the concepts of "${lesson.title}" in this comprehensive ${lesson.duration} lesson from the ${course.title} course. Learn practical techniques used by industry professionals.`,
            instructor: 'Er. Priyanshu Sharma',
            difficulty: 'Intermediate',
            lastUpdated: '2026-07-20',
            notes: `
                <h3>Lesson Overview</h3>
                <p>Welcome to <strong>${lesson.title}</strong>. In this lesson, you'll learn essential concepts that form the foundation of modern cybersecurity practices.</p>
                
                <h3>Key Learning Objectives</h3>
                <ul>
                    <li>Understand the core principles and methodologies</li>
                    <li>Learn practical tools and techniques used in the industry</li>
                    <li>Apply concepts through hands-on exercises</li>
                    <li>Build a solid foundation for advanced topics</li>
                </ul>
                
                <h3>Core Concepts</h3>
                <p>Cybersecurity is a multi-disciplinary field that requires understanding of networking, operating systems, programming, and security principles. This lesson covers the essential building blocks.</p>
                
                <blockquote>
                    "The best defense is a good offense. Understand how attackers think to build better defenses." — Er. Priyanshu Sharma
                </blockquote>
                
                <h3>Practical Example</h3>
                <p>Let's look at a practical example using command-line tools:</p>
                
                <pre><code># Basic reconnaissance command
nmap -sV -sC -oN scan_results.txt target_ip

# Check open ports
netstat -tuln | grep LISTEN

# Analyze network traffic
tcpdump -i eth0 -w capture.pcap</code></pre>
                
                <h3>Best Practices</h3>
                <ol>
                    <li>Always work in isolated lab environments</li>
                    <li>Document your findings systematically</li>
                    <li>Follow ethical guidelines and legal boundaries</li>
                    <li>Keep your tools and knowledge updated</li>
                    <li>Practice regularly with CTF challenges</li>
                </ol>
                
                <h3>Common Mistakes to Avoid</h3>
                <p>Beginners often make these critical errors:</p>
                <ul>
                    <li>Skipping the reconnaissance phase</li>
                    <li>Not documenting their methodology</li>
                    <li>Using tools without understanding them</li>
                    <li>Ignoring legal and ethical considerations</li>
                </ul>
                
                <h3>Next Steps</h3>
                <p>After completing this lesson, move on to the next topic where we'll apply these concepts in more advanced scenarios. Practice the hands-on labs to reinforce your learning.</p>
            `,
            resources: [
                {
                    id: 'R1',
                    title: 'Lesson Notes (PDF)',
                    type: 'pdf',
                    size: '2.4 MB',
                    icon: 'fa-file-pdf'
                },
                {
                    id: 'R2',
                    title: 'Cheat Sheet',
                    type: 'pdf',
                    size: '850 KB',
                    icon: 'fa-file-lines'
                },
                {
                    id: 'R3',
                    title: 'Lab Files',
                    type: 'zip',
                    size: '15.2 MB',
                    icon: 'fa-file-zipper'
                },
                {
                    id: 'R4',
                    title: 'Supplementary Video',
                    type: 'video',
                    size: '45:20',
                    icon: 'fa-video'
                },
                {
                    id: 'R5',
                    title: 'Official Documentation',
                    type: 'link',
                    size: 'External',
                    icon: 'fa-arrow-up-right-from-square'
                }
            ]
        };
    }

    // ============================================
    // 4. INITIALIZATION
    // ============================================

    /**
     * Cache DOM references
     */
    function _cacheDOM() {
        DOM.loader = document.getElementById('haLoader');
        
        // Sidebar
        DOM.sidebar = document.querySelector('.lesson-sidebar');
        DOM.sidebarToggle = document.querySelector('.lesson-sidebar-toggle');
        DOM.sidebarOverlay = document.querySelector('.lesson-sidebar-overlay');
        DOM.sidebarBack = document.querySelector('.lesson-sidebar-back');
        DOM.sidebarCourseTitle = document.getElementById('sidebarCourseTitle');
        DOM.sidebarCourseCategory = document.getElementById('sidebarCourseCategory');
        DOM.sidebarProgressBar = document.querySelector('.lesson-sidebar-progress-fill');
        DOM.sidebarProgressText = document.querySelector('.lesson-sidebar-progress-text');
        DOM.modulesContainer = document.getElementById('modulesContainer');
        
        // Main Content
        DOM.breadcrumb = document.querySelector('.lesson-breadcrumb');
        DOM.lessonTitle = document.getElementById('lessonTitle');
        DOM.lessonMeta = document.getElementById('lessonMeta');
        DOM.lessonDescription = document.querySelector('.lesson-description');
        
        // Video Player
        DOM.videoContainer = document.querySelector('.lesson-video-container');
        DOM.videoPlayBtn = document.querySelector('.lesson-video-play-btn');
        DOM.videoTitle = document.getElementById('videoTitle');
        DOM.videoSubtitle = document.getElementById('videoSubtitle');
        DOM.videoProgressFill = document.querySelector('.lesson-video-progress-fill');
        DOM.videoTimeCurrent = document.getElementById('videoTimeCurrent');
        DOM.videoTimeTotal = document.getElementById('videoTimeTotal');
        
        // Notes
        DOM.notesContent = document.getElementById('notesContent');
        
        // Resources
        DOM.resourcesGrid = document.getElementById('resourcesGrid');
        
        // Navigation
        DOM.prevLessonCard = document.getElementById('prevLessonCard');
        DOM.nextLessonCard = document.getElementById('nextLessonCard');
        
        // Mark Complete
        DOM.markCompleteBtn = document.getElementById('markCompleteBtn');
        DOM.completeSection = document.querySelector('.lesson-complete-section');
        
        console.log('[HA.Lesson] ✅ DOM references cached');
    }

    /**
     * Check authentication
     */
    function _checkAuth() {
        currentUser = HA.Storage.getCurrentUser();
        
        if (!currentUser) {
            console.warn('[HA.Lesson] User not logged in, redirecting...');
            
            HA.Utils.toast({
                type: 'warning',
                title: 'Login Required',
                message: 'Please login to access lessons',
                duration: 3000
            });
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            
            return false;
        }
        
        console.log('[HA.Lesson] ✅ User authenticated:', currentUser.habpsId);
        return true;
    }

    /**
     * Parse URL parameters
     */
    function _parseURLParams() {
        const courseId = HA.Utils.getURLParam('course') || 'C001';
        const lessonId = HA.Utils.getURLParam('lesson') || 'L001';
        
        console.log('[HA.Lesson] 📍 URL params:', { courseId, lessonId });
        
        return { courseId, lessonId };
    }

    /**
     * Load course and lesson data
     */
    function _loadData(courseId, lessonId) {
        // Load course from storage
        currentCourse = HA.Storage.getCourse(courseId);
        
        if (!currentCourse) {
            // Create a default course if not found
            currentCourse = {
                id: courseId,
                title: 'Cyber Security Course',
                category: 'security',
                image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80'
            };
        }
        
        // Generate course content
        const content = _generateCourseContent(courseId);
        courseModules = content.modules;
        
        // Flatten all lessons
        allLessons = [];
        courseModules.forEach(module => {
            module.lessons.forEach(lesson => {
                allLessons.push({
                    ...lesson,
                    moduleId: module.id,
                    moduleName: module.title
                });
            });
        });
        
        // Find current lesson
        currentLessonIndex = allLessons.findIndex(l => l.id === lessonId);
        if (currentLessonIndex === -1) currentLessonIndex = 0;
        
        currentLesson = allLessons[currentLessonIndex];
        
        console.log('[HA.Lesson] ✅ Data loaded:', {
            course: currentCourse.title,
            lesson: currentLesson.title,
            totalLessons: allLessons.length
        });
    }

    // ============================================
    // 5. SIDEBAR RENDERING
    // ============================================

    /**
     * Render course info in sidebar
     */
    function _renderSidebarCourseInfo() {
        if (DOM.sidebarCourseTitle) {
            DOM.sidebarCourseTitle.textContent = currentCourse.title;
        }
        if (DOM.sidebarCourseCategory) {
            DOM.sidebarCourseCategory.textContent = `// ${currentCourse.category.toUpperCase()}`;
        }
        
        // Calculate progress
        const userProgress = HA.Storage.getProgress(currentUser.id);
        const courseProgress = userProgress.courseProgress?.[currentCourse.id];
        const percent = courseProgress 
            ? Math.round((courseProgress.completed / allLessons.length) * 100)
            : 0;
        
        if (DOM.sidebarProgressBar) {
            DOM.sidebarProgressBar.style.width = `${percent}%`;
        }
        if (DOM.sidebarProgressText) {
            DOM.sidebarProgressText.textContent = `${percent}%`;
        }
    }

    /**
     * Render modules and lessons in sidebar
     */
    function _renderModules() {
        if (!DOM.modulesContainer) return;
        
        const userProgress = HA.Storage.getProgress(currentUser.id);
        const completedLessons = userProgress.completedLessons || [];
        
        const html = courseModules.map((module, moduleIndex) => {
            const lessonsHtml = module.lessons.map(lesson => {
                const lessonKey = `${currentCourse.id}:${lesson.id}`;
                const isCompleted = completedLessons.includes(lessonKey);
                const isActive = lesson.id === currentLesson.id;
                
                let stateClass = '';
                let iconHtml = '<i class="fas fa-play"></i>';
                
                if (isActive) {
                    stateClass = 'active';
                    iconHtml = '<i class="fas fa-play"></i>';
                } else if (isCompleted) {
                    stateClass = 'completed';
                    iconHtml = '<i class="fas fa-check"></i>';
                }
                
                const typeIcons = {
                    'video': 'fa-play-circle',
                    'quiz': 'fa-question-circle',
                    'lab': 'fa-flask'
                };
                
                return `
                    <a href="lesson.html?course=${currentCourse.id}&lesson=${lesson.id}" 
                       class="lesson-item ${stateClass}" 
                       data-lesson-id="${lesson.id}">
                        <div class="lesson-item-icon">
                            ${iconHtml}
                        </div>
                        <div class="lesson-item-info">
                            <div class="lesson-item-title">${lesson.title}</div>
                            <div class="lesson-item-meta">
                                <i class="fas ${typeIcons[lesson.type] || 'fa-play-circle'}"></i>
                                <span>${lesson.type.toUpperCase()}</span>
                            </div>
                        </div>
                        <div class="lesson-item-duration">${lesson.duration}</div>
                    </a>
                `;
            }).join('');
            
            // Check if current lesson is in this module
            const isCurrentModule = module.lessons.some(l => l.id === currentLesson.id);
            const collapsedClass = isCurrentModule ? '' : 'collapsed';
            
            return `
                <div class="lesson-module ${collapsedClass}" data-module-id="${module.id}">
                    <div class="lesson-module-header">
                        <div class="lesson-module-title">
                            <i class="fas fa-folder"></i>
                            <span>Module ${moduleIndex + 1}: ${module.title}</span>
                        </div>
                        <i class="fas fa-chevron-down lesson-module-toggle"></i>
                    </div>
                    <div class="lesson-module-lessons">
                        ${lessonsHtml}
                    </div>
                </div>
            `;
        }).join('');
        
        DOM.modulesContainer.innerHTML = html;
        
        // Initialize module collapse toggles
        _initModuleToggles();
        
        console.log('[HA.Lesson] ✅ Modules rendered');
    }

    /**
     * Initialize module collapse toggles
     */
    function _initModuleToggles() {
        document.querySelectorAll('.lesson-module-header').forEach(header => {
            header.addEventListener('click', () => {
                const module = header.closest('.lesson-module');
                module.classList.toggle('collapsed');
            });
        });
    }

    // ============================================
    // 6. MAIN CONTENT RENDERING
    // ============================================

    /**
     * Render breadcrumb
     */
    function _renderBreadcrumb() {
        if (!DOM.breadcrumb) return;
        
        DOM.breadcrumb.innerHTML = `
            <a href="dashboard.html"><i class="fas fa-home"></i> Dashboard</a>
            <span class="separator">/</span>
            <a href="dashboard.html">${currentCourse.title}</a>
            <span class="separator">/</span>
            <span class="current">${currentLesson.title}</span>
        `;
    }

    /**
     * Render lesson header
     */
    function _renderLessonHeader() {
        const content = _generateLessonContent(currentLesson, currentCourse);
        
        if (DOM.lessonTitle) {
            DOM.lessonTitle.innerHTML = `
                <span class="accent">Lesson ${currentLessonIndex + 1}:</span> ${currentLesson.title}
            `;
        }
        
        if (DOM.lessonMeta) {
            DOM.lessonMeta.innerHTML = `
                <div class="lesson-meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${currentLesson.duration}</span>
                </div>
                <div class="lesson-meta-item">
                    <i class="fas fa-user-tie"></i>
                    <span>${content.instructor}</span>
                </div>
                <div class="lesson-meta-item">
                    <i class="fas fa-signal"></i>
                    <span>${content.difficulty}</span>
                </div>
                <div class="lesson-meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>Updated ${HA.Utils.formatDate(content.lastUpdated)}</span>
                </div>
            `;
        }
        
        if (DOM.lessonDescription) {
            DOM.lessonDescription.textContent = content.description;
        }
    }

    /**
     * Render video player
     */
    function _renderVideoPlayer() {
        if (DOM.videoTitle) {
            DOM.videoTitle.textContent = currentLesson.title;
        }
        if (DOM.videoSubtitle) {
            DOM.videoSubtitle.textContent = `// ${currentLesson.type.toUpperCase()} • ${currentLesson.duration}`;
        }
        
        // Parse duration to seconds
        const parts = currentLesson.duration.split(':');
        const totalSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        
        if (DOM.videoTimeTotal) {
            DOM.videoTimeTotal.textContent = HA.Utils.formatDuration(totalSeconds);
        }
        if (DOM.videoTimeCurrent) {
            DOM.videoTimeCurrent.textContent = '00:00';
        }
    }

    /**
     * Initialize video player
     */
    function _initVideoPlayer() {
        if (!DOM.videoPlayBtn) return;
        
        let isPlaying = false;
        let currentTime = 0;
        let playInterval = null;
        
        const parts = currentLesson.duration.split(':');
        const totalSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        
        DOM.videoPlayBtn.addEventListener('click', () => {
            if (isPlaying) {
                // Pause
                clearInterval(playInterval);
                DOM.videoPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
                isPlaying = false;
                
                HA.Utils.toast({
                    type: 'info',
                    title: 'Video Paused',
                    message: 'Click play to continue',
                    duration: 2000
                });
            } else {
                // Play
                DOM.videoPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
                isPlaying = true;
                
                HA.Utils.toast({
                    type: 'success',
                    title: 'Video Playing',
                    message: 'Enjoy the lesson!',
                    duration: 2000
                });
                
                // Simulate video progress
                playInterval = setInterval(() => {
                    currentTime++;
                    
                    if (DOM.videoTimeCurrent) {
                        DOM.videoTimeCurrent.textContent = HA.Utils.formatDuration(currentTime);
                    }
                    
                    if (DOM.videoProgressFill) {
                        const percent = (currentTime / totalSeconds) * 100;
                        DOM.videoProgressFill.style.width = `${percent}%`;
                    }
                    
                    if (currentTime >= totalSeconds) {
                        clearInterval(playInterval);
                        isPlaying = false;
                        DOM.videoPlayBtn.innerHTML = '<i class="fas fa-redo"></i>';
                        
                        HA.Utils.toast({
                            type: 'success',
                            title: 'Lesson Complete!',
                            message: 'Great job! Mark as complete to continue.',
                            duration: 4000
                        });
                    }
                }, 1000); // 1 second = 1 second of video (accelerated for demo)
            }
        });
    }

    /**
     * Render lesson notes
     */
    function _renderNotes() {
        if (!DOM.notesContent) return;
        
        const content = _generateLessonContent(currentLesson, currentCourse);
        DOM.notesContent.innerHTML = content.notes;
        
        // Initialize code block copy buttons
        _initCodeBlockCopy();
        
        console.log('[HA.Lesson] ✅ Notes rendered');
    }

    /**
     * Initialize code block copy buttons
     */
    function _initCodeBlockCopy() {
        const codeBlocks = DOM.notesContent.querySelectorAll('pre');
        
        codeBlocks.forEach((block, index) => {
            // Wrap in container
            const wrapper = document.createElement('div');
            wrapper.className = 'lesson-code-block';
            wrapper.innerHTML = `
                <div class="lesson-code-header">
                    <span class="lesson-code-lang">CODE BLOCK ${index + 1}</span>
                    <button class="lesson-code-copy" data-code-index="${index}">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
            `;
            
            block.parentNode.insertBefore(wrapper, block);
            wrapper.appendChild(block);
            block.className = 'lesson-code-body';
        });
        
        // Add copy handlers
        document.querySelectorAll('.lesson-code-copy').forEach(btn => {
            btn.addEventListener('click', async () => {
                const index = btn.dataset.codeIndex;
                const codeBlock = document.querySelectorAll('.lesson-code-body')[index];
                
                if (codeBlock) {
                    const code = codeBlock.textContent;
                    const success = await HA.Utils.copyToClipboard(code);
                    
                    if (success) {
                        btn.classList.add('copied');
                        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                        
                        HA.Utils.toast({
                            type: 'success',
                            title: 'Copied!',
                            message: 'Code copied to clipboard',
                            duration: 2000
                        });
                        
                        setTimeout(() => {
                            btn.classList.remove('copied');
                            btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                        }, 2000);
                    }
                }
            });
        });
    }

    /**
     * Render resources
     */
    function _renderResources() {
        if (!DOM.resourcesGrid) return;
        
        const content = _generateLessonContent(currentLesson, currentCourse);
        
        const html = content.resources.map(resource => {
            const iconClass = {
                'pdf': 'pdf',
                'video': 'video',
                'link': 'link',
                'zip': ''
            }[resource.type] || '';
            
            return `
                <a href="#" class="lesson-resource-card" data-resource-id="${resource.id}">
                    <div class="lesson-resource-icon ${iconClass}">
                        <i class="fas ${resource.icon}"></i>
                    </div>
                    <div class="lesson-resource-info">
                        <div class="lesson-resource-title">${resource.title}</div>
                        <div class="lesson-resource-meta">
                            <span><i class="fas fa-${resource.type === 'link' ? 'external-link' : 'file'}"></i> ${resource.type.toUpperCase()}</span>
                            <span><i class="fas fa-weight-hanging"></i> ${resource.size}</span>
                        </div>
                    </div>
                    <div class="lesson-resource-download">
                        <i class="fas fa-download"></i>
                    </div>
                </a>
            `;
        }).join('');
        
        DOM.resourcesGrid.innerHTML = html;
        
        // Add click handlers
        document.querySelectorAll('.lesson-resource-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                
                const resourceId = card.dataset.resourceId;
                const resource = content.resources.find(r => r.id === resourceId);
                
                if (resource) {
                    HA.Utils.toast({
                        type: 'info',
                        title: 'Download Started',
                        message: `"${resource.title}" is being downloaded...`,
                        duration: 3000
                    });
                }
            });
        });
        
        console.log('[HA.Lesson] ✅ Resources rendered');
    }

    // ============================================
    // 7. NAVIGATION
    // ============================================

    /**
     * Render previous/next lesson navigation
     */
    function _renderNavigation() {
        const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
        const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;
        
        // Previous
        if (DOM.prevLessonCard) {
            if (prevLesson) {
                DOM.prevLessonCard.classList.remove('disabled');
                DOM.prevLessonCard.innerHTML = `
                    <div class="lesson-nav-icon">
                        <i class="fas fa-arrow-left"></i>
                    </div>
                    <div>
                        <div class="lesson-nav-label">← Previous Lesson</div>
                        <div class="lesson-nav-title">${prevLesson.title}</div>
                    </div>
                `;
                DOM.prevLessonCard.href = `lesson.html?course=${currentCourse.id}&lesson=${prevLesson.id}`;
            } else {
                DOM.prevLessonCard.classList.add('disabled');
                DOM.prevLessonCard.innerHTML = `
                    <div class="lesson-nav-icon">
                        <i class="fas fa-arrow-left"></i>
                    </div>
                    <div>
                        <div class="lesson-nav-label">← Previous Lesson</div>
                        <div class="lesson-nav-title">No previous lesson</div>
                    </div>
                `;
            }
        }
        
        // Next
        if (DOM.nextLessonCard) {
            if (nextLesson) {
                DOM.nextLessonCard.classList.remove('disabled');
                DOM.nextLessonCard.innerHTML = `
                    <div>
                        <div class="lesson-nav-label">Next Lesson →</div>
                        <div class="lesson-nav-title">${nextLesson.title}</div>
                    </div>
                    <div class="lesson-nav-icon">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                `;
                DOM.nextLessonCard.href = `lesson.html?course=${currentCourse.id}&lesson=${nextLesson.id}`;
            } else {
                DOM.nextLessonCard.classList.add('disabled');
                DOM.nextLessonCard.innerHTML = `
                    <div>
                        <div class="lesson-nav-label">Next Lesson →</div>
                        <div class="lesson-nav-title">Course complete!</div>
                    </div>
                    <div class="lesson-nav-icon">
                        <i class="fas fa-flag-checkered"></i>
                    </div>
                `;
            }
        }
    }

    // ============================================
    // 8. MARK COMPLETE
    // ============================================

    /**
     * Initialize mark complete button
     */
    function _initMarkComplete() {
        if (!DOM.markCompleteBtn) return;
        
        // Check if already completed
        const userProgress = HA.Storage.getProgress(currentUser.id);
        const lessonKey = `${currentCourse.id}:${currentLesson.id}`;
        const isCompleted = userProgress.completedLessons?.includes(lessonKey);
        
        if (isCompleted) {
            DOM.markCompleteBtn.classList.add('completed');
            DOM.markCompleteBtn.innerHTML = '<i class="fas fa-check-circle"></i> Lesson Completed';
        }
        
        DOM.markCompleteBtn.addEventListener('click', () => {
            if (isCompleted) {
                HA.Utils.toast({
                    type: 'info',
                    title: 'Already Completed',
                    message: 'You\'ve already completed this lesson',
                    duration: 2500
                });
                return;
            }
            
            // Mark as complete
            const result = HA.Storage.markLessonComplete(
                currentUser.id,
                currentCourse.id,
                currentLesson.id
            );
            
            if (result.success) {
                // Update UI
                DOM.markCompleteBtn.classList.add('completed');
                DOM.markCompleteBtn.innerHTML = '<i class="fas fa-check-circle"></i> Lesson Completed';
                
                // Celebration animation
                _celebrateCompletion();
                
                // Success toast
                HA.Utils.toast({
                    type: 'success',
                    title: 'Lesson Completed!',
                    message: '+10 points earned! Keep going!',
                    duration: 3500
                });
                
                // Refresh sidebar to show completed state
                _renderModules();
                _renderSidebarCourseInfo();
                
                // Auto-navigate to next lesson after delay
                const nextLesson = currentLessonIndex < allLessons.length - 1 
                    ? allLessons[currentLessonIndex + 1] 
                    : null;
                
                if (nextLesson) {
                    setTimeout(() => {
                        HA.Utils.toast({
                            type: 'info',
                            title: 'Next Lesson',
                            message: `Moving to "${nextLesson.title}"...`,
                            duration: 2500
                        });
                        
                        setTimeout(() => {
                            window.location.href = `lesson.html?course=${currentCourse.id}&lesson=${nextLesson.id}`;
                        }, 2000);
                    }, 2000);
                }
            }
        });
    }

    /**
     * Celebration animation
     */
    function _celebrateCompletion() {
        const colors = ['#00ff9d', '#00d4ff', '#b537f2', '#ffd60a'];
        
        for (let i = 0; i < 25; i++) {
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
                    top: 70%;
                    box-shadow: 0 0 12px currentColor;
                `;
                
                document.body.appendChild(particle);
                
                const angle = (Math.PI * 2 * i) / 25;
                const velocity = 150 + Math.random() * 100;
                const dx = Math.cos(angle) * velocity;
                const dy = Math.sin(angle) * velocity - 150;
                
                particle.animate([
                    { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                    { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 }
                ], {
                    duration: 1200,
                    easing: 'cubic-bezier(0, 0.5, 0.5, 1)'
                }).onfinish = () => particle.remove();
            }, i * 30);
        }
    }

    // ============================================
    // 9. SIDEBAR MOBILE
    // ============================================

    /**
     * Initialize mobile sidebar
     */
    function _initMobileSidebar() {
        if (!DOM.sidebarToggle || !DOM.sidebar) return;
        
        DOM.sidebarToggle.addEventListener('click', () => {
            DOM.sidebar.classList.add('active');
            if (DOM.sidebarOverlay) DOM.sidebarOverlay.classList.add('active');
            sidebarOpen = true;
        });
        
        if (DOM.sidebarOverlay) {
            DOM.sidebarOverlay.addEventListener('click', () => {
                DOM.sidebar.classList.remove('active');
                DOM.sidebarOverlay.classList.remove('active');
                sidebarOpen = false;
            });
        }
        
        // Close on lesson click (mobile)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.lesson-item') && sidebarOpen) {
                DOM.sidebar.classList.remove('active');
                if (DOM.sidebarOverlay) DOM.sidebarOverlay.classList.remove('active');
                sidebarOpen = false;
            }
        });
    }

    /**
     * Initialize sidebar back button
     */
    function _initSidebarBack() {
        if (!DOM.sidebarBack) return;
        
        DOM.sidebarBack.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'dashboard.html';
        });
    }

    // ============================================
    // 10. KEYBOARD SHORTCUTS
    // ============================================

    /**
     * Initialize keyboard shortcuts
     */
    function _initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            // Left arrow - previous lesson
            if (e.key === 'ArrowLeft' && currentLessonIndex > 0) {
                e.preventDefault();
                const prevLesson = allLessons[currentLessonIndex - 1];
                window.location.href = `lesson.html?course=${currentCourse.id}&lesson=${prevLesson.id}`;
            }
            
            // Right arrow - next lesson
            if (e.key === 'ArrowRight' && currentLessonIndex < allLessons.length - 1) {
                e.preventDefault();
                const nextLesson = allLessons[currentLessonIndex + 1];
                window.location.href = `lesson.html?course=${currentCourse.id}&lesson=${nextLesson.id}`;
            }
            
            // Space - play/pause video
            if (e.key === ' ' && DOM.videoPlayBtn) {
                e.preventDefault();
                DOM.videoPlayBtn.click();
            }
            
            // M - mark complete
            if (e.key === 'm' || e.key === 'M') {
                if (DOM.markCompleteBtn && !DOM.markCompleteBtn.classList.contains('completed')) {
                    DOM.markCompleteBtn.click();
                }
            }
            
            // Escape - close sidebar
            if (e.key === 'Escape' && sidebarOpen) {
                DOM.sidebar.classList.remove('active');
                if (DOM.sidebarOverlay) DOM.sidebarOverlay.classList.remove('active');
                sidebarOpen = false;
            }
        });
    }

    // ============================================
    // 11. LOADING SCREEN
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
    // 12. ERROR HANDLING
    // ============================================

    /**
     * Initialize error handling
     */
    function _initErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('[HA.Lesson] Global error:', e.message);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('[HA.Lesson] Unhandled promise rejection:', e.reason);
        });
    }

    // ============================================
    // 13. PUBLIC API
    // ============================================

    return {
        /**
         * Initialize the lesson page
         */
        init: function() {
            console.log('[HA.Lesson] 🚀 Initializing Lesson Page...');
            console.log('[HA.Lesson] Founded by Er. Priyanshu Sharma');
            
            // Prevent double initialization
            if (window.__HA_LESSON_INITIALIZED__) {
                console.warn('[HA.Lesson] Already initialized');
                return;
            }
            window.__HA_LESSON_INITIALIZED__ = true;
            
            // Cache DOM
            _cacheDOM();
            
            // Check authentication
            if (!_checkAuth()) return;
            
            // Initialize storage
            if (HA.Storage) {
                HA.Storage.init();
            }
            
            // Parse URL and load data
            const { courseId, lessonId } = _parseURLParams();
            _loadData(courseId, lessonId);
            
            // Render sidebar
            _renderSidebarCourseInfo();
            _renderModules();
            
            // Render main content
            _renderBreadcrumb();
            _renderLessonHeader();
            _renderVideoPlayer();
            _renderNotes();
            _renderResources();
            _renderNavigation();
            
            // Initialize interactions
            _initVideoPlayer();
            _initMarkComplete();
            _initMobileSidebar();
            _initSidebarBack();
            _initKeyboardShortcuts();
            
            // Initialize utilities
            _initErrorHandling();
            
            // Hide loader
            _hideLoader();
            
            console.log('[HA.Lesson] ✅ Initialization complete');
            console.log('[HA.Lesson] 📚 Course:', currentCourse.title);
            console.log('[HA.Lesson] 📖 Lesson:', currentLesson.title);
            console.log('[HA.Lesson] 📊 Progress:', currentLessonIndex + 1, 'of', allLessons.length);
        },

        /**
         * Get current lesson
         */
        getCurrentLesson: function() {
            return currentLesson;
        },

        /**
         * Get current course
         */
        getCurrentCourse: function() {
            return currentCourse;
        },

        /**
         * Navigate to specific lesson
         */
        navigateToLesson: function(lessonId) {
            window.location.href = `lesson.html?course=${currentCourse.id}&lesson=${lessonId}`;
        },

        /**
         * Get all lessons
         */
        getAllLessons: function() {
            return allLessons;
        },

        /**
         * Get current progress
         */
        getCurrentProgress: function() {
            return {
                current: currentLessonIndex + 1,
                total: allLessons.length,
                percent: Math.round(((currentLessonIndex + 1) / allLessons.length) * 100)
            };
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
        HA.Lesson.init();
    }, 100);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HA.Lesson;
}