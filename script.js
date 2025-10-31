

// ===== Navbar & Sidebar =====
const navbar = document.querySelector(".navbar");
const searchBox = document.querySelector(".search-box .bx-search");

if (searchBox && navbar) {
    searchBox.addEventListener("click", ()=>{
        navbar.classList.toggle("showInput");
        if(navbar.classList.contains("showInput")){
            searchBox.classList.replace("bx-search" ,"bx-x");
        }else {
            searchBox.classList.replace("bx-x" ,"bx-search");
        }
    });
}

// JS codes for sidebar (Opening & Closing)

const menuOpenBtn = document.querySelector(".navbar .bx-menu");
const navLinks = document.querySelector(".nav-links");

// Sidebar Modal Creation (mobile)
function createSidebarModal() {
    const existing = document.getElementById('sidebar-modal');
    if (existing) return existing;

    const modal = document.createElement('div');
    modal.id = 'sidebar-modal';
    modal.className = 'sidebar-modal';

    const content = document.createElement('div');
    content.className = 'sidebar-modal-content';

    // Header with logo (if available) and close button
    const header = document.createElement('div');
    header.className = 'sidebar-header';
    const logo = document.querySelector('.nav-logo')?.cloneNode(true);
    if (logo) {
        header.appendChild(logo);
    }
    const closeBtn = document.createElement('span');
    closeBtn.className = 'sidebar-close bx bx-x';
    closeBtn.setAttribute('aria-label', 'Close menu');
    header.appendChild(closeBtn);

    // Body: clone the links and optional mobile footer
    const body = document.createElement('div');
    body.className = 'sidebar-body';

    const linksList = document.querySelector('.nav-links .links');
    if (linksList) {
        const clonedNavLinks = document.createElement('div');
        clonedNavLinks.className = 'nav-links'; // so existing styles can be adapted
        clonedNavLinks.appendChild(linksList.cloneNode(true));
        body.appendChild(clonedNavLinks);
    }

    const mobileFooter = document.querySelector('.nav-links .mobile-footer');
    if (mobileFooter) {
        body.appendChild(mobileFooter.cloneNode(true));
    }

    content.appendChild(header);
    content.appendChild(body);
    modal.appendChild(content);
    document.body.appendChild(modal);

    // Wire close interactions
    function closeSidebarModal() {
        // Animate out: slide content left and fade overlay
        modal.classList.remove('open');
        modal.classList.add('closing');
        const contentEl = modal.querySelector('.sidebar-modal-content');
        if (contentEl) {
            const onEnd = (ev) => {
                if (ev.propertyName !== 'transform') return; // wait for slide-out
                contentEl.removeEventListener('transitionend', onEnd);
                modal.classList.remove('closing');
                document.body.style.overflow = '';
            };
            contentEl.addEventListener('transitionend', onEnd);
        } else {
            modal.classList.remove('closing');
            document.body.style.overflow = '';
        }
    }
    closeBtn.addEventListener('click', closeSidebarModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeSidebarModal();
    });

    // Close on Escape key (bind once)
    if (!modal._escBound) {
        modal._escBound = true;
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                if (modal.classList.contains('open')) {
                    closeSidebarModal();
                }
            }
        });
    }

    // Handle link clicks: close modal after navigation intent
    modal.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (a && a.getAttribute('href')) {
            closeSidebarModal();
        }
    });

    // Dropdown arrow toggles inside modal
    function bindDropdownToggles() {
        const programsArrow = modal.querySelector('.programs-arrow');
        const libraryArrow = modal.querySelector('.library-arrow');
        if (programsArrow) {
            programsArrow.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                content.classList.toggle('show1');
            });
        }
        if (libraryArrow) {
            libraryArrow.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                content.classList.toggle('show2');
            });
        }

        // Allow clicking the span text to navigate
        modal.querySelectorAll('.dropdown-link span').forEach(span => {
            span.addEventListener('click', (e) => {
                const link = span.closest('a');
                if (link && link.href) {
                    window.location.href = link.href;
                }
            });
        });

        // Prevent full link navigation when clicking outside the span (to keep arrow as toggle only)
        modal.querySelectorAll('.dropdown-link').forEach(link => {
            link.addEventListener('click', (e) => {
                if (!e.target.matches('span')) {
                    e.preventDefault();
                }
            });
        });
    }
    bindDropdownToggles();

    return modal;
}

