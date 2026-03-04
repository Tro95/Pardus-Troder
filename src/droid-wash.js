import { VAR, getVar } from './variables.js';
import {
    attemptSell, attemptBuy, ensureFuel, unload, reset, submitIfNotPreview,
} from './trade-helper.js';

export function findItemsToDroidwash(page) {
    const droidWashLevel = getVar(VAR.DROID_WASH_LEVEL);
    const items = [];

    for (const [name, commodity] of page.commodities) {
        if (commodity.max <= droidWashLevel && commodity.max > 0) {
            items.push(name);
        }
    }

    return items;
}

export function ableToDroidWashItem(page, itemName) {
    const commodity = page.commodities.get(itemName);
    if (!commodity) {
        return false; 
    }
    return commodity.shipStock + commodity.tradeStock > commodity.bal + 1;
}

export function isReadyToDroidWash(page, itemsToDroidwash) {
    for (const itemName of itemsToDroidwash) {
        if (ableToDroidWashItem(page, itemName)) {
            const commodity = page.commodities.get(itemName);
            if (commodity.tradeStock > commodity.bal + 1) {
                console.log(`Item '${itemName}' has too many items to begin the droidwash!`);
                return false;
            }
            if (commodity.tradeStock <= commodity.bal) {
                console.log(`Item '${itemName}' doesn't have enough items to begin the droidwash!`);
                return false;
            }
        }
    }
    return true;
}

export function droidWash(page, itemsToDroidwash) {
    unload(page, itemsToDroidwash);
    ensureFuel(page);

    if (isReadyToDroidWash(page, itemsToDroidwash)) {
        for (const itemName of itemsToDroidwash) {
            if (ableToDroidWashItem(page, itemName)) {
                attemptSell(page, itemName, 999);
                attemptBuy(page, itemName, 999);
                const commodity = page.commodities.get(itemName);
                commodity.buy(parseInt(commodity.getBuying(), 10) + parseInt(commodity.getSelling(), 10) - 1);
            }
        }
    } else {
        for (const itemName of itemsToDroidwash) {
            if (ableToDroidWashItem(page, itemName)) {
                const commodity = page.commodities.get(itemName);
                if (commodity.tradeStock > commodity.bal) {
                    attemptBuy(page, itemName, commodity.tradeStock - commodity.bal - 1);
                }
                if (commodity.tradeStock <= commodity.bal) {
                    attemptSell(page, itemName, commodity.bal - commodity.tradeStock + 1);
                }
            }
        }
    }
}

export function endDroidWash(page, itemsToDroidwash) {
    reset(page);
    ensureFuel(page);

    for (const itemName of itemsToDroidwash) {
        if (ableToDroidWashItem(page, itemName)) {
            attemptBuy(page, itemName, 999);
        }
    }

    submitIfNotPreview(page);
}
