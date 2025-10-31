

// Global variables to store library data loaded from JSON
let booksData = [];
let soundsData = [];
let videosData = [];

// DOM elements
let currentBookIndex = 6;
let currentSoundIndex = 6;
let currentVideoIndex = 6;

// Modal elements
const modal = document.getElementById('book-modal');
const modalTitle = document.getElementById('modal-book-title');
const modalImage = document.getElementById('modal-book-image');
const modalAuthor = document.getElementById('modal-book-author');
const modalDescription = document.getElementById('modal-book-description');
const modalAmazonLink = document.getElementById('modal-amazon-link');
const closeModal = document.querySelector('.book-modal-close');

// Media (sound) modal elements
const mediaModal = document.getElementById('media-modal');
const mediaIframe = document.getElementById('media-iframe');
const closeMediaModalBtn = document.querySelector('.media-modal-close');

// Load library data from JSON file
/**
 * Load library.json and populate global arrays (booksData, soundsData, videosData).
 */
async function loadLibraryData() {
    try {
        const response = await fetch('library.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const libraryData = await response.json();
        
        // Assign data to global variables
        booksData = libraryData.books || [];
        soundsData = libraryData.sounds || [];
        videosData = libraryData.videos || [];
        
        console.log('Library data loaded successfully:');
        console.log('- Books:', booksData.length);
        console.log('- Sounds:', soundsData.length);
        console.log('- Videos:', videosData.length);
    } catch (error) {
        console.error('Error loading library data:', error);
        // Fallback to empty arrays if JSON fails to load
        booksData = [];
        soundsData = [];
        videosData = [];
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    await loadLibraryData(); // Load all library data first
    initializeLibrary();
    setupEventListeners();
    setupSearch();
});

/** Initialize all library sections. */
function initializeLibrary() {
    renderBooks();
    renderSounds();
    renderVideos();
}

/** Wire up Show More buttons, modal close, and library search handlers. */
function setupEventListeners() {
    // Show more buttons
    document.getElementById('show-more-books').addEventListener('click', showMoreBooks);
    document.getElementById('show-more-sounds').addEventListener('click', showMoreSounds);
    document.getElementById('show-more-videos').addEventListener('click', showMoreVideos);
    // Show less buttons
    document.getElementById('show-less-books').addEventListener('click', showLessBooks);
    document.getElementById('show-less-sounds').addEventListener('click', showLessSounds);
    document.getElementById('show-less-videos').addEventListener('click', showLessVideos);

    // Modal events
    if (closeModal) {
        closeModal.addEventListener('click', closeBookModal);
    }
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeBookModal();
        }
        if (event.target === mediaModal) {
            closeMediaModal();
        }
    });

    // Library search
    const librarySearch = document.getElementById('library-search');
    const categoryFilter = document.getElementById('category-filter');
    const searchBtn = document.querySelector('.search-btn');

    if (librarySearch) {
        librarySearch.addEventListener('input', handleLiveSearch);
        librarySearch.addEventListener('focus', function() {
            if (librarySearch.value.trim().length > 0) {
                showLiveSearchSuggestions(librarySearch.value);
            }
        });
        librarySearch.addEventListener('blur', function(e) {
            // Delay hiding suggestions to allow clicking on them
            setTimeout(hideLiveSearchSuggestions, 200);
        });
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', performLibrarySearch);
    }
    if (searchBtn) {
        searchBtn.addEventListener('click', performLibrarySearch);
    }

    // Media modal close button
    if (closeMediaModalBtn) {
        closeMediaModalBtn.addEventListener('click', closeMediaModal);
    }

    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.library-search-container')) {
            hideLiveSearchSuggestions();
        }
    });
}

/** Hook into global navbar search to include library items. */
function setupSearch() {
    // Update the main search functionality to include library content
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            if (query.length > 2) {
                updateSearchResults(query);
            }
        });
    }
}

/** Render the Books grid cards with initial 6 visible. */
function renderBooks() {
    const booksGrid = document.getElementById('books-grid');
    if (!booksGrid) return;

    booksGrid.innerHTML = '';

    booksData.forEach((book, index) => {
        const bookCard = createBookCard(book, index);
        booksGrid.appendChild(bookCard);
    });

    updateShowMoreButton('books');
}

/**
 * Create a DOM node for a single book card.
 * @param {Object} book
 * @param {number} index
 * @returns {HTMLDivElement}
 */
