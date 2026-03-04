import Buttons from '../buttons.js';
import { VAR, getVar, setVar } from '../variables.js';
import {
    unload, ensureFuel, attemptBuy, submitIfNotPreview, loadMultiBuy, getEnsureFuelSpace,
} from '../trade-helper.js';
import {
    findItemsToDroidwash, isReadyToDroidWash, droidWash, endDroidWash,
} from '../droid-wash.js';

export default class Planet {
    #page;

    #buttons;

    #stimExcludes = ['Capri Stim', 'Crimson Stim', 'Amber Stim'];

    constructor(page) {
        this.#page = page;
        this.#buttons = new Buttons(page);

        this.#buttons.createButtonsBox();
        this.#addDroidWashing();
        this.#addPlanetButtons();
        this.#buttons.addStandardButtons();
    }

    #addDroidWashing() {
        if (!getVar(VAR.DROID_WASH_MODE)) {
            return; 
        }

        const planetType = this.#page.type;
        const dwDefaults = {
            i: true, a: false, m: false, g: true, r: true, d: true,
        };

        const dwVar = `droid_washing_planet_${planetType}_enabled`;
        if (!(getVar(dwVar) ?? dwDefaults[planetType])) {
            return; 
        }

        const itemsToDroidwash = findItemsToDroidwash(this.#page);
        this.#buttons.addDroidwashableItems(itemsToDroidwash);

        if (itemsToDroidwash.length === 0) {
            return; 
        }

        if (isReadyToDroidWash(this.#page, itemsToDroidwash)) {
            droidWash(this.#page, itemsToDroidwash);
            this.#buttons.addButton('Stop Droid Wash', () => endDroidWash(this.#page, itemsToDroidwash));
        } else {
            this.#buttons.addButton('Start Droid Wash', () => droidWash(this.#page, itemsToDroidwash));
        }
    }

    #addPlanetButtons() {
        switch (this.#page.type) {
            case 'a':
                if (getVar(VAR.PLANET_A_STARBASE_RUN)) {
                    this.#buttons.addButton('Starbase Run', () => this.#loadStarbase());
                    document.addPardusKeyDownListener('planet_starbase_run_keypress', { code: 83 }, () => {
                        this.#loadStarbase(); 
                    });
                    document.addPardusKeyDownListener('planet_food_run_keypress', { code: 70 }, () => {
                        this.#loadSingle('Food', ['Food']); 
                    });
                    document.addPardusKeyDownListener('planet_water_run_keypress', { code: 87 }, () => {
                        this.#loadSingle('Water', ['Water']); 
                    });
                }
                if (getVar(VAR.PLANET_A_STOCK_RUN)) {
                    this.#buttons.addButton('Stock Run', () => this.#loadStockRun()); 
                }
                if (getVar(VAR.PLANET_A_LOAD_FOOD)) {
                    this.#buttons.addButton('Load Food', () => this.#loadSingle('Food', ['Food'])); 
                }
                if (getVar(VAR.PLANET_A_LOAD_WATER)) {
                    this.#buttons.addButton('Load Water', () => this.#loadSingle('Water', ['Water'])); 
                }
                break;
            case 'm':
                if (getVar(VAR.PLANET_M_STARBASE_RUN)) {
                    this.#buttons.addButton('Starbase Run', () => this.#loadStarbase());
                    document.addPardusKeyDownListener('planet_starbase_run_keypress', { code: 83 }, () => {
                        this.#loadStarbase(); 
                    });
                    document.addPardusKeyDownListener('planet_food_run_keypress', { code: 70 }, () => {
                        this.#loadSingle('Food', ['Food']); 
                    });
                    document.addPardusKeyDownListener('planet_water_run_keypress', { code: 87 }, () => {
                        this.#loadSingle('Water', ['Water']); 
                    });
                }
                if (getVar(VAR.PLANET_M_STOCK_RUN)) {
                    this.#buttons.addButton('Stock Run', () => this.#loadStockRun()); 
                }
                if (getVar(VAR.PLANET_M_LOAD_FOOD)) {
                    this.#buttons.addButton('Load Food', () => this.#loadSingle('Food', ['Food'])); 
                }
                if (getVar(VAR.PLANET_M_LOAD_WATER)) {
                    this.#buttons.addButton('Load Water', () => this.#loadSingle('Water', ['Water'])); 
                }
                break;
            case 'i':
                if (getVar(VAR.PLANET_I_PLANET_RUN)) {
                    this.#buttons.addButton('Planet Run', () => {
                        unload(this.#page, ['Food', 'Water']);
                        ensureFuel(this.#page);
                        attemptBuy(this.#page, 'Water', this.#page.allowedSpace(getVar(VAR.MAGSCOOP_ALLOWED)));
                        submitIfNotPreview(this.#page);
                    });
                }
                if (getVar(VAR.PLANET_I_LOAD_WATER)) {
                    this.#buttons.addButton('Load Water', () => this.#loadSingle('Water', ['Water'])); 
                }
                break;
            case 'r':
                if (getVar(VAR.PLANET_R_COMBO_RUN)) {
                    this.#buttons.addButton('Combo Run', () => loadMultiBuy(this.#page, 'planet_r_combo', ['Animal embryos', 'Metal', 'Ore', 'Radioactive cells'], [10, 5, 15, 1]));
                }
                if (getVar(VAR.PLANET_R_LOAD_EMBRYOS)) {
                    this.#buttons.addButton('Load Embryos', () => this.#loadSingle('Animal embryos')); 
                }
                if (getVar(VAR.PLANET_R_LOAD_METAL)) {
                    this.#buttons.addButton('Load Metal', () => this.#loadSingle('Metal')); 
                }
                if (getVar(VAR.PLANET_R_LOAD_ORE)) {
                    this.#buttons.addButton('Load Ore', () => this.#loadSingle('Ore')); 
                }
                if (getVar(VAR.PLANET_R_LOAD_RADS)) {
                    this.#buttons.addButton('Load Rads', () => this.#loadSingle('Radioactive cells')); 
                }
                break;
            case 'g':
                if (getVar(VAR.PLANET_G_LOAD_EMBRYOS)) {
                    this.#buttons.addButton('Load Embryos', () => this.#loadSingle('Animal embryos')); 
                }
                if (getVar(VAR.PLANET_G_LOAD_NEBULA)) {
                    this.#buttons.addButton('Load Nebula', () => this.#loadSingle('Nebula gas')); 
                }
                if (getVar(VAR.PLANET_G_LOAD_CHEMS)) {
                    this.#buttons.addButton('Load Chemicals', () => this.#loadSingle('Chemical supplies')); 
                }
                // Intentional fallthrough to 'd' case (matches legacy behavior)
                // falls through
            case 'd':
                if (getVar(VAR.PLANET_D_LOAD_SLAVES)) {
                    this.#buttons.addButton('Load Slaves', () => this.#loadSingle('Slaves')); 
                }
                break;
            default:
                break;
        }
    }

    #loadStarbase() {
        unload(this.#page, ['Food', 'Water', ...this.#stimExcludes]);
        ensureFuel(this.#page);

        const food = this.#page.commodities.get('Food');
        const water = this.#page.commodities.get('Water');
        const magscoopAllowed = getVar(VAR.MAGSCOOP_ALLOWED);
        const totalCarry = getVar('total_carry') || 0;
        let foodCarry = 0;
        let waterCarry = 0;

        let leftOver = (this.#page.allowedSpace(magscoopAllowed) - getEnsureFuelSpace() + food.shipStock + water.shipStock) % 5;
        const oneFifth = Math.floor((this.#page.allowedSpace(magscoopAllowed) - getEnsureFuelSpace() - leftOver + food.shipStock + water.shipStock) / 5);

        setVar('total_carry', (totalCarry + leftOver) % 5);

        while (leftOver > 0) {
            if (((totalCarry + leftOver) % 5) < 3) {
                foodCarry++;
            } else {
                waterCarry++;
            }
            leftOver--;
        }

        if ((food.tradeStock - food.min) < (3 * oneFifth + foodCarry - food.shipStock)) {
            waterCarry = 999;
        }
        if ((water.tradeStock - water.min) < (2 * oneFifth + foodCarry - water.shipStock)) {
            foodCarry = 999;
        }

        attemptBuy(this.#page, 'Food', 3 * oneFifth + foodCarry - food.shipStock);
        attemptBuy(this.#page, 'Water', 2 * oneFifth + waterCarry - water.shipStock);
        submitIfNotPreview(this.#page);
    }

    #loadStockRun() {
        unload(this.#page, ['Food', 'Water', ...this.#stimExcludes]);
        ensureFuel(this.#page);

        const food = this.#page.commodities.get('Food');
        const water = this.#page.commodities.get('Water');
        const magscoopAllowed = getVar(VAR.MAGSCOOP_ALLOWED);
        const totalCarry = getVar('stock_run_carry') || 0;
        let foodCarry = 0;
        let waterCarry = 0;

        let leftOver = (this.#page.allowedSpace(magscoopAllowed) - getEnsureFuelSpace() + food.shipStock + water.shipStock) % 2;
        const oneHalf = Math.floor((this.#page.allowedSpace(magscoopAllowed) - getEnsureFuelSpace() - leftOver + food.shipStock + water.shipStock) / 2);

        setVar('stock_run_carry', (totalCarry + leftOver) % 2);

        while (leftOver > 0) {
            if (((totalCarry + leftOver) % 2) < 1) {
                foodCarry++;
            } else {
                waterCarry++;
            }
            leftOver--;
        }

        if ((food.tradeStock - food.min) < (oneHalf + foodCarry - food.shipStock)) {
            waterCarry = 999;
        }
        if ((water.tradeStock - water.min) < (oneHalf + foodCarry - water.shipStock)) {
            waterCarry = 999;
        }

        attemptBuy(this.#page, 'Food', oneHalf + foodCarry - food.shipStock);
        attemptBuy(this.#page, 'Water', oneHalf + waterCarry - water.shipStock);
        submitIfNotPreview(this.#page);
    }

    #loadSingle(commodityName, excludes = [commodityName]) {
        unload(this.#page, [...excludes, ...this.#stimExcludes]);
        ensureFuel(this.#page);
        attemptBuy(this.#page, commodityName, this.#page.allowedSpace(getVar(VAR.MAGSCOOP_ALLOWED)));
        submitIfNotPreview(this.#page);
    }
}
