exports.average = function (ingatlanok) {

    let totalPrice = 0;
    let totalPricesqm = 0;
    let totalSize = 0;
    let totalProperty = 0;

    ingatlanok.forEach((item) => {
        totalPrice += item.price*1000000;
        totalPricesqm += Math.round(item.price*1000000/item.size);
        totalSize += item.size;
        totalProperty += item.property;
    });
    
    let obj = {
        averagePrice: Math.round(totalPrice / ingatlanok.length ).toLocaleString('hu-HU', {
            style: 'currency',
            maximumSignificantDigits:  4,
            currency: 'HUF',
          }),
        averagePriceSQM: Math.round(totalPricesqm / ingatlanok.length).toLocaleString('hu-HU', {
            style: 'currency',
            maximumSignificantDigits:  4,
            currency: 'HUF',
        }),
        averageSize: Math.round(totalSize / ingatlanok.length),
        averageProperty: Math.round(totalProperty / ingatlanok.length),
        numberofElements:ingatlanok.length
    };
    return obj;
}