function createBookCard(book, index) {
    const card = document.createElement('div');
    card.className = `book-card ${index >= 6 ? 'hidden' : ''}`;
    card.innerHTML = `
        <div class="book-image">
            <img src="${book.image}" alt="${book.title}" loading="lazy">
        </div>
        <div class="book-content">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">by ${book.author}</p>
            <div class="book-actions">
                <a href="${book.amazonLink}" target="_blank" class="amazon-btn">
                    <i class='bx bxl-amazon'></i>
                    Buy From Amazon
                </a>
                <button class="about-btn" onclick="openBookModal(${book.id})">
                    <i class='bx bx-info-circle'></i>
                    About the Book
                </button>
            </div>
        </div>
    `;
    return card;
}

/** Render the Sounds grid cards with initial 6 visible. */
function renderSounds() {
    const soundsGrid = document.getElementById('sounds-grid');
    if (!soundsGrid) return;

    soundsGrid.innerHTML = '';

    soundsData.forEach((sound, index) => {
        const soundCard = createSoundCard(sound, index);
        soundsGrid.appendChild(soundCard);
    });

    updateShowMoreButton('sounds');
}

/**
 * Create a DOM node for a single sound card.
 * @param {Object} sound
 * @param {number} index
 * @returns {HTMLDivElement}
 */
function createSoundCard(sound, index) {
    const card = document.createElement('div');
    card.className = `sound-card ${index >= 6 ? 'hidden' : ''}`;
    const thumbUrl = getYouTubeThumbnail(sound.youtubeId);
    const imageHtml = thumbUrl
        ? `<img src="${thumbUrl}" alt="${sound.title} thumbnail" loading="lazy">`
        : `<i class='bx bx-music sound-icon' aria-hidden="true"></i>`;
    card.innerHTML = `
        <div class="sound-image">
            ${imageHtml}
        </div>
        <div class="sound-content">
            <h3 class="sound-title">${sound.title}</h3>
            <p class="sound-duration">Duration: ${sound.duration}</p>
            <button class="play-btn" onclick="playSound('${sound.youtubeId}')">
                <i class='bx bx-play'></i>
                Play Sound
            </button>
        </div>
    `;
    return card;
}

/**
 * Derive a YouTube video ID from various URL formats or a plain ID.
 * Supports: watch?v=, youtu.be/ID, shorts/ID
 * Returns empty string when not resolvable (e.g., search URL).
 */
function getYouTubeIdFromRef(youtubeRef) {
    const ref = (youtubeRef || '').trim();
    if (!ref) return '';
    // Plain ID (heuristic: 11+ chars, no spaces, no protocol)
    if (!ref.startsWith('http://') && !ref.startsWith('https://')) {
        return ref;
    }
    try {
        const url = new URL(ref);
        const host = url.hostname.replace('www.', '');
        if (host.includes('youtube.com')) {
            if (url.pathname.startsWith('/watch')) {
                return url.searchParams.get('v') || '';
            }
            if (url.pathname.startsWith('/shorts/')) {
                return url.pathname.split('/')[2] || '';
            }
            // results/search page has no single ID
            return '';
        }
        if (host.includes('youtu.be')) {
            return url.pathname.replace('/', '') || '';
        }
    } catch (e) {
        console.warn('Invalid YouTube ref for thumbnail:', youtubeRef);
    }
    return '';
}

/** Return a YouTube thumbnail URL or empty string if unavailable. */
function getYouTubeThumbnail(youtubeRef) {
    const id = getYouTubeIdFromRef(youtubeRef);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
}

/** Render the Videos grid cards with initial 6 visible. */
function renderVideos() {
    const videosGrid = document.getElementById('videos-grid');
    if (!videosGrid) return;

    videosGrid.innerHTML = '';

    videosData.forEach((video, index) => {
        const videoCard = createVideoCard(video, index);
        videosGrid.appendChild(videoCard);
    });

    updateShowMoreButton('videos');
}

/**
 * Create a DOM node for a single video card.
 * @param {Object} video
 * @param {number} index
 * @returns {HTMLDivElement}
 */
