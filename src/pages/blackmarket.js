import Buttons from '../buttons.js';
import { VAR, getVar } from '../variables.js';
import {
    unload, ensureFuel, attemptBuy, attemptSell, submitIfNotPreview, loadMultiBuy,
} from '../trade-helper.js';

export default class Blackmarket {
    #page;

    #buttons;

    constructor(page) {
        this.#page = page;
        this.#buttons = new Buttons(page);

        this.#buttons.createButtonsBox();
        this.#addButtons();
        this.#buttons.addStandardButtons();
    }

    #addButtons() {
        if (getVar(VAR.BM_LOAD_MOE)) {
            this.#buttons.addButton('Load MOE', () => loadMultiBuy(this.#page, 'bm_construction_materials', ['Energy', 'Metal', 'Ore']));
        }
        if (getVar(VAR.BM_LOAD_ENERGY)) {
            this.#buttons.addButton('Load Energy', () => this.#loadSingle('Energy'));
        }
        if (getVar(VAR.BM_LOAD_METAL)) {
            this.#buttons.addButton('Load Metal', () => this.#loadSingle('Metal'));
        }
        if (getVar(VAR.BM_LOAD_ORE)) {
            this.#buttons.addButton('Load Ore', () => this.#loadSingle('Ore'));
        }
        if (getVar(VAR.BM_SELL_DRUGS)) {
            this.#buttons.addButton('Sell Drugs', () => {
                ensureFuel(this.#page);
                attemptSell(this.#page, 'Drugs', getVar(VAR.BM_DRUGS_TO_SELL));
                submitIfNotPreview(this.#page);
            });
        }
        if (getVar(VAR.BM_LOAD_GEM_MERCHANT)) {
            this.#buttons.addButton('Gem Merchant', () => this.#loadGemMerchant());
        }
    }

    #loadSingle(commodityName) {
        unload(this.#page, [commodityName]);
        ensureFuel(this.#page);
        attemptBuy(this.#page, commodityName, this.#page.allowedSpace(getVar(VAR.MAGSCOOP_ALLOWED)));
        submitIfNotPreview(this.#page);
    }

    #loadGemMerchant() {
        ensureFuel(this.#page);

        const base = {
            Food: 26,
            Energy: 26,
            Water: 26,
            'Gem stones': 224,
            'Optical components': 53,
        };

        const itemsList = ['Food', 'Energy', 'Water', 'Gem stones', 'Optical components'];
        const smallItems = ['Food', 'Energy', 'Water', 'Optical components'];

        const existing = {};
        for (const item of itemsList) {
            const commodity = this.#page.commodities.get(item);
            existing[item] = commodity ? commodity.shipStock : 0;
        }

        const magscoopAllowed = getVar(VAR.MAGSCOOP_ALLOWED);
        const freeSpace = this.#page.allowedSpace(magscoopAllowed);

        const baseSum = Object.values(base).reduce((a, b) => a + b, 0);
        const scale = baseSum > 0 ? freeSpace / baseSum : 0;

        const targets = {};
        for (const item of itemsList) {
            if (smallItems.includes(item)) {
                targets[item] = Math.ceil(base[item] * scale);
            } else {
                targets[item] = Math.floor(base[item] * scale);
            }
        }

        let needSmallTotal = 0;
        for (const item of smallItems) {
            needSmallTotal += Math.max(targets[item] - existing[item], 0);
        }
        targets['Gem stones'] = Math.max(freeSpace - needSmallTotal, 0);

        for (const item of itemsList) {
            const commodity = this.#page.commodities.get(item);
            if (!commodity || commodity.buyElement === null) {
                continue; 
            }

            const need = Math.max(targets[item] - existing[item], 0);
            if (need > 0) {
                const spaceLeft = this.#page.allowedSpace(magscoopAllowed);
                const actual = Math.min(need, spaceLeft);
                if (actual > 0) {
                    commodity.buy(actual);
                }
            }
        }

        submitIfNotPreview(this.#page);
    }
}
