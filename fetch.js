const fs = require('fs');

async function run(){
  const newsDataKey = process.env.NEWSDATA_KEY;
  const geminiKey = process.env.GEMINI_KEY;

  let res = await fetch(`https://newsdata.io/api/1/news?apikey=${newsDataKey}&country=in&language=hi,en&category=top,national,world,sports,entertainment,health,education`);
  let data = await res.json();

  if(!data.results){ console.log("No news found"); return; }

  let finalNews = [];
  for(let item of data.results.slice(0,10)){
    let prompt = `Is news ko 700 words me Hindi aur English me alag alag re-write karo. Original jaisi na lage. Logical, data ke saath, 3 para me. Faltu AI words mat use karna. News: ${item.title} - ${item.description}`;

    let gemRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({contents:[{parts:[{text:prompt}]}]})
    });
    let gemData = await gemRes.json();
    let rewritten = gemData.candidates?.[0]?.content?.parts?.[0]?.text || item.description || item.title;

    // Image Logic - Pexels nahi, direct solution
    let imageUrl = item.image_url;
    if(!imageUrl){
      // Agar image nahi hai to category ke hisab se copyright-free Unsplash image
      const cat = item.category?.[0] || 'news';
      imageUrl = `https://source.unsplash.com/800x400/?${cat},india`;
    }

    finalNews.push({
      title_hi: item.title,
      title_en: item.title,
      category: item.category?.[0] || 'national',
      image: imageUrl,
      content_hi: rewritten.substring(0,900),
      content_en: rewritten.substring(0,900),
      date: new Date().toLocaleString('en-IN')
    });
  }

  fs.writeFileSync('news.json', JSON.stringify(finalNews, null, 2));
  console.log("News updated without Pexels");
}
run();
