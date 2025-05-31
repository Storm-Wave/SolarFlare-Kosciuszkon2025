const savings = {
    yearlySavings: [],
    yearlyCosts: [],
}

let calculateYearlyReturn = function(years, entryData) {
    let savings = Object.entries(savings)
    let prevYearSellPrice = entryData.sellPrice;
    let prevYearBuyPrice = entryData.buyPrice;
    let cumulatedSavings = 0;
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
        savings.yearlySavings.push(cumulatedSavings);
    }
    return savings;
}