function openSidebarModal() {
    const modal = createSidebarModal();
    // Reset any dropdown state
    const content = modal.querySelector('.sidebar-modal-content');
    if (content) {
        content.classList.remove('show1', 'show2');
    }
    modal.classList.remove('closing');
    // Force a frame to ensure transition from off-canvas state kicks in even after rapid toggles
    requestAnimationFrame(() => {
        modal.classList.add('open');
    });
    document.body.style.overflow = 'hidden';
}

if (menuOpenBtn) {
    menuOpenBtn.addEventListener('click', openSidebarModal);
}

// Ensure sidebar modal is closed when resizing to desktop
window.addEventListener('resize', () => {
    const modal = document.getElementById('sidebar-modal');
    if (window.innerWidth > 800 && modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
});

// sidebar sub menu (Opening & Closing)
let programsArrow = document.querySelector(".programs-arrow");
let libraryArrow = document.querySelector(".library-arrow");

// Prevent dropdown links from navigating when clicking the arrow
programsArrow.addEventListener("click", (e)=>{
    e.preventDefault();
    e.stopPropagation();
    navLinks.classList.toggle("show1");
});

libraryArrow.addEventListener("click", (e)=>{
    e.preventDefault();
    e.stopPropagation();
    navLinks.classList.toggle("show2");
});

// Ensure main link text still works for navigation
document.querySelectorAll('.dropdown-link span').forEach(span => {
    span.addEventListener('click', (e) => {
        // Allow default navigation behavior for the span (text)
        const link = span.closest('a');
        if (link && link.href) {
            window.location.href = link.href;
        }
    });
});

// Prevent dropdown links from navigating when clicked anywhere except the span
document.querySelectorAll('.dropdown-link').forEach(link => {
    link.addEventListener('click', (e) => {
        // Only prevent default if not clicking on the span (text)
        if (!e.target.matches('span')) {
            e.preventDefault();
        }
    });
});





/* ===== Automatic Carousel Effect (Info section) ===== */

document.addEventListener('DOMContentLoaded', function() {
    const carousels = document.querySelectorAll('.image-container .carousel');
    const prevBtn = document.querySelector('.image-container .prev-btn');
    const nextBtn = document.querySelector('.image-container .next-btn');

    if (!carousels || carousels.length === 0 || !prevBtn || !nextBtn) {
        // No static slides on this page; another script may manage a dynamic carousel (e.g., blog.js)
        return;
    }

    let current = 0;
    let direction = 1; // 1 for next, -1 for prev
    let autoSlideInterval;

    /**
     * Show the carousel at a given index and apply swipe direction class.
     * @param {number} index - Target slide index.
     * @param {1|-1} [swipeDirection=1] - 1 for next, -1 for prev.
     */
    function showCarousel(index, swipeDirection = 1) {
        carousels.forEach((carousel, i) => {
            carousel.classList.remove('active', 'swipe-next', 'swipe-prev');
            if (i === index) {
                carousel.classList.add('active');
                carousel.classList.add(swipeDirection === 1 ? 'swipe-next' : 'swipe-prev');
            }
        });
    }

    /** Advance to next slide (wraps). */
    function nextSlide() {
        direction = 1;
        current = (current + 1) % carousels.length;
        showCarousel(current, direction);
    }

    /** Go to previous slide (wraps). */
    function prevSlide() {
        direction = -1;
        current = (current - 1 + carousels.length) % carousels.length;
        showCarousel(current, direction);
    }

    /** Start auto sliding at fixed interval. */
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 4000); // Change every 4 seconds
    }

    /** Restart auto sliding timer (on manual navigation). */
    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    prevBtn.addEventListener('click', function() {
        prevSlide();
        resetAutoSlide();
    });

    nextBtn.addEventListener('click', function() {
        nextSlide();
        resetAutoSlide();
    });

    showCarousel(current, direction); // Show first carousel on load
    startAutoSlide();
});

