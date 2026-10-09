const fs = require('fs');
async function run(){
  try{
    const key = process.env.NEWSDATA_KEY;
    if(!key){ console.log("API Key missing"); return; }
    let res = await fetch(`https://newsdata.io/api/1/news?apikey=${key}&country=in&language=en&size=10`);
    let data = await res.json();
    if(!data.results){ console.log(JSON.stringify(data)); return; }
    let finalNews = data.results.map(item => ({
      title_hi: item.title,
      title_en: item.title,
      category: (item.category?.[0] || 'national').toLowerCase(),
      image: item.image_url || `https://picsum.photos/seed/${Date.now()}/800/400`,
      content_hi: (item.description || item.title) + " . News Wire 24 ki vishleshan team dwara.",
      content_en: (item.description || item.title) + " . Analyzed by News Wire 24.",
      date: new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})
    }));
    fs.writeFileSync('news.json', JSON.stringify(finalNews, null, 2));
    console.log("Success");
  }catch(e){ console.log(e); }
}
run();
