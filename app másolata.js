const express = require("express");
const app = express();
const scraper = require(__dirname + "/scraper.js");
const avgCalc = require(__dirname + "/averageCalculator.js");

const cheerio = require("cheerio");
const request = require("request");

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
  let ingatlanok=[]; 

  function getProperties($, callback) {
    //var ingatlanok=[]; 
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

  const address = req.body.webaddress;
  request(address, (error, response, html) => {
    if (error) {
      console.log(error);
    }
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(html);
      
      const pages = $(".pagination__page-number").text().replace(/[^0-9/\.]+/g, "");
      
      var result = pages.split("/");
      //if(parseInt(result[0])/parseInt(result[1])===1 || pages==""){//last page found or onlz one page exist then show result
        getProperties($, function(){
          let obj= avgCalc.average(ingatlanok)
          
          res.render("list", {
            avgPrice: obj.averagePrice,
            avgNmPrice: obj.averagePriceSQM,
            avgSize: obj.averageSize,
            avgPropSize: obj.averageProperty,
          });
          
        })
      //}else{
        //restart request with the next url
      //}

    }
 
  })
})
app.listen(3000, function () {
  console.log("server running ");
});







