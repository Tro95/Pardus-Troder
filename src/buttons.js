import { VAR, getVar, setVar } from './variables.js';
import { unload, reset, submitIfNotPreview, hasTradeQueued } from './trade-helper.js';

export default class Buttons {
    #buttonsBox = null;

    #numberOfButtons = 0;

    #page;

    #freeSpaceElement = null;

    #initialMagscoopSpace = null;

    constructor(page) {
        this.#page = page;
    }

    createButtonsBox() {
        const buttonsBoxHtml = '<div id="troder-buttons-container"><table style="background:url(//static.pardus.at/img/std/bgd.gif)" width="90%" cellpadding="3" align="center" id="troder-buttons-table"><tbody><tr><th>Troder Buttons</th></tr><tr><td align="center" id="troder-free-space"></td></tr><tr><td><table align="center" width="90%" frame="box" style="border-style:dashed;border-color:yellow;" id="troder-options-box"><tbody><tr><td align="center">Unload ship:</td><td align="center"><input type="checkbox" id="autoUnload"></td></tr><tr><td align="center">Preview Trade:</td><td align="center"><input type="checkbox" id="troder-preview-trade"></td></tr></tbody></table></td></tr><tr><td><table align="center" width="90%" frame="box" style="border-style:dashed;border-color:yellow;border-spacing:10px;" id="troder-buttons-box"><tbody></tbody></table></td></tr></tbody></table></div>';

        if (!this.#page.transferButton) {
            return;
        }
        this.#page.transferButton.parentNode.insertAdjacentHTML('beforeend', buttonsBoxHtml);

        this.#freeSpaceElement = document.getElementById('troder-free-space');

        document.addEventListener('pardus-trade-space-changed', (e) => {
            this.#updateFreeSpace(e.detail);
        });

        this.#page.recalculateSpace();

        this.#buttonsBox = document.getElementById('troder-buttons-box').lastChild;

        if (this.#page.shipSpace.hasMagscoop) {
            const magscoopOption = document.createElement('tr');
            magscoopOption.innerHTML = '<td align="center">Use Magscoop:</td><td align="center"><input type="checkbox" id="useMagScoop"></td>';
            document.getElementById('troder-options-box').appendChild(magscoopOption);

            document.getElementById('useMagScoop').checked = getVar(VAR.MAGSCOOP_ALLOWED);
            document.getElementById('useMagScoop').addEventListener('change', () => {
                setVar(VAR.MAGSCOOP_ALLOWED, document.getElementById('useMagScoop').checked);
            }, true);
        }

        document.getElementById('troder-preview-trade').checked = getVar(VAR.PREVIEW);
        document.getElementById('autoUnload').checked = getVar(VAR.AUTO_UNLOAD);

        document.getElementById('autoUnload').addEventListener('change', () => {
            setVar(VAR.AUTO_UNLOAD, document.getElementById('autoUnload').checked);
        }, true);

        document.getElementById('troder-preview-trade').addEventListener('change', () => {
            setVar(VAR.PREVIEW, document.getElementById('troder-preview-trade').checked);
        }, true);

        document.addPardusKeyDownListener('transfer_keypress', { code: 13 }, () => {
            if (hasTradeQueued(this.#page)) {
                this.#page.transfer();
            }
        });

        document.addPardusKeyDownListener('exit_to_nav_keypress', { code: 27 }, (event) => {
            document.location.assign(`${document.location.origin}/main.php`);
            event.preventDefault();
        });
    }

    #updateFreeSpace(detail) {
        if (!this.#freeSpaceElement) {
            return;
        }

        if (detail.hasMagscoop && this.#initialMagscoopSpace === null) {
            this.#initialMagscoopSpace = detail.magscoopSpace;
        }

        let shipText;
        if (detail.hasMagscoop) {
            shipText = `Ship: ${detail.shipSpace} + ${detail.magscoopSpace}t`;
        } else {
            shipText = `Ship: ${detail.shipSpace}t`;
        }

        const shipNegative = detail.hasMagscoop
            ? detail.magscoopSpace < 0
            : detail.shipSpace < 0;
        const magscoopUsed = detail.hasMagscoop
            && detail.magscoopSpace < this.#initialMagscoopSpace;

        let shipColour = '';
        if (shipNegative) {
            shipColour = 'color:#FF0000;';
        } else if (magscoopUsed) {
            shipColour = 'color:#FFFF00;';
        }

        let html = `<span style="${shipColour}">${shipText}</span>`;

        if (detail.buildingSpace !== null) {
            const buildingColour = detail.buildingSpace < 0 ? 'color:#FF0000;' : '';
            html += `<br><span style="${buildingColour}">Building: ${detail.buildingSpace}t</span>`;
        }

        this.#freeSpaceElement.innerHTML = html;
    }

    addButton(label, fn) {
        if (this.#buttonsBox === null) {
            return; 
        }

        const newButton = document.createElement('tr');
        newButton.innerHTML = `<td width="90%" align="center" colspan=2><input type="button" style="width:90%;height:150%;" id="troder-button-${this.#numberOfButtons}" value="${label}"></td>`;
        this.#buttonsBox.appendChild(newButton);
        document.getElementById(`troder-button-${this.#numberOfButtons}`).addEventListener('click', () => {
            fn();
        }, true);
        this.#numberOfButtons += 1;
    }

    addStandardButtons() {
        const page = this.#page;
        this.addButton('Unload Ship', () => {
            unload(page);
            submitIfNotPreview(page);
        });
        this.addButton('Reset', () => {
            reset(page);
        });
        document.addPardusKeyDownListener('unload_keypress', { code: 85 }, () => {
            unload(page);
            submitIfNotPreview(page);
        });
        document.addPardusKeyDownListener('reset_keypress', { code: 82 }, () => {
            reset(page);
        });
    }

    addDroidwashableItems(droidwashItems) {
        const droidwashItemsBox = document.createElement('tr');
        droidwashItemsBox.innerHTML = '<td><table align="center" width="90%" frame="box" style="border-style:dashed;border-color:yellow;border-spacing:10px;" id="troder-droidwash-items"><tbody></tbody></table></td>';
        document.getElementById('troder-buttons-table').firstChild.appendChild(droidwashItemsBox);

        if (droidwashItems.length === 0) {
            document.getElementById('troder-droidwash-items').firstChild.innerHTML = '<tr><td align="center"><font color="#FF0000">No items capable of being droidwashed</font></td></tr>';
            return;
        }

        document.getElementById('troder-droidwash-items').firstChild.innerHTML = '<tr><td align="center">Items capable of being droidwashed:</td></tr><tr><td align="center" style="font-size:11px;"><ul style="list-style-type:none;padding-left:0;" id="troder-droidwash-items-list"></ul></td></tr>';

        const page = this.#page;
        for (const itemName of droidwashItems) {
            const commodity = page.commodities.get(itemName);
            const newItem = document.createElement('li');

            if (commodity.shipStock + commodity.tradeStock < commodity.bal + 2) {
                newItem.innerHTML = `<font color="#FFAA00">${itemName}</font>`;
            } else {
                newItem.innerHTML = `<font color="#009900">${itemName}</font>`;
            }

            document.getElementById('troder-droidwash-items-list').appendChild(newItem);
        }
    }
}
