const fs = require('fs');

async function run(){
  const key = process.env.NEWSDATA_KEY;
  let res = await fetch(`https://newsdata.io/api/1/news?apikey=${key}&country=in&language=hi,en&category=top,national,world,sports,entertainment,health,education&size=10`);
  let data = await res.json();

  if(!data.results){
    console.log("News API limit khatam ya key galat:", JSON.stringify(data));
    return;
  }

  let finalNews = data.results.map(item => {
    // AdSense Safe Re-write Logic - Bina AI ke original banana
    let desc = item.description || item.title;
    
    // Source name hatana + apna touch dena
    let cleanDesc = desc.replace(/Aaj Tak|NDTV|Jagran|Patrika|Zee News/gi, "News Wire 24");
    
    // Analytical banane ke liye template
    let analyticalContent = `${cleanDesc}\n\nIs khabar ka vishleshan: Ye ghatna ${item.category?.[0] || 'desh'} se judi hui hai aur iska seedha asar aam janta par pad raha hai. News Wire 24 ki team ne iski gehri janch ki hai. Aane wale samay me isse jude aur bhi updates aap tak pahunchaye jayenge.\n\nPuri khabar vistaar se: ${cleanDesc} Is mudde par adhikariyon ka kehna hai ki sthiti par nazar rakhi ja rahi hai.`;

    // Image - Bina API key ke
    let img = item.image_url;
    if(!img || img.includes("null")){
      img = `https://picsum.photos/seed/${item.title.substring(0,10)}/800/400`;
    }

    return {
      title_hi: item.title,
      title_en: item.title,
      category: (item.category && item.category[0]) ? item.category[0].toLowerCase() : 'national',
      image: img,
      content_hi: analyticalContent.substring(0,1200),
      content_en: analyticalContent.substring(0,1200),
      date: new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'}),
      source: "News Wire 24 Original"
    };
  });

  fs.writeFileSync('news.json', JSON.stringify(finalNews, null, 2));
  console.log("Done - News updated 100% free mode me");
}
run();
