import Buttons from '../buttons.js';
import { VAR, getVar } from '../variables.js';
import {
    unload, ensureFuel, attemptBuy, submitIfNotPreview, loadMultiBuy,
} from '../trade-helper.js';
import {
    findItemsToDroidwash, isReadyToDroidWash, droidWash, endDroidWash,
} from '../droid-wash.js';

export default class Starbase {
    #page;

    #buttons;

    constructor(page) {
        this.#page = page;
        this.#buttons = new Buttons(page);

        this.#buttons.createButtonsBox();

        if (page.isPlayerOwned) {
            this.#addPlayerOwnedButtons();
        } else {
            this.#addNpcButtons();
        }

        this.#buttons.addStandardButtons();
    }

    #addPlayerOwnedButtons() {
        if (getVar(VAR.PO_STARBASE_PLANET_RUN)) {
            this.#buttons.addButton('Planet Run', () => this.#loadPlanet());
            document.addPardusKeyDownListener('starbase_planet_run_keypress', { code: 83 }, () => {
                this.#loadPlanet(); 
            });
        }
        if (getVar(VAR.PO_STARBASE_LOAD_ROBOTS)) {
            this.#buttons.addButton('Load Robots', () => this.#loadSingle('Robots'));
            document.addPardusKeyDownListener('starbase_load_robots_keypress', { code: 66 }, () => {
                this.#loadSingle('Robots'); 
            });
        }
        if (getVar(VAR.PO_STARBASE_LOAD_MO)) {
            this.#buttons.addButton('Load MO', () => loadMultiBuy(this.#page, 'sb_mo_materials', ['Metal', 'Ore']));
        }
        if (getVar(VAR.PO_STARBASE_LOAD_METAL)) {
            this.#buttons.addButton('Load Metal', () => this.#loadSingle('Metal')); 
        }
        if (getVar(VAR.PO_STARBASE_LOAD_ORE)) {
            this.#buttons.addButton('Load Ore', () => this.#loadSingle('Ore')); 
        }
    }

    #addNpcButtons() {
        if (getVar(VAR.DROID_WASH_MODE) && getVar(VAR.DROID_WASH_STARBASE)) {
            const itemsToDroidwash = findItemsToDroidwash(this.#page);
            this.#buttons.addDroidwashableItems(itemsToDroidwash);
            if (itemsToDroidwash.length !== 0) {
                if (isReadyToDroidWash(this.#page, itemsToDroidwash)) {
                    droidWash(this.#page, itemsToDroidwash);
                    this.#buttons.addButton('Stop Droid Wash', () => endDroidWash(this.#page, itemsToDroidwash));
                } else {
                    this.#buttons.addButton('Start Droid Wash', () => droidWash(this.#page, itemsToDroidwash));
                }
            }
        }

        if (getVar(VAR.NPC_STARBASE_PLANET_RUN)) {
            this.#buttons.addButton('Planet Run', () => this.#loadPlanet());
            document.addPardusKeyDownListener('starbase_planet_run_keypress', { code: 83 }, () => {
                this.#loadPlanet(); 
            });
        }
    }

    #loadPlanet() {
        unload(this.#page, ['Energy']);
        ensureFuel(this.#page);
        attemptBuy(this.#page, 'Energy', this.#page.allowedSpace(getVar(VAR.MAGSCOOP_ALLOWED)));
        submitIfNotPreview(this.#page);
    }

    #loadSingle(commodityName) {
        unload(this.#page, [commodityName]);
        ensureFuel(this.#page);
        attemptBuy(this.#page, commodityName, this.#page.allowedSpace(getVar(VAR.MAGSCOOP_ALLOWED)));
        submitIfNotPreview(this.#page);
    }
}
