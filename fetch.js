const fs = require('fs');
const API_KEY = process.env.NEWS_API_KEY; // GitHub secret se ayega

async function translateToHindi(text) {
  try {
    // Free MyMemory API - sahi Hindi deta hai Hinglish nahi
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|hi`);
    const data = await res.json();
    return data.responseData.translatedText || text;
  } catch {
    return text; // fail hua to English hi rehne de
  }
}

async function getNews() {
  let articles = [];
  try {
    // Category wise 5-5 news layega = 25 total
    const categories = ['national', 'world', 'sports', 'entertainment', 'business'];
    for (let cat of categories) {
      const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&country=in&language=en&category=${cat}&size=5`;
      const r = await fetch(url);
      const d = await r.json();
      if (d.results) {
       
