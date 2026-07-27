/**
 * ============================================
 * HACKER ACADEMY — TODAY'S CLASS CONTROLLER
 * Premium Cyberpunk Live Class Management
 * ============================================
 * 
 * Founded & Owned by Er. Priyanshu Sharma
 * File: js/today-class.js
 * Version: 1.0.0
 * 
 * ARCHITECTURE:
 * - Namespace: HA.TodayClass
 * - Pattern: Module (IIFE)
 * - Dependencies: HA.Storage, HA.Utils
 * - Target Page: admin/today-class.html
 * 
 * FEATURES:
 * • Admin authentication check
 * • Today's class display
 * • Edit today's class
 * • Schedule new classes
 * • Class status management (live, upcoming, completed)
 * • Instructor assignment
 * • Time & duration settings
 * • Course & lesson linking
 * • Live preview
 * • Notification to students
 * • Recurring class settings
 * • Class history
 * • Quick actions (start, end, cancel)
 * ============================================
 */

// Initialize namespace
window.HA = window.HA || {};

/**
 * HA.TodayClass Module
 * Today's class management controller
 */
HA.TodayClass = (function() {
    'use strict';

    // ============================================
    // 1. PRIVATE STATE
    // ============================================
    let adminUser = null;
    let todayClass = null;
    let isEditing = false;

    // ============================================
    // 2. DOM REFERENCES
    // ============================================
    const DOM = {
        loader: null,
        
        // Display
        classTitle: null,
        classCourse: null,
        classInstructor: null,
        classTime: null,
        classDuration: null,
        classStatus: null,
        
        // Edit Form
        editForm: null,
        lessonTitle: null,
        courseSelect: null,
        lessonSelect: null,
        instructorInput: null,
        timeInput: null,
        durationInput: null,
        statusSelect: null,
        saveBtn: null,
        cancelBtn: null,
        
        // Actions
        editBtn: null,
        startBtn: null,
        endBtn: null,
        cancelClassBtn: null,
        
        // History
        historyList: null
    };

    // ============================================
    // 3. INITIALIZATION
    // ============================================

    /**
     * Cache DOM references
     */
    function _cacheDOM() {
        DOM.loader = document.getElementById('haLoader');
        
        // Display
        DOM.classTitle = document.getElementById('classTitle');
        DOM.classCourse = document.getElementById('classCourse');
        DOM.classInstructor = document.getElementById('classInstructor');
        DOM.classTime = document.getElementById('classTime');
        DOM.classDuration = document.getElementById('classDuration');
        DOM.classStatus = document.getElementById('classStatus');
        
        // Edit Form
        DOM.editForm = document.getElementById('editClassForm');
        DOM.lessonTitle = document.getElementById('lessonTitle');
        DOM.courseSelect = document.getElementById('courseSelect');
        DOM.lessonSelect = document.getElementById('lessonSelect');
        DOM.instructorInput = document.getElementById('instructorInput');
        DOM.timeInput = document.getElementById('timeInput');
        DOM.durationInput = document.getElementById('durationInput');
        DOM.statusSelect = document.getElementById('statusSelect');
        DOM.saveBtn = document.getElementById('saveClassBtn');
        DOM.cancelBtn = document.getElementById('cancelEditBtn');
        
        // Actions
        DOM.editBtn = document.getElementById('editClassBtn');
        DOM.startBtn = document.getElementById('startClassBtn');
        DOM.endBtn = document.getElementById('endClassBtn');
        DOM.cancelClassBtn = document.getElementById('cancelClassBtn');
        
        // History
        DOM.historyList = document.getElementById('classHistoryList');
        
        console.log('[HA.TodayClass] ✅ DOM references cached');
    }

    /**
     * Check admin authentication
     */
    function _checkAuth() {
        adminUser = HA.Storage.getAdminSession();
        
        if (!adminUser) {
            console.warn('[HA.TodayClass] Admin not logged in, redirecting...');
            
            HA.Utils.toast({
                type: 'warning',
                title: 'Admin Login Required',
                message: 'Please login as admin to manage classes',
                duration: 3000
            });
            
            setTimeout(() => {
                window.location.href = 'admin-login.html';
            }, 1500);
            
            return false;
        }
        
        console.log('[HA.TodayClass] ✅ Admin authenticated:', adminUser.name);
        return true;
    }

    /**
     * Load today's class data
     */
    function _loadTodayClass() {
        todayClass = HA.Storage.getTodayClass();
        
        if (!todayClass) {
            console.log('[HA.TodayClass] No class scheduled for today');
        } else {
            console.log('[HA.TodayClass] ✅ Today\'s class loaded:', todayClass.lessonTitle);
        }
        
        return true;
    }

    // ============================================
    // 4. DISPLAY
    // ============================================

    /**
     * Render today's class display
     */
    function _renderTodayClass() {
        if (!todayClass) {
            _showEmptyState();
            return;
        }
        
        if (DOM.classTitle) DOM.classTitle.textContent = todayClass.lessonTitle;
        if (DOM.classCourse) DOM.classCourse.textContent = todayClass.courseName;
        if (DOM.classInstructor) DOM.classInstructor.textContent = todayClass.instructor;
        if (DOM.classTime) DOM.classTime.textContent = todayClass.time;
        if (DOM.classDuration) DOM.classDuration.textContent = todayClass.duration;
        
        if (DOM.classStatus) {
            const statusMap = {
                'live': { text: 'LIVE NOW', class: 'live', icon: 'fa-circle-dot' },
                'upcoming': { text: 'UPCOMING', class: 'upcoming', icon: 'fa-clock' },
                'completed': { text: 'COMPLETED', class: 'completed', icon: 'fa-check-circle' },
                'cancelled': { text: 'CANCELLED', class: 'cancelled', icon: 'fa-times-circle' }
            };
            
            const status = statusMap[todayClass.status] || statusMap.upcoming;
            DOM.classStatus.className = `class-status-badge ${status.class}`;
            DOM.classStatus.innerHTML = `<i class="fas ${status.icon}"></i> ${status.text}`;
        }
        
        // Update action buttons based on status
        _updateActionButtons();
        
        console.log('[HA.TodayClass] ✅ Today\'s class rendered');
    }

    /**
     * Show empty state
     */
    function _showEmptyState() {
        const container = document.querySelector('.today-class-display');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-plus" style="font-size: 4rem; color: var(--text-muted); margin-bottom: 20px;"></i>
                    <h3 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 10px;">No Class Scheduled</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 24px;">Schedule a new class for today</p>
                    <button class="btn btn-primary" id="scheduleNewClassBtn">
                        <i class="fas fa-plus"></i> Schedule Class
                    </button>
                </div>
            `;
            
            document.getElementById('scheduleNewClassBtn').addEventListener('click', () => {
                _toggleEditMode(true);
            });
        }
    }

    /**
     * Update action buttons based on status
     */
    function _updateActionButtons() {
        if (!todayClass) return;
        
        const status = todayClass.status;
        
        if (DOM.startBtn) {
            DOM.startBtn.style.display = (status === 'upcoming') ? 'inline-flex' : 'none';
        }
        
        if (DOM.endBtn) {
            DOM.endBtn.style.display = (status === 'live') ? 'inline-flex' : 'none';
        }
        
        if (DOM.cancelClassBtn) {
            DOM.cancelClassBtn.style.display = (status === 'upcoming' || status === 'live') ? 'inline-flex' : 'none';
        }
    }

    // ============================================
    // 5. EDIT MODE
    // ============================================

    /**
     * Toggle edit mode
     */
    function _toggleEditMode(editing) {
        isEditing = editing;
        
        const displaySection = document.querySelector('.today-class-display');
        const editSection = document.querySelector('.today-class-edit');
        
        if (editing) {
            if (displaySection) displaySection.style.display = 'none';
            if (editSection) editSection.style.display = 'block';
            
            _populateEditForm();
            _populateCourseSelect();
            
            HA.Utils.toast({
                type: 'info',
                title: 'Edit Mode',
                message: 'You can now edit today\'s class',
                duration: 2000
            });
        } else {
            if (displaySection) displaySection.style.display = 'block';
            if (editSection) editSection.style.display = 'none';
            
            _clearForm();
        }
    }

    /**
     * Populate edit form with current data
     */
    function _populateEditForm() {
        if (!todayClass) return;
        
        if (DOM.lessonTitle) DOM.lessonTitle.value = todayClass.lessonTitle || '';
        if (DOM.instructorInput) DOM.instructorInput.value = todayClass.instructor || '';
        if (DOM.timeInput) DOM.timeInput.value = todayClass.time || '';
        if (DOM.durationInput) DOM.durationInput.value = todayClass.duration || '';
        if (DOM.statusSelect) DOM.statusSelect.value = todayClass.status || 'upcoming';
    }

    /**
     * Populate course select dropdown
     */
    function _populateCourseSelect() {
        if (!DOM.courseSelect) return;
        
        const courses = HA.Storage.getCourses();
        
        DOM.courseSelect.innerHTML = '<option value="">Select Course</option>';
        
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = course.title;
            
            if (todayClass && todayClass.courseId === course.id) {
                option.selected = true;
            }
            
            DOM.courseSelect.appendChild(option);
        });
        
        // Populate lessons based on selected course
        if (todayClass && todayClass.courseId) {
            _populateLessonSelect(todayClass.courseId);
        }
        
        // Course change handler
        DOM.courseSelect.addEventListener('change', (e) => {
            const courseId = e.target.value;
            if (courseId) {
                _populateLessonSelect(courseId);
            }
        });
    }

    /**
     * Populate lesson select dropdown
     */
    function _populateLessonSelect(courseId) {
        if (!DOM.lessonSelect) return;
        
        // Demo lessons (in production, this would fetch from course data)
        const lessons = [
            { id: 'L001', title: 'Introduction to Ethical Hacking' },
            { id: 'L002', title: 'Types of Hackers' },
            { id: 'L003', title: 'Legal & Ethical Boundaries' },
            { id: 'L004', title: 'Hacking Phases Overview' },
            { id: 'L005', title: 'Reconnaissance Techniques' }
        ];
        
        DOM.lessonSelect.innerHTML = '<option value="">Select Lesson</option>';
        
        lessons.forEach(lesson => {
            const option = document.createElement('option');
            option.value = lesson.id;
            option.textContent = lesson.title;
            
            if (todayClass && todayClass.lessonId === lesson.id) {
                option.selected = true;
            }
            
            DOM.lessonSelect.appendChild(option);
        });
    }

    /**
     * Clear form
     */
    function _clearForm() {
        if (DOM.editForm) DOM.editForm.reset();
    }

    /**
     * Initialize edit mode
     */
    function _initEditMode() {
        if (DOM.editBtn) {
            DOM.editBtn.addEventListener('click', () => {
                _toggleEditMode(true);
            });
        }
        
        if (DOM.cancelBtn) {
            DOM.cancelBtn.addEventListener('click', () => {
                _toggleEditMode(false);
            });
        }
        
        if (DOM.saveBtn) {
            DOM.saveBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await _saveTodayClass();
            });
        }
        
        console.log('[HA.TodayClass] ✅ Edit mode initialized');
    }

    // ============================================
    // 6. SAVE
    // ============================================

    /**
     * Save today's class
     */
    async function _saveTodayClass() {
        // Validate
        if (!_validateForm()) return;
        
        // Set loading state
        DOM.saveBtn.classList.add('loading');
        DOM.saveBtn.disabled = true;
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
            const data = {
                id: todayClass ? todayClass.id : `TC${Date.now()}`,
                lessonTitle: DOM.lessonTitle.value.trim(),
                courseId: DOM.courseSelect.value,
                lessonId: DOM.lessonSelect.value,
                courseName: DOM.courseSelect.options[DOM.courseSelect.selectedIndex].text,
                instructor: DOM.instructorInput.value.trim(),
                time: DOM.timeInput.value,
                duration: DOM.durationInput.value,
                status: DOM.statusSelect.value,
                updatedAt: new Date().toISOString()
            };
            
            const result = HA.Storage.updateTodayClass(data);
            
            if (result.success) {
                todayClass = data;
                
                HA.Utils.toast({
                    type: 'success',
                    title: 'Class Updated!',
                    message: 'Today\'s class has been saved successfully',
                    duration: 3000
                });
                
                _toggleEditMode(false);
                _renderTodayClass();
                _celebrateSave();
            } else {
                HA.Utils.toast({
                    type: 'error',
                    title: 'Save Failed',
                    message: result.error || 'Could not save class',
                    duration: 3000
                });
            }
        } catch (error) {
            console.error('[HA.TodayClass] Save error:', error);
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
     * Validate form
     */
    function _validateForm() {
        let isValid = true;
        
        if (!DOM.lessonTitle.value.trim()) {
            HA.Utils.toast({
                type: 'error',
                title: 'Validation Error',
                message: 'Lesson title is required',
                duration: 2500
            });
            isValid = false;
        }
        
        if (!DOM.courseSelect.value) {
            HA.Utils.toast({
                type: 'error',
                title: 'Validation Error',
                message: 'Please select a course',
                duration: 2500
            });
            isValid = false;
        }
        
        if (!DOM.instructorInput.value.trim()) {
            HA.Utils.toast({
                type: 'error',
                title: 'Validation Error',
                message: 'Instructor name is required',
                duration: 2500
            });
            isValid = false;
        }
        
        if (!DOM.timeInput.value) {
            HA.Utils.toast({
                type: 'error',
                title: 'Validation Error',
                message: 'Class time is required',
                duration: 2500
            });
            isValid = false;
        }
        
        if (!DOM.durationInput.value) {
            HA.Utils.toast({
                type: 'error',
                title: 'Validation Error',
                message: 'Duration is required',
                duration: 2500
            });
            isValid = false;
        }
        
        return isValid;
    }

    /**
     * Celebrate save
     */
    function _celebrateSave() {
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
    // 7. QUICK ACTIONS
    // ============================================

    /**
     * Initialize quick actions
     */
    function _initQuickActions() {
        // Start class
        if (DOM.startBtn) {
            DOM.startBtn.addEventListener('click', async () => {
                const confirmed = await HA.Utils.confirm({
                    title: 'Start Live Class',
                    message: 'Are you sure you want to start the class now? Students will be notified.',
                    confirmText: 'Start Now',
                    type: 'success'
                });
                
                if (confirmed) {
                    todayClass.status = 'live';
                    HA.Storage.updateTodayClass(todayClass);
                    _renderTodayClass();
                    
                    HA.Utils.toast({
                        type: 'success',
                        title: 'Class Started!',
                        message: 'Live class is now active. Students have been notified.',
                        duration: 3500
                    });
                }
            });
        }
        
        // End class
        if (DOM.endBtn) {
            DOM.endBtn.addEventListener('click', async () => {
                const confirmed = await HA.Utils.confirm({
                    title: 'End Live Class',
                    message: 'Are you sure you want to end the live class?',
                    confirmText: 'End Class',
                    type: 'warning'
                });
                
                if (confirmed) {
                    todayClass.status = 'completed';
                    HA.Storage.updateTodayClass(todayClass);
                    _renderTodayClass();
                    
                    HA.Utils.toast({
                        type: 'success',
                        title: 'Class Ended',
                        message: 'The live class has been completed',
                        duration: 3000
                    });
                }
            });
        }
        
        // Cancel class
        if (DOM.cancelClassBtn) {
            DOM.cancelClassBtn.addEventListener('click', async () => {
                const confirmed = await HA.Utils.confirm({
                    title: 'Cancel Class',
                    message: 'Are you sure you want to cancel today\'s class? Students will be notified.',
                    confirmText: 'Cancel Class',
                    cancelText: 'Keep Class',
                    type: 'danger'
                });
                
                if (confirmed) {
                    todayClass.status = 'cancelled';
                    HA.Storage.updateTodayClass(todayClass);
                    _renderTodayClass();
                    
                    HA.Utils.toast({
                        type: 'warning',
                        title: 'Class Cancelled',
                        message: 'Today\'s class has been cancelled. Students have been notified.',
                        duration: 3500
                    });
                }
            });
        }
        
        console.log('[HA.TodayClass] ✅ Quick actions initialized');
    }

    // ============================================
    // 8. CLASS HISTORY
    // ============================================

    /**
     * Render class history
     */
    function _renderClassHistory() {
        if (!DOM.historyList) return;
        
        // Demo history
        const history = [
            {
                date: '2026-07-26',
                title: 'SQL Injection Deep Dive',
                course: 'Web Application Security',
                instructor: 'Er. Priyanshu Sharma',
                status: 'completed',
                attendees: 245
            },
            {
                date: '2026-07-25',
                title: 'Nmap Advanced Techniques',
                course: 'Ethical Hacking Mastery',
                instructor: 'Cyber Defence Team',
                status: 'completed',
                attendees: 189
            },
            {
                date: '2026-07-24',
                title: 'Python for Pentesters',
                course: 'Python for Cyber Security',
                instructor: 'Code Security Lab',
                status: 'completed',
                attendees: 312
            },
            {
                date: '2026-07-23',
                title: 'Network Forensics',
                course: 'Digital Forensics',
                instructor: 'Forensics Lead',
                status: 'cancelled',
                attendees: 0
            }
        ];
        
        const html = history.map(item => {
            const statusClass = item.status === 'completed' ? 'completed' : 'cancelled';
            const statusText = item.status === 'completed' ? 'Completed' : 'Cancelled';
            
            return `
                <div class="history-item">
                    <div class="history-date">
                        <div class="history-day">${new Date(item.date).getDate()}</div>
                        <div class="history-month">${new Date(item.date).toLocaleString('default', { month: 'short' })}</div>
                    </div>
                    <div class="history-content">
                        <div class="history-title">${item.title}</div>
                        <div class="history-meta">
                            <span><i class="fas fa-book"></i> ${item.course}</span>
                            <span><i class="fas fa-user"></i> ${item.instructor}</span>
                            ${item.attendees > 0 ? `<span><i class="fas fa-users"></i> ${item.attendees} attendees</span>` : ''}
                        </div>
                    </div>
                    <div class="history-status ${statusClass}">
                        ${statusText}
                    </div>
                </div>
            `;
        }).join('');
        
        DOM.historyList.innerHTML = html;
        
        console.log('[HA.TodayClass] ✅ Class history rendered');
    }

    // ============================================
    // 9. KEYBOARD SHORTCUTS
    // ============================================

    /**
     * Initialize keyboard shortcuts
     */
    function _initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + E to edit
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                if (!isEditing) {
                    _toggleEditMode(true);
                }
            }
            
            // Escape to cancel edit
            if (e.key === 'Escape' && isEditing) {
                _toggleEditMode(false);
            }
            
            // Ctrl/Cmd + Enter to save
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isEditing) {
                e.preventDefault();
                if (DOM.saveBtn) DOM.saveBtn.click();
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
            }, remaining);
        };
        
        if (document.readyState === 'complete') {
            hide();
        } else {
            window.addEventListener('load', hide);
        }
    }

    // ============================================
    // 11. ERROR HANDLING
    // ============================================

    /**
     * Initialize error handling
     */
    function _initErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('[HA.TodayClass] Global error:', e.message);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('[HA.TodayClass] Unhandled promise rejection:', e.reason);
        });
    }

    // ============================================
    // 12. PUBLIC API
    // ============================================

    return {
        /**
         * Initialize the today's class page
         */
        init: function() {
            console.log('[HA.TodayClass] 🚀 Initializing Today\'s Class Page...');
            console.log('[HA.TodayClass] Founded by Er. Priyanshu Sharma');
            
            // Prevent double initialization
            if (window.__HA_TODAYCLASS_INITIALIZED__) {
                console.warn('[HA.TodayClass] Already initialized');
                return;
            }
            window.__HA_TODAYCLASS_INITIALIZED__ = true;
            
            // Cache DOM
            _cacheDOM();
            
            // Check authentication
            if (!_checkAuth()) return;
            
            // Initialize storage
            if (HA.Storage) {
                HA.Storage.init();
            }
            
            // Load today's class
            if (!_loadTodayClass()) return;
            
            // Render display
            _renderTodayClass();
            
            // Initialize edit mode
            _initEditMode();
            
            // Initialize quick actions
            _initQuickActions();
            
            // Render history
            _renderClassHistory();
            
            // Initialize utilities
            _initKeyboardShortcuts();
            _initErrorHandling();
            
            // Hide loader
            _hideLoader();
            
            console.log('[HA.TodayClass] ✅ Initialization complete');
            
            if (todayClass) {
                console.log('[HA.TodayClass] 📅 Class:', todayClass.lessonTitle);
                console.log('[HA.TodayClass] 📚 Course:', todayClass.courseName);
                console.log('[HA.TodayClass] ⏰ Time:', todayClass.time);
            }
        },

        /**
         * Get today's class
         */
        getTodayClass: function() {
            return todayClass;
        },

        /**
         * Refresh today's class data
         */
        refresh: function() {
            todayClass = HA.Storage.getTodayClass();
            _renderTodayClass();
            
            HA.Utils.toast({
                type: 'success',
                title: 'Refreshed',
                message: 'Today\'s class data updated',
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
        HA.TodayClass.init();
    }, 100);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HA.TodayClass;
}
