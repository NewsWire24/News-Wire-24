let lang = 'hi';
let allNews = [];

// Demo data - API key lagate hi real news ayegi
allNews = [
{
 title_hi: "ISRO ne naya satellite launch kiya",
 title_en: "ISRO launched new satellite",
 category: "national",
 image: "https://images.pexels.com/photos/2156/sky-earth-space-working.jpg",
 content_hi: "Bharat ki antariksh agency ISRO ne aaj... (700 words ki detail yaha AI re-write karke bharega, data ke saath)",
 content_en: "India's space agency ISRO today... (detailed analytical news)",
 date: new Date().toLocaleString()
}
];

function renderNews(list){
 const c = document.getElementById('news-container');
 c.innerHTML = "";
 list.forEach(n=>{
   c.innerHTML += `
   <div class="card">
     <img src="${n.image}" onerror="this.src='https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg'">
     <h3>${lang=='hi'? n.title_hi : n.title_en}</h3>
     <p class="byline">By Gaurav Sharma (News Wire 24) | ${n.date} | ${n.category}</p>
     <p>${lang=='hi'? n.content_hi : n.content_en}</p>
   </div>`;
 });
}

function toggleLang(){
 lang = lang=='hi' ? 'en' : 'hi';
 renderNews(allNews);
}

function filterNews(cat){
 if(cat=='all') renderNews(allNews);
 else renderNews(allNews.filter(x=>x.category==cat));
}

renderNews(allNews);

// TODO: Real API connect - iske liye next step me workflow banayenge
