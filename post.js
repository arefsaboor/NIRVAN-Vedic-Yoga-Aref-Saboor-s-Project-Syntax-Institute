// Single post page loader: fetch by slug, render article and recommended cards
(function(){
  const DATA_URL = 'articles.json';
  const LONG_LOREM = (
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. '.repeat(6)
  );

  function getSlug() {
    const url = new URL(window.location.href);
    return url.searchParams.get('slug');
  }

  /**
   * Convert plain text with blank-line separators into paragraph HTML.
   * @param {string} text
   * @returns {string}
   */
  function paragraphsHTML(text) {
    if (!text || typeof text !== 'string') return `<p>${LONG_LOREM}</p>`;
    const parts = text.trim().split(/\n\s*\n+/);
    return parts.map(p => `<p>${p.trim()}</p>`).join('');
  }

  /**
   * Template for the full post content area.
   * @param {Object} post
   * @returns {string}
   */
  function templateArticle(post) {
    const tags = (post.tags || []).map(t => `<button class="tag-chip" data-tag="${t}"><i class='bx bx-purchase-tag'></i> ${t}</button>`).join('');
    return `
      <header class="post-header">
        <div class="post-hero-wrap">
          <img class="post-hero" src="${post.image}" alt="${post.title}" />
          <div class="post-hero-overlay">
            <h1 class="post-title">${post.title}</h1>
            <h2 class="post-subtitle">${post.subtitle}</h2>
            <div class="post-meta">
              <span class="post-author"><i class='bx bxs-pencil'></i> ${post.author}</span>
              <span class="post-date"><i class='bx bx-time-five'></i> ${post.date}</span>
            </div>
          </div>
        </div>
      </header>
      <section class="post-content">
        ${paragraphsHTML(post.content)}
      </section>
    `;
  }

  function templateRecCard(post) {
    return `
      <a class="rec-card" href="post.html?slug=${post.slug}">
        <img class="rec-image" src="${post.image}" alt="${post.title}" />
        <div class="rec-body">
          <h4 class="rec-title">${post.title}</h4>
          <p class="rec-subtitle">${post.subtitle}</p>
        </div>
      </a>
    `;
  }

  function mapArticle(a, idx) {
    const obj = {
      id: idx + 1,
      slug: a.Slug || (a.Heading ? a.Heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : `post-${idx+1}`),
      title: a.Heading || '',
      subtitle: a.Subheading || '',
      image: a.Image || '',
      author: a.Author || '',
      date: a.Date || '',
      excerpt: a.Excerpt || '',
      content: a.Content || ''
    };
    // normalize tags
    const tags = Array.isArray(a.Tags) ? a.Tags : (typeof a.Tags === 'string' && a.Tags ? a.Tags.split(',').map(s => s.trim()) : []);
    obj.tags = tags;
    // infer minimal tags when missing
    if (!obj.tags.length) {
      const s = (obj.title + ' ' + obj.subtitle).toLowerCase();
      if (s.includes('philosophy')) obj.tags.push('philosophy');
      if (s.includes('asana') || s.includes('pranayama') || s.includes('yoga')) obj.tags.push('practice');
      if (s.includes('brain') || s.includes('gland') || s.includes('chakra') || s.includes('science')) obj.tags.push('science');
    }
    return obj;
  }

  /**
   * Load articles.json, locate matching slug (or fallback), and render page sections.
   */
  async function load() {
    try {
      const res = await fetch(DATA_URL);
      let articles = await res.json();
      let posts = articles.map(mapArticle);
      const slug = getSlug();
      const post = posts.find(p => p.slug === slug) || posts[0];
      if (!post) return;
      document.getElementById('post-article').innerHTML = templateArticle(post);
      const recommended = posts.filter(p => p.slug !== post.slug).slice(0, 6);
      document.getElementById('recommended-grid').innerHTML = recommended.map(templateRecCard).join('');

      // Update breadcrumb with post title
      const breadcrumbTitle = document.getElementById('breadcrumb-title');
      if (breadcrumbTitle && post.title) {
        breadcrumbTitle.textContent = post.title.length > 50 ? post.title.substring(0, 47) + '...' : post.title;
      }

      // Render tags in sidebar
      const tagsCtn = document.getElementById('post-tags');
      if (tagsCtn && post.tags && post.tags.length) {
        tagsCtn.innerHTML = post.tags.map(t => `<a class="tag-chip" href="blog.html?tag=${encodeURIComponent(t)}"><i class='bx bx-purchase-tag'></i> ${t}</a>`).join('');
      }

      // Render share buttons in sidebar
      const shareCtn = document.getElementById('post-share');
      if (shareCtn) {
        const shareUrl = encodeURIComponent(window.location.href);
        const shareText = encodeURIComponent(post.title + ' - ' + post.subtitle);
        shareCtn.innerHTML = `
          <div class="post-share post-share-sidebar">
            <span class="share-label">Share:</span>
            <a class="share-btn" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}"><i class='bx bxl-facebook-square'></i> Facebook</a>
            <a class="share-btn" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}"><i class='bx bxl-twitter'></i> X</a>
            <a class="share-btn" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}"><i class='bx bxl-linkedin-square'></i> LinkedIn</a>
            <button class="share-btn clip-btn" type="button"><i class='bx bx-link-alt'></i> Copy Link</button>
          </div>
        `;
        const clipBtn = shareCtn.querySelector('.clip-btn');
        clipBtn?.addEventListener('click', async () => {
          try { await navigator.clipboard.writeText(window.location.href); clipBtn.textContent = 'Copied!'; setTimeout(() => clipBtn.textContent = 'Copy Link', 1500); } catch {}
        });
      }
    } catch (e) {
      console.error('Failed to load post', e);
    }
  }

  document.addEventListener('DOMContentLoaded', load);
})();
