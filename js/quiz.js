v/**
 * ============================================
 * HACKER ACADEMY — QUIZ CONTROLLER
 * Premium Cyberpunk Quiz & Assessment System
 * ============================================
 * 
 * Founded & Owned by Er. Priyanshu Sharma
 * File: js/quiz.js
 * Version: 1.0.0
 * 
 * ARCHITECTURE:
 * - Namespace: HA.Quiz
 * - Pattern: Module (IIFE)
 * - Dependencies: HA.Storage, HA.Utils
 * - Target Page: quiz.html
 * 
 * FEATURES:
 * • Authentication check (redirect if not logged in)
 * • Quiz loading from storage
 * • Question-by-question navigation
 * • Answer selection with visual feedback
 * • Countdown timer with color states
 * • Progress tracking (question X of Y)
 * • Question navigation panel (jump to any question)
 * • Auto-save answers
 * • Quiz submission with confirmation
 * • Score calculation
 * • Result screen with analytics
 * • Answer review with explanations
 * • Points awarding (50 for pass)
 * • Retry functionality
 * • Keyboard shortcuts (1-4 for answers, ← → navigation)
 * • Loading screen
 * ============================================
 */

// Initialize namespace
window.HA = window.HA || {};

/**
 * HA.Quiz Module
 * Quiz system controller
 */
