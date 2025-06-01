class CalcDataH  {
    constructor(hourlySavings, hourlyCostsNoPV, hourlyCostsPV) {
        this.hourlySavings = hourlySavings;
        this.hourlyCostsNoPV = hourlyCostsNoPV;
        this.hourlyCostsPV = hourlyCostsPV;
    }
}

class CalcDataY {
    constructor(yearlySavings, yearlyCostsNoPV, yearlyCostsPV) {
        this.yearlySavings = yearlySavings;
        this.yearlyCostsNoPV = yearlyCostsNoPV;
        this.yearlyCostsPV = yearlyCostsPV;
    }

}

const years = 25;
const hours = years*365*24;

let hourlyReturn = function(entryData, sunPerH, buyPerH, sellPerH, powerPerDay) {
    let hourlySavings =  new Array(hours).fill(0);
    let hourlyCostsNoPV = new Array(hours).fill(0);
    let hourlyCostsPV = new Array(hours).fill(0);
    hourlyCostsPV[0] = entryData.pvSize*entryData.pvCostPerKw; //initial cost
    let daily_cons = entryData.consumption/365;
    let mult = 1;
    for(let i = 0; i < hours; i++) {
        if(i % (24*365) == 0 && i != 0) mult *= (1-entryData.panelwear);
        hourlyCostsNoPV[i] = powerPerDay[i%24]*daily_cons*buyPerH[i];
        hourlyCostsPV[i] += buyPerH[i]*Math.max((powerPerDay[i%24]*daily_cons-sunPerH[i]*mult), 0);
        hourlyCostsPV[i] -= sellPerH[i]*Math.max((-powerPerDay[i%24]*daily_cons+sunPerH[i]*mult), 0);
        hourlySavings[i] = hourlyCostsNoPV[i] - hourlyCostsPV[i];
        if(i != 0) {
            hourlySavings[i] += hourlySavings[i-1];
            hourlyCostsNoPV[i] += hourlyCostsNoPV[i-1];
            hourlyCostsPV[i] += hourlyCostsPV[i-1];
        }
    }

    return new CalcDataH(
        hourlySavings,
        hourlyCostsNoPV,
        hourlyCostsPV);
}

function yearlyReturn(dataH) {
    let yearlySavings = new Array(years).fill(0);
    let yearlyCostsPV = new Array(years).fill(0);
    let yearlyCostsNoPV = new Array(years).fill(0);
    for(let i = 0, j = 0; i < hours; i+=24*365, j++) { 
        yearlyCostsNoPV[j] = dataH.hourlyCostsNoPV[i];
        yearlyCostsPV[j] = dataH.hourlyCostsPV[i];
        yearlySavings[j] = dataH.hourlySavings[i];
    }

    return new CalcDataY(
        yearlySavings,
        yearlyCostsNoPV,
        yearlyCostsPV,
    );
}


module.exports = {
    yearlyReturn,
    hourlyReturn, 
};
