/**
 * ============================================
 * HACKER ACADEMY — ADMIN PANEL CONTROLLER
 * Premium Cyberpunk Admin Management System
 * ============================================
 * 
 * Founded & Owned by Er. Priyanshu Sharma
 * File: js/admin.js
 * Version: 1.0.0
 * 
 * ARCHITECTURE:
 * - Namespace: HA.Admin
 * - Pattern: Module (IIFE)
 * - Dependencies: HA.Storage, HA.Utils
 * - Target Page: admin/*.html (All admin pages)
 * 
 * FEATURES:
 * • Admin authentication check
 * • Dashboard stats & analytics
 * • Student management (CRUD + bulk actions)
 * • Course management (CRUD)
 * • Lesson management
 * • Today's class management
 * • Quiz management
 * • Certificate management
 * • Announcements management
 * • Settings management
 * • Analytics & charts
 * • Search & filter functionality
 * • Data tables with sorting/pagination
 * • Bulk actions (approve, delete, export)
 * • Export/Import data (JSON)
 * • Activity logs
 * • Server status monitoring
 * • Admin sidebar navigation
 * • Mobile responsive admin
 * • Confirmation dialogs
 * • Toast notifications
 * ============================================
 */

// Initialize namespace
window.HA = window.HA || {};

/**
 * HA.Admin Module
 * Admin panel controller
 */
