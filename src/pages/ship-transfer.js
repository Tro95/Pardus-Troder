import { VAR, getVar } from '../variables.js';

export default class ShipTransfer {
    #page;

    constructor(page) {
        this.#page = page;

        if (getVar(VAR.SHIP2SHIP_REFRESH)) {
            this.#createRefreshButton();
        }

        if (getVar(VAR.SHIP2SHIP_OP_MODE)) {
            this.#preloadResources();
        }
    }

    #createRefreshButton() {
        const mainForm = this.#page.form;
        const centreRow = mainForm.children[1].children[0].children[1].children[0];

        const refreshButton = document.createElement('input');
        refreshButton.type = 'button';
        refreshButton.value = 'Refresh';
        refreshButton.addEventListener('click', () => {
            window.location.href = this.#page.getRedirectUrl();
        }, false);
        centreRow.insertBefore(refreshButton, centreRow.children[1]);
        centreRow.insertBefore(document.createElement('br'), centreRow.children[1]);
    }

    #preloadResources() {
        const freeSpace = this.#page.freeSpace;
        if (freeSpace === 0) {
            return; 
        }

        const preloadConfig = {
            'Hydrogen fuel': getVar(VAR.FUEL_TO_PRELOAD),
            Robots: getVar(VAR.BOTS_TO_PRELOAD),
            Drugs: getVar(VAR.DRUGS_TO_PRELOAD),
            'Amber Stim': getVar(VAR.AMBER_STIMS_TO_PRELOAD),
        };

        for (const [resourceName, resource] of this.#page.resources) {
            const toPreload = preloadConfig[resourceName];
            if (toPreload === undefined || toPreload === 0) {
                continue; 
            }

            const button = this.#createTransferButton(resourceName);
            resource.row.cells[3].appendChild(button);
            resource.inputElement.value = Math.min(toPreload, resource.amount, freeSpace);
        }
    }

    #createTransferButton(resourceName) {
        const buttonElement = document.createElement('input');
        buttonElement.type = 'button';
        buttonElement.value = 'Transfer';
        buttonElement.setAttribute('style', 'padding:2px; margin:6px 0px 6px 10px;min-width:90px;vertical-align:middle;');
        buttonElement.addEventListener('click', () => {
            for (const [name, resource] of this.#page.resources) {
                if (name !== resourceName) {
                    resource.transfer('');
                }
            }
            this.#page.submit();
        });
        return buttonElement;
    }
}
