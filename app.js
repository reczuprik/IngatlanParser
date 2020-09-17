const express = require("express");
const app = express();
const avgCalc = require(__dirname + "/averageCalculator.js");
const cheerio = require("cheerio");
const got = require("got");

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
  const webAddress = req.body.webaddress;
  (async () => {

    // Extract ingatlanok on the page, recursively check the next page in the URL pattern
    const extractingatlanok = async url => {
      // Scrape the data we want
      const response = await got(url);
      const $ = cheerio.load(response.body);

      function createData($) {
        const ingatlanOnOnePage = []
        $('div.listing__card').each(function (i, e) {
          const newElement = cheerio.load(e);
          const newItem = {
            price: "0",
            priceSqm: "0",
            size: "0",
            property: "0"
          }
          newItem.price = Number(newElement("div.price").text().replace(/[^0-9\.]+/g, ""));
          newItem.priceSqm = Number(newElement("div.price--sqm").text().replace(/[^0-9\.]+/g, ""));
          newItem.size = Number(newElement("div.listing__data--area-size").text().replace(/[^0-9\.]+/g, ""));
          newItem.property = Number(newElement("div.listing__data--plot-size").text().replace(/[^0-9\.]+/g, ""));
          ingatlanOnOnePage.push(newItem);
        });

        return ingatlanOnOnePage;

      }
      const ingatlanokOnPage = createData($);


      // Recursively scrape the next page
      if (ingatlanokOnPage.length < 1) {
        // Terminate if no ingatlanok exist
        return ingatlanokOnPage
      } else {
        // Go fetch the next page ?page=X+1

        const nextPageNumber = parseInt(url.match(/page=(\d+)$/)[1], 10) + 1;
        const nextUrl = webAddress + ("?page=") + nextPageNumber;
        console.log(nextPageNumber);
        if (nextPageNumber > 37) {
          return ingatlanokOnPage
        } else {
     return ingatlanokOnPage.concat(await extractingatlanok(nextUrl))
        }
      }
    };


    const firstUrl = webAddress.split("?page=")[0] + ("?page=1");
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

   
  })();


})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server started on port 3000");
});