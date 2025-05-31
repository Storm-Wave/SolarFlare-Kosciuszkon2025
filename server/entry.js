class entryData {
    constructor(consumption, buyPrice, pvSize, pyProduction, sellPrice, pvCostPerKw, autoconsumption, priceIncrease) {
        this.consumption = consumption;
        this.buyPrice = buyPrice;
        this.pvSize = pvSize;
        this.pyProduction = pyProduction;
        this.sellPrice = sellPrice;
        this.pvCostPerKw = pvCostPerKw;
        this.autoconsumption = autoconsumption;
        this.priceIncrease = priceIncrease;
    }
}


function import_data(req) {
    const {consumption, buyPrice, pvSize, pvProduction, sellPrice, pvCostPerKw, autoconsumption, priceIncrease} = req.body;
    return entryData(consumption, buyPrice, pvSize, pvProduction, sellPrice, pvCostPerKw, autoconsumption, priceIncrease);
}


module.exports = {Entry_data, import_data};

