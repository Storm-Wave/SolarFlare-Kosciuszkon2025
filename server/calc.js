class CalcData  {
    constructor(yearlySavings, yearlyCostsNoPV, yearlyCostsPV) {
        this.yearlySavings = yearlySavings;
        this.yearlyCostsNoPV = yearlyCostsNoPV;
        this.yearlyCostsPV = yearlyCostsPV;
    }
}

const years = 25;

let calculateYearlyReturn = function(entryData) {
    let energyBuy = entryData.buyPrice*(1+entryData.priceIncrease); // price for buying energy at current year
    let energySell = entryData.sellPrice*(1+entryData.priceIncrease); // price for selling energy at current year

    let oldPrice = energyBuy*entryData.consumption; // cumulative price paid normally for the year 
    let installationCost = entryData.pvSize*entryData.pvCostPerKw;
    let newPrice = installationCost+energyBuy*(Math.max(entryData.consumption-entryData.pvProduction, 0)) - energySell*(Math.max(entryData.pvProduction - entryData.consumption, 0)); // cumulative price for this year with installation

    let yearlyCostsPV = Array(years)
    let yearlyCostsNoPV = Array(years);
    let yearlySavings = Array(years);
    for(let i = 0; i < years; i++) {
        yearlyCostsPV[i] = newPrice;
        yearlyCostsNoPV[i] = oldPrice;
        yearlySavings[i] = yearlyCostsNoPV[i]-yearlyCostsPV[i];
        
        energyBuy = energyBuy*(1+entryData.priceIncrease);
        energySell = energySell*(1+entryData.priceIncrease);

        oldPrice += energyBuy*entryData.consumption;
        newPrice += energyBuy*(Math.max(entryData.consumption-entryData.pvProduction, 0)) - energySell*(Math.max(entryData.pvProduction - entryData.consumption, 0));  
    }


    return new CalcData(
        yearlySavings,
        yearlyCostsNoPV,
        yearlyCostsPV);
}


module.exports = {
    calculateYearlyReturn 
};
