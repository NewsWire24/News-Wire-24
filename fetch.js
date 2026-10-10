const fs = require('fs');
const API_KEY = process.env.NEWS_API_KEY;

async function toHindi(text) {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|hi`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    return text;
  } catch (e) {
    return text;
  }
}

async function main() {
  let raw = [];
  try {
    const categories = ["top", "national", "world", "sports", "business"];
    for (const cat of categories) {
      const apiUrl = `https://newsdata.io/api/1/news?apikey=${API_KEY}&country=in&language=en&category=${cat}&size=5`;
      const r = await fetch(apiUrl);
      const j = await r.json();
      if (j.results) {
       