function createVideoCard(video, index) {
    const card = document.createElement('div');
    card.className = `video-card ${index >= 6 ? 'hidden' : ''}`;
    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
            <div class="play-overlay">
                <i class='bx bx-play'></i>
            </div>
        </div>
        <div class="video-content">
            <h3 class="video-title">${video.title}</h3>
            <p class="video-description">${video.description}</p>
            <a href="https://www.youtube.com/watch?v=${video.youtubeId}" target="_blank" class="watch-btn">
                <i class='bx bxl-youtube'></i>
                Watch Video
            </a>
        </div>
    `;
    return card;
}

function showMoreBooks() {
    const hiddenBooks = document.querySelectorAll('.book-card.hidden');
    const booksToShow = Math.min(6, hiddenBooks.length);
    
    for (let i = 0; i < booksToShow; i++) {
        hiddenBooks[i].classList.remove('hidden');
        hiddenBooks[i].style.animation = 'fadeInUp 0.5s ease forwards';
    }

    updateShowMoreButton('books');
}

function showMoreSounds() {
    const hiddenSounds = document.querySelectorAll('.sound-card.hidden');
    const soundsToShow = Math.min(6, hiddenSounds.length);
    
    for (let i = 0; i < soundsToShow; i++) {
        hiddenSounds[i].classList.remove('hidden');
        hiddenSounds[i].style.animation = 'fadeInUp 0.5s ease forwards';
    }

    updateShowMoreButton('sounds');
}

function showMoreVideos() {
    const hiddenVideos = document.querySelectorAll('.video-card.hidden');
    const videosToShow = Math.min(6, hiddenVideos.length);
    
    for (let i = 0; i < videosToShow; i++) {
        hiddenVideos[i].classList.remove('hidden');
        hiddenVideos[i].style.animation = 'fadeInUp 0.5s ease forwards';
    }

    updateShowMoreButton('videos');
}

function showLessBooks() {
    const allBooks = document.querySelectorAll('.book-card');
    allBooks.forEach((card, idx) => {
        if (idx >= 6) {
            card.classList.add('hidden');
            card.style.animation = '';
        }
    });
    updateShowMoreButton('books');
    const section = document.getElementById('books-section');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showLessSounds() {
    const allSounds = document.querySelectorAll('.sound-card');
    allSounds.forEach((card, idx) => {
        if (idx >= 6) {
            card.classList.add('hidden');
            card.style.animation = '';
        }
    });
    updateShowMoreButton('sounds');
    const section = document.getElementById('sound-library-section');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showLessVideos() {
    const allVideos = document.querySelectorAll('.video-card');
    allVideos.forEach((card, idx) => {
        if (idx >= 6) {
            card.classList.add('hidden');
            card.style.animation = '';
        }
    });
    updateShowMoreButton('videos');
    const section = document.getElementById('video-library-section');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateShowMoreButton(type) {
    const button = document.getElementById(`show-more-${type}`);
    const lessButton = document.getElementById(`show-less-${type}`);
    if (!button) return;

    const singular = type.slice(0, -1);
    const allItems = Array.from(document.querySelectorAll(`.${singular}-card`));
    // Consider only items that are not forcibly hidden by search filtering (style.display !== 'none')
    const visibleItems = allItems.filter(el => el.style.display !== 'none');
    const hiddenItems = visibleItems.filter(el => el.classList.contains('hidden'));

    // No pagination needed for <= 6 items
    if (visibleItems.length <= 6) {
        button.style.display = 'none';
        if (lessButton) lessButton.style.display = 'none';
        return;
    }

    if (hiddenItems.length === 0) {
        // All items visible: hide Show More, show Show Less
        button.style.display = 'none';
        if (lessButton) lessButton.style.display = 'inline-block';
    } else {
        // Some items still hidden: show Show More with remaining count, hide Show Less
        const label = `Show More ${type.charAt(0).toUpperCase() + type.slice(1)} (${hiddenItems.length})`;
        button.style.display = 'inline-block';
        button.textContent = label;
        button.setAttribute('data-label', label);
        if (lessButton) lessButton.style.display = 'none';
    }
}

function openBookModal(bookId) {
    const book = booksData.find(b => b.id === bookId);
    if (!book || !modal) return;

    modalTitle.textContent = book.title;
    modalImage.src = book.image;
    modalImage.alt = book.title;
    modalAuthor.textContent = `by ${book.author}`;
    modalDescription.textContent = book.description;
    modalAmazonLink.href = book.amazonLink;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeBookModal() {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function playSound(youtubeRef) {
    // Build an embeddable URL and play inside modal
    try {
        const embedUrl = buildYouTubeEmbed(youtubeRef);
        if (!embedUrl) return;
        openMediaModal(embedUrl);
    } catch (e) {
        console.error('Failed to play sound:', e);
    }
}

function buildYouTubeEmbed(youtubeRef) {
    const ref = (youtubeRef || '').trim();
    if (!ref) return '';

    // If it's a full URL, parse it
    if (ref.startsWith('http://') || ref.startsWith('https://')) {
        try {
            const url = new URL(ref);
            const host = url.hostname.replace('www.', '');
            // Search results -> use listType=search embed
            if (host.includes('youtube.com') && url.pathname.startsWith('/results')) {
                const q = url.searchParams.get('search_query') || '';
                if (!q) return '';
                return `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(q)}&autoplay=1&rel=0`;
            }
            // Standard watch URL
            if (host.includes('youtube.com') && url.pathname.startsWith('/watch')) {
                const id = url.searchParams.get('v');
                if (!id) return '';
                return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
            }
            // Shorts URL
            if (host.includes('youtube.com') && url.pathname.startsWith('/shorts/')) {
                const id = url.pathname.split('/')[2];
                if (!id) return '';
                return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
            }
            // youtu.be short link
            if (host.includes('youtu.be')) {
                const id = url.pathname.replace('/', '');
                if (!id) return '';
                return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
            }
        } catch (e) {
            console.warn('Invalid YouTube URL:', ref);
            return '';
        }
    }

    // Otherwise assume plain video ID
    return `https://www.youtube-nocookie.com/embed/${ref}?autoplay=1&rel=0`;
}

