const express = require("express");
const app = express();

const avgCalc = require(__dirname + "/averageCalculator.js");
const puppeteer = require("puppeteer");
const bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.get("/", function (req, res) {
  res.render("home", {});
})
app.post("/", function (req, res) {
  const webAddress= req.body.webaddress;
  (async () => {

    // Extract ingatlanok on the page, recursively check the next page in the URL pattern
    const extractingatlanok = async url => {

      // Scrape the data we want
      const page = await browser.newPage();
      await page.setRequestInterception(true);
      
      page.on('request', (request) => {
        if (request.resourceType() !== "document")
        request.abort();
        else request.continue();
      });

      await page.goto(url);
      const ingatlanokOnPage = await page.evaluate(() =>
        Array.from(document.querySelectorAll("div.listing__card")).map(card => ({
          price: Number(card.querySelector("div.price").innerText.replace(/[^0-9\.]+/g, "")),
          pricesqm: Number(card.querySelector("div.price--sqm").innerText.replace(/[^0-9\.]+/g, "")),
          size: Number(card.querySelector("div.listing__data--area-size").innerText.replace(/[^0-9\.]+/g, "")),
          property: Number(card.querySelector("div.listing__data--plot-size").innerText.replace(/[^0-9\.]+/g, ""))
        }))
      );
      await page.close();

      // Recursively scrape the next page
      if (ingatlanokOnPage.length < 1) {
        // Terminate if no ingatlanok exist
        return ingatlanokOnPage
      } else {
        // Go fetch the next page ?page=X+1
        const nextPageNumber = parseInt(url.match(/page=(\d+)$/)[1], 10) + 1;
        const nextUrl = webAddress + ("?page=")+ nextPageNumber;
        console.log(nextPageNumber);
        return ingatlanokOnPage.concat(await extractingatlanok(nextUrl))
      }
    };

    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    });
    const firstUrl =webAddress.split("?page=")[0]+("?page=1");
    const ingatlanok = await extractingatlanok(firstUrl);

    // Todo: Update database with ingatlanok
    let averageValues = avgCalc.average(ingatlanok);
    res.render("list", {
      numberOfElements: averageValues.numberofElements,
      avgPrice: averageValues.averagePrice,
      avgNmPrice: averageValues.averagePriceSQM,
      avgSize: averageValues.averageSize,
      avgPropSize: averageValues.averageProperty,
    });
    await browser.close();
  })();

})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server started on port 3000");
});

function getProperties($, callback) {

  $(".listing__card").each((index, card) => {
    let item = {
      price: "",
      pricesqm: "",
      size: "",
      property: ""
    }
    item.price = Number($(card).find(".price").text().replace(/[^0-9\.]+/g, ""));
    item.pricesqm = Number($(card).find(".price--sqm").text().replace(/[^0-9\.]+/g, ""));
    item.size = Number($(card).find(".listing__data--area-size").text().replace(/[^0-9\.]+/g, ""));
    item.property = Number($(card).find(".listing__data--plot-size").text().replace(/[^0-9\.]+/g, ""));
    ingatlanok.push(item);
  });
  return callback();

}

