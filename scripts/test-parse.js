const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    console.log("Fetching LIST_URL...");
    const { data } = await axios.get('http://www.fourfoldgospel.org/main/sub.html?page=1&boardID=www40');
    const $ = cheerio.load(data);
    const links = [];
    $(".mdWebzineSbj a").each((_, el) => {
        links.push($(el).attr("href"));
    });
    console.log("Links found:", links.length);
    if (links.length > 0) {
        console.log("First link:", links[0]);
        console.log("Fetching Detail Page...");
        const url = links[0].startsWith('http') ? links[0] : 'http://www.fourfoldgospel.org' + links[0];
        const { data: detail } = await axios.get(url);
        const $2 = cheerio.load(detail);

        console.log("Title:", $2(".mdSbj, .mdWebzineSbj, title").first().text().trim());

        // Let's find some author class
        console.log("Author text:", $2(".mdNameList").text().trim());

        console.log("Content text length:", $2(".mdDefaultDiv.mdViewCon").text().length);
        console.log("HTML inside .mdViewCon:", $2(".mdDefaultDiv.mdViewCon").html()?.substring(0, 100));

        // Finding download link
        const fileLinks = [];
        $2("a").each((_, el) => {
            const href = $2(el).attr('href');
            if (href && (href.includes('download') || href.includes('file'))) {
                fileLinks.push(href);
            }
        });
        console.log("File Links:", fileLinks);
    }
}
test();
