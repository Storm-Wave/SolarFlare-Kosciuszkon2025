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
    let hourlySavings = Array(hours);
    let hourlyCostsNoPV = Array(hours);
    let hourlyCostsPV = Array(hours);
    hourlyCostsPV[0] = entryData.pvSize*entryData.pvCostPerKw; //initial cost
    hourlyCostsNoPV[0] = 0; // no initial cost

    let hourly_use = entryData.panelWear/365/24;
    let hourly_pvProd = entryData.pvProduction/365/24;
    for(let i = 0; i < hours; i++) {
        hourlyCostsNoPV[i] += powerPerDay[i%24]*entryData.consumption*buyPerH[i];
        hourlyCostsPV[i] += buyPerH[i]*Math.max((powerPerDay[i%24]*entryData.consumption-sunPerH[i]*hourly_pvProd), 0);
        hourlyCostsPV[i] -= sellPerH[i]*Math.max((-powerPerDay[i%24]*entryData.consumption*buyPerH[i]+sunPerH[i]*hourly_pvProd), 0);

        hourly_pvProd *= 1 - hourly_use;
        hourlySavings[i] = hourlyCostsPV[i] - hourlyCostsNoPV[i];
    }


    return new CalcDataH(
        hourlySavings,
        hourlyCostsNoPV,
        hourlyCostsPV);
}

function yearlyReturn(dataH) {
    let yearlySavings = Array(years);
    let yearlyCostsPV = Array(years);
    let yearlyCostsNoPV = Array(years);

    let j = -1;
    for(let i = 0; i < hours; i++) {
        if(i % 24*365 == 0) j++;
        yearlySavings[j] += dataH.hourlySavings[i];
        yearlyCostsPV[j] += dataH.hourlyCostsNoPV[i];
        yearlyCostsNoPV[j] += dataH.hourlyCostsPV[i];
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
