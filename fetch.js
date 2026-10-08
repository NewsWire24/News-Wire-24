const fs = require('fs');

async function run(){
  const newsDataKey = process.env.NEWSDATA_KEY;
  const geminiKey = process.env.GEMINI_KEY;

  // 1. NewsData se real news lao
  let res = await fetch(`https://newsdata.io/api/1/news?apikey=${newsDataKey}&country=in&language=hi,en&category=top,national,world,sports,entertainment,health,education`);
  let data = await res.json();

  let finalNews = [];

  for(let item of data.results.slice(0,10)){
    // 2. Gemini se re-write karo taki copy-paste na lage, analytical bane
    let prompt = `Is news ko 700 words me Hindi aur English me alag alag re-write karo.
    Original jaisi na lage. Logical, data ke saath, 3 para me.
    Faltu AI words mat use karna.
    News: ${item.title} - ${item.description}`;

    let gemRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({contents:[{parts:[{text:prompt}]}]})
    });
    let gemData = await gemRes.json();
    let rewritten = gemData.candidates?.[0]?.content?.parts?.[0]?.text || item.description;

    finalNews.push({
      title_hi: item.title,
      title_en: item.title,
      category: item.category?.[0] || 'national',
      image: item.image_url || `https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg`,
      content_hi: rewritten.substring(0,800),
      content_en: rewritten.substring(0,800),
      date: new Date().toLocaleString('en-IN')
    });
  }

  // 3. news.json me save karo
  fs.writeFileSync('news.json', JSON.stringify(finalNews, null, 2));
  console.log("News updated");
}
run();