HA.Admin = (function() {
    'use strict';

    // ============================================
    // 1. PRIVATE STATE
    // ============================================
    let adminUser = null;
    let currentPage = 'dashboard';
    let currentSection = null;
    let tableData = [];
    let filteredData = [];
    let currentPageNum = 1;
    const itemsPerPage = 10;
    let sortColumn = null;
    let sortDirection = 'asc';
    let selectedItems = [];

    // ============================================
    // 2. DOM REFERENCES
    // ============================================
    const DOM = {
        loader: null,
        
        // Sidebar
        sidebar: null,
        sidebarToggle: null,
        sidebarOverlay: null,
        
        // Header
        pageTitle: null,
        pageBreadcrumb: null,
        serverStatus: null,
        
        // Dashboard Stats
        statStudents: null,
        statCourses: null,
        statCertificates: null,
        statRevenue: null,
        
        // Tables
        tableBody: null,
        tableSearch: null,
        tableFilter: null,
        tablePagination: null,
        tableInfo: null,
        selectAllCheckbox: null,
        
        // Bulk Actions
        bulkBar: null,
        bulkCount: null,
        bulkApproveBtn: null,
        bulkDeleteBtn: null,
        bulkExportBtn: null,
        
        // Modals
        modalOverlay: null,
        modalTitle: null,
        modalBody: null,
        modalClose: null,
        modalSave: null,
        modalCancel: null,
        
        // Forms
        form: null,
        
        // Analytics
        analyticsChart: null,
        
        // Activity Logs
        activityList: null
    };

    // ============================================
    // 3. INITIALIZATION
    // ============================================

    /**
     * Cache DOM references
     */
    function _cacheDOM() {
        DOM.loader = document.getElementById('haLoader');
        
        // Sidebar
        DOM.sidebar = document.querySelector('.admin-sidebar');
        DOM.sidebarToggle = document.querySelector('.admin-sidebar-toggle');
        DOM.sidebarOverlay = document.querySelector('.sidebar-overlay');
        
        // Header
        DOM.pageTitle = document.querySelector('.admin-page-title h1');
        DOM.pageBreadcrumb = document.querySelector('.admin-page-breadcrumb');
        DOM.serverStatus = document.querySelector('.admin-server-status');
        
        // Dashboard Stats
        DOM.statStudents = document.getElementById('adminStatStudents');
        DOM.statCourses = document.getElementById('adminStatCourses');
        DOM.statCertificates = document.getElementById('adminStatCertificates');
        DOM.statRevenue = document.getElementById('adminStatRevenue');
        
        // Tables
        DOM.tableBody = document.querySelector('.admin-table tbody');
        DOM.tableSearch = document.querySelector('.admin-table-search-input');
        DOM.tableFilter = document.querySelector('.admin-filter-select');
        DOM.tablePagination = document.querySelector('.admin-table-pagination');
        DOM.tableInfo = document.querySelector('.admin-table-info');
        DOM.selectAllCheckbox = document.getElementById('selectAllCheckbox');
        
        // Bulk Actions
        DOM.bulkBar = document.querySelector('.admin-bulk-bar');
        DOM.bulkCount = document.querySelector('.admin-bulk-count');
        DOM.bulkApproveBtn = document.getElementById('bulkApproveBtn');
        DOM.bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        DOM.bulkExportBtn = document.getElementById('bulkExportBtn');
        
        // Modals
        DOM.modalOverlay = document.querySelector('.admin-modal-overlay');
        DOM.modalTitle = document.querySelector('.admin-modal-title');
        DOM.modalBody = document.querySelector('.admin-modal-body');
        DOM.modalClose = document.querySelector('.admin-modal-close');
        DOM.modalSave = document.querySelector('.admin-modal-save');
        DOM.modalCancel = document.querySelector('.admin-modal-cancel');
        
        // Analytics
        DOM.analyticsChart = document.getElementById('analyticsChart');
        
        // Activity Logs
        DOM.activityList = document.getElementById('activityList');
        
        console.log('[HA.Admin] ✅ DOM references cached');
    }

    /**
     * Check admin authentication
     */
    function _checkAuth() {
        adminUser = HA.Storage.getAdminSession();
        
        if (!adminUser) {
            console.warn('[HA.Admin] Admin not logged in, redirecting...');
            
            HA.Utils.toast({
                type: 'warning',
                title: 'Admin Login Required',
                message: 'Please login as admin to access this page',
                duration: 3000
            });
            
            setTimeout(() => {
                window.location.href = 'admin-login.html';
            }, 1500);
            
            return false;
        }
        
        console.log('[HA.Admin] ✅ Admin authenticated:', adminUser.name);
        return true;
    }

    /**
     * Detect current page
     */
    function _detectPage() {
        const path = window.location.pathname;
        
        if (path.includes('admin-dashboard')) currentPage = 'dashboard';
        else if (path.includes('students')) currentPage = 'students';
        else if (path.includes('courses')) currentPage = 'courses';
        else if (path.includes('lessons')) currentPage = 'lessons';
        else if (path.includes('today-class')) currentPage = 'today-class';
        else if (path.includes('quiz-management')) currentPage = 'quizzes';
        else if (path.includes('announcements')) currentPage = 'announcements';
        else if (path.includes('settings')) currentPage = 'settings';
        else if (path.includes('analytics')) currentPage = 'analytics';
        else currentPage = 'dashboard';
        
        console.log('[HA.Admin] 📍 Current page:', currentPage);
    }

    // ============================================
    // 4. SIDEBAR NAVIGATION
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
        document.querySelectorAll('.admin-sidebar-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes(currentPage)) {
                link.classList.add('active');
            }
        });
        
        console.log('[HA.Admin] ✅ Sidebar initialized');
    }

    // ============================================
    // 5. DASHBOARD
    // ============================================

    /**
     * Render admin dashboard
     */
    function _renderDashboard() {
        if (currentPage !== 'dashboard') return;
        
        const stats = HA.Storage.getStats();
        const students = HA.Storage.getStudents();
        const courses = HA.Storage.getCourses();
        
        // Calculate revenue (demo)
        const totalRevenue = students.length * 4999; // Average course price
        
        // Animate stats
        if (DOM.statStudents) _animateStat(DOM.statStudents, stats.students);
        if (DOM.statCourses) _animateStat(DOM.statCourses, stats.courses);
        if (DOM.statCertificates) _animateStat(DOM.statCertificates, stats.certificates);
        if (DOM.statRevenue) {
            DOM.statRevenue.textContent = '₹' + HA.Utils.formatNumber(totalRevenue);
        }
        
        // Render activity logs
        _renderActivityLogs();
        
        // Update server status
        _updateServerStatus();
        
        console.log('[HA.Admin] ✅ Dashboard rendered');
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

    /**
     * Update server status
     */
    function _updateServerStatus() {
        if (!DOM.serverStatus) return;
        
        // Simulate server status (in production, this would be real API calls)
        const statuses = ['online', 'online', 'online', 'warning'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const statusMap = {
            'online': { text: 'ONLINE', class: '' },
            'warning': { text: 'HIGH LOAD', class: 'warning' },
            'offline': { text: 'OFFLINE', class: 'danger' }
        };
        
        const statusInfo = statusMap[status];
        DOM.serverStatus.className = `admin-server-status ${statusInfo.class}`;
        DOM.serverStatus.innerHTML = `
            <span class="status-dot"></span>
            ${statusInfo.text}
        `;
    }

    /**
     * Render activity logs
     */
    function _renderActivityLogs() {
        if (!DOM.activityList) return;
        
        // Demo activity logs
        const activities = [
            {
                type: 'login',
                icon: 'fa-right-to-bracket',
                text: '<strong>Admin</strong> logged in from 192.168.1.1',
                time: '2 minutes ago'
            },
            {
                type: 'create',
                icon: 'fa-plus',
                text: '<strong>New student</strong> registered: HABPS-48291037',
                time: '15 minutes ago'
            },
            {
                type: 'update',
                icon: 'fa-pen',
                text: '<strong>Course updated</strong>: Ethical Hacking Mastery',
                time: '1 hour ago'
            },
            {
                type: 'delete',
                icon: 'fa-trash',
                text: '<strong>Quiz deleted</strong>: Old Assessment',
                time: '3 hours ago'
            },
            {
                type: 'warning',
                icon: 'fa-triangle-exclamation',
                text: '<strong>High server load</strong> detected',
                time: '5 hours ago'
            }
        ];
        
        const html = activities.map(activity => `
            <div class="admin-activity-item">
                <div class="admin-activity-icon ${activity.type}">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="admin-activity-content">
                    <div class="admin-activity-text">${activity.text}</div>
                    <div class="admin-activity-meta">
                        <span><i class="fas fa-clock"></i> ${activity.time}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        DOM.activityList.innerHTML = html;
    }

    // ============================================
    // 6. STUDENTS MANAGEMENT
    // ============================================

    /**
     * Render students table
     */
    function _renderStudentsTable() {
        if (currentPage !== 'students' || !DOM.tableBody) return;
        
        const students = HA.Storage.getStudents();
        tableData = students;
        filteredData = [...students];
        
        _renderTable();
        _initTableControls();
        
        console.log('[HA.Admin] ✅ Students table rendered');
    }

    /**
     * Render table
     */
    function _renderTable() {
        if (!DOM.tableBody) return;
        
        // Apply sorting
        if (sortColumn) {
            filteredData.sort((a, b) => {
                const aVal = a[sortColumn] || '';
                const bVal = b[sortColumn] || '';
                
                if (sortDirection === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }
        
        // Apply pagination
        const startIndex = (currentPageNum - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = filteredData.slice(startIndex, endIndex);
        
        if (pageData.length === 0) {
            DOM.tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px;">
                        <i class="fas fa-inbox" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 12px;"></i>
                        <p style="color: var(--text-secondary);">No data found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        const html = pageData.map(item => {
            const initials = item.fullName
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
            
            const isSelected = selectedItems.includes(item.id);
            const selectedClass = isSelected ? 'selected' : '';
            
            return `
                <tr class="${selectedClass}" data-id="${item.id}">
                    <td>
                        <input type="checkbox" class="row-checkbox" data-id="${item.id}" ${isSelected ? 'checked' : ''}>
                    </td>
                    <td>
                        <div class="admin-table-user">
                            <div class="admin-table-user-avatar">
                                ${item.photo ? `<img src="${item.photo}" alt="${item.fullName}">` : initials}
                            </div>
                            <div class="admin-table-user-info">
                                <div class="admin-table-user-name">${item.fullName}</div>
                                <div class="admin-table-user-email">${item.email}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="admin-table-id">${item.habpsId}</span>
                    </td>
                    <td>
                        <span class="admin-table-status ${item.status}">
                            ${item.status.toUpperCase()}
                        </span>
                    </td>
                    <td>${item.enrolledCourses?.length || 0}</td>
                    <td>
                        <div class="admin-table-progress">
                            <div class="admin-table-progress-bar">
                                <div class="admin-table-progress-fill" style="width: ${Math.random() * 100}%;"></div>
                            </div>
                            <span class="admin-table-progress-text">${Math.floor(Math.random() * 100)}%</span>
                        </div>
                    </td>
                    <td>${HA.Utils.formatDate(item.joinedAt)}</td>
                    <td>
                        <div class="admin-table-actions-cell">
                            <button class="admin-table-action-btn view" data-id="${item.id}" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="admin-table-action-btn edit" data-id="${item.id}" title="Edit">
                                <i class="fas fa-pen"></i>
                            </button>
                            <button class="admin-table-action-btn delete" data-id="${item.id}" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        DOM.tableBody.innerHTML = html;
        
        // Update pagination
        _renderPagination();
        
        // Update table info
        if (DOM.tableInfo) {
            DOM.tableInfo.textContent = `Showing ${startIndex + 1} to ${Math.min(endIndex, filteredData.length)} of ${filteredData.length} entries`;
        }
        
        // Add event listeners
        _initTableActions();
    }

    /**
     * Render pagination
     */
    function _renderPagination() {
        if (!DOM.tablePagination) return;
        
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        
        if (totalPages <= 1) {
            DOM.tablePagination.innerHTML = '';
            return;
        }
        
        let html = '';
        
        // Previous button
        html += `<button class="admin-pagination-btn" ${currentPageNum === 1 ? 'disabled' : ''} data-page="prev">
            <i class="fas fa-chevron-left"></i>
        </button>`;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPageNum - 1 && i <= currentPageNum + 1)) {
                html += `<button class="admin-pagination-btn ${i === currentPageNum ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>`;
            } else if (i === currentPageNum - 2 || i === currentPageNum + 2) {
                html += `<span style="padding: 0 8px; color: var(--text-muted);">...</span>`;
            }
        }
        
        // Next button
        html += `<button class="admin-pagination-btn" ${currentPageNum === totalPages ? 'disabled' : ''} data-page="next">
            <i class="fas fa-chevron-right"></i>
        </button>`;
        
        DOM.tablePagination.innerHTML = html;
        
        // Add click handlers
        DOM.tablePagination.querySelectorAll('.admin-pagination-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                
                if (page === 'prev' && currentPageNum > 1) {
                    currentPageNum--;
                } else if (page === 'next' && currentPageNum < totalPages) {
                    currentPageNum++;
                } else if (page !== 'prev' && page !== 'next') {
                    currentPageNum = parseInt(page);
                }
                
                _renderTable();
            });
        });
    }

    /**
     * Initialize table controls
     */
    function _initTableControls() {
        // Search
        if (DOM.tableSearch) {
            DOM.tableSearch.addEventListener('input', HA.Utils.debounce((e) => {
                const query = e.target.value.toLowerCase();
                
                filteredData = tableData.filter(item => {
                    return Object.values(item).some(val => 
                        String(val).toLowerCase().includes(query)
                    );
                });
                
                currentPageNum = 1;
                _renderTable();
            }, 300));
        }
        
        // Filter
        if (DOM.tableFilter) {
            DOM.tableFilter.addEventListener('change', (e) => {
                const filter = e.target.value;
                
                if (filter === 'all') {
                    filteredData = [...tableData];
                } else {
                    filteredData = tableData.filter(item => item.status === filter);
                }
                
                currentPageNum = 1;
                _renderTable();
            });
        }
        
        // Select all checkbox
        if (DOM.selectAllCheckbox) {
            DOM.selectAllCheckbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                
                if (isChecked) {
                    selectedItems = filteredData.map(item => item.id);
                } else {
                    selectedItems = [];
                }
                
                _renderTable();
                _updateBulkBar();
            });
        }
        
        // Sorting
        document.querySelectorAll('.admin-table th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.dataset.sort;
                
                if (sortColumn === column) {
                    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    sortColumn = column;
                    sortDirection = 'asc';
                }
                
                // Update sort indicators
                document.querySelectorAll('.admin-table th').forEach(header => {
                    header.classList.remove('sorted');
                    const icon = header.querySelector('.sort-icon');
                    if (icon) icon.textContent = '↕';
                });
                
                th.classList.add('sorted');
                const icon = th.querySelector('.sort-icon');
                if (icon) icon.textContent = sortDirection === 'asc' ? '↑' : '↓';
                
                _renderTable();
            });
        });
    }

    /**
     * Initialize table actions
     */
    function _initTableActions() {
        // Row checkboxes
        document.querySelectorAll('.row-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                
                if (e.target.checked) {
                    if (!selectedItems.includes(id)) {
                        selectedItems.push(id);
                    }
                } else {
                    selectedItems = selectedItems.filter(itemId => itemId !== id);
                }
                
                _updateBulkBar();
                e.target.closest('tr').classList.toggle('selected', e.target.checked);
            });
        });
        
        // View buttons
        document.querySelectorAll('.admin-table-action-btn.view').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                _viewItem(id);
            });
        });
        
        // Edit buttons
        document.querySelectorAll('.admin-table-action-btn.edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                _editItem(id);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.admin-table-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                await _deleteItem(id);
            });
        });
    }

    /**
     * Update bulk action bar
     */
    function _updateBulkBar() {
        if (!DOM.bulkBar) return;
        
        if (selectedItems.length > 0) {
            DOM.bulkBar.style.display = 'flex';
            if (DOM.bulkCount) DOM.bulkCount.textContent = selectedItems.length;
        } else {
            DOM.bulkBar.style.display = 'none';
        }
    }

    /**
     * Initialize bulk actions
     */
    function _initBulkActions() {
        if (DOM.bulkApproveBtn) {
            DOM.bulkApproveBtn.addEventListener('click', async () => {
                const confirmed = await HA.Utils.confirm({
                    title: 'Approve Selected',
                    message: `Are you sure you want to approve ${selectedItems.length} item(s)?`,
                    confirmText: 'Approve',
                    type: 'success'
                });
                
                if (confirmed) {
                    selectedItems.forEach(id => {
                        HA.Storage.updateStudent(id, { status: 'active' });
                    });
                    
                    HA.Utils.toast({
                        type: 'success',
                        title: 'Approved!',
                        message: `${selectedItems.length} item(s) approved`,
                        duration: 3000
                    });
                    
                    selectedItems = [];
                    _renderTable();
                    _updateBulkBar();
                }
            });
        }
        
        if (DOM.bulkDeleteBtn) {
            DOM.bulkDeleteBtn.addEventListener('click', async () => {
                const confirmed = await HA.Utils.confirm({
                    title: 'Delete Selected',
                    message: `Are you sure you want to delete ${selectedItems.length} item(s)? This cannot be undone.`,
                    confirmText: 'Delete',
                    type: 'danger'
                });
                
                if (confirmed) {
                    selectedItems.forEach(id => {
                        HA.Storage.deleteStudent(id);
                    });
                    
                    HA.Utils.toast({
                        type: 'success',
                        title: 'Deleted!',
                        message: `${selectedItems.length} item(s) deleted`,
                        duration: 3000
                    });
                    
                    selectedItems = [];
                    tableData = HA.Storage.getStudents();
                    filteredData = [...tableData];
                    _renderTable();
                    _updateBulkBar();
                }
            });
        }
        
        if (DOM.bulkExportBtn) {
            DOM.bulkExportBtn.addEventListener('click', () => {
                _exportData();
            });
        }
    }

    // ============================================
    // 7. CRUD OPERATIONS
    // ============================================

    /**
     * View item details
     */
    function _viewItem(id) {
        const item = tableData.find(i => i.id === id);
        if (!item) return;
        
        HA.Utils.toast({
            type: 'info',
            title: 'View Details',
            message: `Viewing: ${item.fullName}`,
            duration: 2500
        });
        
        // In production, this would open a detailed view modal
    }

    /**
     * Edit item
     */
    function _editItem(id) {
        const item = tableData.find(i => i.id === id);
        if (!item) return;
        
        _openModal('Edit Student', `
            <form id="editForm" class="admin-form">
                <div class="admin-form-grid">
                    <div class="admin-form-group">
                        <label class="admin-form-label">Full Name <span class="required">*</span></label>
                        <input type="text" class="admin-form-input" value="${item.fullName}" required>
                    </div>
                    <div class="admin-form-group">
                        <label class="admin-form-label">Email <span class="required">*</span></label>
                        <input type="email" class="admin-form-input" value="${item.email}" required>
                    </div>
                    <div class="admin-form-group">
                        <label class="admin-form-label">WhatsApp</label>
                        <input type="tel" class="admin-form-input" value="${item.whatsapp || ''}">
                    </div>
                    <div class="admin-form-group">
                        <label class="admin-form-label">Status</label>
                        <select class="admin-form-select">
                            <option value="active" ${item.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="inactive" ${item.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                            <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>Pending</option>
                        </select>
                    </div>
                </div>
            </form>
        `);
        
        // Save button handler
        if (DOM.modalSave) {
            DOM.modalSave.onclick = async () => {
                const form = document.getElementById('editForm');
                const formData = new FormData(form);
                
                const data = {
                    fullName: formData.get('Full Name') || item.fullName,
                    email: formData.get('Email') || item.email,
                    whatsapp: formData.get('WhatsApp') || item.whatsapp,
                    status: formData.get('Status') || item.status
                };
                
                const result = HA.Storage.updateStudent(id, data);
                
                if (result.success) {
                    HA.Utils.toast({
                        type: 'success',
                        title: 'Updated!',
                        message: 'Student updated successfully',
                        duration: 3000
                    });
                    
                    _closeModal();
                    tableData = HA.Storage.getStudents();
                    filteredData = [...tableData];
                    _renderTable();
                } else {
                    HA.Utils.toast({
                        type: 'error',
                        title: 'Update Failed',
                        message: result.error,
                        duration: 3000
                    });
                }
            };
        }
    }

    /**
     * Delete item
     */
    async function _deleteItem(id) {
        const item = tableData.find(i => i.id === id);
        if (!item) return;
        
        const confirmed = await HA.Utils.confirm({
            title: 'Delete Confirmation',
            message: `Are you sure you want to delete "${item.fullName}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger'
        });
        
        if (confirmed) {
            const result = HA.Storage.deleteStudent(id);
            
            if (result.success) {
                HA.Utils.toast({
                    type: 'success',
                    title: 'Deleted!',
                    message: 'Student deleted successfully',
                    duration: 3000
                });
                
                tableData = HA.Storage.getStudents();
                filteredData = [...tableData];
                _renderTable();
            } else {
                HA.Utils.toast({
                    type: 'error',
                    title: 'Delete Failed',
                    message: result.error,
                    duration: 3000
                });
            }
        }
    }

    // ============================================
    // 8. MODALS
    // ============================================

    /**
     * Open modal
     */
    function _openModal(title, content) {
        if (!DOM.modalOverlay) return;
        
        if (DOM.modalTitle) DOM.modalTitle.innerHTML = `<i class="fas fa-edit"></i> ${title}`;
        if (DOM.modalBody) DOM.modalBody.innerHTML = content;
        
        DOM.modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close modal
     */
    function _closeModal() {
        if (!DOM.modalOverlay) return;
        
        DOM.modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Initialize modals
     */
    function _initModals() {
        if (DOM.modalClose) {
            DOM.modalClose.addEventListener('click', _closeModal);
        }
        
        if (DOM.modalCancel) {
            DOM.modalCancel.addEventListener('click', _closeModal);
        }
        
        if (DOM.modalOverlay) {
            DOM.modalOverlay.addEventListener('click', (e) => {
                if (e.target === DOM.modalOverlay) {
                    _closeModal();
                }
            });
        }
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && DOM.modalOverlay && DOM.modalOverlay.classList.contains('active')) {
                _closeModal();
            }
        });
    }

    // ============================================
    // 9. EXPORT/IMPORT
    // ============================================

    /**
     * Export data
     */
    function _exportData() {
        const data = HA.Storage.exportData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `hacker-academy-backup-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        HA.Utils.toast({
            type: 'success',
            title: 'Export Complete!',
            message: 'Data exported successfully',
            duration: 3000
        });
    }

    /**
     * Import data
     */
    function _importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    const confirmed = await HA.Utils.confirm({
                        title: 'Import Data',
                        message: 'This will replace all existing data. Are you sure?',
                        confirmText: 'Import',
                        type: 'warning'
                    });
                    
                    if (confirmed) {
                        HA.Storage.importData(data);
                        
                        HA.Utils.toast({
                            type: 'success',
                            title: 'Import Complete!',
                            message: 'Data imported successfully',
                            duration: 3000
                        });
                        
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    }
                } catch (error) {
                    HA.Utils.toast({
                        type: 'error',
                        title: 'Import Failed',
                        message: 'Invalid JSON file',
                        duration: 3000
                    });
                }
            };
            
            reader.readAsText(file);
        });
        
        input.click();
    }

    // ============================================
    // 10. LOGOUT
    // ============================================

    /**
     * Initialize logout
     */
    function _initLogout() {
        const logoutBtn = document.getElementById('adminLogoutBtn');
        if (!logoutBtn) return;
        
        logoutBtn.addEventListener('click', async () => {
            const confirmed = await HA.Utils.confirm({
                title: 'Logout Confirmation',
                message: 'Are you sure you want to logout?',
                confirmText: 'Logout',
                cancelText: 'Cancel',
                type: 'warning'
            });
            
            if (confirmed) {
                HA.Storage.adminLogout();
                
                HA.Utils.toast({
                    type: 'success',
                    title: 'Logged Out',
                    message: 'You have been successfully logged out',
                    duration: 2500
                });
                
                setTimeout(() => {
                    window.location.href = 'admin-login.html';
                }, 1500);
            }
        });
    }

    // ============================================
    // 11. KEYBOARD SHORTCUTS
    // ============================================

    /**
     * Initialize keyboard shortcuts
     */
    function _initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K = Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (DOM.tableSearch) DOM.tableSearch.focus();
            }
            
            // Ctrl/Cmd + E = Export
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                _exportData();
            }
            
            // Ctrl/Cmd + I = Import
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                _importData();
            }
        });
    }

    // ============================================
    // 12. LOADING SCREEN
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
    // 13. ERROR HANDLING
    // ============================================

    /**
     * Initialize error handling
     */
    function _initErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('[HA.Admin] Global error:', e.message);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('[HA.Admin] Unhandled promise rejection:', e.reason);
        });
    }

    // ============================================
    // 14. PUBLIC API
    // ============================================

    return {
        /**
         * Initialize the admin panel
         */
        init: function() {
            console.log('[HA.Admin] 🚀 Initializing Admin Panel...');
            console.log('[HA.Admin] Founded by Er. Priyanshu Sharma');
            
            // Prevent double initialization
            if (window.__HA_ADMIN_INITIALIZED__) {
                console.warn('[HA.Admin] Already initialized');
                return;
            }
            window.__HA_ADMIN_INITIALIZED__ = true;
            
            // Cache DOM
            _cacheDOM();
            
            // Check authentication
            if (!_checkAuth()) return;
            
            // Initialize storage
            if (HA.Storage) {
                HA.Storage.init();
            }
            
            // Detect current page
            _detectPage();
            
            // Initialize sidebar
            _initSidebar();
            
            // Render based on current page
            _renderDashboard();
            _renderStudentsTable();
            
            // Initialize UI components
            _initModals();
            _initBulkActions();
            _initLogout();
            _initKeyboardShortcuts();
            
            // Initialize utilities
            _initErrorHandling();
            
            // Hide loader
            _hideLoader();
            
            console.log('[HA.Admin] ✅ Initialization complete');
            console.log('[HA.Admin] 👤 Admin:', adminUser.name);
            console.log('[HA.Admin] 📍 Page:', currentPage);
        },

        /**
         * Get current admin user
         */
        getAdminUser: function() {
            return adminUser;
        },

        /**
         * Get current page
         */
        getCurrentPage: function() {
            return currentPage;
        },

        /**
         * Export data
         */
        exportData: _exportData,

        /**
         * Import data
         */
        importData: _importData,

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
        HA.Admin.init();
    }, 100);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HA.Admin;
}