function openMediaModal(embedUrl) {
    if (!mediaModal || !mediaIframe) return;
    mediaIframe.src = embedUrl;
    mediaModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeMediaModal() {
    if (!mediaModal || !mediaIframe) return;
    mediaIframe.src = '';
    mediaModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Live Search Functionality
function handleLiveSearch(e) {
    const query = e.target.value.trim();
    
    if (query.length > 0) {
        showLiveSearchSuggestions(query);
    } else {
        hideLiveSearchSuggestions();
    }
    
    // Also perform the regular search
    performLibrarySearch();
}

function showLiveSearchSuggestions(query) {
    const suggestionsContainer = document.getElementById('search-suggestions');
    if (!suggestionsContainer) return;
    
    const suggestions = getSearchSuggestions(query, 8); // Limit to 8 suggestions
    
    if (suggestions.length === 0) {
        hideLiveSearchSuggestions();
        return;
    }
    
    suggestionsContainer.innerHTML = '';
    
    suggestions.forEach(item => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        // Ensure every suggestion shows an image or a fallback icon
        let imageHtml = '';
        if (item.image) {
            imageHtml = `<img src="${item.image}" alt="${item.title}" class="suggestion-image">`;
        } else {
            const icon = item.type === 'Sound' ? 'bx-music' : (item.type === 'Video' ? 'bxl-youtube' : 'bx-book-open');
            imageHtml = `<div class="suggestion-placeholder"><i class='bx ${icon}'></i></div>`;
        }
        const authorHtml = item.author ? `<div class="suggestion-author">by ${item.author}</div>` : '';
        const descriptionText = item.description || '';
        suggestionItem.innerHTML = `
            ${imageHtml}
            <div class="suggestion-content">
                <div class="suggestion-title">${highlightMatch(item.title, query)}</div>
                ${authorHtml}
                <div class="suggestion-description">${highlightMatch(descriptionText, query)}</div>
            </div>
            <div class="suggestion-type">${item.type}</div>
        `;
        
        suggestionItem.addEventListener('click', () => {
            selectSuggestion(item);
        });
        
        suggestionsContainer.appendChild(suggestionItem);
    });
    
    suggestionsContainer.classList.add('show');
}

function hideLiveSearchSuggestions() {
    const suggestionsContainer = document.getElementById('search-suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.classList.remove('show');
    }
}

function getSearchSuggestions(query, limit = 8) {
    const suggestions = [];
    const lowerQuery = query.toLowerCase();
    
    // Search books
    booksData.forEach(book => {
        if (book.title.toLowerCase().includes(lowerQuery) || 
            book.author.toLowerCase().includes(lowerQuery) || 
            book.description.toLowerCase().includes(lowerQuery)) {
            suggestions.push({
                ...book,
                type: 'Book',
                image: book.image,
                description: book.description
            });
        }
    });
    
    // Search sounds
    soundsData.forEach(sound => {
        const artist = (sound.artist || '').toLowerCase();
        const description = (sound.description || '').toLowerCase();
        if (sound.title.toLowerCase().includes(lowerQuery) || 
            artist.includes(lowerQuery) || 
            description.includes(lowerQuery)) {
            const thumb = getYouTubeThumbnail(sound.youtubeId);
            const composedDesc = sound.description || [sound.category, sound.duration ? `Duration: ${sound.duration}` : ''].filter(Boolean).join(' • ');
            suggestions.push({
                ...sound,
                type: 'Sound',
                author: sound.artist || undefined,
                image: thumb || undefined,
                description: composedDesc
            });
        }
    });
    
    // Search videos
    videosData.forEach(video => {
        if (video.title.toLowerCase().includes(lowerQuery) || 
            video.instructor.toLowerCase().includes(lowerQuery) || 
            video.description.toLowerCase().includes(lowerQuery)) {
            suggestions.push({
                ...video,
                type: 'Video',
                author: video.instructor,
                image: video.thumbnail,
                description: video.description
            });
        }
    });
    
    return suggestions.slice(0, limit);
}

function highlightMatch(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
}

function selectSuggestion(item) {
    const searchInput = document.getElementById('library-search');
    if (searchInput) {
        searchInput.value = item.title;
        performLibrarySearch();
        hideLiveSearchSuggestions();
    }
}

/** Filter all sections by query and category dropdown. */
function performLibrarySearch() {
    const searchInput = document.getElementById('library-search');
    const categoryFilter = document.getElementById('category-filter');
    
    if (!searchInput || !categoryFilter) return;

    const query = searchInput.value.toLowerCase();
    const category = categoryFilter.value;

    // Filter books
    filterItems('book', query, category, booksData);
    
    // Filter sounds
    filterItems('sound', query, category, soundsData);
    
    // Filter videos
    filterItems('video', query, category, videosData);
}

/**
 * Filter and toggle visibility for a card type grid.
 * @param {'book'|'sound'|'video'} type
 * @param {string} query
 * @param {string} category
 * @param {Array<Object>} data
 */
function filterItems(type, query, category, data) {
    const cards = document.querySelectorAll(`.${type}-card`);
    let visibleCount = 0;

    cards.forEach((card, index) => {
        const item = data[index];
        let shouldShow = true;

        // Category filter
        if (category !== 'all') {
            const itemCategory = type === 'book' ? 'books' : 
                                type === 'sound' ? 'sounds' : 'videos';
            if (category !== itemCategory) {
                shouldShow = false;
            }
        }

        // Text search
        if (query && shouldShow) {
            const searchText = type === 'book' 
                ? `${item.title} ${item.author} ${item.description}`.toLowerCase()
                : type === 'sound'
                ? `${item.title} ${item.category} ${item.description || ''} ${item.duration || ''}`.toLowerCase()
                : `${item.title} ${item.description} ${item.category}`.toLowerCase();
            
            if (!searchText.includes(query)) {
                shouldShow = false;
            }
        }

        if (shouldShow) {
            card.style.display = 'block';
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Update show more button
    updateShowMoreButton(type + 's');
}

/**
 * Update the global navbar dropdown with Library matches (lightweight subset).
 * @param {string} query
 */
function updateSearchResults(query) {
    // This function updates the main navbar search results to include library content
    const searchDropdown = document.getElementById('search-dropdown');
    if (!searchDropdown) return;

    let results = [];

    // Search books
    const bookResults = booksData
        .filter(book => 
            book.title.toLowerCase().includes(query) || 
            book.author.toLowerCase().includes(query)
        )
        .slice(0, 3)
        .map(book => ({
            type: 'book',
            title: book.title,
            subtitle: `by ${book.author}`,
            url: `library.html#book-${book.id}`
        }));

    // Search sounds
    const soundResults = soundsData
        .filter(sound => sound.title.toLowerCase().includes(query))
        .slice(0, 2)
        .map(sound => ({
            type: 'sound',
            title: sound.title,
            subtitle: `Duration: ${sound.duration}`,
            url: `library.html#sound-${sound.id}`
        }));

    // Search videos
    const videoResults = videosData
        .filter(video => 
            video.title.toLowerCase().includes(query) || 
            video.description.toLowerCase().includes(query)
        )
        .slice(0, 2)
        .map(video => ({
            type: 'video',
            title: video.title,
            subtitle: video.description.substring(0, 50) + '...',
            url: `library.html#video-${video.id}`
        }));

    results = [...bookResults, ...soundResults, ...videoResults];

    if (results.length > 0) {
        searchDropdown.innerHTML = results.map(result => `
            <div class="search-result-item">
                <div class="search-result-type">${result.type}</div>
                <div class="search-result-title">${highlightSearchTerm(result.title, query)}</div>
                <div class="search-result-subtitle">${result.subtitle}</div>
            </div>
        `).join('');
        searchDropdown.style.display = 'block';
    } else {
        searchDropdown.style.display = 'none';
    }
}

function highlightSearchTerm(text, term) {
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);