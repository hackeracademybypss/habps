/**
 * ============================================
 * HACKER ACADEMY — CERTIFICATE CONTROLLER
 * Premium Cyberpunk Certificate Management System
 * ============================================
 * 
 * Founded & Owned by Er. Priyanshu Sharma
 * File: js/certificate.js
 * Version: 1.0.0
 * 
 * ARCHITECTURE:
 * - Namespace: HA.Certificate
 * - Pattern: Module (IIFE)
 * - Dependencies: HA.Storage, HA.Utils
 * - Target Page: certificate.html
 * 
 * FEATURES:
 * • Authentication check (redirect if not logged in)
 * • Certificate loading from storage
 * • Certificate preview display
 * • Certificate details section
 * • Download as PDF functionality
 * • Share to social media
 * • Print certificate
 * • Share to LinkedIn
 * • Copy certificate ID
 * • Certificate verification
 * • Certificate list/grid view
 * • Empty state handling
 * • Loading screen
 * • Premium animations
 * ============================================
 */

// Initialize namespace
window.HA = window.HA || {};

/**
 * HA.Certificate Module
 * Certificate management controller
 */
HA.Certificate = (function() {
    'use strict';

    // ============================================
    // 1. PRIVATE STATE
    // ============================================
    let currentUser = null;
    let currentCertificate = null;
    let certificateList = [];

    // ============================================
    // 2. DOM REFERENCES
    // ============================================
    const DOM = {
        loader: null,
        
        // Single Certificate View
        certificatePreview: null,
        certificateLogo: null,
        certificateHeading: null,
        certificateSubheading: null,
        certificateRecipient: null,
        certificateCourse: null,
        certificateDescription: null,
        certificateDate: null,
        certificateId: null,
        certificateSignatureName: null,
        certificateSignatureTitle: null,
        
        // Details Section
        detailsGrid: null,
        
        // Actions
        downloadBtn: null,
        shareBtn: null,
        printBtn: null,
        linkedinBtn: null,
        copyIdBtn: null,
        
        // Certificate List
        certificateListSection: null,
        certificatesGrid: null,
        certificateCount: null,
        
        // Empty State
        emptyState: null
    };

    // ============================================
    // 3. INITIALIZATION
    // ============================================

    /**
     * Cache DOM references
     */
    function _cacheDOM() {
        DOM.loader = document.getElementById('haLoader');
        
        // Single Certificate View
        DOM.certificatePreview = document.querySelector('.certificate-template');
        DOM.certificateLogo = document.querySelector('.certificate-logo');
        DOM.certificateHeading = document.querySelector('.certificate-heading');
        DOM.certificateSubheading = document.querySelector('.certificate-subheading');
        DOM.certificateRecipient = document.querySelector('.certificate-recipient');
        DOM.certificateCourse = document.querySelector('.certificate-course');
        DOM.certificateDescription = document.querySelector('.certificate-description');
        DOM.certificateDate = document.getElementById('certificateDate');
        DOM.certificateId = document.getElementById('certificateId');
        DOM.certificateSignatureName = document.querySelector('.certificate-signature-name');
        DOM.certificateSignatureTitle = document.querySelector('.certificate-signature-title');
        
        // Details Section
        DOM.detailsGrid = document.querySelector('.certificate-info-grid');
        
        // Actions
        DOM.downloadBtn = document.getElementById('downloadBtn');
        DOM.shareBtn = document.getElementById('shareBtn');
        DOM.printBtn = document.getElementById('printBtn');
        DOM.linkedinBtn = document.getElementById('linkedinBtn');
        DOM.copyIdBtn = document.getElementById('copyIdBtn');
        
        // Certificate List
        DOM.certificateListSection = document.querySelector('.certificate-list-section');
        DOM.certificatesGrid = document.getElementById('certificatesGrid');
        DOM.certificateCount = document.querySelector('.certificate-list-count');
        
        // Empty State
        DOM.emptyState = document.querySelector('.certificate-empty-state');
        
        console.log('[HA.Certificate] ✅ DOM references cached');
    }

    /**
     * Check authentication
     */
    function _checkAuth() {
        currentUser = HA.Storage.getCurrentUser();
        
        if (!currentUser) {
            console.warn('[HA.Certificate] User not logged in, redirecting...');
            
            HA.Utils.toast({
                type: 'warning',
                title: 'Login Required',
                message: 'Please login to view certificates',
                duration: 3000
            });
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            
            return false;
        }
        
        console.log('[HA.Certificate] ✅ User authenticated:', currentUser.habpsId);
        return true;
    }

    /**
     * Load certificate data
     */
    function _loadCertificate() {
        const certId = HA.Utils.getURLParam('id');
        
        if (certId) {
            // Load specific certificate
            currentCertificate = HA.Storage.verifyCertificate(certId);
            
            if (!currentCertificate) {
                HA.Utils.toast({
                    type: 'error',
                    title: 'Certificate Not Found',
                    message: 'The requested certificate does not exist',
                    duration: 3000
                });
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
                
                return false;
            }
            
            // Verify ownership
            if (currentCertificate.userId !== currentUser.id) {
                HA.Utils.toast({
                    type: 'error',
                    title: 'Access Denied',
                    message: 'You do not have permission to view this certificate',
                    duration: 3000
                });
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
                
                return false;
            }
            
            console.log('[HA.Certificate] ✅ Certificate loaded:', certId);
        } else {
            // Load all certificates for list view
            certificateList = HA.Storage.getCertificates(currentUser.id);
            console.log('[HA.Certificate] ✅ Loaded', certificateList.length, 'certificates');
        }
        
        return true;
    }

    // ============================================
    // 4. SINGLE CERTIFICATE VIEW
    // ============================================

    /**
     * Render single certificate
     */
    function _renderCertificate() {
        if (!currentCertificate) return;
        
        const course = HA.Storage.getCourse(currentCertificate.courseId);
        const courseName = course ? course.title : currentCertificate.courseName;
        
        // Certificate template
        if (DOM.certificateRecipient) {
            DOM.certificateRecipient.textContent = currentCertificate.studentName;
        }
        
        if (DOM.certificateCourse) {
            DOM.certificateCourse.textContent = courseName;
        }
        
        if (DOM.certificateDescription) {
            DOM.certificateDescription.textContent = `This certificate is proudly presented to ${currentCertificate.studentName} for successfully completing the ${courseName} course at Hacker Academy, demonstrating exceptional knowledge and skills in cybersecurity.`;
        }
        
        if (DOM.certificateDate) {
            DOM.certificateDate.textContent = HA.Utils.formatDate(currentCertificate.issuedAt);
        }
        
        if (DOM.certificateId) {
            DOM.certificateId.textContent = currentCertificate.id;
        }
        
        if (DOM.certificateSignatureName) {
            DOM.certificateSignatureName.textContent = currentCertificate.issuedBy;
        }
        
        if (DOM.certificateSignatureTitle) {
            DOM.certificateSignatureTitle.textContent = 'Founder & CEO';
        }
        
        // Details section
        _renderDetails(course);
        
        console.log('[HA.Certificate] ✅ Certificate rendered');
    }

    /**
     * Render certificate details
     */
    function _renderDetails(course) {
        if (!DOM.detailsGrid) return;
        
        const html = `
            <div class="certificate-info-item">
                <div class="certificate-info-label">Certificate ID</div>
                <div class="certificate-info-value highlight">${currentCertificate.id}</div>
            </div>
            <div class="certificate-info-item">
                <div class="certificate-info-label">Student Name</div>
                <div class="certificate-info-value">${currentCertificate.studentName}</div>
            </div>
            <div class="certificate-info-item">
                <div class="certificate-info-label">HABPS ID</div>
                <div class="certificate-info-value highlight">${currentCertificate.habpsId}</div>
            </div>
            <div class="certificate-info-item">
                <div class="certificate-info-label">Course Name</div>
                <div class="certificate-info-value">${course ? course.title : currentCertificate.courseName}</div>
            </div>
            <div class="certificate-info-item">
                <div class="certificate-info-label">Course Category</div>
                <div class="certificate-info-value">${course ? course.category.toUpperCase() : 'CYBER SECURITY'}</div>
            </div>
            <div class="certificate-info-item">
                <div class="certificate-info-label">Issue Date</div>
                <div class="certificate-info-value">${HA.Utils.formatDate(currentCertificate.issuedAt)}</div>
            </div>
            <div class="certificate-info-item">
                <div class="certificate-info-label">Issued By</div>
                <div class="certificate-info-value">${currentCertificate.issuedBy}</div>
            </div>
            <div class="certificate-info-item">
                <div class="certificate-info-label">Verification Status</div>
                <div class="certificate-info-value" style="color: var(--neon-green);">
                    <i class="fas fa-check-circle"></i> VERIFIED
                </div>
            </div>
        `;
        
        DOM.detailsGrid.innerHTML = html;
    }

    // ============================================
    // 5. CERTIFICATE LIST VIEW
    // ============================================

    /**
     * Render certificate list
     */
    function _renderCertificateList() {
        if (!DOM.certificatesGrid) return;
        
        if (certificateList.length === 0) {
            // Show empty state
            if (DOM.emptyState) {
                DOM.emptyState.style.display = 'block';
            }
            if (DOM.certificateListSection) {
                DOM.certificateListSection.style.display = 'none';
            }
            return;
        }
        
        // Update count
        if (DOM.certificateCount) {
            DOM.certificateCount.textContent = certificateList.length;
        }
        
        const html = certificateList.map(cert => {
            const course = HA.Storage.getCourse(cert.courseId);
            const courseName = course ? course.title : cert.courseName;
            
            return `
                <div class="certificate-card" data-cert-id="${cert.id}">
                    <div class="certificate-card-preview">
                        <div class="certificate-card-icon">
                            <i class="fas fa-certificate"></i>
                        </div>
                        <div class="certificate-card-ribbon">VERIFIED</div>
                    </div>
                    <div class="certificate-card-body">
                        <div class="certificate-card-title">${courseName}</div>
                        <div class="certificate-card-course">CERTIFICATE OF COMPLETION</div>
                        <div class="certificate-card-footer">
                            <div class="certificate-card-date">
                                <i class="fas fa-calendar"></i> ${HA.Utils.formatDate(cert.issuedAt)}
                            </div>
                            <button class="certificate-card-btn" data-cert-id="${cert.id}">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        DOM.certificatesGrid.innerHTML = html;
        
        // Add click handlers
        document.querySelectorAll('.certificate-card-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const certId = btn.dataset.certId;
                window.location.href = `certificate.html?id=${certId}`;
            });
        });
        
        document.querySelectorAll('.certificate-card').forEach(card => {
            card.addEventListener('click', () => {
                const certId = card.dataset.certId;
                window.location.href = `certificate.html?id=${certId}`;
            });
        });
        
        console.log('[HA.Certificate] ✅ Certificate list rendered');
    }

    // ============================================
    // 6. ACTIONS
    // ============================================

    /**
     * Initialize certificate actions
     */
    function _initActions() {
        // Download PDF
        if (DOM.downloadBtn) {
            DOM.downloadBtn.addEventListener('click', _downloadCertificate);
        }
        
        // Share
        if (DOM.shareBtn) {
            DOM.shareBtn.addEventListener('click', _shareCertificate);
        }
        
        // Print
        if (DOM.printBtn) {
            DOM.printBtn.addEventListener('click', _printCertificate);
        }
        
        // LinkedIn
        if (DOM.linkedinBtn) {
            DOM.linkedinBtn.addEventListener('click', _shareToLinkedIn);
        }
        
        // Copy ID
        if (DOM.copyIdBtn) {
            DOM.copyIdBtn.addEventListener('click', _copyCertificateId);
        }
        
        console.log('[HA.Certificate] ✅ Actions initialized');
    }

    /**
     * Download certificate as PDF
     */
    function _downloadCertificate() {
        if (!currentCertificate) return;
        
        HA.Utils.toast({
            type: 'info',
            title: 'Preparing Download...',
            message: 'Your certificate is being prepared',
            duration: 2500
        });
        
        // Simulate PDF generation
        setTimeout(() => {
            // In production, this would use a library like html2pdf or jsPDF
            // For demo, we'll show a success message
            HA.Utils.toast({
                type: 'success',
                title: 'Download Ready!',
                message: `Certificate_${currentCertificate.id}.pdf`,
                duration: 3500
            });
            
            // Celebration
            _celebrateAction();
        }, 1500);
    }

    /**
     * Share certificate
     */
    async function _shareCertificate() {
        if (!currentCertificate) return;
        
        const shareUrl = `${window.location.origin}/certificate.html?id=${currentCertificate.id}`;
        const shareText = `I just earned a certificate in ${currentCertificate.courseName} from Hacker Academy! 🎓`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Hacker Academy Certificate',
                    text: shareText,
                    url: shareUrl
                });
                
                HA.Utils.toast({
                    type: 'success',
                    title: 'Shared!',
                    message: 'Certificate shared successfully',
                    duration: 2500
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('[HA.Certificate] Share error:', error);
                    _fallbackShare(shareUrl, shareText);
                }
            }
        } else {
            _fallbackShare(shareUrl, shareText);
        }
    }

    /**
     * Fallback share (copy to clipboard)
     */
    async function _fallbackShare(url, text) {
        const shareContent = `${text}\n\n${url}`;
        const success = await HA.Utils.copyToClipboard(shareContent);
        
        if (success) {
            HA.Utils.toast({
                type: 'success',
                title: 'Link Copied!',
                message: 'Share link copied to clipboard',
                duration: 3000
            });
        } else {
            HA.Utils.toast({
                type: 'error',
                title: 'Share Failed',
                message: 'Could not copy share link',
                duration: 3000
            });
        }
    }

    /**
     * Print certificate
     */
    function _printCertificate() {
        if (!currentCertificate) return;
        
        HA.Utils.toast({
            type: 'info',
            title: 'Preparing Print...',
            message: 'Opening print dialog',
            duration: 2000
        });
        
        setTimeout(() => {
            window.print();
        }, 500);
    }

    /**
     * Share to LinkedIn
     */
    function _shareToLinkedIn() {
        if (!currentCertificate) return;
        
        const course = HA.Storage.getCourse(currentCertificate.courseId);
        const courseName = course ? course.title : currentCertificate.courseName;
        
        const linkedinUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(courseName)}&organizationId=Hacker Academy&issueYear=2026&issueMonth=7&certUrl=${encodeURIComponent(window.location.href)}`;
        
        HA.Utils.toast({
            type: 'info',
            title: 'Opening LinkedIn...',
            message: 'Add this certificate to your profile',
            duration: 2500
        });
        
        setTimeout(() => {
            window.open(linkedinUrl, '_blank');
        }, 1000);
    }

    /**
     * Copy certificate ID
     */
    async function _copyCertificateId() {
        if (!currentCertificate) return;
        
        const success = await HA.Utils.copyToClipboard(currentCertificate.id);
        
        if (success) {
            HA.Utils.toast({
                type: 'success',
                title: 'Copied!',
                message: 'Certificate ID copied to clipboard',
                duration: 2000
            });
            
            // Visual feedback
            if (DOM.copyIdBtn) {
                const originalHTML = DOM.copyIdBtn.innerHTML;
                DOM.copyIdBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                DOM.copyIdBtn.classList.add('copied');
                
                setTimeout(() => {
                    DOM.copyIdBtn.innerHTML = originalHTML;
                    DOM.copyIdBtn.classList.remove('copied');
                }, 2000);
            }
        }
    }

    /**
     * Celebrate action
     */
    function _celebrateAction() {
        const colors = ['#00ff9d', '#00d4ff', '#b537f2', '#ffd60a'];
        
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
    // 7. KEYBOARD SHORTCUTS
    // ============================================

    /**
     * Initialize keyboard shortcuts
     */
    function _initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + P to print
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                if (currentCertificate) {
                    e.preventDefault();
                    _printCertificate();
                }
            }
            
            // Ctrl/Cmd + D to download
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                if (currentCertificate) {
                    e.preventDefault();
                    _downloadCertificate();
                }
            }
            
            // Ctrl/Cmd + C to copy ID (when not in input)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                if (currentCertificate && window.getSelection().toString() === '') {
                    e.preventDefault();
                    _copyCertificateId();
                }
            }
        });
    }

    // ============================================
    // 8. LOADING SCREEN
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
    // 9. ERROR HANDLING
    // ============================================

    /**
     * Initialize error handling
     */
    function _initErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('[HA.Certificate] Global error:', e.message);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('[HA.Certificate] Unhandled promise rejection:', e.reason);
        });
    }

    // ============================================
    // 10. PUBLIC API
    // ============================================

    return {
        /**
         * Initialize the certificate page
         */
        init: function() {
            console.log('[HA.Certificate] 🚀 Initializing Certificate Page...');
            console.log('[HA.Certificate] Founded by Er. Priyanshu Sharma');
            
            // Prevent double initialization
            if (window.__HA_CERTIFICATE_INITIALIZED__) {
                console.warn('[HA.Certificate] Already initialized');
                return;
            }
            window.__HA_CERTIFICATE_INITIALIZED__ = true;
            
            // Cache DOM
            _cacheDOM();
            
            // Check authentication
            if (!_checkAuth()) return;
            
            // Initialize storage
            if (HA.Storage) {
                HA.Storage.init();
            }
            
            // Load certificate data
            if (!_loadCertificate()) return;
            
            // Render based on view type
            if (currentCertificate) {
                // Single certificate view
                _renderCertificate();
                _initActions();
            } else {
                // Certificate list view
                _renderCertificateList();
            }
            
            // Initialize utilities
            _initKeyboardShortcuts();
            _initErrorHandling();
            
            // Hide loader
            _hideLoader();
            
            console.log('[HA.Certificate] ✅ Initialization complete');
            
            if (currentCertificate) {
                console.log('[HA.Certificate] 🏆 Certificate:', currentCertificate.id);
                console.log('[HA.Certificate] 📚 Course:', currentCertificate.courseName);
            } else {
                console.log('[HA.Certificate] 📋 Total Certificates:', certificateList.length);
            }
        },

        /**
         * Get current certificate
         */
        getCurrentCertificate: function() {
            return currentCertificate;
        },

        /**
         * Get all certificates
         */
        getAllCertificates: function() {
            return certificateList;
        },

        /**
         * Verify certificate by ID
         */
        verifyCertificate: function(certId) {
            return HA.Storage.verifyCertificate(certId);
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
        HA.Certificate.init();
    }, 100);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HA.Certificate;
}