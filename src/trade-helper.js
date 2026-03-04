import { VAR, getVar, setVar } from './variables.js';

let ensureFuelSpace = 0;

export function attemptSell(page, commodityName, quantity) {
    const commodity = page.commodities.get(commodityName);
    if (!commodity) {
        return; 
    }

    commodity.sell('');

    if (quantity < 1) {
        return; 
    }

    let attemptedQuantity = quantity;

    // Do we actually have enough to sell?
    if (commodity.shipStock < attemptedQuantity) {
        attemptedQuantity = commodity.shipStock;
    }

    // Is there enough building space?
    const buildingSpace = page.availableBuildingSpace;
    if (buildingSpace !== null && buildingSpace < attemptedQuantity) {
        attemptedQuantity = buildingSpace;
    }

    // Do the maxes allow us to sell this much?
    if ((commodity.max - commodity.tradeStock) < attemptedQuantity) {
        attemptedQuantity = commodity.max - commodity.tradeStock;
    }

    if (attemptedQuantity < 1) {
        return; 
    }

    commodity.sell(attemptedQuantity);
}

export function attemptBuy(page, commodityName, quantity) {
    if (quantity < 1) {
        return 0; 
    }

    const commodity = page.commodities.get(commodityName);
    if (!commodity) {
        return 0; 
    }

    if (commodity.tradeStock < commodity.min) {
        return 0; 
    }

    let attemptedQuantity = quantity + commodity.getBuying();
    commodity.buy('');

    if (commodityName !== 'Hydrogen fuel') {
        const allowed = page.allowedSpace(getVar(VAR.MAGSCOOP_ALLOWED)) - ensureFuelSpace;
        if (allowed < attemptedQuantity) {
            attemptedQuantity = allowed;
        }
    } else {
        const allowed = page.allowedSpace(getVar(VAR.MAGSCOOP_ALLOWED));
        if (allowed < attemptedQuantity) {
            attemptedQuantity = allowed;
        }
    }

    // Do the mins allow us to buy this much?
    if ((commodity.tradeStock - commodity.min) < attemptedQuantity) {
        attemptedQuantity = commodity.tradeStock - commodity.min;
    }

    if (attemptedQuantity < 1) {
        return 0; 
    }

    commodity.buy(attemptedQuantity);
    return attemptedQuantity;
}

export function ensureFuel(page) {
    const fuelSpaceLeft = getVar(VAR.FUEL_SPACE_LEFT);
    const fuelToPurchase = getVar(VAR.FUEL_TO_PURCHASE);
    const fuel = page.commodities.get('Hydrogen fuel');
    if (!fuel) {
        return; 
    }

    if (fuel.shipStock < fuelSpaceLeft) {
        ensureFuelSpace = fuelSpaceLeft - fuel.shipStock - fuel.getBuying();
    }

    if (fuel.shipStock < fuelToPurchase) {
        attemptBuy(page, 'Hydrogen fuel', fuelToPurchase - fuel.shipStock);
        ensureFuelSpace = fuelSpaceLeft - fuel.shipStock - fuel.getBuying();
    }

    if (fuel.shipStock > fuelSpaceLeft) {
        attemptSell(page, 'Hydrogen fuel', fuel.shipStock - fuelSpaceLeft);
        ensureFuelSpace = 0;
    }
}

export function hasTradeQueued(page) {
    for (const [, commodity] of page.commodities) {
        if (commodity.getSelling() !== 0 || commodity.getBuying() !== 0) {
            return true;
        }
    }
    return false;
}

export function submitIfNotPreview(page) {
    if (!getVar(VAR.PREVIEW) && hasTradeQueued(page)) {
        page.transfer();
    }
}

export function unload(page, excludes = []) {
    if (!getVar(VAR.AUTO_UNLOAD)) {
        return; 
    }

    const fuelSpaceLeft = getVar(VAR.FUEL_SPACE_LEFT);

    for (const [name, commodity] of page.commodities) {
        if (excludes.length > 0 && excludes.includes(name)) {
            continue;
        }

        if (name === 'Hydrogen fuel') {
            if (commodity.shipStock > fuelSpaceLeft) {
                attemptSell(page, name, commodity.shipStock - fuelSpaceLeft);
            }
        } else if (commodity.shipStock > 0) {
            attemptSell(page, name, commodity.shipStock);
        }
    }
}

