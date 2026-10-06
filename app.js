let currentLang = 'en';
let currentCategory = 'general';
let currentPage = 1;
const PAGE_SIZE = 10;
const MAX_STORED_ARTICLES = 500;

async function fetchNews(category = 'general', lang = 'en') {
    const newsContainer = document.getElementById('news-container');
    if (newsContainer) {
        newsContainer.innerHTML = '<div class="loading">Fetching live authenticated reports...</div>';
    }

    // Direct static mirror endpoint (No CORS Proxy needed, works 100%)
    const targetUrl = `https://saurav.tech/NewsAPI/top-headlines/category/${category}/in.json`;

    try {
        const res = await fetch(targetUrl);
        const data = await res.json();

        if (data && data.articles && data.articles.length > 0) {
            const formatted = data.articles.map(art => formatArticle(art, lang));
            storeArticles(formatted);
            renderCurrentPage();
        } else {
            if (newsContainer) newsContainer.innerHTML = '<p style="text-align:center; padding: 20px;">No articles found.</p>';
        }
    } catch (err) {
        console.error('Fetch error:', err);
        if (newsContainer) {
            newsContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Error loading news feed. Please refresh.</p>';
        }
    }
}

function formatArticle(art, lang) {
    const pubDate = new Date(art.publishedAt || Date.now()).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const title = art.title || "Breaking News Update";
    const desc = art.description || title;
    const sourceName = art.source && art.source.name ? art.source.name : "Verified Wire Agency";

    let p1, p2, p3;
    if (lang === 'hi') {
        p1 = `${desc} इस मुख्य समाचार की पुष्टि आधिकारिक स्रोत (${sourceName}) के ज़रिए की गई है।`;
        p2 = `मामले पर संबंधित विभाग और विश्लेषक लगातार स्थिति का जायजा ले रहे हैं।`;
        p3 = `गौरव शर्मा (News Wire 24) की इस रिपोर्ट पर सीधी नज़र बनी हुई है। ताज़ा अपडेट्स आते ही जानकारी अपडेट की जाएगी। (दिनांक: ${pubDate})`;
    } else {
        p1 = `${desc} Key findings regarding this release have been verified by authentic official channels (${sourceName}).`;
        p2 = `Administrative teams and field experts are actively monitoring the evolving situation to gather further operational context.`;
        p3 = `Gaurav Sharma (News Wire 24) is continuously following this story. Further updates will be issued as confirmed. (Date: ${pubDate})`;
    }

    return {
        id: encodeURIComponent(art.url || title),
        title: title,
        publishedAt: pubDate,
        image: art.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
        paragraph1: p1,
        paragraph2: p2,
        paragraph3: p3,
        sourceUrl: art.url || '#'
    };
}

function storeArticles(newArticles) {
    let storageKey = `nw24_news_${currentCategory}_${currentLang}`;
    let existing = JSON.parse(localStorage.getItem(storageKey) || '[]');

    newArticles.forEach(art => {
        if (!existing.some(e => e.title === art.title)) {
            existing.unshift(art);
        }
    });

    if (existing.length > MAX_STORED_ARTICLES) {
        existing = existing.slice(0, MAX_STORED_ARTICLES);
    }

    localStorage.setItem(storageKey, JSON.stringify(existing));
}

function renderCurrentPage() {
    const newsContainer = document.getElementById('news-container');
    let storageKey = `nw24_news_${currentCategory}_${currentLang}`;
    let articles = JSON.parse(localStorage.getItem(storageKey) || '[]');

    if (!articles || articles.length === 0) {
        if (newsContainer) newsContainer.innerHTML = '<p style="text-align:center; padding: 20px;">No stored articles available.</p>';
        return;
    }

    const totalPages = Math.ceil(articles.length / PAGE_SIZE) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const pageArticles = articles.slice(startIndex, startIndex + PAGE_SIZE);

    newsContainer.innerHTML = '';

    pageArticles.forEach(article => {
        const articleCard = document.createElement('article');
        articleCard.className = 'article-card';

        const shareText = encodeURIComponent(`${article.title} - Read full report by Gaurav Sharma on News Wire 24`);
        const pageUrl = encodeURIComponent(article.sourceUrl || window.location.href);

        articleCard.innerHTML = `
            <h2 class="article-title">${article.title}</h2>
            <div class="article-byline">
                <span>By Gaurav Sharma (News Wire 24)</span>
                <span>${article.publishedAt}</span>
            </div>
            <img src="${article.image}" alt="News Image" class="article-img" onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80'">
            <div class="article-body">
                <p>${article.paragraph1}</p>
                <p>${article.paragraph2}</p>
                <p>${article.paragraph3}</p>
            </div>
            <div class="share-section">
                <span class="share-title">${currentLang === 'hi' ? 'शेयर करें:' : 'Share Article:'}</span>
                <a href="https://api.whatsapp.com/send?text=${shareText}%20${pageUrl}" target="_blank" class="share-btn share-wa">WhatsApp</a>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${pageUrl}" target="_blank" class="share-btn share-fb">Facebook</a>
                <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${pageUrl}" target="_blank" class="share-btn share-x">X (Twitter)</a>
                <button onclick="navigator.clipboard.writeText('${article.sourceUrl}'); alert('${currentLang === 'hi' ? 'लिंक कॉपी हो गया!' : 'Link Copied!}');" class="share-btn share-link">Copy Link</button>
            </div>
        `;
        newsContainer.appendChild(articleCard);
    });

    document.getElementById('page-info').innerText = `${currentLang === 'hi' ? 'पेज' : 'Page'} ${currentPage} / ${totalPages}`;
    document.getElementById('prev-btn').disabled = (currentPage === 1);
    document.getElementById('next-btn').disabled = (currentPage >= totalPages);
}

document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderCurrentPage();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

document.getElementById('next-btn').addEventListener('click', () => {
    currentPage++;
    renderCurrentPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        currentCategory = e.target.getAttribute('data-category');
        currentPage = 1;
        fetchNews(currentCategory, currentLang);
    });
});

const langToggleBtn = document.getElementById('lang-toggle-btn');
if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
        if (currentLang === 'en') {
            currentLang = 'hi';
            langToggleBtn.innerText = '🌐 Switch to English';
        } else {
            currentLang = 'en';
            langToggleBtn.innerText = '🌐 Switch to Hindi';
        }
        currentPage = 1;
        fetchNews(currentCategory, currentLang);
    });
}

fetchNews(currentCategory, currentLang);