HA.Quiz = (function() {
    'use strict';

    // ============================================
    // 1. PRIVATE STATE
    // ============================================
    let currentUser = null;
    let currentQuiz = null;
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let timerInterval = null;
    let timeRemaining = 0;
    let quizStartTime = null;
    let quizSubmitted = false;

    // ============================================
    // 2. DOM REFERENCES
    // ============================================
    const DOM = {
        loader: null,
        
        // Quiz Container
        quizContainer: null,
        
        // Header
        quizTitle: null,
        quizSubtitle: null,
        questionCounter: null,
        timerDisplay: null,
        timerIcon: null,
        progressBar: null,
        progressText: null,
        
        // Question
        questionCard: null,
        questionNumber: null,
        questionText: null,
        questionHint: null,
        optionsContainer: null,
        
        // Navigation
        prevBtn: null,
        nextBtn: null,
        submitBtn: null,
        
        // Question Nav Panel
        navPanel: null,
        navGrid: null,
        
        // Result Screen
        resultScreen: null,
        resultIcon: null,
        resultTitle: null,
        resultSubtitle: null,
        scoreValue: null,
        correctValue: null,
        totalValue: null,
        timeValue: null,
        analyticsGrid: null,
        reviewSection: null,
        reviewList: null,
        retryBtn: null,
        backBtn: null
    };

    // ============================================
    // 3. INITIALIZATION
    // ============================================

    /**
     * Cache DOM references
     */
    function _cacheDOM() {
        DOM.loader = document.getElementById('haLoader');
        
        // Quiz Container
        DOM.quizContainer = document.querySelector('.quiz-container');
        
        // Header
        DOM.quizTitle = document.getElementById('quizTitle');
        DOM.quizSubtitle = document.getElementById('quizSubtitle');
        DOM.questionCounter = document.getElementById('questionCounter');
        DOM.timerDisplay = document.getElementById('timerDisplay');
        DOM.timerIcon = document.getElementById('timerIcon');
        DOM.progressBar = document.getElementById('quizProgressBar');
        DOM.progressText = document.getElementById('quizProgressText');
        
        // Question
        DOM.questionCard = document.querySelector('.quiz-question-card');
        DOM.questionNumber = document.getElementById('questionNumber');
        DOM.questionText = document.getElementById('questionText');
        DOM.questionHint = document.getElementById('questionHint');
        DOM.optionsContainer = document.getElementById('optionsContainer');
        
        // Navigation
        DOM.prevBtn = document.getElementById('prevBtn');
        DOM.nextBtn = document.getElementById('nextBtn');
        DOM.submitBtn = document.getElementById('submitBtn');
        
        // Question Nav Panel
        DOM.navPanel = document.querySelector('.quiz-nav-panel');
        DOM.navGrid = document.getElementById('navGrid');
        
        // Result Screen
        DOM.resultScreen = document.querySelector('.quiz-result');
        DOM.resultIcon = document.querySelector('.quiz-result-icon');
        DOM.resultTitle = document.querySelector('.quiz-result-title');
        DOM.resultSubtitle = document.querySelector('.quiz-result-subtitle');
        DOM.scoreValue = document.getElementById('scoreValue');
        DOM.correctValue = document.getElementById('correctValue');
        DOM.totalValue = document.getElementById('totalValue');
        DOM.timeValue = document.getElementById('timeValue');
        DOM.analyticsGrid = document.getElementById('analyticsGrid');
        DOM.reviewSection = document.querySelector('.quiz-review');
        DOM.reviewList = document.getElementById('reviewList');
        DOM.retryBtn = document.getElementById('retryBtn');
        DOM.backBtn = document.getElementById('backBtn');
        
        console.log('[HA.Quiz] ✅ DOM references cached');
    }

    /**
     * Check authentication
     */
    function _checkAuth() {
        currentUser = HA.Storage.getCurrentUser();
        
        if (!currentUser) {
            console.warn('[HA.Quiz] User not logged in, redirecting...');
            
            HA.Utils.toast({
                type: 'warning',
                title: 'Login Required',
                message: 'Please login to take quizzes',
                duration: 3000
            });
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            
            return false;
        }
        
        console.log('[HA.Quiz] ✅ User authenticated:', currentUser.habpsId);
        return true;
    }

    /**
     * Load quiz data
     */
    function _loadQuiz() {
        const quizId = HA.Utils.getURLParam('id') || 'Q001';
        
        currentQuiz = HA.Storage.getQuiz(quizId);
        
        if (!currentQuiz) {
            HA.Utils.toast({
                type: 'error',
                title: 'Quiz Not Found',
                message: 'The requested quiz does not exist',
                duration: 3000
            });
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
            
            return false;
        }
        
        // Initialize answers array
        userAnswers = new Array(currentQuiz.questions.length).fill(null);
        
        // Set timer
        timeRemaining = currentQuiz.duration * 60; // Convert minutes to seconds
        
        console.log('[HA.Quiz] ✅ Quiz loaded:', {
            id: currentQuiz.id,
            title: currentQuiz.title,
            questions: currentQuiz.questions.length,
            duration: currentQuiz.duration + ' min'
        });
        
        return true;
    }

    // ============================================
    // 4. QUIZ HEADER
    // ============================================

    /**
     * Render quiz header
     */
    function _renderQuizHeader() {
        if (DOM.quizTitle) {
            DOM.quizTitle.textContent = currentQuiz.title;
        }
        
        if (DOM.quizSubtitle) {
            const course = HA.Storage.getCourse(currentQuiz.courseId);
            const courseName = course ? course.title : 'Cyber Security';
            DOM.quizSubtitle.textContent = `${courseName} • ${currentQuiz.questions.length} Questions • ${currentQuiz.duration} Minutes`;
        }
        
        _updateQuestionCounter();
        _updateProgressBar();
    }

    /**
     * Update question counter
     */
    function _updateQuestionCounter() {
        if (DOM.questionCounter) {
            DOM.questionCounter.innerHTML = `
                <i class="fas fa-question-circle"></i>
                Question ${currentQuestionIndex + 1} of ${currentQuiz.questions.length}
            `;
        }
    }

    /**
     * Update progress bar
     */
    function _updateProgressBar() {
        const answered = userAnswers.filter(a => a !== null).length;
        const percent = Math.round((answered / currentQuiz.questions.length) * 100);
        
        if (DOM.progressBar) {
            DOM.progressBar.style.width = `${percent}%`;
        }
        
        if (DOM.progressText) {
            DOM.progressText.textContent = `${answered}/${currentQuiz.questions.length} Answered`;
        }
    }

    // ============================================
    // 5. TIMER
    // ============================================

    /**
     * Initialize timer
     */
    function _initTimer() {
        quizStartTime = Date.now();
        _updateTimerDisplay();
        
        timerInterval = setInterval(() => {
            timeRemaining--;
            _updateTimerDisplay();
            
            if (timeRemaining <= 0) {
                _handleTimeUp();
            }
        }, 1000);
        
        console.log('[HA.Quiz] ✅ Timer started');
    }

    /**
     * Update timer display
     */
    function _updateTimerDisplay() {
        if (!DOM.timerDisplay) return;
        
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        DOM.timerDisplay.textContent = display;
        
        // Update color based on time remaining
        const totalTime = currentQuiz.duration * 60;
        const percentRemaining = timeRemaining / totalTime;
        
        if (DOM.timerIcon) {
            DOM.timerIcon.className = 'fas fa-clock';
        }
        
        if (percentRemaining <= 0.1) {
            // Critical - less than 10%
            DOM.timerDisplay.className = 'quiz-stat-value danger';
            if (DOM.timerIcon) {
                DOM.timerIcon.parentElement.className = 'quiz-stat-icon danger';
            }
        } else if (percentRemaining <= 0.25) {
            // Warning - less than 25%
            DOM.timerDisplay.className = 'quiz-stat-value warning';
            if (DOM.timerIcon) {
                DOM.timerIcon.parentElement.className = 'quiz-stat-icon warning';
            }
        } else {
            // Normal
            DOM.timerDisplay.className = 'quiz-stat-value timer';
            if (DOM.timerIcon) {
                DOM.timerIcon.parentElement.className = 'quiz-stat-icon timer';
            }
        }
    }

    /**
     * Handle time up
     */
    function _handleTimeUp() {
        clearInterval(timerInterval);
        
        HA.Utils.toast({
            type: 'warning',
            title: 'Time\'s Up!',
            message: 'Submitting your quiz automatically...',
            duration: 3000
        });
        
        setTimeout(() => {
            _submitQuiz();
        }, 2000);
    }

    // ============================================
    // 6. QUESTION RENDERING
    // ============================================

    /**
     * Render current question
     */
    function _renderQuestion() {
        const question = currentQuiz.questions[currentQuestionIndex];
        
        // Update question number
        if (DOM.questionNumber) {
            DOM.questionNumber.innerHTML = `
                <i class="fas fa-hashtag"></i>
                Question ${currentQuestionIndex + 1}
            `;
        }
        
        // Update question text
        if (DOM.questionText) {
            DOM.questionText.textContent = question.text;
        }
        
        // Update hint (if exists)
        if (DOM.questionHint) {
            if (question.hint) {
                DOM.questionHint.style.display = 'flex';
                DOM.questionHint.innerHTML = `
                    <i class="fas fa-lightbulb"></i>
                    <p>${question.hint}</p>
                `;
            } else {
                DOM.questionHint.style.display = 'none';
            }
        }
        
        // Render options
        _renderOptions(question);
        
        // Update navigation buttons
        _updateNavigationButtons();
        
        // Update question nav panel
        _renderQuestionNavPanel();
        
        // Animate question card
        if (DOM.questionCard) {
            DOM.questionCard.style.animation = 'none';
            DOM.questionCard.offsetHeight; // Trigger reflow
            DOM.questionCard.style.animation = 'fadeInUp 0.5s ease';
        }
    }

    /**
     * Render answer options
     */
    function _renderOptions(question) {
        if (!DOM.optionsContainer) return;
        
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        const selectedAnswer = userAnswers[currentQuestionIndex];
        
        const html = question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const selectedClass = isSelected ? 'selected' : '';
            
            return `
                <div class="quiz-option ${selectedClass}" data-option-index="${index}">
                    <div class="quiz-option-letter">${letters[index]}</div>
                    <div class="quiz-option-text">${option}</div>
                    <div class="quiz-option-icon">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
            `;
        }).join('');
        
        DOM.optionsContainer.innerHTML = html;
        
        // Add click handlers
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', () => {
                const index = parseInt(option.dataset.optionIndex);
                _selectAnswer(index);
            });
        });
    }

    /**
     * Select answer
     */
    function _selectAnswer(index) {
        userAnswers[currentQuestionIndex] = index;
        
        // Update UI
        document.querySelectorAll('.quiz-option').forEach((option, i) => {
            option.classList.toggle('selected', i === index);
        });
        
        // Update progress
        _updateProgressBar();
        _renderQuestionNavPanel();
        
        // Auto-advance after short delay (optional)
        // setTimeout(() => {
        //     if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        //         _nextQuestion();
        //     }
        // }, 500);
    }

    // ============================================
    // 7. NAVIGATION
    // ============================================

    /**
     * Update navigation buttons
     */
    function _updateNavigationButtons() {
        // Previous button
        if (DOM.prevBtn) {
            DOM.prevBtn.disabled = currentQuestionIndex === 0;
        }
        
        // Next/Submit button
        const isLastQuestion = currentQuestionIndex === currentQuiz.questions.length - 1;
        
        if (DOM.nextBtn && DOM.submitBtn) {
            if (isLastQuestion) {
                DOM.nextBtn.style.display = 'none';
                DOM.submitBtn.style.display = 'inline-flex';
            } else {
                DOM.nextBtn.style.display = 'inline-flex';
                DOM.submitBtn.style.display = 'none';
            }
        }
    }

    /**
     * Next question
     */
    function _nextQuestion() {
        if (currentQuestionIndex < currentQuiz.questions.length - 1) {
            currentQuestionIndex++;
            _renderQuestion();
        }
    }

    /**
     * Previous question
     */
    function _prevQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            _renderQuestion();
        }
    }

    /**
     * Go to specific question
     */
    function _goToQuestion(index) {
        if (index >= 0 && index < currentQuiz.questions.length) {
            currentQuestionIndex = index;
            _renderQuestion();
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    /**
     * Initialize navigation buttons
     */
    function _initNavigation() {
        if (DOM.prevBtn) {
            DOM.prevBtn.addEventListener('click', _prevQuestion);
        }
        
        if (DOM.nextBtn) {
            DOM.nextBtn.addEventListener('click', _nextQuestion);
        }
        
        if (DOM.submitBtn) {
            DOM.submitBtn.addEventListener('click', _handleSubmitClick);
        }
    }

    // ============================================
    // 8. QUESTION NAVIGATION PANEL
    // ============================================

    /**
     * Render question navigation panel
     */
    function _renderQuestionNavPanel() {
        if (!DOM.navGrid) return;
        
        const html = currentQuiz.questions.map((_, index) => {
            const isAnswered = userAnswers[index] !== null;
            const isCurrent = index === currentQuestionIndex;
            
            let stateClass = '';
            if (isCurrent) stateClass = 'current';
            else if (isAnswered) stateClass = 'answered';
            
            return `
                <div class="quiz-nav-item ${stateClass}" data-question-index="${index}">
                    ${index + 1}
                </div>
            `;
        }).join('');
        
        DOM.navGrid.innerHTML = html;
        
        // Add click handlers
        document.querySelectorAll('.quiz-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.questionIndex);
                _goToQuestion(index);
            });
        });
    }

    // ============================================
    // 9. SUBMISSION
    // ============================================

    /**
     * Handle submit button click
     */
    async function _handleSubmitClick() {
        const unanswered = userAnswers.filter(a => a === null).length;
        
        let confirmMessage = 'Are you sure you want to submit the quiz?';
        if (unanswered > 0) {
            confirmMessage = `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`;
        }
        
        const confirmed = await HA.Utils.confirm({
            title: 'Submit Quiz',
            message: confirmMessage,
            confirmText: 'Submit',
            cancelText: 'Review',
            type: 'warning'
        });
        
        if (confirmed) {
            _submitQuiz();
        }
    }

    /**
     * Submit quiz
     */
    function _submitQuiz() {
        if (quizSubmitted) return;
        quizSubmitted = true;
        
        // Stop timer
        clearInterval(timerInterval);
        
        // Calculate time taken
        const timeTaken = Math.round((Date.now() - quizStartTime) / 1000);
        
        // Submit to storage
        const result = HA.Storage.submitQuiz(
            currentUser.id,
            currentQuiz.id,
            userAnswers,
            timeTaken
        );
        
        if (result.success) {
            _showResults(result);
        } else {
            HA.Utils.toast({
                type: 'error',
                title: 'Submission Failed',
                message: result.error || 'Could not submit quiz',
                duration: 3000
            });
        }
    }

    // ============================================
    // 10. RESULTS
    // ============================================

    /**
     * Show results screen
     */
    function _showResults(result) {
        // Hide quiz container
        if (DOM.quizContainer) {
            DOM.quizContainer.style.display = 'none';
        }
        
        // Show result screen
        if (DOM.resultScreen) {
            DOM.resultScreen.classList.add('active');
        }
        
        // Determine result category
        let resultClass = 'average';
        let resultIcon = 'fa-meh';
        let resultTitle = 'Good Effort!';
        let resultMessage = 'Keep practicing to improve your score.';
        
        if (result.score >= 90) {
            resultClass = 'excellent';
            resultIcon = 'fa-trophy';
            resultTitle = 'Outstanding!';
            resultMessage = 'You\'ve mastered this topic. Excellent work!';
        } else if (result.score >= 70) {
            resultClass = 'good';
            resultIcon = 'fa-smile';
            resultTitle = 'Great Job!';
            resultMessage = 'You passed the quiz. Well done!';
        } else if (result.score >= 50) {
            resultClass = 'average';
            resultIcon = 'fa-meh';
            resultTitle = 'Good Effort!';
            resultMessage = 'You\'re on the right track. Keep practicing!';
        } else {
            resultClass = 'poor';
            resultIcon = 'fa-frown';
            resultTitle = 'Keep Trying!';
            resultMessage = 'Review the material and try again. You can do it!';
        }
        
        // Update result display
        if (DOM.resultIcon) {
            DOM.resultIcon.className = `quiz-result-icon ${resultClass}`;
            DOM.resultIcon.innerHTML = `<i class="fas ${resultIcon}"></i>`;
        }
        
        if (DOM.resultTitle) {
            DOM.resultTitle.innerHTML = `${resultTitle} <span class="accent">${result.score}%</span>`;
        }
        
        if (DOM.resultSubtitle) {
            DOM.resultSubtitle.textContent = resultMessage;
        }
        
        // Animate score counters
        if (DOM.scoreValue) _animateCounter(DOM.scoreValue, result.score, '%');
        if (DOM.correctValue) _animateCounter(DOM.correctValue, result.correct);
        if (DOM.totalValue) DOM.totalValue.textContent = result.total;
        if (DOM.timeValue) DOM.timeValue.textContent = HA.Utils.formatDuration(result.timeTaken);
        
        // Render analytics
        _renderAnalytics(result);
        
        // Render review
        _renderReview(result);
        
        // Celebration animation for passing
        if (result.passed) {
            _celebrateResult();
            
            HA.Utils.toast({
                type: 'success',
                title: 'Quiz Passed!',
                message: `+50 points earned! Score: ${result.score}%`,
                duration: 4000
            });
        } else {
            HA.Utils.toast({
                type: 'info',
                title: 'Quiz Completed',
                message: `Score: ${result.score}%. Need 70% to pass.`,
                duration: 4000
            });
        }
        
        // Initialize result actions
        _initResultActions();
    }

    /**
     * Animate counter
     */
    function _animateCounter(el, target, suffix = '') {
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

    /**
     * Render analytics
     */
    function _renderAnalytics(result) {
        if (!DOM.analyticsGrid) return;
        
        const accuracy = Math.round((result.correct / result.total) * 100);
        const avgTimePerQuestion = Math.round(result.timeTaken / result.total);
        
        const html = `
            <div class="quiz-analytics-item">
                <div class="quiz-analytics-item-header">
                    <div class="quiz-analytics-item-label">Accuracy</div>
                    <div class="quiz-analytics-item-value">${accuracy}%</div>
                </div>
                <div class="quiz-analytics-bar">
                    <div class="quiz-analytics-fill" style="width: ${accuracy}%;"></div>
                </div>
            </div>
            
            <div class="quiz-analytics-item">
                <div class="quiz-analytics-item-header">
                    <div class="quiz-analytics-item-label">Avg. Time/Question</div>
                    <div class="quiz-analytics-item-value">${avgTimePerQuestion}s</div>
                </div>
                <div class="quiz-analytics-bar">
                    <div class="quiz-analytics-fill" style="width: ${Math.min(avgTimePerQuestion * 2, 100)}%;"></div>
                </div>
            </div>
            
            <div class="quiz-analytics-item">
                <div class="quiz-analytics-item-header">
                    <div class="quiz-analytics-item-label">Status</div>
                    <div class="quiz-analytics-item-value" style="color: ${result.passed ? 'var(--neon-green)' : 'var(--neon-red)'};">
                        ${result.passed ? 'PASSED' : 'FAILED'}
                    </div>
                </div>
                <div class="quiz-analytics-bar">
                    <div class="quiz-analytics-fill" style="width: 100%; background: ${result.passed ? 'var(--gradient-primary)' : 'linear-gradient(135deg, var(--neon-red), var(--neon-pink))'};"></div>
                </div>
            </div>
        `;
        
        DOM.analyticsGrid.innerHTML = html;
    }

    /**
     * Render answer review
     */
    function _renderReview(result) {
        if (!DOM.reviewList) return;
        
        const html = result.results.map((r, index) => {
            const question = currentQuiz.questions[index];
            const isCorrect = r.isCorrect;
            const stateClass = isCorrect ? 'correct' : 'incorrect';
            
            const userAnswerText = r.userAnswer !== null 
                ? question.options[r.userAnswer] 
                : 'Not answered';
            
            const correctAnswerText = question.options[question.correct];
            
            return `
                <div class="quiz-review-item ${stateClass}">
                    <div class="quiz-review-question">
                        <span class="quiz-review-question-number">Q${index + 1}</span>
                        <span>${question.text}</span>
                    </div>
                    <div class="quiz-review-answers">
                        <div class="quiz-review-answer ${r.userAnswer !== null ? 'selected' : ''} ${!isCorrect ? 'incorrect' : ''}">
                            <div class="quiz-review-answer-icon">
                                <i class="fas ${isCorrect ? 'fa-check' : 'fa-xmark'}"></i>
                            </div>
                            <span>Your answer: ${userAnswerText}</span>
                        </div>
                        ${!isCorrect ? `
                            <div class="quiz-review-answer correct">
                                <div class="quiz-review-answer-icon">
                                    <i class="fas fa-check"></i>
                                </div>
                                <span>Correct answer: ${correctAnswerText}</span>
                            </div>
                        ` : ''}
                    </div>
                    ${question.explanation ? `
                        <div class="quiz-review-explanation">
                            <strong>Explanation:</strong> ${question.explanation}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        DOM.reviewList.innerHTML = html;
    }

    /**
     * Celebrate result
     */
    function _celebrateResult() {
        const colors = ['#00ff9d', '#00d4ff', '#b537f2', '#ffd60a', '#ff2e9a'];
        
        for (let i = 0; i < 50; i++) {
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
                    top: 30%;
                    box-shadow: 0 0 15px currentColor;
                `;
                
                document.body.appendChild(particle);
                
                const angle = (Math.PI * 2 * i) / 50;
                const velocity = 200 + Math.random() * 150;
                const dx = Math.cos(angle) * velocity;
                const dy = Math.sin(angle) * velocity;
                
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

    /**
     * Initialize result actions
     */
    function _initResultActions() {
        if (DOM.retryBtn) {
            DOM.retryBtn.addEventListener('click', () => {
                window.location.reload();
            });
        }
        
        if (DOM.backBtn) {
            DOM.backBtn.addEventListener('click', () => {
                window.location.href = 'dashboard.html';
            });
        }
    }

    // ============================================
    // 11. KEYBOARD SHORTCUTS
    // ============================================

    /**
     * Initialize keyboard shortcuts
     */
    function _initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger if quiz is submitted
            if (quizSubmitted) return;
            
            // Number keys 1-4 for answer selection
            if (e.key >= '1' && e.key <= '4') {
                const index = parseInt(e.key) - 1;
                const question = currentQuiz.questions[currentQuestionIndex];
                
                if (index < question.options.length) {
                    _selectAnswer(index);
                }
            }
            
            // Arrow keys for navigation
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                _prevQuestion();
            }
            
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                _nextQuestion();
            }
            
            // Enter to submit (on last question)
            if (e.key === 'Enter' && currentQuestionIndex === currentQuiz.questions.length - 1) {
                if (DOM.submitBtn) {
                    DOM.submitBtn.click();
                }
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
            console.error('[HA.Quiz] Global error:', e.message);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('[HA.Quiz] Unhandled promise rejection:', e.reason);
        });
        
        // Warn before leaving quiz
        window.addEventListener('beforeunload', (e) => {
            if (!quizSubmitted && currentQuiz) {
                e.preventDefault();
                e.returnValue = 'You have an unfinished quiz. Are you sure you want to leave?';
            }
        });
    }

    /**
     * Initialize cleanup
     */
    function _initCleanup() {
        window.addEventListener('beforeunload', () => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        });
    }

    // ============================================
    // 14. PUBLIC API
    // ============================================

    return {
        /**
         * Initialize the quiz page
         */
        init: function() {
            console.log('[HA.Quiz] 🚀 Initializing Quiz Page...');
            console.log('[HA.Quiz] Founded by Er. Priyanshu Sharma');
            
            // Prevent double initialization
            if (window.__HA_QUIZ_INITIALIZED__) {
                console.warn('[HA.Quiz] Already initialized');
                return;
            }
            window.__HA_QUIZ_INITIALIZED__ = true;
            
            // Cache DOM
            _cacheDOM();
            
            // Check authentication
            if (!_checkAuth()) return;
            
            // Initialize storage
            if (HA.Storage) {
                HA.Storage.init();
            }
            
            // Load quiz
            if (!_loadQuiz()) return;
            
            // Render quiz header
            _renderQuizHeader();
            
            // Initialize timer
            _initTimer();
            
            // Render first question
            _renderQuestion();
            
            // Initialize navigation
            _initNavigation();
            
            // Initialize keyboard shortcuts
            _initKeyboardShortcuts();
            
            // Initialize utilities
            _initErrorHandling();
            _initCleanup();
            
            // Hide loader
            _hideLoader();
            
            console.log('[HA.Quiz] ✅ Initialization complete');
            console.log('[HA.Quiz] 📝 Quiz:', currentQuiz.title);
            console.log('[HA.Quiz] ❓ Questions:', currentQuiz.questions.length);
            console.log('[HA.Quiz] ⏱️ Duration:', currentQuiz.duration, 'minutes');
        },

        /**
         * Get current quiz
         */
        getCurrentQuiz: function() {
            return currentQuiz;
        },

        /**
         * Get current question index
         */
        getCurrentQuestionIndex: function() {
            return currentQuestionIndex;
        },

        /**
         * Get user answers
         */
        getUserAnswers: function() {
            return [...userAnswers];
        },

        /**
         * Get time remaining
         */
        getTimeRemaining: function() {
            return timeRemaining;
        },

        /**
         * Check if quiz is submitted
         */
        isSubmitted: function() {
            return quizSubmitted;
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
        HA.Quiz.init();
    }, 100);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HA.Quiz;
}