/* ===== Testimonials carousel (click-only, no auto) ===== */
document.addEventListener('DOMContentLoaded', function() {
    const section = document.querySelector('.testimonials-section');
    if (!section) return;

    const card = section.querySelector('.testimonial-card');
    if (!card) return;

    const viewport = card.querySelector('.testo-viewport');
    const track = card.querySelector('.testo-track');
    const items = track ? Array.from(track.children).filter(el => el.classList.contains('testo-content')) : [];
    const prev = card.querySelector('.testo-prev');
    const next = card.querySelector('.testo-next');

    if (!viewport || !track || !items.length || !prev || !next) return;

    let index = 0;

    // Move buttons to the section so they can sit 24px from screen edges and not be clipped
    /**
     * Move arrow buttons to section root so they can position relative to viewport edges.
     */
    function relocateButtons() {
        if (prev.parentElement !== section) section.appendChild(prev);
        if (next.parentElement !== section) section.appendChild(next);
        positionButtons();
    }

    /**
     * Position arrow buttons vertically centered to the viewport box.
     */
    function positionButtons() {
        const rect = viewport.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        const centerTop = rect.top - sectionRect.top + rect.height / 2;

        [prev, next].forEach(btn => {
            btn.style.position = 'absolute';
            btn.style.top = `${centerTop}px`;
            btn.style.transform = 'translateY(-50%)';
            btn.style.zIndex = '100';
        });
        prev.style.left = '24px';
        prev.style.right = '';
        next.style.right = '24px';
        next.style.left = '';
    }

    /**
     * Compute the number of visible cards based on current breakpoint.
     * @returns {number}
     */
    function visibleCount() {
        if (window.innerWidth < 768) return 1;   // mobile
        if (window.innerWidth < 1200) return 2;  // tablet/medium
        return 3;                                // desktop
    }

    /**
     * Clamp index so we never scroll beyond content width.
     * @param {number} i
     * @returns {number}
     */
    function clampIndex(i) {
        const max = Math.max(0, items.length - visibleCount());
        return Math.max(0, Math.min(i, max));
    }

    /**
     * Translate the track to reveal item at the clamped index.
     * @param {number} i
     */
    function scrollToIndex(i) {
        index = clampIndex(i);
        const target = items[index];
        const offset = target.offsetLeft - track.offsetLeft;
        track.style.transform = `translateX(${-offset}px)`;
    }

    prev.addEventListener('click', () => {
        scrollToIndex(index - 1); // move one-by-one
    });

    next.addEventListener('click', () => {
        scrollToIndex(index + 1); // move one-by-one
    });

    window.addEventListener('resize', () => scrollToIndex(index));
    window.addEventListener('resize', positionButtons);

    // Initialize
    relocateButtons();
    scrollToIndex(0);
    positionButtons();
});

// Account link injection and hero button behavior
document.addEventListener('DOMContentLoaded', function() {
    try {
        const currentUser = localStorage.getItem('nirvan.currentUser');
        const linksUl = document.querySelector('.nav-links .links');
        if (currentUser && linksUl && !linksUl.querySelector('a[href="account.html"]')) {
            const li = document.createElement('li');
            li.className = 'li';
            const a = document.createElement('a');
            a.href = 'account.html';
            a.className = 'nav-link';
            a.textContent = 'Account';
            li.appendChild(a);
            linksUl.appendChild(li);
        }

        // Hero buttons on homepage
        const signinBtn = document.getElementById('openSignin');
        const signupBtn = document.getElementById('openSignup');
        if (currentUser && signinBtn) {
            signinBtn.textContent = 'Account';
            signinBtn.onclick = function(e) {
                e.preventDefault();
                window.location.href = 'account.html';
            };
            if (signupBtn) signupBtn.style.display = 'none';
        }
    } catch (e) {
        console.warn('Account UI init failed:', e);
    }
});


// Hero Section Buttons //

// Info section: wire 'Read Article' buttons and dates from articles.json
document.addEventListener('DOMContentLoaded', async function() {
    const infoSection = document.querySelector('.info-section');
    if (!infoSection) return; // Only on pages with the info section (index.html)

    try {
        const res = await fetch('articles.json');
        const articles = await res.json();
        // Create a fast lookup by Heading
        const byTitle = new Map(articles.map(a => [String(a.Heading).trim(), a]));

        const overlays = infoSection.querySelectorAll('.carousel-overlay');
        overlays.forEach(overlay => {
            const titleEl = overlay.querySelector('.carousel-title');
            const btn = overlay.querySelector('.read-article-btn');
            const dateEl = overlay.querySelector('.date');
            if (!titleEl || !btn) return;

            const heading = titleEl.textContent.trim();
            const item = byTitle.get(heading);
            if (item) {
                const slug = (item.Slug && String(item.Slug).trim()) || heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                btn.setAttribute('href', `post.html?slug=${slug}`);
                if (dateEl && item.Date) {
                    dateEl.textContent = item.Date;
                }
            }
        });
    } catch (err) {
        console.error('Failed to wire info-section articles from JSON', err);
    }
});

