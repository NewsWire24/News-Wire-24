let currentLang = 'en';
let currentCategory = 'general';
let currentPage = 1;
const PAGE_SIZE = 10;
const MAX_STORED_ARTICLES = 500;

// Dual Fetch Source Strategy (Google Live RSS + Backup Client API)
async function fetchNews(category = 'general', lang = 'en') {
    const newsContainer = document.getElementById('news-container');
    if (newsContainer) {
        newsContainer.innerHTML = '<div class="loading">Fetching live authenticated reports...</div>';
    }

    try {
        let rawArticles = [];
        const rssCategoryMap = {
            general: 'NATION',
            business: 'BUSINESS',
            technology: 'TECHNOLOGY',
            sports: 'SPORTS',
            entertainment: 'ENTERTAINMENT',
            health: 'HEALTH',
            science: 'SCIENCE'
        };

        const topic = rssCategoryMap[category] || 'NATION';
        const hl = lang === 'hi' ? 'hi' : 'en-IN';
        const gl = 'IN';
        const ceid = lang === 'hi' ? 'IN:hi' : 'IN:en';

        // Source 1: Live Google News RSS via RSS2JSON Parser
        const rssUrl = encodeURIComponent(`https://news.google.com/rss/headlines/section/topic/${topic}?hl=${hl}&gl=${gl}&ceid=${ceid}`);
        const primaryApi = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

        const res = await fetch(primaryApi);
        const data = await res.json();

        if (data.status === 'ok' && data.items && data.items.length > 0) {
            rawArticles = data.items.map(item => ({
                title: item.title,
                publishedAt: item.pubDate,
                description: item.description ? item.description.replace(/<[^>]*>?/gm, '') : item.title,
                url: item.link,
                source: item.author || 'Verified Wire Source',
                image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80'
            }));
        } else {
            // Source 2: Backup Static Mirror
            const backupUrl = `https://saurav.tech/NewsAPI/top-headlines/category/${category}/in.json`;
            const backupRes = await fetch(backupUrl);
            const backupData = await backupRes.json();
            if (backupData.articles) {
                rawArticles = backupData.articles.map(art => ({
                    title: art.title,
                    publishedAt: art.publishedAt,
                    description: art.description || art.title,
                    url: art.url,
                    source: art.source ? art.source.name : 'Newswire Engine',
                    image: art.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80'
                }));
            }
        }

        if (rawArticles.length > 0) {
            const formatted = rawArticles.map(art => formatArticle(art, lang));
            storeArticles(formatted);
            renderCurrentPage();
        } else {
            if (newsContainer) newsContainer.innerHTML = '<p>No news available right now.</p>';
        }

    } catch (err) {
        console.error('Fetch error:', err);
        if (newsContainer) newsContainer.innerHTML = '<p>Unable to load news feed. Please try again.</p>';
    }
}

function formatArticle(art, lang) {
    const pubDate = new Date(art.publishedAt || Date.now()).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const desc = art.description || art.title;
    
    let p1, p2, p3;
    if (lang === 'hi') {
        p1 = `${desc} इस महत्वपूर्ण घटना पर आधिकारिक स्रोत (${art.source}) द्वारा रिपोर्ट जारी कर दी गई है।`;
        p2 = `मामले की गहराई से समीक्षा की जा रही है। संबंधित प्रशासनिक व तकनीकी पक्ष स्थिति का लगातार आकलन कर रहे हैं।`;
        p3 = `गौरव शर्मा (News Wire 24) इस रिपोर्ट पर पूरी नज़र बनाए हुए हैं। आगे की प्रामाणिक जानकारी प्राप्त होते ही समाचार को अपडेट किया जाएगा। (तारीख: ${pubDate})`;
    } else {
        p1 = `${desc} Key official reports verified by authentic news sources (${art.source}) have confirmed this development.`;
        p2 = `Field evaluators and administrative representatives are assessing the full context and operational details as information arrives.`;
        p3 = `Gaurav Sharma (News Wire 24) is constantly monitoring this coverage. Further verified updates will be posted as confirmed. (Date: ${pubDate})`;
    }

    return {
        id: encodeURIComponent(art.url || art.title),
        title: art.title,
        publishedAt: pubDate,
        image: art.image,
        paragraph1: p1,
        paragraph2: p2,
        paragraph3: p3,
        sourceUrl: art.url
    };
}

// 500 Articles Storage Engine (New Top pe, Purani Delete)
function storeArticles(newArticles) {
    let storageKey = `nw24_news_${currentCategory}_${currentLang}`;
    let existing = JSON.parse(localStorage.getItem(storageKey) || '[]');

    // Duplicate check and push to top
    newArticles.forEach(art => {
        if (!existing.some(e => e.title === art.title)) {
            existing.unshift(art);
        }
    });

    // Keep max 500 articles
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
        if (newsContainer) newsContainer.innerHTML = '<p>No stored articles found.</p>';
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

    // Update Pagination UI
    document.getElementById('page-info').innerText = `${currentLang === 'hi' ? 'पेज' : 'Page'} ${currentPage} / ${totalPages}`;
    document.getElementById('prev-btn').disabled = (currentPage === 1);
    document.getElementById('next-btn').disabled = (currentPage >= totalPages);
}

// Pagination Event Listeners
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

// Category Switcher
document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        currentCategory = e.target.getAttribute('data-category');
        currentPage = 1;
        fetchNews(currentCategory, currentLang);
    });
});

// Language Switcher
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

// Initial Load
fetchNews(currentCategory, currentLang);

