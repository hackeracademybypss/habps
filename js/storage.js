/**
 * ============================================
 * HACKER ACADEMY — STORAGE LAYER
 * Premium localStorage Abstraction
 * Firebase Migration Ready
 * ============================================
 * 
 * Founded & Owned by Er. Priyanshu Sharma
 * File: js/storage.js
 * Version: 1.0.0
 * 
 * ARCHITECTURE:
 * - Namespace: HA.Storage
 * - Pattern: Module (IIFE)
 * - Backend: localStorage (swappable to Firebase)
 * - Features:
 *   • CRUD operations for all entities
 *   • Auto-generated HABPS IDs (8 digits)
 *   • Password hashing (SHA-256 ready)
 *   • Default data seeding (30 courses)
 *   • Session management
 *   • Admin & Student auth
 *   • Progress tracking
 *   • Certificate issuance
 *   • Quiz management
 *   • Announcement system
 * 
 * MIGRATION PATH:
 * Replace _get/_set/_remove with Firebase Firestore calls.
 * All public methods remain unchanged.
 * ============================================
 */

// Initialize global namespace
window.HA = window.HA || {};

/**
 * HA.Storage Module
 * Central data management layer
 */
HA.Storage = (function() {
    'use strict';

    // ============================================
    // 1. STORAGE KEYS (Constants)
    // ============================================
    const KEYS = {
        // Auth & Session
        STUDENTS: 'ha_students',
        CURRENT_USER: 'ha_current_user',
        ADMIN_SESSION: 'ha_admin_session',
        REMEMBER_ME: 'ha_remember_me',
        
        // Content
        COURSES: 'ha_courses',
        QUIZZES: 'ha_quizzes',
        CERTIFICATES: 'ha_certificates',
        ANNOUNCEMENTS: 'ha_announcements',
        TODAY_CLASS: 'ha_today_class',
        
        // User Data
        PROGRESS: 'ha_progress',
        QUIZ_ATTEMPTS: 'ha_quiz_attempts',
        ACHIEVEMENTS: 'ha_achievements',
        
        // Misc
        CONTACT_SUBMISSIONS: 'ha_contacts',
        LEADERBOARD: 'ha_leaderboard',
        SETTINGS: 'ha_settings',
        INITIALIZED: 'ha_initialized',
        VERSION: 'ha_version'
    };

    // ============================================
    // 2. DEFAULT ADMIN CREDENTIALS
    // ============================================
    const DEFAULT_ADMIN = {
        id: 'ADMIN-001',
        username: 'admin',
        email: 'admin@hackeracademy.com',
        password: _hashPassword('Admin@2026'),
        name: 'Er. Priyanshu Sharma',
        role: 'super_admin',
        createdAt: new Date('2026-01-01').toISOString()
    };

    // ============================================
    // 3. DEFAULT 30 COURSES
    // ============================================
    const DEFAULT_COURSES = [
        {
            id: 'C001',
            title: 'Ethical Hacking Mastery',
            category: 'hacking',
            level: 'beginner',
            duration: '40 hours',
            lessons: 48,
            modules: 8,
            price: 4999,
            originalPrice: 9999,
            image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80',
            instructor: 'Er. Priyanshu Sharma',
            rating: 4.9,
            students: 2840,
            description: 'Complete ethical hacking course from zero to hero. Learn reconnaissance, scanning, exploitation, and post-exploitation.',
            badge: 'BESTSELLER'
        },
        {
            id: 'C002',
            title: 'SOC Analyst Professional',
            category: 'soc',
            level: 'intermediate',
            duration: '60 hours',
            lessons: 72,
            modules: 10,
            price: 6999,
            originalPrice: 12999,
            image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
            instructor: 'Cyber Defence Team',
            rating: 4.8,
            students: 1920,
            description: 'Master Security Operations Center operations with SIEM, threat hunting, and incident response.',
            badge: 'TRENDING'
        },
        {
            id: 'C003',
            title: 'Penetration Testing Expert',
            category: 'hacking',
            level: 'advanced',
            duration: '80 hours',
            lessons: 96,
            modules: 12,
            price: 8999,
            originalPrice: 15999,
            image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80',
            instructor: 'Red Team Lead',
            rating: 4.9,
            students: 1540,
            description: 'Advanced penetration testing covering networks, web apps, mobile, and wireless systems.',
            badge: 'PRO'
        },
        {
            id: 'C004',
            title: 'Python for Cyber Security',
            category: 'programming',
            level: 'beginner',
            duration: '35 hours',
            lessons: 42,
            modules: 7,
            price: 3499,
            originalPrice: 6999,
            image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&q=80',
            instructor: 'Code Security Lab',
            rating: 4.7,
            students: 3210,
            description: 'Learn Python programming with focus on security tools, automation, and exploit development.',
            badge: 'POPULAR'
        },
        {
            id: 'C005',
            title: 'Network Security Fundamentals',
            category: 'hacking',
            level: 'beginner',
            duration: '30 hours',
            lessons: 36,
            modules: 6,
            price: 2999,
            originalPrice: 5999,
            image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80',
            instructor: 'Network Security Expert',
            rating: 4.6,
            students: 2650,
            description: 'Master networking fundamentals, TCP/IP, protocols, and network security architecture.',
            badge: 'NEW'
        },
        {
            id: 'C006',
            title: 'Digital Forensics & Incident Response',
            category: 'forensics',
            level: 'advanced',
            duration: '55 hours',
            lessons: 66,
            modules: 9,
            price: 7499,
            originalPrice: 13999,
            image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&q=80',
            instructor: 'Forensics Lead',
            rating: 4.8,
            students: 980,
            description: 'Complete digital forensics training covering disk, memory, network, and mobile forensics.',
            badge: 'ADVANCED'
        },
        {
            id: 'C007',
            title: 'Web Application Security',
            category: 'hacking',
            level: 'intermediate',
            duration: '45 hours',
            lessons: 54,
            modules: 8,
            price: 5499,
            originalPrice: 9999,
            image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80',
            instructor: 'Web Security Pro',
            rating: 4.9,
            students: 2180,
            description: 'Master OWASP Top 10, XSS, SQLi, CSRF, and advanced web exploitation techniques.',
            badge: 'BESTSELLER'
        },
        {
            id: 'C008',
            title: 'Linux for Hackers',
            category: 'programming',
            level: 'beginner',
            duration: '28 hours',
            lessons: 34,
            modules: 6,
            price: 2499,
            originalPrice: 4999,
            image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&q=80',
            instructor: 'Linux Expert',
            rating: 4.7,
            students: 3540,
            description: 'Complete Linux mastery for ethical hackers - commands, scripting, and system administration.',
            badge: 'POPULAR'
        },
        {
            id: 'C009',
            title: 'Bug Bounty Hunting Masterclass',
            category: 'hacking',
            level: 'intermediate',
            duration: '50 hours',
            lessons: 60,
            modules: 9,
            price: 6499,
            originalPrice: 11999,
            image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80',
            instructor: 'Bug Bounty Pro',
            rating: 4.9,
            students: 1870,
            description: 'Learn professional bug hunting with real-world targets, responsible disclosure, and earning strategies.',
            badge: 'TRENDING'
        },
        {
            id: 'C010',
            title: 'AI & Machine Learning for Security',
            category: 'ai',
            level: 'advanced',
            duration: '65 hours',
            lessons: 78,
            modules: 11,
            price: 9499,
            originalPrice: 17999,
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80',
            instructor: 'AI Security Lead',
            rating: 4.8,
            students: 890,
            description: 'Apply AI/ML to cybersecurity - threat detection, anomaly detection, and adversarial ML.',
            badge: 'NEW'
        },
        {
            id: 'C011',
            title: 'Cloud Security (AWS, Azure, GCP)',
            category: 'soc',
            level: 'intermediate',
            duration: '48 hours',
            lessons: 58,
            modules: 8,
            price: 6999,
            originalPrice: 12999,
            image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
            instructor: 'Cloud Security Expert',
            rating: 4.7,
            students: 1420,
            description: 'Secure cloud infrastructure across AWS, Azure, and Google Cloud platforms.',
            badge: 'PRO'
        },
        {
            id: 'C012',
            title: 'Malware Analysis & Reverse Engineering',
            category: 'forensics',
            level: 'advanced',
            duration: '70 hours',
            lessons: 84,
            modules: 12,
            price: 9999,
            originalPrice: 18999,
            image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=600&q=80',
            instructor: 'Malware Lab',
            rating: 4.9,
            students: 720,
            description: 'Analyze and reverse engineer malicious software using static and dynamic analysis techniques.',
            badge: 'ADVANCED'
        },
        {
            id: 'C013',
            title: 'Cryptography & Encryption',
            category: 'hacking',
            level: 'intermediate',
            duration: '32 hours',
            lessons: 38,
            modules: 6,
            price: 4499,
            originalPrice: 8999,
            image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&q=80',
            instructor: 'Crypto Expert',
            rating: 4.6,
            students: 1180,
            description: 'Master cryptographic principles, algorithms, and implementation in real-world systems.',
            badge: 'ESSENTIAL'
        },
        {
            id: 'C014',
            title: 'Mobile Application Security',
            category: 'hacking',
            level: 'intermediate',
            duration: '42 hours',
            lessons: 50,
            modules: 7,
            price: 5999,
            originalPrice: 10999,
            image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80',
            instructor: 'Mobile Security Lead',
            rating: 4.7,
            students: 1340,
            description: 'Secure Android and iOS applications - reverse engineering, vulnerability assessment, and hardening.',
            badge: 'HOT'
        },
        {
            id: 'C015',
            title: 'SIEM & Log Analysis',
            category: 'soc',
            level: 'intermediate',
            duration: '38 hours',
            lessons: 46,
            modules: 7,
            price: 5499,
            originalPrice: 9999,
            image: 'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=600&q=80',
            instructor: 'SOC Team',
            rating: 4.8,
            students: 1560,
            description: 'Master Splunk, ELK, QRadar, and Azure Sentinel for enterprise log analysis.',
            badge: 'TRENDING'
        },
        {
            id: 'C016',
            title: 'Wireless & IoT Security',
            category: 'hacking',
            level: 'intermediate',
            duration: '36 hours',
            lessons: 44,
            modules: 6,
            price: 4999,
            originalPrice: 9499,
            image: 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=600&q=80',
            instructor: 'IoT Security Expert',
            rating: 4.6,
            students: 980,
            description: 'Hack and secure WiFi, Bluetooth, Zigbee, and IoT devices with hands-on labs.',
            badge: 'NEW'
        },
        {
            id: 'C017',
            title: 'DevSecOps & Secure Coding',
            category: 'programming',
            level: 'intermediate',
            duration: '44 hours',
            lessons: 52,
            modules: 8,
            price: 6499,
            originalPrice: 11999,
            image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
            instructor: 'DevSecOps Lead',
            rating: 4.8,
            students: 1280,
            description: 'Integrate security into DevOps pipelines - SAST, DAST, SCA, and secure coding practices.',
            badge: 'PRO'
        },
        {
            id: 'C018',
            title: 'Threat Intelligence & Hunting',
            category: 'soc',
            level: 'advanced',
            duration: '52 hours',
            lessons: 62,
            modules: 9,
            price: 7999,
            originalPrice: 14999,
            image: 'https://images.unsplash.com/photo-1526378800651-c32d170fe6f8?w=600&q=80',
            instructor: 'Threat Intel Team',
            rating: 4.9,
            students: 840,
            description: 'Advanced threat hunting, intelligence gathering, MITRE ATT&CK framework mastery.',
            badge: 'ADVANCED'
        },
        {
            id: 'C019',
            title: 'Red Team Operations',
            category: 'hacking',
            level: 'advanced',
            duration: '75 hours',
            lessons: 90,
            modules: 12,
            price: 10999,
            originalPrice: 19999,
            image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&q=80',
            instructor: 'Red Team Lead',
            rating: 5.0,
            students: 620,
            description: 'Elite red team operations - adversary simulation, C2 frameworks, and evasion techniques.',
            badge: 'ELITE'
        },
        {
            id: 'C020',
            title: 'OSINT & Reconnaissance',
            category: 'hacking',
            level: 'beginner',
            duration: '26 hours',
            lessons: 32,
            modules: 5,
            price: 2999,
            originalPrice: 5999,
            image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&q=80',
            instructor: 'OSINT Expert',
            rating: 4.7,
            students: 2340,
            description: 'Master open-source intelligence gathering for ethical hacking and investigations.',
            badge: 'POPULAR'
        },
        {
            id: 'C021',
            title: 'JavaScript Security',
            category: 'programming',
            level: 'intermediate',
            duration: '34 hours',
            lessons: 40,
            modules: 6,
            price: 4499,
            originalPrice: 8999,
            image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&q=80',
            instructor: 'JS Security Pro',
            rating: 4.6,
            students: 1680,
            description: 'Secure JavaScript applications - XSS prevention, secure coding, and Node.js security.',
            badge: 'ESSENTIAL'
        },
        {
            id: 'C022',
            title: 'Active Directory Attacks & Defense',
            category: 'soc',
            level: 'advanced',
            duration: '58 hours',
            lessons: 70,
            modules: 10,
            price: 8499,
            originalPrice: 15999,
            image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
            instructor: 'AD Security Expert',
            rating: 4.9,
            students: 920,
            description: 'Attack and defend Active Directory - Kerberos, BloodHound, lateral movement.',
            badge: 'ADVANCED'
        },
        {
            id: 'C023',
            title: 'Blockchain & Web3 Security',
            category: 'hacking',
            level: 'advanced',
            duration: '46 hours',
            lessons: 56,
            modules: 8,
            price: 7999,
            originalPrice: 14999,
            image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&q=80',
            instructor: 'Web3 Security Lead',
            rating: 4.8,
            students: 580,
            description: 'Secure smart contracts, DeFi protocols, and blockchain infrastructure.',
            badge: 'NEW'
        },
        {
            id: 'C024',
            title: 'Golang for Security Engineers',
            category: 'programming',
            level: 'intermediate',
            duration: '38 hours',
            lessons: 46,
            modules: 7,
            price: 5499,
            originalPrice: 9999,
            image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
            instructor: 'Go Security Dev',
            rating: 4.7,
            students: 780,
            description: 'Build security tools with Go - scanners, proxies, and automation frameworks.',
            badge: 'PRO'
        },
        {
            id: 'C025',
            title: 'Social Engineering & Human Hacking',
            category: 'hacking',
            level: 'beginner',
            duration: '24 hours',
            lessons: 28,
            modules: 5,
            price: 3499,
            originalPrice: 6999,
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80',
            instructor: 'SE Expert',
            rating: 4.8,
            students: 1920,
            description: 'Master the art of social engineering - phishing, pretexting, and physical security.',
            badge: 'POPULAR'
        },
        {
            id: 'C026',
            title: 'Kubernetes & Container Security',
            category: 'soc',
            level: 'advanced',
            duration: '50 hours',
            lessons: 60,
            modules: 9,
            price: 7999,
            originalPrice: 14999,
            image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&q=80',
            instructor: 'K8s Security Lead',
            rating: 4.8,
            students: 680,
            description: 'Secure Kubernetes clusters, Docker containers, and container orchestration.',
            badge: 'ADVANCED'
        },
        {
            id: 'C027',
            title: 'Compliance & GRC',
            category: 'soc',
            level: 'intermediate',
            duration: '30 hours',
            lessons: 36,
            modules: 6,
            price: 4999,
            originalPrice: 9499,
            image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
            instructor: 'GRC Expert',
            rating: 4.5,
            students: 1140,
            description: 'Governance, Risk & Compliance - ISO 27001, SOC 2, GDPR, HIPAA, and PCI-DSS.',
            badge: 'ESSENTIAL'
        },
        {
            id: 'C028',
            title: 'AI-Powered Cyber Defence',
            category: 'ai',
            level: 'advanced',
            duration: '55 hours',
            lessons: 66,
            modules: 9,
            price: 8999,
            originalPrice: 16999,
            image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80',
            instructor: 'AI Defence Lead',
            rating: 4.9,
            students: 520,
            description: 'Build AI-powered defence systems - automated threat detection and response.',
            badge: 'ELITE'
        },
        {
            id: 'C029',
            title: 'CTF & Wargames Training',
            category: 'hacking',
            level: 'intermediate',
            duration: '40 hours',
            lessons: 48,
            modules: 7,
            price: 4999,
            originalPrice: 9499,
            image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&q=80',
            instructor: 'CTF Champion',
            rating: 4.9,
            students: 1480,
            description: 'Master Capture The Flag competitions - web, crypto, forensics, pwn, and reverse engineering.',
            badge: 'FUN'
        },
        {
            id: 'C030',
            title: 'Cyber Security Career Path',
            category: 'soc',
            level: 'beginner',
            duration: '20 hours',
            lessons: 24,
            modules: 4,
            price: 1999,
            originalPrice: 3999,
            image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80',
            instructor: 'Career Mentor',
            rating: 4.8,
            students: 4200,
            description: 'Launch your cybersecurity career - resume, interviews, certifications, and job strategies.',
            badge: 'START HERE'
        }
    ];

    // ============================================
    // 4. DEFAULT DATA
    // ============================================
    const DEFAULT_ANNOUNCEMENTS = [
        {
            id: 'A001',
            title: 'Welcome to Hacker Academy 2026',
            content: 'We are thrilled to launch the most advanced cybersecurity learning platform. Join 10,000+ students mastering ethical hacking, SOC analysis, and AI security.',
            type: 'info',
            author: 'Er. Priyanshu Sharma',
            date: '2026-07-20T10:00:00Z',
            pinned: true
        },
        {
            id: 'A002',
            title: 'New AI Tutor Powered by Gemini',
            content: 'Our AI tutor is now live! Ask anything about cybersecurity and get instant, expert-level answers 24/7.',
            type: 'info',
            author: 'AI Team',
            date: '2026-07-18T14:30:00Z',
            pinned: false
        },
        {
            id: 'A003',
            title: 'Critical: Server Maintenance Tonight',
            content: 'Scheduled maintenance from 2:00 AM to 4:00 AM IST. All services will be temporarily unavailable.',
            type: 'urgent',
            author: 'System Admin',
            date: '2026-07-25T18:00:00Z',
            pinned: true
        }
    ];

    const DEFAULT_TODAY_CLASS = {
        id: 'TC001',
        lessonTitle: 'Introduction to Ethical Hacking',
        courseName: 'Ethical Hacking Mastery',
        instructor: 'Er. Priyanshu Sharma',
        time: '10:00 AM',
        duration: '45 min',
        status: 'live',
        courseId: 'C001',
        lessonId: 'L001'
    };

    const DEFAULT_QUIZZES = [
        {
            id: 'Q001',
            title: 'Ethical Hacking Fundamentals',
            courseId: 'C001',
            duration: 15,
            questions: [
                {
                    id: 1,
                    text: 'What is the primary goal of ethical hacking?',
                    options: [
                        'To cause damage to systems',
                        'To identify and fix security vulnerabilities',
                        'To steal sensitive data',
                        'To create malware'
                    ],
                    correct: 1,
                    explanation: 'Ethical hackers identify vulnerabilities to help organizations fix them before malicious hackers exploit them.'
                },
                {
                    id: 2,
                    text: 'Which phase comes first in ethical hacking?',
                    options: ['Scanning', 'Gaining Access', 'Reconnaissance', 'Maintaining Access'],
                    correct: 2,
                    explanation: 'Reconnaissance (information gathering) is always the first phase of any ethical hacking engagement.'
                },
                {
                    id: 3,
                    text: 'What does OWASP stand for?',
                    options: [
                        'Open Web Application Security Project',
                        'Open Web Application Security Program',
                        'Organization for Web Application Security',
                        'Open Website Application Security Project'
                    ],
                    correct: 0,
                    explanation: 'OWASP stands for Open Web Application Security Project, a nonprofit foundation that works to improve software security.'
                },
                {
                    id: 4,
                    text: 'Which tool is commonly used for network scanning?',
                    options: ['Photoshop', 'Nmap', 'Microsoft Word', 'VLC Player'],
                    correct: 1,
                    explanation: 'Nmap (Network Mapper) is the industry-standard tool for network discovery and security auditing.'
                },
                {
                    id: 5,
                    text: 'What is a zero-day vulnerability?',
                    options: [
                        'A vulnerability that takes zero days to fix',
                        'A vulnerability unknown to the vendor',
                        'A vulnerability that appears on day zero of system installation',
                        'A vulnerability with no impact'
                    ],
                    correct: 1,
                    explanation: 'A zero-day vulnerability is a software vulnerability unknown to the vendor, meaning there are zero days to patch it before exploitation.'
                }
            ]
        }
    ];

    // ============================================
    // 5. PRIVATE HELPER FUNCTIONS
    // ============================================

    /**
     * Get data from localStorage
     * @param {string} key - Storage key
     * @returns {*} Parsed data or null
     */
    function _get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`[HA.Storage] Error reading ${key}:`, error);
            return null;
        }
    }

    /**
     * Set data to localStorage
     * @param {string} key - Storage key
     * @param {*} value - Data to store
     * @returns {boolean} Success status
     */
    function _set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`[HA.Storage] Error writing ${key}:`, error);
            return false;
        }
    }

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    function _remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`[HA.Storage] Error removing ${key}:`, error);
            return false;
        }
    }

    /**
     * Generate random 8-digit HABPS ID
     * Format: HABPS-XXXXXXXX (e.g., HABPS-48291037)
     * @returns {string} Unique HABPS ID
     */
    function _generateHABPSId() {
        const students = _get(KEYS.STUDENTS) || [];
        let id;
        let attempts = 0;
        
        do {
            // Generate 8 random digits
            const digits = Math.floor(10000000 + Math.random() * 90000000);
            id = `HABPS-${digits}`;
            attempts++;
            
            // Safety check to prevent infinite loop
            if (attempts > 100) {
                console.error('[HA.Storage] Could not generate unique HABPS ID');
                return `HABPS-${Date.now().toString().slice(-8)}`;
            }
        } while (students.some(s => s.habpsId === id));
        
        return id;
    }

    /**
     * Hash password (SHA-256 simulation)
     * Note: In production, use proper bcrypt/argon2 via backend
     * @param {string} password - Plain password
     * @returns {string} Hashed password
     */
    function _hashPassword(password) {
        // Simple hash for localStorage demo
        // In production, this would be done server-side with bcrypt
        const salt = 'HA_SALT_2026';
        let hash = 0;
        const str = salt + password;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        // Convert to hex-like string
        return 'ha_' + Math.abs(hash).toString(16).padStart(12, '0') + '_' + 
               btoa(password).slice(0, 8);
    }

    /**
     * Verify password against hash
     * @param {string} password - Plain password
     * @param {string} hash - Stored hash
     * @returns {boolean} Match status
     */
    function _verifyPassword(password, hash) {
        return _hashPassword(password) === hash;
    }

    /**
     * Get current timestamp in ISO format
     * @returns {string} ISO timestamp
     */
    function _timestamp() {
        return new Date().toISOString();
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Valid status
     */
    function _isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} Validation result
     */
    function _validatePassword(password) {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        const score = Object.values(checks).filter(Boolean).length;
        let strength = 'weak';
        
        if (score >= 5) strength = 'very-strong';
        else if (score >= 4) strength = 'strong';
        else if (score >= 3) strength = 'medium';
        
        return {
            valid: score >= 4,
            strength,
            score,
            checks
        };
    }

    /**
     * Generate unique ID
     * @param {string} prefix - ID prefix
     * @returns {string} Unique ID
     */
    function _generateId(prefix = 'ID') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    }

    // ============================================
    // 6. PUBLIC API
    // ============================================
    return {
        // Expose constants
        KEYS,

        /**
         * Initialize storage with default data
         * Called on first app load
         */
        init: function() {
            const initialized = _get(KEYS.INITIALIZED);
            
            if (!initialized) {
                console.log('[HA.Storage] First-time initialization...');
                this.seed();
                _set(KEYS.INITIALIZED, true);
                _set(KEYS.VERSION, '1.0.0');
                console.log('[HA.Storage] ✅ Initialization complete');
            } else {
                console.log('[HA.Storage] ✅ Storage already initialized');
            }
            
            return true;
        },

        /**
         * Seed storage with default data
         * Creates 30 courses, announcements, quizzes, etc.
         */
        seed: function() {
            console.log('[HA.Storage] Seeding default data...');
            
            // Seed courses
            _set(KEYS.COURSES, DEFAULT_COURSES);
            
            // Seed announcements
            _set(KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
            
            // Seed today's class
            _set(KEYS.TODAY_CLASS, DEFAULT_TODAY_CLASS);
            
            // Seed quizzes
            _set(KEYS.QUIZZES, DEFAULT_QUIZZES);
            
            // Initialize empty collections
            _set(KEYS.STUDENTS, []);
            _set(KEYS.CERTIFICATES, []);
            _set(KEYS.PROGRESS, {});
            _set(KEYS.QUIZ_ATTEMPTS, []);
            _set(KEYS.ACHIEVEMENTS, {});
            _set(KEYS.CONTACT_SUBMISSIONS, []);
            _set(KEYS.LEADERBOARD, []);
            
            // Default settings
            _set(KEYS.SETTINGS, {
                siteName: 'Hacker Academy',
                founder: 'Er. Priyanshu Sharma',
                maintenanceMode: false,
                registrationOpen: true,
                aiTutorEnabled: true
            });
            
            console.log('[HA.Storage] ✅ Default data seeded');
            return true;
        },

        /**
         * Reset all storage (admin function)
         */
        reset: function() {
            Object.values(KEYS).forEach(key => _remove(key));
            console.log('[HA.Storage] 🔄 Storage reset');
            return this.init();
        },

        // ============================================
        // AUTHENTICATION
        // ============================================

        /**
         * Register new student
         * @param {Object} data - Registration data
         * @returns {Object} Result with student or error
         */
        register: function(data) {
            // Validate required fields
            const required = ['fullName', 'email', 'password', 'whatsapp'];
            for (const field of required) {
                if (!data[field]) {
                    return { success: false, error: `Missing required field: ${field}` };
                }
            }
            
            // Validate email
            if (!_isValidEmail(data.email)) {
                return { success: false, error: 'Invalid email format' };
            }
            
            // Validate password
            const passwordCheck = _validatePassword(data.password);
            if (!passwordCheck.valid) {
                return { 
                    success: false, 
                    error: 'Password too weak',
                    details: passwordCheck 
                };
            }
            
            // Check password match
            if (data.password !== data.confirmPassword) {
                return { success: false, error: 'Passwords do not match' };
            }
            
            const students = _get(KEYS.STUDENTS) || [];
            
            // Check if email exists
            if (students.some(s => s.email.toLowerCase() === data.email.toLowerCase())) {
                return { success: false, error: 'Email already registered' };
            }
            
            // Generate HABPS ID
            const habpsId = _generateHABPSId();
            
            // Create student object
            const student = {
                id: _generateId('STU'),
                habpsId: habpsId,
                fullName: data.fullName,
                fatherName: data.fatherName || '',
                motherName: data.motherName || '',
                email: data.email.toLowerCase(),
                password: _hashPassword(data.password),
                whatsapp: data.whatsapp,
                lastEducation: data.lastEducation || '',
                country: data.country || '',
                state: data.state || '',
                city: data.city || '',
                address: data.address || '',
                photo: data.photo || null,
                termsAccepted: data.termsAccepted || false,
                role: 'student',
                tier: 'starter',
                status: 'active',
                enrolledCourses: [],
                completedLessons: [],
                quizScores: [],
                certificates: [],
                achievements: [],
                points: 0,
                joinedAt: _timestamp(),
                lastLogin: _timestamp()
            };
            
            students.push(student);
            _set(KEYS.STUDENTS, students);
            
            console.log(`[HA.Storage] ✅ Student registered: ${habpsId}`);
            
            return {
                success: true,
                student: {
                    ...student,
                    password: undefined // Don't return password
                },
                habpsId: habpsId
            };
        },

        /**
         * Login student
         * @param {Object} credentials - {email|habpsId, password}
         * @param {boolean} rememberMe - Remember login
         * @returns {Object} Result with user or error
         */
        login: function(credentials, rememberMe = false) {
            const students = _get(KEYS.STUDENTS) || [];
            const identifier = credentials.email || credentials.habpsId;
            
            if (!identifier || !credentials.password) {
                return { success: false, error: 'Email/HABPS ID and password required' };
            }
            
            // Find student by email or HABPS ID
            const student = students.find(s => 
                s.email.toLowerCase() === identifier.toLowerCase() ||
                s.habpsId === identifier
            );
            
            if (!student) {
                return { success: false, error: 'Account not found' };
            }
            
            if (student.status !== 'active') {
                return { success: false, error: 'Account is suspended' };
            }
            
            // Verify password
            if (!_verifyPassword(credentials.password, student.password)) {
                return { success: false, error: 'Invalid password' };
            }
            
            // Update last login
            student.lastLogin = _timestamp();
            const updatedStudents = students.map(s => s.id === student.id ? student : s);
            _set(KEYS.STUDENTS, updatedStudents);
            
            // Create session
            const session = {
                id: student.id,
                habpsId: student.habpsId,
                fullName: student.fullName,
                email: student.email,
                photo: student.photo,
                role: student.role,
                tier: student.tier,
                loginAt: _timestamp()
            };
            
            _set(KEYS.CURRENT_USER, session);
            
            if (rememberMe) {
                _set(KEYS.REMEMBER_ME, true);
            }
            
            console.log(`[HA.Storage] ✅ Login successful: ${student.habpsId}`);
            
            return {
                success: true,
                user: session
            };
        },

        /**
         * Logout current user
         */
        logout: function() {
            _remove(KEYS.CURRENT_USER);
            _remove(KEYS.REMEMBER_ME);
            console.log('[HA.Storage] ✅ Logged out');
            return true;
        },

        /**
         * Get current logged-in user
         * @returns {Object|null} Current user session
         */
        getCurrentUser: function() {
            return _get(KEYS.CURRENT_USER);
        },

        /**
         * Admin login
         * @param {Object} credentials - {username|email, password}
         * @returns {Object} Result
         */
        adminLogin: function(credentials) {
            const identifier = credentials.username || credentials.email;
            
            if (identifier === DEFAULT_ADMIN.username || 
                identifier === DEFAULT_ADMIN.email) {
                
                if (_verifyPassword(credentials.password, DEFAULT_ADMIN.password)) {
                    const session = {
                        id: DEFAULT_ADMIN.id,
                        name: DEFAULT_ADMIN.name,
                        role: DEFAULT_ADMIN.role,
                        loginAt: _timestamp()
                    };
                    
                    _set(KEYS.ADMIN_SESSION, session);
                    console.log('[HA.Storage] ✅ Admin login successful');
                    
                    return { success: true, user: session };
                }
            }
            
            return { success: false, error: 'Invalid admin credentials' };
        },

        /**
         * Admin logout
         */
        adminLogout: function() {
            _remove(KEYS.ADMIN_SESSION);
            return true;
        },

        /**
         * Get current admin session
         */
        getAdminSession: function() {
            return _get(KEYS.ADMIN_SESSION);
        },

        // ============================================
        // STUDENTS MANAGEMENT
        // ============================================

        /**
         * Get all students
         * @returns {Array} List of students
         */
        getStudents: function() {
            return _get(KEYS.STUDENTS) || [];
        },

        /**
         * Get student by ID
         * @param {string} id - Student ID or HABPS ID
         * @returns {Object|null} Student object
         */
        getStudent: function(id) {
            const students = _get(KEYS.STUDENTS) || [];
            return students.find(s => s.id === id || s.habpsId === id) || null;
        },

        /**
         * Update student
         * @param {string} id - Student ID
         * @param {Object} data - Updated data
         * @returns {Object} Result
         */
        updateStudent: function(id, data) {
            const students = _get(KEYS.STUDENTS) || [];
            const index = students.findIndex(s => s.id === id || s.habpsId === id);
            
            if (index === -1) {
                return { success: false, error: 'Student not found' };
            }
            
            // Don't allow password update through this method
            delete data.password;
            delete data.id;
            delete data.habpsId;
            
            students[index] = { ...students[index], ...data, updatedAt: _timestamp() };
            _set(KEYS.STUDENTS, students);
            
            return { success: true, student: students[index] };
        },

        /**
         * Delete student
         * @param {string} id - Student ID
         * @returns {Object} Result
         */
        deleteStudent: function(id) {
            let students = _get(KEYS.STUDENTS) || [];
            const initialLength = students.length;
            students = students.filter(s => s.id !== id && s.habpsId !== id);
            
            if (students.length === initialLength) {
                return { success: false, error: 'Student not found' };
            }
            
            _set(KEYS.STUDENTS, students);
            return { success: true };
        },

        /**
         * Change password
         * @param {string} userId - User ID
         * @param {string} oldPassword - Current password
         * @param {string} newPassword - New password
         * @returns {Object} Result
         */
        changePassword: function(userId, oldPassword, newPassword) {
            const students = _get(KEYS.STUDENTS) || [];
            const index = students.findIndex(s => s.id === userId);
            
            if (index === -1) {
                return { success: false, error: 'User not found' };
            }
            
            if (!_verifyPassword(oldPassword, students[index].password)) {
                return { success: false, error: 'Current password is incorrect' };
            }
            
            const passwordCheck = _validatePassword(newPassword);
            if (!passwordCheck.valid) {
                return { success: false, error: 'New password too weak' };
            }
            
            students[index].password = _hashPassword(newPassword);
            _set(KEYS.STUDENTS, students);
            
            return { success: true };
        },

        // ============================================
        // COURSES
        // ============================================

        /**
         * Get all courses
         * @returns {Array} List of courses
         */
        getCourses: function() {
            return _get(KEYS.COURSES) || [];
        },

        /**
         * Get course by ID
         * @param {string} id - Course ID
         * @returns {Object|null} Course object
         */
        getCourse: function(id) {
            const courses = _get(KEYS.COURSES) || [];
            return courses.find(c => c.id === id) || null;
        },

        /**
         * Create new course (admin)
         * @param {Object} data - Course data
         * @returns {Object} Result
         */
        createCourse: function(data) {
            const courses = _get(KEYS.COURSES) || [];
            const course = {
                id: _generateId('C'),
                ...data,
                createdAt: _timestamp(),
                students: 0,
                rating: 0
            };
            
            courses.push(course);
            _set(KEYS.COURSES, courses);
            
            return { success: true, course };
        },

        /**
         * Update course (admin)
         */
        updateCourse: function(id, data) {
            const courses = _get(KEYS.COURSES) || [];
            const index = courses.findIndex(c => c.id === id);
            
            if (index === -1) return { success: false, error: 'Course not found' };
            
            courses[index] = { ...courses[index], ...data, updatedAt: _timestamp() };
            _set(KEYS.COURSES, courses);
            
            return { success: true, course: courses[index] };
        },

        /**
         * Delete course (admin)
         */
        deleteCourse: function(id) {
            let courses = _get(KEYS.COURSES) || [];
            courses = courses.filter(c => c.id !== id);
            _set(KEYS.COURSES, courses);
            return { success: true };
        },

        // ============================================
        // PROGRESS TRACKING
        // ============================================

        /**
         * Get user progress
         * @param {string} userId - User ID
         * @returns {Object} Progress data
         */
        getProgress: function(userId) {
            const allProgress = _get(KEYS.PROGRESS) || {};
            return allProgress[userId] || {
                completedLessons: [],
                quizScores: {},
                courseProgress: {},
                totalPoints: 0
            };
        },

        /**
         * Mark lesson as complete
         * @param {string} userId - User ID
         * @param {string} courseId - Course ID
         * @param {string} lessonId - Lesson ID
         * @returns {Object} Result
         */
        markLessonComplete: function(userId, courseId, lessonId) {
            const allProgress = _get(KEYS.PROGRESS) || {};
            const userProgress = allProgress[userId] || {
                completedLessons: [],
                quizScores: {},
                courseProgress: {},
                totalPoints: 0
            };
            
            const lessonKey = `${courseId}:${lessonId}`;
            
            if (!userProgress.completedLessons.includes(lessonKey)) {
                userProgress.completedLessons.push(lessonKey);
                userProgress.totalPoints += 10;
                
                // Update course progress
                if (!userProgress.courseProgress[courseId]) {
                    userProgress.courseProgress[courseId] = {
                        completed: 0,
                        total: 0,
                        percentage: 0
                    };
                }
                userProgress.courseProgress[courseId].completed++;
                
                allProgress[userId] = userProgress;
                _set(KEYS.PROGRESS, allProgress);
                
                return { success: true, progress: userProgress };
            }
            
            return { success: true, progress: userProgress, message: 'Already completed' };
        },

        /**
         * Enroll student in course
         */
        enrollInCourse: function(userId, courseId) {
            const students = _get(KEYS.STUDENTS) || [];
            const index = students.findIndex(s => s.id === userId);
            
            if (index === -1) return { success: false, error: 'Student not found' };
            
            if (!students[index].enrolledCourses.includes(courseId)) {
                students[index].enrolledCourses.push(courseId);
                _set(KEYS.STUDENTS, students);
            }
            
            return { success: true };
        },

        // ============================================
        // QUIZZES
        // ============================================

        /**
         * Get all quizzes
         */
        getQuizzes: function() {
            return _get(KEYS.QUIZZES) || [];
        },

        /**
         * Get quiz by ID
         */
        getQuiz: function(id) {
            const quizzes = _get(KEYS.QUIZZES) || [];
            return quizzes.find(q => q.id === id) || null;
        },

        /**
         * Submit quiz attempt
         * @param {string} userId - User ID
         * @param {string} quizId - Quiz ID
         * @param {Array} answers - User answers
         * @param {number} timeTaken - Time in seconds
         * @returns {Object} Result with score
         */
        submitQuiz: function(userId, quizId, answers, timeTaken) {
            const quiz = this.getQuiz(quizId);
            if (!quiz) return { success: false, error: 'Quiz not found' };
            
            let correct = 0;
            const results = quiz.questions.map((q, i) => {
                const userAnswer = answers[i];
                const isCorrect = userAnswer === q.correct;
                if (isCorrect) correct++;
                
                return {
                    questionId: q.id,
                    userAnswer,
                    correctAnswer: q.correct,
                    isCorrect
                };
            });
            
            const score = Math.round((correct / quiz.questions.length) * 100);
            const passed = score >= 70;
            
            // Save attempt
            const attempts = _get(KEYS.QUIZ_ATTEMPTS) || [];
            const attempt = {
                id: _generateId('QA'),
                userId,
                quizId,
                answers,
                results,
                correct,
                total: quiz.questions.length,
                score,
                passed,
                timeTaken,
                attemptedAt: _timestamp()
            };
            
            attempts.push(attempt);
            _set(KEYS.QUIZ_ATTEMPTS, attempts);
            
            // Update user progress
            const allProgress = _get(KEYS.PROGRESS) || {};
            const userProgress = allProgress[userId] || {
                completedLessons: [],
                quizScores: {},
                courseProgress: {},
                totalPoints: 0
            };
            
            userProgress.quizScores[quizId] = {
                score,
                passed,
                attempts: (userProgress.quizScores[quizId]?.attempts || 0) + 1,
                bestScore: Math.max(score, userProgress.quizScores[quizId]?.bestScore || 0)
            };
            
            if (passed) {
                userProgress.totalPoints += 50;
            }
            
            allProgress[userId] = userProgress;
            _set(KEYS.PROGRESS, allProgress);
            
            return {
                success: true,
                attempt,
                score,
                passed,
                correct,
                total: quiz.questions.length
            };
        },

        /**
         * Get user quiz attempts
         */
        getUserQuizAttempts: function(userId) {
            const attempts = _get(KEYS.QUIZ_ATTEMPTS) || [];
            return attempts.filter(a => a.userId === userId);
        },

        // ============================================
        // CERTIFICATES
        // ============================================

        /**
         * Get user certificates
         */
        getCertificates: function(userId) {
            const certs = _get(KEYS.CERTIFICATES) || [];
            return userId ? certs.filter(c => c.userId === userId) : certs;
        },

        /**
         * Issue certificate
         * @param {string} userId - User ID
         * @param {string} courseId - Course ID
         * @returns {Object} Certificate
         */
        issueCertificate: function(userId, courseId) {
            const student = this.getStudent(userId);
            const course = this.getCourse(courseId);
            
            if (!student || !course) {
                return { success: false, error: 'Student or course not found' };
            }
            
            const certId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            
            const certificate = {
                id: certId,
                userId,
                courseId,
                studentName: student.fullName,
                habpsId: student.habpsId,
                courseName: course.title,
                issuedAt: _timestamp(),
                issuedBy: 'Er. Priyanshu Sharma',
                verified: true
            };
            
            const certs = _get(KEYS.CERTIFICATES) || [];
            certs.push(certificate);
            _set(KEYS.CERTIFICATES, certs);
            
            return { success: true, certificate };
        },

        /**
         * Verify certificate
         */
        verifyCertificate: function(certId) {
            const certs = _get(KEYS.CERTIFICATES) || [];
            return certs.find(c => c.id === certId) || null;
        },

        // ============================================
        // ANNOUNCEMENTS
        // ============================================

        /**
         * Get all announcements
         */
        getAnnouncements: function() {
            return _get(KEYS.ANNOUNCEMENTS) || [];
        },

        /**
         * Create announcement (admin)
         */
        createAnnouncement: function(data) {
            const announcements = _get(KEYS.ANNOUNCEMENTS) || [];
            const announcement = {
                id: _generateId('A'),
                ...data,
                date: _timestamp(),
                pinned: data.pinned || false
            };
            
            announcements.unshift(announcement);
            _set(KEYS.ANNOUNCEMENTS, announcements);
            
            return { success: true, announcement };
        },

        /**
         * Delete announcement
         */
        deleteAnnouncement: function(id) {
            let announcements = _get(KEYS.ANNOUNCEMENTS) || [];
            announcements = announcements.filter(a => a.id !== id);
            _set(KEYS.ANNOUNCEMENTS, announcements);
            return { success: true };
        },

        // ============================================
        // TODAY'S CLASS
        // ============================================

        /**
         * Get today's class
         */
        getTodayClass: function() {
            return _get(KEYS.TODAY_CLASS) || DEFAULT_TODAY_CLASS;
        },

        /**
         * Update today's class (admin)
         */
        updateTodayClass: function(data) {
            _set(KEYS.TODAY_CLASS, { ...data, updatedAt: _timestamp() });
            return { success: true };
        },

        // ============================================
        // CONTACT FORM
        // ============================================

        /**
         * Submit contact form
         */
        submitContact: function(data) {
            const contacts = _get(KEYS.CONTACT_SUBMISSIONS) || [];
            const submission = {
                id: _generateId('CT'),
                ...data,
                status: 'new',
                submittedAt: _timestamp()
            };
            
            contacts.push(submission);
            _set(KEYS.CONTACT_SUBMISSIONS, contacts);
            
            return { success: true, submission };
        },

        /**
         * Get all contact submissions (admin)
         */
        getContacts: function() {
            return _get(KEYS.CONTACT_SUBMISSIONS) || [];
        },

        // ============================================
        // LEADERBOARD
        // ============================================

        /**
         * Get leaderboard
         */
        getLeaderboard: function() {
            const students = _get(KEYS.STUDENTS) || [];
            const progress = _get(KEYS.PROGRESS) || {};
            
            return students
                .map(s => ({
                    id: s.id,
                    name: s.fullName,
                    habpsId: s.habpsId,
                    photo: s.photo,
                    tier: s.tier,
                    points: progress[s.id]?.totalPoints || 0
                }))
                .sort((a, b) => b.points - a.points)
                .slice(0, 50);
        },

        // ============================================
        // SETTINGS
        // ============================================

        /**
         * Get settings
         */
        getSettings: function() {
            return _get(KEYS.SETTINGS) || {};
        },

        /**
         * Update settings (admin)
         */
        updateSettings: function(data) {
            const current = _get(KEYS.SETTINGS) || {};
            _set(KEYS.SETTINGS, { ...current, ...data, updatedAt: _timestamp() });
            return { success: true };
        },

        // ============================================
        // UTILITIES
        // ============================================

        /**
         * Generate HABPS ID (public)
         */
        generateHABPSId: _generateHABPSId,

        /**
         * Hash password (public)
         */
        hashPassword: _hashPassword,

        /**
         * Validate password (public)
         */
        validatePassword: _validatePassword,

        /**
         * Get storage stats
         */
        getStats: function() {
            const students = _get(KEYS.STUDENTS) || [];
            const courses = _get(KEYS.COURSES) || [];
            const certs = _get(KEYS.CERTIFICATES) || [];
            const quizzes = _get(KEYS.QUIZZES) || [];
            
            return {
                students: students.length,
                courses: courses.length,
                certificates: certs.length,
                quizzes: quizzes.length,
                storageUsed: Object.keys(localStorage).length + ' keys'
            };
        },

        /**
         * Export all data (admin backup)
         */
        exportData: function() {
            const data = {};
            Object.values(KEYS).forEach(key => {
                data[key] = _get(key);
            });
            return data;
        },

        /**
         * Import data (admin restore)
         */
        importData: function(data) {
            Object.entries(data).forEach(([key, value]) => {
                _set(key, value);
            });
            return { success: true };
        }
    };
})();

// ============================================
// AUTO-INITIALIZE ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    HA.Storage.init();
    console.log('[HA] Storage layer ready');
    console.log('[HA] Founder: Er. Priyanshu Sharma');
    console.log('[HA] Default admin: admin / Admin@2026');
});

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HA.Storage;
}