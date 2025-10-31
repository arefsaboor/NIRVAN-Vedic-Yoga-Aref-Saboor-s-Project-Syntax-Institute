// Modal Functionality for Sign In and Sign Up

document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const signinModal = document.getElementById('signinModal');
    const signupModal = document.getElementById('signupModal');
    const forgotModal = document.getElementById('forgotModal');
    const confirmModal = document.getElementById('confirmModal');
    
    // Button elements
    const openSigninBtn = document.getElementById('openSignin');
    const openSignupBtn = document.getElementById('openSignup');
    
    // Close buttons
    const closeBtns = document.querySelectorAll('.close');
    
    // Switch links
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToSignin = document.getElementById('switchToSignin');
    
    // Forms
    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');
    const forgotForm = document.getElementById('forgotForm');

    // Track last forgot email to prefill sign-in
    let lastForgotEmail = '';

    // Open Sign In Modal
    openSigninBtn.addEventListener('click', function() {
        openModal(signinModal);
    });

    // Open Sign Up Modal
    openSignupBtn.addEventListener('click', function() {
        openModal(signupModal);
    });

    // Close modals when clicking close button
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modalType = this.getAttribute('data-modal');
            if (modalType === 'signin') {
                closeModal(signinModal);
            } else if (modalType === 'signup') {
                closeModal(signupModal);
            } else if (modalType === 'forgot' && forgotModal) {
                closeModal(forgotModal);
            } else if (modalType === 'confirm' && confirmModal) {
                closeModal(confirmModal);
            }
        });
    });

    // Disable closing when clicking outside: intentionally do nothing

    // Switch between modals
    switchToSignup.addEventListener('click', function(e) {
        e.preventDefault();
        closeModal(signinModal);
        setTimeout(() => openModal(signupModal), 300);
    });

    switchToSignin.addEventListener('click', function(e) {
        e.preventDefault();
        closeModal(signupModal);
        setTimeout(() => openModal(signinModal), 300);
    });

    // Forgot password link (from Sign In)
    const forgotLink = document.querySelector('.forgot-password');
    if (forgotLink && forgotModal) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            const emailVal = document.getElementById('signin-email')?.value || localStorage.getItem('userEmail') || '';
            closeModal(signinModal);
            setTimeout(() => {
                openModal(forgotModal);
                const forgotEmail = document.getElementById('forgot-email');
                if (forgotEmail && emailVal) forgotEmail.value = emailVal;
            }, 300);
        });
    }

    // Form submissions
    signinForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleSignin();
    });

    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleSignup();
    });

    if (forgotForm) {
        forgotForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleForgot();
        });
    }

    // Confirmation modal action button
    const confirmCloseBtn = document.getElementById('confirmCloseBtn');
    if (confirmCloseBtn && confirmModal) {
        confirmCloseBtn.addEventListener('click', function() {
            closeModal(confirmModal);
            // Optionally take user back to Sign In with prefilled email
            setTimeout(() => {
                if (signinModal) {
                    openModal(signinModal);
                    const signinEmail = document.getElementById('signin-email');
                    if (signinEmail) {
                        signinEmail.value = lastForgotEmail || localStorage.getItem('userEmail') || '';
                    }
                }
            }, 300);
        });
    }

    // Helper functions
    /**
     * Open a modal with scroll compensation and CSS transition.
     * @param {HTMLElement} modal
     */
    function openModal(modal) {
        // Prevent layout shift by compensating for scrollbar width
        const scrollComp = window.innerWidth - document.documentElement.clientWidth;
        if (scrollComp > 0) {
            document.body.style.paddingRight = scrollComp + 'px';
        }
        document.body.style.overflow = 'hidden';

        modal.style.display = 'flex';
        // small delay to allow CSS to pick up state
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
    }

    /**
     * Close a modal with a smooth CSS transition and restore scrolling.
     * @param {HTMLElement} modal
     */
    function closeModal(modal) {
        // Smooth closing: add a transient class so CSS can animate out
        modal.classList.remove('show');
        modal.classList.add('closing');
        
        setTimeout(() => {
            modal.classList.remove('closing');
            modal.style.display = 'none';
            // Restore scrolling and remove compensation
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }, 280); // match CSS 0.25s with slight buffer
    }

    /**
     * Handle sign-in: validate inputs, check stored password, persist session.
     * Uses localStorage for demo purposes; redirects to account.html on success.
     */
    function handleSignin() {
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;
        const remember = document.getElementById('remember-me').checked;

        // Basic validation
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Simulate API call + local auth
        showNotification('Signing you in...', 'info');

        setTimeout(() => {
            // Load or init user stores
            const users = JSON.parse(localStorage.getItem('nirvan.users') || '{}');
            const passwords = JSON.parse(localStorage.getItem('nirvan.passwords') || '{}');

            // If user exists with a stored password, validate
            if (passwords[email] && passwords[email] !== password) {
                showNotification('Incorrect email or password.', 'error');
                return;
            }

            // Ensure profile exists
            if (!users[email]) {
                users[email] = {
                    email,
                    firstName: users[email]?.firstName || '',
                    lastName: users[email]?.lastName || '',
                    displayName: users[email]?.displayName || '',
                    avatar: users[email]?.avatar || '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            }
            // Save/refresh password
            passwords[email] = password;

            localStorage.setItem('nirvan.users', JSON.stringify(users));
            localStorage.setItem('nirvan.passwords', JSON.stringify(passwords));
            localStorage.setItem('nirvan.currentUser', email);

            if (remember) {
                localStorage.setItem('userEmail', email);
            }

            showNotification('Welcome back! Sign in successful.', 'success');
            closeModal(signinModal);

            // Reset form
            signinForm.reset();

            // Redirect to account dashboard
            setTimeout(() => { window.location.href = 'account.html'; }, 350);
        }, 900);
    }

    /**
     * Handle sign-up: validate fields, create user, store password and session.
     * Uses localStorage; redirects to account.html on success.
     */
    function handleSignup() {
        const firstname = document.getElementById('signup-firstname').value;
        const lastname = document.getElementById('signup-lastname').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const acceptTerms = document.getElementById('accept-terms').checked;

        // Validation
        if (!firstname || !lastname || !email || !password || !confirmPassword) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 8) {
            showNotification('Password must be at least 8 characters long', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }

        if (!acceptTerms) {
            showNotification('Please accept the Terms of Service and Privacy Policy', 'error');
            return;
        }

        // Simulate API call + store user
        showNotification('Creating your account...', 'info');

        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('nirvan.users') || '{}');
            const passwords = JSON.parse(localStorage.getItem('nirvan.passwords') || '{}');

            users[email] = {
                email,
                firstName: firstname,
                lastName: lastname,
                displayName: `${firstname} ${lastname}`.trim(),
                avatar: users[email]?.avatar || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            passwords[email] = password;

            localStorage.setItem('nirvan.users', JSON.stringify(users));
            localStorage.setItem('nirvan.passwords', JSON.stringify(passwords));
            localStorage.setItem('nirvan.currentUser', email);

            showNotification('Account created successfully! Welcome to NIRVAN!', 'success');
            closeModal(signupModal);

            // Reset form
            signupForm.reset();

            // Redirect to account dashboard
            setTimeout(() => { window.location.href = 'account.html'; }, 350);
        }, 1200);
    }

    /**
     * Handle forgot password flow: basic validation then mock success, opens confirm modal.
     */
    function handleForgot() {
        const emailEl = document.getElementById('forgot-email');
        const passEl = document.getElementById('forgot-password');
        const confirmEl = document.getElementById('forgot-confirm-password');

        const email = (emailEl?.value || '').trim();
        const password = passEl?.value || '';
        const confirmPassword = confirmEl?.value || '';

        if (!email || !password || !confirmPassword) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        if (password.length < 8) {
            showNotification('Password must be at least 8 characters long', 'error');
            return;
        }
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }

        lastForgotEmail = email;
        showNotification('Updating your password...', 'info');
        setTimeout(() => {
            // Simulate success
            showNotification('Your password has been updated.', 'success');
            if (forgotModal) closeModal(forgotModal);
            if (forgotForm) forgotForm.reset();
            setTimeout(() => {
                if (confirmModal) openModal(confirmModal);
            }, 300);
        }, 1000);
    }

    /**
     * Basic email validation regex.
     * @param {string} email
     * @returns {boolean}
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Render a transient toast notification.
     * @param {string} message
     * @param {'success'|'error'|'info'} type
     */
    function showNotification(message, type) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            font-size: 14px;
            z-index: 20000;
            max-width: 350px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
        `;

        // Set background color based on type
        switch(type) {
            case 'success':
                notification.style.backgroundColor = 'var(--primary-green-500)';
                break;
            case 'error':
                notification.style.backgroundColor = '#e74c3c';
                break;
            case 'info':
                notification.style.backgroundColor = 'var(--primary-dark-blue-500)';
                break;
        }

        // Add to document
        document.body.appendChild(notification);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
});