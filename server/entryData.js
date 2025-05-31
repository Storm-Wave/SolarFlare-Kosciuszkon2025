// ---------------------------
// EntryData Class Definition
// ---------------------------

/**
 * Represents an energy-related data entry.
 */
class EntryData {
    constructor(consumption, buyPrice, pvSize, pvProduction, sellPrice, pvCostPerKw, autoconsumption, priceIncrease) {
        this.consumption = consumption;
        this.buyPrice = buyPrice;
        this.pvSize = pvSize;
        this.pvProduction = pvProduction;
        this.sellPrice = sellPrice;
        this.pvCostPerKw = pvCostPerKw;
        this.autoconsumption = autoconsumption;
        this.priceIncrease = priceIncrease;
    }
}

// ---------------------------
// Factory Function
// ---------------------------

/**
 * Creates an EntryData object from an HTTP request body.
 * @param {Object} req - Express request object with a body containing input data.
 * @returns {EntryData} - A populated EntryData instance.
 */
function createEntryData(req) {
    const {
        consumption,
        buyPrice,
        pvSize,
        pvProduction,
        sellPrice,
        pvCostPerKw,
        autoconsumption,
        priceIncrease
    } = req.body;

    return new EntryData(
        consumption,
        buyPrice,
        pvSize,
        pvProduction,
        sellPrice,
        pvCostPerKw,
        autoconsumption,
        priceIncrease
    );
}

// ---------------------------
// Module Exports
// ---------------------------

module.exports = {
    createEntryData
};
