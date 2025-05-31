class CalcData  {
    constructor(yearlySavings, yearlyCostsNoPV, yearlyCostsPV) {
        this.yearlySavings = yearlySavings;
        this.yearlyCostsNoPV = yearlyCostsNoPV;
        this.yearlyCostsPV = yearlyCostsPV;
    }
}

const years = 25;

let calculateYearlyReturn = function(entryData) {
    let prevYearSellPrice = entryData.sellPrice;
    let prevYearBuyPrice = entryData.buyPrice;
    let cumulatedSavings = 0;
    let cumulatedCostPV = 0;
    let cumulatedCostNoPV = 0;
    let yearlySavings = [];
    let yearlyCostsPV = [];
    let yearlyCostsNoPV = [];
    for (y = 0; y < years; y++) {
        let yearSellPrice = prevYearSellPrice * (1 + entryData.priceIncrease);
        let yearBuyPrice = prevYearBuyPrice * (1 + entryData.priceIncrease);
        prevYearSellPrice = yearSellPrice;
        prevYearBuyPrice = yearBuyPrice;

        let costNoPV = yearBuyPrice * entryData.consumption;
        let energyProduced = entryData.pvProduction * entryData.pvSize;
        let autoconsumption = entryData.autoconsumption * energyProduced;
        let energySold = energyProduced - autoconsumption;
        let energyConsumedWithPV = entryData.consumption - autoconsumption;
        let profit = yearSellPrice * energySold;
        let costPV = yearBuyPrice * energyConsumedWithPV - profit;

        cumulatedSavings += costNoPV - costPV;
        cumulatedCostPV += costPV;
        cumulatedCostNoPV += costNoPV;

        yearlySavings.push(cumulatedSavings);
        yearlyCostsNoPV.push(costNoPV);
        yearlyCostsPV.push(costPV);
    }
    return new CalcData(
        yearlySavings,
        yearlyCostsNoPV,
        yearlyCostsPV);
}