// Newsletter subscribe validation
document.addEventListener('DOMContentLoaded', function() {
    const newsletters = document.querySelectorAll('.newsletter');
    if (!newsletters.length) return;

    function ensureMessageEl(inputWrap) {
        let msg = inputWrap.querySelector('.newsletter-message');
        if (!msg) {
            msg = document.createElement('div');
            msg.className = 'newsletter-message';
            msg.setAttribute('aria-live', 'polite');
            inputWrap.prepend(msg);
        }
        return msg;
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
        return re.test(String(email).trim());
    }

    newsletters.forEach(section => {
        const input = section.querySelector('.newsletter-input');
        const btn = section.querySelector('.newsletter-btn');
        const inputWrap = section.querySelector('.newsletter-input-wrap');
        if (!input || !btn || !inputWrap) return;

        const msg = ensureMessageEl(inputWrap);

        function showMessage(text, type) {
            msg.textContent = text;
            msg.classList.remove('error', 'success');
            if (type) msg.classList.add(type);
        }

        // Clear message as user types
        input.addEventListener('input', () => {
            msg.textContent = '';
            msg.classList.remove('error', 'success');
        });

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const value = input.value || '';
            if (!isValidEmail(value)) {
                showMessage('Please enter a valid email address.', 'error');
                input.focus();
                return;
            }
            showMessage('Thank you! You are subscribed.', 'success');
        });
    });
});

// Random Quote: Wire up any .quote-refresh-btn to fetch a new quote
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.quote-refresh-btn');
    if (!buttons.length) return;

    // Primary: DummyJSON random quote (CORS-enabled)
    async function fetchFromDummyJSON() {
        const res = await fetch('https://dummyjson.com/quotes/random', { cache: 'no-store' });
        if (!res.ok) throw new Error('DummyJSON failed');
        const data = await res.json();
        return { content: data.quote, author: data.author };
    }

    // Fallback: type.fit provides a large quotes array; pick a random item client-side
    async function fetchFromTypeFit() {
        const res = await fetch('https://type.fit/api/quotes', { cache: 'no-store' });
        if (!res.ok) throw new Error('type.fit failed');
        const list = await res.json();
        if (!Array.isArray(list) || list.length === 0) throw new Error('type.fit empty');
        const item = list[Math.floor(Math.random() * list.length)] || {};
        return { content: item.text || item.quote, author: item.author || 'Unknown' };
    }

    // Final fallback: small local pool (no network)
    async function fetchFromLocalPool() {
        const pool = [
            { content: 'Yoga is the journey of the self, through the self, to the self.', author: 'The Bhagavad Gita' },
            { content: 'Silence is not an absence but a presence.', author: 'Anne D. LeClair' },
            { content: 'The body benefits from movement, and the mind benefits from stillness.', author: 'Sakyong Mipham' },
            { content: 'Wherever you are, be there totally.', author: 'Eckhart Tolle' },
            { content: 'What we think, we become.', author: 'Buddha' }
        ];
        const item = pool[Math.floor(Math.random() * pool.length)];
        return item;
    }

    async function fetchQuote() {
        const sources = [fetchFromDummyJSON, fetchFromTypeFit, fetchFromLocalPool];
        for (const src of sources) {
            try {
                const q = await src();
                if (q && q.content) return q;
            } catch (_) {
                // try next
            }
        }
        throw new Error('All quote sources failed');
    }

    async function handleClick(btn) {
        // Support button placed outside the card: search in the same info-quote-section
        const card = btn.closest('.quote-card') || btn.closest('.info-quote-section')?.querySelector('.quote-card');
        if (!card) return;
        const textEl = card.querySelector('.quote-text');
        const authorEl = card.querySelector('.quote-author');
        if (!textEl) return;

        const originalLabel = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Loading…';

        try {
            const { content, author } = await fetchQuote();
            if (content) {
                // Bold the first sentence of the fetched quote
                const m = content.match(/^(.*?[.!?])(\s+|$)([\s\S]*)/);
                const first = m ? m[1] : content;
                const rest = m ? m[3] : '';

                // Clear and rebuild DOM to avoid XSS via innerHTML
                while (textEl.firstChild) textEl.firstChild.remove();
                const strong = document.createElement('strong');
                strong.textContent = first;
                textEl.appendChild(strong);
                if (rest) textEl.appendChild(document.createTextNode(' ' + rest));
            }
            if (authorEl && author) {
                authorEl.textContent = `— ${author}`;
            }
        } catch (e) {
            btn.textContent = 'Try Again';
        } finally {
            btn.disabled = false;
            if (btn.textContent !== 'Try Again') btn.textContent = originalLabel;
        }
    }

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => handleClick(btn));
    });
});

