const cheerio = require("cheerio");
const request= require("request");

exports.scrape =function (webaddress){
    
    webaddress="https://ingatlan.com/lista/elado+haz+csaladi-haz+fejer-megye+pest-megye+50-mFt-ig+80-m2-felett+650-m2telek-felett?page=2";
    const items =  request(webaddress,(error,response, html)=>{
        var ingatlanok=[];    
        if(error){
            console.log(error);
        }
        if(!error && response.statusCode==200){
            const $ =cheerio.load(html);
            const pages = $(".pagination__page-number").text();
            // console.log(siteHeading.text());
            $(".listing__card").each((index, card)=>{
                let item ={
                    price:"",
                    pricesqm:"",
                    size:"",
                    property:""
                }
                item.price = Number($(card).find(".price").text().replace(/[^0-9\.]+/g, ""));
                item.pricesqm = Number($(card).find(".price--sqm").text().replace(/[^0-9\.]+/g, ""));
                item.size = Number($(card).find(".listing__data--area-size").text().replace(/[^0-9\.]+/g, ""));
                item.property = Number($(card).find(".listing__data--plot-size").text().replace(/[^0-9\.]+/g, ""));
                ingatlanok.push(item);
            });


            let result = createResult(ingatlanok)
            
            function createResult(ingatlanok){
                let totalPrice = 0;
                let totalPricesqm = 0;
                let totalSize = 0;
                let totalProperty = 0;
        
                ingatlanok.forEach((item)=>{
                    totalPrice += item.price;
                    totalPricesqm += item.pricesqm;
                    totalSize += item.size;
                    totalProperty += item.property;
                    
        
                });

                let obj={
                    averagePrice: totalPrice/ingatlanok.length,
                    averagePriceSQM: totalPricesqm/ingatlanok.length,
                    averagePriceSize: totalSize/ingatlanok.length,
                    averagePriceProperty: totalProperty/ingatlanok.length
                };
                return obj;
            } 
        }
        console.log("inside request");        
        return ingatlanok});

    return(items) ;
}

