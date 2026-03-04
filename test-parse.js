const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const { data } = await axios.get('http://www.fourfoldgospel.org/main/sub.html?page=1&boardID=www40');
  const $ = cheerio.load(data);
  const links = [];
  $(".mdWebzineSbj a").each((_, el) => {
    links.push($(el).attr("href"));
  });
  console.log("Links:", links);

  const { data: detail } = await axios.get('http://www.fourfoldgospel.org/main/sub.html?Mode=view&boardID=www40&num=922&page=1');
  const $2 = cheerio.load(detail);
  console.log("Title:", $2(".mdSbj").text().trim());
  console.log("Author:", $2(".mdNameList").text().trim() || "Author parsing might need anySecure");
  console.log("Content text length:", $2(".mdDefaultDiv.mdViewCon").text().length);
  $2("a").each((_, el) => {
    const href = $2(el).attr('href');
    if(href && href.includes('download')) {
      console.log("Download link:", href);
    }
  });
}
test();