export function reset(page) {
    for (const [, commodity] of page.commodities) {
        if (commodity.shipStock > 0 && commodity.getSelling() !== 0) {
            commodity.sell('');
        }
        if (commodity.tradeStock > commodity.min && commodity.getBuying() !== 0) {
            commodity.buy('');
        }
    }
}

export function loadMultiBuy(page, saveString, itemsToBuy = [], ratios = []) {
    if (itemsToBuy.length === 0) {
        return; 
    }

    unload(page, itemsToBuy);
    ensureFuel(page);

    const totalCarryStored = getVar(`${saveString}_total_carry`) || 0;
    let maxRatio = 0;
    const cumulativeRatios = [];
    const activeItems = [...itemsToBuy];
    const activeRatios = [...ratios];

    // Ensure ratios are sensible
    if (activeRatios.length !== activeItems.length) {
        activeRatios.length = 0;
        for (let i = 0; i < activeItems.length; i++) {
            activeRatios.push(1);
            cumulativeRatios.push(i);
        }
        maxRatio = activeRatios.length;
    } else {
        for (let i = 0; i < activeItems.length; i++) {
            if (activeRatios[i] < 1) {
                activeRatios[i] = 1; 
            }
            cumulativeRatios.push(maxRatio);
            maxRatio += activeRatios[i];
        }
    }

    // Check that all items are in stock
    for (let i = activeItems.length - 1; i >= 0; i--) {
        const commodity = page.commodities.get(activeItems[i]);
        if (!commodity || commodity.tradeStock - commodity.min < 1) {
            maxRatio -= activeRatios[i];
            activeItems.splice(i, 1);
            activeRatios.splice(i, 1);
            cumulativeRatios.splice(i, 1);
        }
    }

    if (activeItems.length === 0) {
        return; 
    }

    // How many of the needed items do we currently have?
    let currentShipStock = 0;
    for (const item of activeItems) {
        const commodity = page.commodities.get(item);
        if (commodity) {
            currentShipStock += commodity.shipStock; 
        }
    }

    const magscoopAllowed = getVar(VAR.MAGSCOOP_ALLOWED);
    const totalLeftOver = page.allowedSpace(magscoopAllowed) - ensureFuelSpace + currentShipStock;
    let leftOver = totalLeftOver % maxRatio;
    const onePortion = Math.floor((totalLeftOver - leftOver) / maxRatio);
    setVar(`${saveString}_total_carry`, (totalCarryStored + leftOver) % maxRatio);

    const itemCarries = new Array(activeItems.length).fill(0);

    while (leftOver > 0) {
        for (let i = 0; i < activeItems.length; i++) {
            if ((totalCarryStored + leftOver) % maxRatio <= cumulativeRatios[i]) {
                itemCarries[i]++;
                break;
            }
        }
        leftOver--;
    }

    let tryAgain = false;
    const retryItems = [...activeItems];
    const retryRatios = [...activeRatios];

    for (let i = 0; i < activeItems.length; i++) {
        const commodity = page.commodities.get(activeItems[i]);
        const numToTryAndBuy = activeRatios[i] * onePortion + itemCarries[i] - commodity.shipStock;
        const numAlreadyBeingBought = commodity.getBuying();
        const numActuallyBought = attemptBuy(page, activeItems[i], numToTryAndBuy);
        if ((numToTryAndBuy + numAlreadyBeingBought) !== numActuallyBought) {
            tryAgain = true;
            const idx = retryItems.indexOf(activeItems[i]);
            retryItems.splice(idx, 1);
            retryRatios.splice(idx, 1);
        }
    }

    if (tryAgain) {
        loadMultiBuy(page, saveString, retryItems, retryRatios);
    }

    submitIfNotPreview(page);
}

export function getEnsureFuelSpace() {
    return ensureFuelSpace;
}

export function resetEnsureFuelSpace() {
    ensureFuelSpace = 0;
}
