const express = require("express");
const app = express();
const scraper = require(__dirname + "/scraper.js");
const avgCalc = require(__dirname + "/averageCalculator.js");

const cheerio = require("cheerio");
const request = require("request");
const pagelimit = 40;
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
  function getProperties($,callback) {

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
  let ingatlanok = [];
  let counter =[]
  address = req.body.webaddress.split("?page=")[0]+("?page=");
  console.log(address);
  for (let i = 1; i < pagelimit; i++) {//lmit number of pages


    request(address + i, (error, response, html) => {

      if (error) {
        console.log(error);
      } else if (!error && response.statusCode == 200) {

        const $ = cheerio.load(html);
        const counts = parseInt($(".results__number__count").text());
        
        getProperties($, function () {
          counter.push(i);
          console.log(counter.length);
          if(counter.length===pagelimit-1){
          //if (ingatlanok.length!==0 &&  ingatlanok.length === counts  ) {//limit the founds
            let obj = avgCalc.average(ingatlanok)
            res.render("list", {
              numberOfElements: obj.numberofElements,
              avgPrice: obj.averagePrice,
              avgNmPrice: obj.averagePriceSQM ,
              avgSize: obj.averageSize,
              avgPropSize: obj.averageProperty,
            });
          }
        })
      }
    })
  }

})

let port = process.env.PORT;
if (port == null || port == ""){
  port = 3000;
}
app.listen(  port, function() {
  console.log("Server started on port 3000");
});