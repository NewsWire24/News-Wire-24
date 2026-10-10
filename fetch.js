const fs = require('fs');
const API_KEY = process.env.NEWS_API_KEY;

async function toHindi(text) {
  try {
    if (!text) return "";
    const url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(text) + "&langpair=en|hi";
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    return text;
  } catch (e) {
    return text;
  }
}

async function main() {
  let list = [];
  try {
    const apiUrl = "https://newsdata.io/api/1/news?apikey=" + API_KEY + "&country=in&language=en&size=25";
    const r = await fetch(apiUrl);
    const j = await r.json();
    if (j.results) list = j.results;
  } catch (e) {
    console.log("API fail: " + e.message);
  }

  if (list.length < 3) {
    list = [
      { title: "ISRO launched new satellite successfully", description: "ISRO has successfully launched its new communication satellite from Sriharikota.", category: ["national"], image_url: "", link: "#" },
      { title: "India wins cricket match against Australia", description: "India defeated Australia by 5 wickets in a thrilling match.", category: ["sports"], image_url: "", link: "#" },
      { title: "Sensex hits all time high", description: "Indian stock market Sensex crossed 80000 mark today.", category: ["business"], image_url: "", link: "#" },
      { title: "New Bollywood movie breaks box office record", description: "Latest Bollywood movie collected 100 crore in two days.", category: ["entertainment"], image_url: "", link: "#" },
      { title: "Heavy rain alert in Delhi", description: "Weather department issued heavy rain alert for Delhi NCR.", category: ["national"], image_url: "", link: "#" }
    ];
  }

  const finalList = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const titleEn = item.title || "Breaking News";
    const descEn = item.description || item.content || "Full details inside.";

    console.log("Translating " + (i+1) + "/" + list.length);
    const titleHi = await toHindi(titleEn);
    const descHi = await toHindi(descEn);

    finalList.push({
      title: titleEn,
      title_hi: titleHi,
      content: descEn,
      content_hi: descHi,
      category: item.category? item.category[0] : "national",
      image: item.image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c",
      link: item.link || "#",
      author: "Gaurav Sharma (News Wire 24)",
      date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    });

    await new Promise(r => setTimeout(r, 800));
  }

  fs.writeFileSync("news.json", JSON.stringify(finalList, null, 2), "utf-8");
  console.log("Done: " + finalList.length + " news saved");
}

main();
