(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["PardusTroder"] = factory();
	else
		root["PardusTroder"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ PardusTroder)
});

;// ./node_modules/pardus-library/src/classes/abstract/abstract-page.js
class AbstractPage {
    #page;

    constructor(pageName = '') {
        if (pageName === '') {
            throw new Error('Page is not defined for class');
        }

        this.#page = pageName;
    }

    toString() {
        return this.#page;
    }

    navigateTo() {
        document.location.assign(`${document.location.origin}${this.#page}`);
    }

    isActive() {
        return document.location.pathname === this.#page;
    }
}

;// ./node_modules/pardus-library/src/classes/abstract/refreshable.js
class Refreshable {
    #afterRefreshHooks = [];
    #beforeRefreshHooks = [];

    refresh() {
        this.#beforeRefresh();
        this._reload();
        this.#afterRefresh();
    }

    /**
     * Override in subclasses to re-parse DOM on refresh.
     */
    _reload() { }

    /**
     * Add a hook to run after the element is refreshed
     * @param {function} func Function to call after the element is refreshed
     */
    addAfterRefreshHook(func) {
        this.#afterRefreshHooks.push(func);
    }

    /**
     * Add a hook to run before the element is refreshed
     * @param {function} func Function to call before the element is refreshed
     */
    addBeforeRefreshHook(func) {
        this.#beforeRefreshHooks.push(func);
    }

    addMutationObserver(mutationTarget = null, mutationConfiguration = {
        attributes: false,
        childList: true,
        subtree: true,
    }) {
        if (!mutationTarget) {
            throw new Error('No mutationTarget provided!');
        }

        const observer = new MutationObserver((mutationsList, obs) => {
            this.mutationCallback(mutationsList, obs);
        });

        observer.observe(mutationTarget, mutationConfiguration);
    }

    /**
     * Override in subclasses to handle mutations.
     */
    mutationCallback(mutationsList, observer) {
        throw new Error('Unhandled mutationCallback');
    }

    /**
     * Run all hooks that should be called prior to refreshing the element
     */
    #beforeRefresh() {
        for (const func of this.#beforeRefreshHooks) {
            func();
        }
    }

    /**
     * Run all hooks that should be called after refreshing the element
     */
    #afterRefresh() {
        for (const func of this.#afterRefreshHooks) {
            func();
        }
    }
}

;// ./node_modules/pardus-library/src/classes/main/tile.js
/* global userloc */

class Tile {
    #x;
    #y;
    #tileId;
    #virtualTile;
    #highlights = new Set();
    #listenerNonce = new Set();

    static colours = new Map([
        ['Green', {
            red: 0,
            green: 128,
            blue: 0,
            shortCode: 'g',
        }],
        ['Blue', {
            red: 0,
            green: 0,
            blue: 128,
            shortCode: 'b',
        }],
        ['Red', {
            red: 128,
            green: 0,
            blue: 0,
            shortCode: 'r',
        }],
        ['Yellow', {
            red: 128,
            green: 128,
            blue: 0,
            shortCode: 'y',
        }],
        ['Cyan', {
            red: 0,
            green: 128,
            blue: 128,
            shortCode: 'c',
        }],
        ['Magenta', {
            red: 128,
            green: 0,
            blue: 128,
            shortCode: 'm',
        }],
        ['Silver', {
            red: 128,
            green: 128,
            blue: 128,
            shortCode: 's',
        }],
    ]);

    constructor(element, x, y, tileId = null, virtualTile = false) {
        this.#x = x;
        this.#y = y;
        this.emphasised = false;
        this.pathHighlighted = false;
        this.#virtualTile = virtualTile;
        this.type = 'regular';
        this.objectType = '';

        if (this.isVirtualTile()) {
            this.#tileId = tileId.toString();
        } else {
            this.element = element;
            this.backgroundImage = this.element.style.backgroundImage;
            const unhighlightRegex = /^\s*linear-gradient.*?, (url\(.*)$/;

            if (unhighlightRegex.test(this.backgroundImage)) {
                this.backgroundImage = this.backgroundImage.match(unhighlightRegex)[1];
            }

            if (this.element.classList.contains('navNpc')) {
                this.objectType = 'npc';
            }

            if (this.element.classList.contains('navBuilding')) {
                this.objectType = 'building';
            }

            if (this.element.classList.contains('navWormhole')) {
                this.type = 'wormhole';
            }

            if (this.element.classList.contains('navYhole')) {
                this.type = 'y-hole';
            }

            if (this.element.classList.contains('navXhole')) {
                this.type = 'x-hole';
            }

            // Get the tile id
            if (this.element.classList.contains('navShip') && this.element.querySelector('#thisShip')) {
                this.#tileId = this.getUserloc();
            } else if (this.element.children.length > 0 && this.element.querySelector('A')) {
                // In order to support blue stims, we have to use querySelector to handle the extra <div>
                const childElement = this.element.querySelector('A');

                // Can we navigate to the tile?
                if ((!childElement.hasAttribute('onclick') || childElement.getAttribute('onclick').startsWith('warp')) && (!childElement.hasAttribute('_onclick') || childElement.getAttribute('_onclick').startsWith('warp'))) {
                    this.#tileId = this.getUserloc();
                } else if (childElement.hasAttribute('onclick') && childElement.getAttribute('onclick').startsWith('nav')) {
                    this.#tileId = childElement.getAttribute('onclick').match(/^[^\d]*(\d*)[^\d]*$/)[1];
                } else if (childElement.hasAttribute('_onclick') && childElement.getAttribute('_onclick').startsWith('nav')) {
                    // Freeze Frame compatibility
                    this.#tileId = childElement.getAttribute('_onclick').match(/^[^\d]*(\d*)[^\d]*$/)[1];
                } else if (childElement.hasAttribute('_onclick') && childElement.getAttribute('_onclick') === 'null') {
                    this.#tileId = this.getUserloc();
                }
            } else if (this.element.classList.contains('navShip')) {
                // This only happens on retreating
                this.#tileId = this.getUserloc();
            }
        }
    }

    isWormhole() {
        return this.type === 'wormhole';
    }

    isXHole() {
        return this.type === 'x-hole';
    }

    isYHole() {
        return this.type === 'y-hole';
    }

    hasNpc() {
        return this.objectType === 'npc';
    }

    set id(id) {
        this.#tileId = id.toString();
    }

    get id() {
        return this.#tileId;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    getUserloc() {
        if (typeof userloc !== 'undefined') {
            return userloc.toString();
        }
        return '-1';
    }

    toString() {
        return `Tile ${this.#tileId} [${this.x}, ${this.y}]`;
    }

    valueOf() {
        return Number(this.#tileId);
    }

    isVirtualTile() {
        return this.#virtualTile;
    }

    isClickable() {
        if (!this.isVirtualTile() && this.#tileId && parseInt(this.#tileId, 10) > 0) {
            return true;
        }

        return false;
    }

    isNavigatable() {
        if (!this.isVirtualTile() && this.element && this.element.children.length > 0 && this.element.querySelector('A')?.getAttribute('onclick') && this.element.querySelector('A')?.getAttribute('onclick').startsWith('nav') && this.isClickable()) {
            return true;
        }

        if (!this.isVirtualTile() && this.element && this.element.children.length > 0 && this.element.querySelector('A')?.getAttribute('_onclick') && this.element.querySelector('A')?.getAttribute('_onclick').startsWith('nav') && this.isClickable()) {
            return true;
        }

        return false;
    }

    isCentreTile() {
        return this.isCentre;
    }

    isHighlighted() {
        if (this.#highlights.size > 0) {
            return true;
        }

        return false;
    }

    addEventListener(event, func, options = {}) {
        if (Object.prototype.hasOwnProperty.call(options, 'nonce')) {
            if (this.#listenerNonce.has(options.nonce)) {
                return;
            }
        }

        if (this.isNavigatable()) {
            this.element.querySelector('A').addEventListener(event, func, options);

            if (Object.prototype.hasOwnProperty.call(options, 'nonce')) {
                this.#listenerNonce.add(options.nonce);
            }
        }
    }

    addHighlight(highlightColour) {
        this.#highlights.add(highlightColour);
        this.#refreshHighlightStatus();
    }

    addHighlights(highlights = new Set()) {
        highlights.forEach((value) => {
            this.#highlights.add(value);
        });

        this.#refreshHighlightStatus();
    }

    removeHighlight(highlightColour) {
        this.#highlights.delete(highlightColour);
        this.#refreshHighlightStatus();
    }

    isEmphasised() {
        return this.emphasised;
    }

    emphasiseHighlight() {
        this.emphasised = true;
        this.#refreshHighlightStatus();
    }

    removeEmphasis() {
        this.emphasised = false;
        this.#refreshHighlightStatus();
    }

    clearHighlight() {
        this.#clearAllHighlighting();
    }

    #refreshHighlightStatus() {
        if (this.isVirtualTile()) {
            return false;
        }

        if (this.#highlights.size === 0) {
            return this.#clearAllHighlighting();
        }

        const highlightedColourString = this.#getHighlightedColourString();
        const emphasis = this.emphasised ? 0.8 : 0.5;

        // Does this tile have a background image?
        if (this.backgroundImage) {
            this.element.style.backgroundImage = `linear-gradient(to bottom, rgba(${highlightedColourString},${emphasis}), rgba(${highlightedColourString},${emphasis})), ${this.backgroundImage}`;
        } else {
            this.element.style.backgroundColor = `rgba(${highlightedColourString},1)`;
            this.element.firstElementChild.style.opacity = 1 - emphasis;
        }

        return true;
    }

    #clearAllHighlighting() {
        if (this.isVirtualTile()) {
            return false;
        }

        this.#highlights.clear();

        if (this.backgroundImage) {
            this.element.style.backgroundImage = this.backgroundImage;
        } else {
            this.element.style.backgroundColor = '';
            this.element.firstElementChild.style.opacity = 1;
        }

        return true;
    }

    * #yieldHighlightsRGB() {
        for (const colour of this.constructor.colours.values()) {
            if (this.#highlights.has(colour.shortCode)) {
                yield {
                    red: colour.red,
                    green: colour.green,
                    blue: colour.blue,
                };
            }
        }
    }

    #getHighlightedColourString() {
        if (this.isVirtualTile()) {
            return false;
        }

        // This is probably the world's worst colour-mixing algorithm
        let totalRed = 0;
        let totalGreen = 0;
        let totalBlue = 0;

        let numberRed = 0;
        let numberGreen = 0;
        let numberBlue = 0;

        for (const colour of this.#yieldHighlightsRGB()) {
            totalRed += colour.red;
            totalGreen += colour.green;
            totalBlue += colour.blue;

            numberRed += 1;
            numberGreen += 1;
            numberBlue += 1;
        }

        if (numberRed === 0) {
            numberRed = 1;
        }

        if (numberGreen === 0) {
            numberGreen = 1;
        }

        if (numberBlue === 0) {
            numberBlue = 1;
        }

        return `${Math.floor(totalRed / numberRed)},${Math.floor(totalGreen / numberGreen)},${Math.floor(totalBlue / numberBlue)}`;
    }
}

;// ./node_modules/pardus-library/src/classes/pardus/sector.js


class Sector {
    #idStart = 0;
    #columns = 0;
    #rows = 0;

    constructor(name, start, columns, rows) {
        this.name = name;
        this.#idStart = start;
        this.#columns = columns;
        this.#rows = rows;
    }

    contains(tileId) {
        if (tileId >= this.#idStart && tileId < this.#idStart + (this.#columns * this.#rows)) {
            return true;
        }

        return false;
    }

    getTile(tileId) {
        if (!this.contains(tileId)) {
            return null;
        }

        return {
            sector: this.name,
            x: Math.floor((tileId - this.#idStart) / this.#rows),
            y: (tileId - this.#idStart) % this.#rows,
            tileId,
            rows: this.#rows,
            colums: this.#columns,
        };
    }

    getVirtualTile(x, y, reference) {
        return new Tile(null, x, y, Number(reference.id) + (x - reference.x) + ((y - reference.y) * this.#columns), true);
    }

    getTileHumanString(tileId) {
        const sectorObj = this.getTile(tileId);

        return `${sectorObj.sector} [${sectorObj.x}, ${sectorObj.y}]`;
    }

    getTileByCoords(x, y) {
        if (Number(x) < 0 || Number(y) < 0 || Number(x) >= this.#columns || Number(y) >= this.#rows) {
            return -1;
        }

        return Number(this.#idStart) + Number(x) * Number(this.#rows) + Number(y);
    }
}

;// ./node_modules/pardus-library/src/data/sectors.js
const sectors = {
    "Aandti" : { "start": 78435, "cols": 22, "rows": 13 },
    "AB 5-848" : { "start": 375000, "cols": 18, "rows": 14 },
    "Abeho" : { "start": 325645, "cols": 25, "rows": 13 },
    "Achird" : { "start": 118538, "cols": 22, "rows": 22 },
    "Ackandso" : { "start": 24458, "cols": 26, "rows": 20 },
    "Ackarack" : { "start": 300000, "cols": 14, "rows": 20 },
    "Ackexa" : { "start": 32188, "cols": 20, "rows": 15 },
    "Ackwada" : { "start": 101525, "cols": 22, "rows": 15 },
    "Adaa" : { "start": 6409, "cols": 22, "rows": 26 },
    "Adara" : { "start": 95219, "cols": 15, "rows": 21 },
    "Aedce" : { "start": 306687, "cols": 17, "rows": 20 },
    "Aeg" : { "start": 24978, "cols": 21, "rows": 13 },
    "Alfirk" : { "start": 95534, "cols": 20, "rows": 15 },
    "Algol" : { "start": 375252, "cols": 19, "rows": 25 },
    "Alioth" : { "start": 32488, "cols": 16, "rows": 15 },
    "Alpha Centauri" : { "start": 1, "cols": 19, "rows": 12 },
    "AN 2-956" : { "start": 52083, "cols": 19, "rows": 20 },
    "An Dzeve" : { "start": 6981, "cols": 23, "rows": 18 },
    "Anaam" : { "start": 16466, "cols": 18, "rows": 20 },
    "Anayed" : { "start": 300280, "cols": 15, "rows": 16 },
    "Andexa" : { "start": 229, "cols": 20, "rows": 15 },
    "Andsoled" : { "start": 318960, "cols": 18, "rows": 25 },
    "Anphiex" : { "start": 78721, "cols": 18, "rows": 30 },
    "Arexack" : { "start": 325970, "cols": 17, "rows": 17 },
    "Atlas" : { "start": 79261, "cols": 21, "rows": 15 },
    "Aveed" : { "start": 101855, "cols": 17, "rows": 15 },
    "Aya" : { "start": 142998, "cols": 40, "rows": 35 },
    "Ayargre" : { "start": 16826, "cols": 18, "rows": 18 },
    "Ayinti" : { "start": 300520, "cols": 20, "rows": 20 },
    "Ayqugre" : { "start": 307027, "cols": 16, "rows": 14 },
    "Baar" : { "start": 79576, "cols": 16, "rows": 12 },
    "Baham" : { "start": 139288, "cols": 29, "rows": 36 },
    "BE 3-702" : { "start": 119022, "cols": 20, "rows": 20 },
    "Becanin" : { "start": 52463, "cols": 17, "rows": 14 },
    "Becanol" : { "start": 79768, "cols": 20, "rows": 25 },
    "Bedaho" : { "start": 32728, "cols": 20, "rows": 18 },
    "Beeday" : { "start": 300920, "cols": 16, "rows": 15 },
    "Beethti" : { "start": 17150, "cols": 16, "rows": 20 },
    "Begreze" : { "start": 17470, "cols": 17, "rows": 14 },
    "Belati" : { "start": 301160, "cols": 25, "rows": 16 },
    "Bellatrix" : { "start": 119422, "cols": 25, "rows": 18 },
    "Besoex" : { "start": 25251, "cols": 13, "rows": 16 },
    "Beta Hydri" : { "start": 102110, "cols": 24, "rows": 20 },
    "Beta Proxima" : { "start": 529, "cols": 19, "rows": 19 },
    "Betelgeuse" : { "start": 33088, "cols": 32, "rows": 22 },
    "Betiess" : { "start": 40935, "cols": 13, "rows": 16 },
    "Beurso" : { "start": 319410, "cols": 19, "rows": 25 },
    "Bewaack" : { "start": 375727, "cols": 14, "rows": 25 },
    "BL 3961" : { "start": 890, "cols": 20, "rows": 10 },
    "BL 6-511" : { "start": 80268, "cols": 24, "rows": 31 },
    "BQ 3-927" : { "start": 41143, "cols": 15, "rows": 15 },
    "BU 5-773" : { "start": 326259, "cols": 25, "rows": 8 },
    "Cabard" : { "start": 52701, "cols": 9, "rows": 22 },
    "Canaab" : { "start": 7539, "cols": 18, "rows": 13 },
    "Canexin" : { "start": 17708, "cols": 25, "rows": 25 },
    "Canolin" : { "start": 324186, "cols": 16, "rows": 15 },
    "Canopus" : { "start": 41368, "cols": 13, "rows": 22 },
    "Capella" : { "start": 33792, "cols": 19, "rows": 17 },
    "Cassand" : { "start": 25459, "cols": 13, "rows": 19 },
    "CC 3-771" : { "start": 301560, "cols": 20, "rows": 10 },
    "Ceanze" : { "start": 307251, "cols": 15, "rows": 17 },
    "Cebalrai" : { "start": 119872, "cols": 21, "rows": 24 },
    "Cebece" : { "start": 140332, "cols": 27, "rows": 18 },
    "Cegreeth" : { "start": 376077, "cols": 18, "rows": 22 },
    "Ceina" : { "start": 319885, "cols": 16, "rows": 15 },
    "Cemiess" : { "start": 52899, "cols": 18, "rows": 15 },
    "Cesoho" : { "start": 1090, "cols": 12, "rows": 7 },
    "Cor Caroli" : { "start": 140818, "cols": 40, "rows": 42 },
    "CP 2-197" : { "start": 102590, "cols": 16, "rows": 13 },
    "Daaya" : { "start": 41654, "cols": 26, "rows": 25 },
    "Daaze" : { "start": 320125, "cols": 17, "rows": 15 },
    "Daceess" : { "start": 1174, "cols": 15, "rows": 8 },
    "Dadaex" : { "start": 326459, "cols": 18, "rows": 21 },
    "Dainfa" : { "start": 102798, "cols": 18, "rows": 18 },
    "Datiack" : { "start": 18333, "cols": 19, "rows": 15 },
    "Daured" : { "start": 103122, "cols": 18, "rows": 17 },
    "Daurlia" : { "start": 25706, "cols": 14, "rows": 15 },
    "Delta Pavonis" : { "start": 25916, "cols": 14, "rows": 27 },
    "DH 3-625" : { "start": 110554, "cols": 16, "rows": 13 },
    "DI 9-486" : { "start": 103428, "cols": 25, "rows": 16 },
    "Diphda" : { "start": 95834, "cols": 20, "rows": 20 },
    "DP 2-354" : { "start": 301760, "cols": 16, "rows": 14 },
    "Dsiban" : { "start": 120376, "cols": 17, "rows": 17 },
    "Dubhe" : { "start": 142498, "cols": 20, "rows": 25 },
    "Edbeeth" : { "start": 18618, "cols": 18, "rows": 15 },
    "Edeneth" : { "start": 8273, "cols": 12, "rows": 7 },
    "Edenve" : { "start": 81012, "cols": 25, "rows": 25 },
    "Edethex" : { "start": 103828, "cols": 25, "rows": 25 },
    "Edmial" : { "start": 376473, "cols": 17, "rows": 16 },
    "Edmize" : { "start": 18888, "cols": 16, "rows": 16 },
    "Edqueth" : { "start": 320380, "cols": 17, "rows": 10 },
    "Edvea" : { "start": 301984, "cols": 32, "rows": 24 },
    "EH 5-382" : { "start": 96234, "cols": 14, "rows": 15 },
    "Electra" : { "start": 42304, "cols": 23, "rows": 16 },
    "Elnath" : { "start": 376745, "cols": 18, "rows": 25 },
    "Enaness" : { "start": 42672, "cols": 21, "rows": 12 },
    "Encea" : { "start": 53169, "cols": 14, "rows": 15 },
    "Enif" : { "start": 138413, "cols": 35, "rows": 25 },
    "Enioar" : { "start": 307506, "cols": 21, "rows": 13 },
    "Enwaand" : { "start": 320550, "cols": 20, "rows": 22 },
    "Epsilon Eridani" : { "start": 1294, "cols": 18, "rows": 32 },
    "Epsilon Indi" : { "start": 34115, "cols": 20, "rows": 13 },
    "Ericon" : { "start": 1870, "cols": 15, "rows": 26 },
    "Essaa" : { "start": 34375, "cols": 11, "rows": 22 },
    "Eta Cassiopeia" : { "start": 26294, "cols": 15, "rows": 35 },
    "Etamin" : { "start": 144398, "cols": 31, "rows": 24 },
    "Exackcan" : { "start": 26819, "cols": 15, "rows": 13 },
    "Exbeur" : { "start": 53379, "cols": 25, "rows": 25 },
    "Exinfa" : { "start": 8357, "cols": 10, "rows": 20 },
    "Exiool" : { "start": 104453, "cols": 22, "rows": 19 },
    "Faarfa" : { "start": 81637, "cols": 14, "rows": 12 },
    "Facece" : { "start": 54004, "cols": 16, "rows": 23 },
    "Fadaphi" : { "start": 377195, "cols": 25, "rows": 25 },
    "Faedho" : { "start": 307779, "cols": 14, "rows": 25 },
    "Faexze" : { "start": 2260, "cols": 23, "rows": 16 },
    "Famiay" : { "start": 34617, "cols": 15, "rows": 13 },
    "Famida" : { "start": 326837, "cols": 25, "rows": 19 },
    "Famiso" : { "start": 42924, "cols": 22, "rows": 15 },
    "Faphida" : { "start": 19144, "cols": 22, "rows": 14 },
    "Fawaol" : { "start": 302752, "cols": 20, "rows": 25 },
    "Fomalhaut" : { "start": 27014, "cols": 20, "rows": 20 },
    "Fornacis" : { "start": 145142, "cols": 25, "rows": 30 },
    "FR 3-328" : { "start": 320990, "cols": 12, "rows": 20 },
    "Furud" : { "start": 120665, "cols": 15, "rows": 20 },
    "Gienah Cygni" : { "start": 120965, "cols": 15, "rows": 26 },
    "Gilo" : { "start": 81805, "cols": 18, "rows": 21 },
    "GM 4-572" : { "start": 54372, "cols": 15, "rows": 13 },
    "Gomeisa" : { "start": 145892, "cols": 30, "rows": 23 },
    "Greandin" : { "start": 27414, "cols": 14, "rows": 23 },
    "Grecein" : { "start": 8557, "cols": 13, "rows": 16 },
    "Greenso" : { "start": 377820, "cols": 20, "rows": 16 },
    "Grefaho" : { "start": 19452, "cols": 21, "rows": 20 },
    "Greliai" : { "start": 303252, "cols": 16, "rows": 20 },
    "Gresoin" : { "start": 327312, "cols": 25, "rows": 21 },
    "Gretiay" : { "start": 104871, "cols": 20, "rows": 20 },
    "GT 3-328" : { "start": 327837, "cols": 14, "rows": 16 },
    "GV 4-652" : { "start": 34812, "cols": 12, "rows": 12 },
    "HC 4-962" : { "start": 34956, "cols": 12, "rows": 13 },
    "Heze" : { "start": 146605, "cols": 35, "rows": 40 },
    "HO 2-296" : { "start": 48098, "cols": 15, "rows": 11 },
    "Hoanda" : { "start": 2628, "cols": 16, "rows": 18 },
    "Hobeex" : { "start": 308129, "cols": 19, "rows": 14 },
    "Hocancan" : { "start": 43254, "cols": 17, "rows": 19 },
    "Homam" : { "start": 121355, "cols": 17, "rows": 22 },
    "Hooth" : { "start": 82183, "cols": 25, "rows": 13 },
    "Hource" : { "start": 303572, "cols": 19, "rows": 16 },
    "HW 3-863" : { "start": 96444, "cols": 16, "rows": 20 },
    "Iceo" : { "start": 8765, "cols": 20, "rows": 14 },
    "Inena" : { "start": 35112, "cols": 14, "rows": 21 },
    "Inioen" : { "start": 308395, "cols": 13, "rows": 14 },
    "Iniolol" : { "start": 27736, "cols": 17, "rows": 14 },
    "Inliaa" : { "start": 9045, "cols": 12, "rows": 10 },
    "Iohofa" : { "start": 328061, "cols": 24, "rows": 16 },
    "Ioliaa" : { "start": 105271, "cols": 18, "rows": 16 },
    "Ioquex" : { "start": 82508, "cols": 16, "rows": 15 },
    "Iowagre" : { "start": 303876, "cols": 18, "rows": 12 },
    "Iozeio" : { "start": 48263, "cols": 19, "rows": 13 },
    "IP 3-251" : { "start": 7395, "cols": 16, "rows": 9 },
    "Izar" : { "start": 121729, "cols": 16, "rows": 18 },
    "JG 2-013" : { "start": 308577, "cols": 20, "rows": 8 },
    "JO 4-132" : { "start": 378140, "cols": 20, "rows": 20 },
    "JS 2-090" : { "start": 35406, "cols": 13, "rows": 10 },
    "Keid" : { "start": 122017, "cols": 20, "rows": 20 },
    "Keldon" : { "start": 27974, "cols": 26, "rows": 34 },
    "Kenlada" : { "start": 7773, "cols": 25, "rows": 20 },
    "Kitalpha" : { "start": 96764, "cols": 17, "rows": 16 },
    "KU 3-616" : { "start": 28858, "cols": 12, "rows": 8 },
    "Laanex" : { "start": 28954, "cols": 15, "rows": 16 },
    "Labela" : { "start": 148005, "cols": 34, "rows": 38 },
    "Ladaen" : { "start": 321230, "cols": 20, "rows": 23 },
    "Laedgre" : { "start": 43577, "cols": 19, "rows": 20 },
    "Lagreen" : { "start": 328445, "cols": 16, "rows": 20 },
    "Lahola" : { "start": 54567, "cols": 25, "rows": 21 },
    "Lalande" : { "start": 2916, "cols": 7, "rows": 10 },
    "Lamice" : { "start": 9165, "cols": 25, "rows": 22 },
    "Laolla" : { "start": 20240, "cols": 12, "rows": 17 },
    "Lasolia" : { "start": 82748, "cols": 19, "rows": 16 },
    "Lave" : { "start": 2986, "cols": 23, "rows": 16 },
    "Lavebe" : { "start": 328765, "cols": 23, "rows": 8 },
    "Lazebe" : { "start": 122417, "cols": 28, "rows": 19 },
    "Leesti" : { "start": 308737, "cols": 15, "rows": 16 },
    "Let" : { "start": 328949, "cols": 22, "rows": 34 },
    "Liaackti" : { "start": 321690, "cols": 20, "rows": 23 },
    "Liaface" : { "start": 308977, "cols": 20, "rows": 20 },
    "Lianla" : { "start": 9715, "cols": 20, "rows": 20 },
    "Liaququ" : { "start": 105559, "cols": 17, "rows": 24 },
    "LN 3-141" : { "start": 29194, "cols": 6, "rows": 6 },
    "LO 2-014" : { "start": 35536, "cols": 10, "rows": 3 },
    "Maia" : { "start": 35566, "cols": 20, "rows": 13 },
    "Matar" : { "start": 122949, "cols": 16, "rows": 16 },
    "Mebsuta" : { "start": 97036, "cols": 17, "rows": 20 },
    "Menkar" : { "start": 149297, "cols": 27, "rows": 34 },
    "Menkent" : { "start": 105967, "cols": 20, "rows": 17 },
    "Meram" : { "start": 168151, "cols": 20, "rows": 25 },
    "Miackio" : { "start": 304092, "cols": 25, "rows": 16 },
    "Miarin" : { "start": 3354, "cols": 7, "rows": 20 },
    "Miayack" : { "start": 10115, "cols": 24, "rows": 14 },
    "Miayda" : { "start": 378540, "cols": 25, "rows": 17 },
    "Micanex" : { "start": 35826, "cols": 20, "rows": 20 },
    "Mintaka" : { "start": 150215, "cols": 40, "rows": 25 },
    "Miola" : { "start": 329697, "cols": 25, "rows": 19 },
    "Miphimi" : { "start": 43957, "cols": 22, "rows": 18 },
    "Mizar" : { "start": 51715, "cols": 16, "rows": 23 },
    "Naos" : { "start": 106307, "cols": 17, "rows": 18 },
    "Nari" : { "start": 137155, "cols": 34, "rows": 37 },
    "Nashira" : { "start": 123205, "cols": 24, "rows": 21 },
    "Nebul" : { "start": 36226, "cols": 12, "rows": 26 },
    "Nekkar" : { "start": 123709, "cols": 14, "rows": 24 },
    "Nex 0001" : { "start": 83052, "cols": 23, "rows": 25 },
    "Nex 0002" : { "start": 44353, "cols": 20, "rows": 25 },
    "Nex 0003" : { "start": 55092, "cols": 25, "rows": 20 },
    "Nex 0004" : { "start": 97376, "cols": 25, "rows": 25 },
    "Nex 0005" : { "start": 324426, "cols": 25, "rows": 25 },
    "Nex 0006" : { "start": 378965, "cols": 25, "rows": 25 },
    "Nex Kataam" : { "start": 47473, "cols": 25, "rows": 25 },
    "Nhandu" : { "start": 160515, "cols": 28, "rows": 40 },
    "Nionquat" : { "start": 36538, "cols": 15, "rows": 20 },
    "Nunki" : { "start": 167638, "cols": 19, "rows": 27 },
    "Nusakan" : { "start": 98001, "cols": 25, "rows": 19 },
    "Oauress" : { "start": 322150, "cols": 22, "rows": 16 },
    "Olaeth" : { "start": 124045, "cols": 18, "rows": 14 },
    "Olaso" : { "start": 330172, "cols": 25, "rows": 20 },
    "Olbea" : { "start": 10451, "cols": 21, "rows": 22 },
    "Olcanze" : { "start": 44853, "cols": 20, "rows": 20 },
    "Oldain" : { "start": 304492, "cols": 18, "rows": 18 },
    "Olexti" : { "start": 3494, "cols": 8, "rows": 16 },
    "Ollaffa" : { "start": 309377, "cols": 17, "rows": 14 },
    "Olphize" : { "start": 20858, "cols": 19, "rows": 21 },
    "Omicron Eridani" : { "start": 36838, "cols": 16, "rows": 19 },
    "Ook" : { "start": 3622, "cols": 15, "rows": 15 },
    "Ophiuchi" : { "start": 55592, "cols": 22, "rows": 20 },
    "Orerve" : { "start": 3847, "cols": 18, "rows": 15 },
    "Oucanfa" : { "start": 379590, "cols": 15, "rows": 15 },
    "PA 2-013" : { "start": 330672, "cols": 20, "rows": 17 },
    "Paan" : { "start": 56032, "cols": 25, "rows": 23 },
    "Pardus" : { "start": 151215, "cols": 100, "rows": 93 },
    "Pass EMP-01" : { "start": 15053, "cols": 20, "rows": 25 },
    "Pass EMP-02" : { "start": 15553, "cols": 18, "rows": 20 },
    "Pass EMP-03" : { "start": 31688, "cols": 25, "rows": 20 },
    "Pass EMP-04" : { "start": 58622, "cols": 25, "rows": 25 },
    "Pass EMP-05" : { "start": 59247, "cols": 13, "rows": 20 },
    "Pass EMP-06" : { "start": 110762, "cols": 25, "rows": 13 },
    "Pass EMP-07" : { "start": 312856, "cols": 25, "rows": 23 },
    "Pass EMP-08" : { "start": 313431, "cols": 25, "rows": 21 },
    "Pass EMP-09" : { "start": 313956, "cols": 25, "rows": 25 },
    "Pass EMP-10" : { "start": 314581, "cols": 25, "rows": 25 },
    "Pass EMP-11" : { "start": 315206, "cols": 15, "rows": 22 },
    "Pass FED-01" : { "start": 15913, "cols": 18, "rows": 17 },
    "Pass FED-02" : { "start": 16219, "cols": 13, "rows": 19 },
    "Pass FED-03" : { "start": 39275, "cols": 17, "rows": 15 },
    "Pass FED-04" : { "start": 39530, "cols": 25, "rows": 22 },
    "Pass FED-05" : { "start": 40080, "cols": 21, "rows": 21 },
    "Pass FED-06" : { "start": 40521, "cols": 18, "rows": 23 },
    "Pass FED-07" : { "start": 85857, "cols": 27, "rows": 15 },
    "Pass FED-08" : { "start": 315536, "cols": 14, "rows": 23 },
    "Pass FED-09" : { "start": 315858, "cols": 23, "rows": 17 },
    "Pass FED-10" : { "start": 316249, "cols": 19, "rows": 20 },
    "Pass FED-11" : { "start": 316629, "cols": 22, "rows": 17 },
    "Pass FED-12" : { "start": 317003, "cols": 21, "rows": 22 },
    "Pass FED-13" : { "start": 381583, "cols": 16, "rows": 21 },
    "Pass UNI-01" : { "start": 111087, "cols": 25, "rows": 16 },
    "Pass UNI-02" : { "start": 111487, "cols": 10, "rows": 10 },
    "Pass UNI-03" : { "start": 111587, "cols": 18, "rows": 20 },
    "Pass UNI-04" : { "start": 127261, "cols": 25, "rows": 25 },
    "Pass UNI-05" : { "start": 127886, "cols": 25, "rows": 26 },
    "Pass UNI-06" : { "start": 317465, "cols": 17, "rows": 19 },
    "Pass UNI-07" : { "start": 317788, "cols": 23, "rows": 24 },
    "Pass UNI-08" : { "start": 318340, "cols": 20, "rows": 31 },
    "Pass UNI-09" : { "start": 381919, "cols": 20, "rows": 15 },
    "Phaet" : { "start": 124297, "cols": 17, "rows": 16 },
    "Phao" : { "start": 98476, "cols": 21, "rows": 20 },
    "Phekda" : { "start": 37142, "cols": 8, "rows": 17 },
    "Phiagre" : { "start": 45253, "cols": 21, "rows": 13 },
    "Phiandgre" : { "start": 322502, "cols": 24, "rows": 20 },
    "Phicanho" : { "start": 10913, "cols": 13, "rows": 25 },
    "PI 4-669" : { "start": 29230, "cols": 9, "rows": 10 },
    "PJ 3373" : { "start": 4117, "cols": 10, "rows": 6 },
    "PO 4-991" : { "start": 11238, "cols": 20, "rows": 14 },
    "Polaris" : { "start": 83627, "cols": 10, "rows": 14 },
    "Pollux" : { "start": 29320, "cols": 20, "rows": 10 },
    "PP 5-713" : { "start": 325051, "cols": 15, "rows": 13 },
    "Procyon" : { "start": 161635, "cols": 37, "rows": 31 },
    "Propus" : { "start": 379815, "cols": 16, "rows": 20 },
    "Quaack" : { "start": 162782, "cols": 28, "rows": 25 },
    "Quana" : { "start": 11518, "cols": 16, "rows": 26 },
    "Quaphi" : { "start": 304816, "cols": 17, "rows": 14 },
    "Quator" : { "start": 29520, "cols": 18, "rows": 18 },
    "Quexce" : { "start": 106613, "cols": 19, "rows": 24 },
    "Quexho" : { "start": 322982, "cols": 17, "rows": 14 },
    "Quince" : { "start": 56607, "cols": 14, "rows": 16 },
    "Qumia" : { "start": 83767, "cols": 20, "rows": 15 },
    "Qumiin" : { "start": 309615, "cols": 18, "rows": 20 },
    "Quurze" : { "start": 4177, "cols": 16, "rows": 20 },
    "QW 2-014" : { "start": 21257, "cols": 15, "rows": 9 },
    "RA 3-124" : { "start": 309975, "cols": 12, "rows": 12 },
    "Ras Elased" : { "start": 163482, "cols": 41, "rows": 40 },
    "Rashkan" : { "start": 37278, "cols": 25, "rows": 29 },
    "Regulus" : { "start": 29844, "cols": 16, "rows": 16 },
    "Remo" : { "start": 45526, "cols": 28, "rows": 26 },
    "Retho" : { "start": 21392, "cols": 22, "rows": 22 },
    "Rigel" : { "start": 165122, "cols": 49, "rows": 34 },
    "Ross" : { "start": 46254, "cols": 17, "rows": 15 },
    "Rotanev" : { "start": 98896, "cols": 16, "rows": 19 },
    "RV 2-578" : { "start": 11934, "cols": 14, "rows": 12 },
    "RX 3-129" : { "start": 305054, "cols": 13, "rows": 12 },
    "SA 2779" : { "start": 4497, "cols": 16, "rows": 5 },
    "Sargas" : { "start": 166788, "cols": 34, "rows": 25 },
    "SD 3-562" : { "start": 46509, "cols": 23, "rows": 19 },
    "Seginus" : { "start": 99200, "cols": 17, "rows": 18 },
    "SF 5-674" : { "start": 310119, "cols": 13, "rows": 22 },
    "Siberion" : { "start": 4577, "cols": 25, "rows": 15 },
    "Sigma Draconis" : { "start": 12102, "cols": 25, "rows": 20 },
    "Silaad" : { "start": 380135, "cols": 25, "rows": 20 },
    "Sirius" : { "start": 124569, "cols": 30, "rows": 25 },
    "Ska" : { "start": 12602, "cols": 40, "rows": 25 },
    "Sobein" : { "start": 331012, "cols": 15, "rows": 12 },
    "Sodaack" : { "start": 56831, "cols": 15, "rows": 16 },
    "Soessze" : { "start": 21876, "cols": 20, "rows": 20 },
    "Sohoa" : { "start": 38003, "cols": 14, "rows": 16 },
    "Sol" : { "start": 4952, "cols": 24, "rows": 29 },
    "Solaqu" : { "start": 84067, "cols": 25, "rows": 25 },
    "Soolti" : { "start": 310405, "cols": 21, "rows": 20 },
    "Sophilia" : { "start": 107069, "cols": 24, "rows": 17 },
    "Sowace" : { "start": 325246, "cols": 19, "rows": 21 },
    "Spica" : { "start": 107477, "cols": 20, "rows": 23 },
    "Stein" : { "start": 323220, "cols": 16, "rows": 16 },
    "Subra" : { "start": 125319, "cols": 20, "rows": 20 },
    "SZ 4-419" : { "start": 30100, "cols": 12, "rows": 7 },
    "Tau Ceti" : { "start": 5648, "cols": 25, "rows": 15 },
    "TG 2-143" : { "start": 22276, "cols": 11, "rows": 12 },
    "Thabit" : { "start": 99506, "cols": 25, "rows": 25 },
    "Tiacan" : { "start": 38227, "cols": 15, "rows": 18 },
    "Tiacken" : { "start": 22408, "cols": 19, "rows": 28 },
    "Tiafa" : { "start": 310825, "cols": 24, "rows": 27 },
    "Tianbe" : { "start": 30184, "cols": 19, "rows": 15 },
    "Tiexen" : { "start": 13602, "cols": 19, "rows": 20 },
    "Tigrecan" : { "start": 331192, "cols": 19, "rows": 13 },
    "Tiliala" : { "start": 57071, "cols": 25, "rows": 17 },
    "Tiurio" : { "start": 305210, "cols": 25, "rows": 14 },
    "Tivea" : { "start": 323476, "cols": 25, "rows": 20 },
    "Turais" : { "start": 125719, "cols": 20, "rows": 23 },
    "UF 3-555" : { "start": 311473, "cols": 14, "rows": 14 },
    "UG 5-093" : { "start": 126179, "cols": 22, "rows": 23 },
    "Urandack" : { "start": 13982, "cols": 20, "rows": 15 },
    "Ureneth" : { "start": 311669, "cols": 18, "rows": 17 },
    "Uressce" : { "start": 331439, "cols": 20, "rows": 17 },
    "Urfaa" : { "start": 107937, "cols": 23, "rows": 20 },
    "Urhoho" : { "start": 22940, "cols": 18, "rows": 18 },
    "Urioed" : { "start": 57496, "cols": 21, "rows": 9 },
    "Urlafa" : { "start": 30469, "cols": 17, "rows": 16 },
    "Ururur" : { "start": 46946, "cols": 20, "rows": 17 },
    "Usube" : { "start": 23264, "cols": 14, "rows": 30 },
    "Uv Seti" : { "start": 331779, "cols": 22, "rows": 15 },
    "UZ 8-466" : { "start": 84692, "cols": 20, "rows": 13 },
    "Veareth" : { "start": 57685, "cols": 19, "rows": 25 },
    "Vecelia" : { "start": 380635, "cols": 15, "rows": 26 },
    "Veedfa" : { "start": 323976, "cols": 14, "rows": 15 },
    "Vega" : { "start": 108857, "cols": 30, "rows": 25 },
    "Veliace" : { "start": 332109, "cols": 25, "rows": 16 },
    "Vewaa" : { "start": 30741, "cols": 22, "rows": 15 },
    "VH 3-344" : { "start": 14282, "cols": 8, "rows": 16 },
    "VM 3-326" : { "start": 311975, "cols": 25, "rows": 10 },
    "Waarze" : { "start": 58160, "cols": 20, "rows": 14 },
    "Waayan" : { "start": 38497, "cols": 25, "rows": 16 },
    "Wainze" : { "start": 109607, "cols": 17, "rows": 16 },
    "Waiophi" : { "start": 14410, "cols": 17, "rows": 15 },
    "Wamien" : { "start": 312225, "cols": 25, "rows": 15 },
    "Waolex" : { "start": 84952, "cols": 25, "rows": 25 },
    "Wasat" : { "start": 100131, "cols": 25, "rows": 19 },
    "Watibe" : { "start": 305560, "cols": 21, "rows": 15 },
    "Wezen" : { "start": 126685, "cols": 20, "rows": 20 },
    "WG 3-288" : { "start": 31071, "cols": 9, "rows": 13 },
    "WI 4-329" : { "start": 332509, "cols": 16, "rows": 21 },
    "WO 3-290" : { "start": 47286, "cols": 17, "rows": 11 },
    "Wolf" : { "start": 31188, "cols": 18, "rows": 20 },
    "WP 3155" : { "start": 6023, "cols": 17, "rows": 7 },
    "WW 2-934" : { "start": 127085, "cols": 16, "rows": 11 },
    "XC 3-261" : { "start": 14665, "cols": 16, "rows": 13 },
    "Xeho" : { "start": 381025, "cols": 16, "rows": 17 },
    "Xewao" : { "start": 312600, "cols": 16, "rows": 16 },
    "XH 3819" : { "start": 6142, "cols": 16, "rows": 12 },
    "YC 3-268" : { "start": 38897, "cols": 14, "rows": 15 },
    "Yildun" : { "start": 100606, "cols": 14, "rows": 17 },
    "YS 3-386" : { "start": 305875, "cols": 14, "rows": 20 },
    "YV 3-386" : { "start": 109879, "cols": 12, "rows": 18 },
    "Zamith" : { "start": 23684, "cols": 18, "rows": 18 },
    "Zaniah" : { "start": 100844, "cols": 16, "rows": 16 },
    "Zaurak" : { "start": 110095, "cols": 17, "rows": 27 },
    "Zeaay" : { "start": 332845, "cols": 27, "rows": 14 },
    "Zeaex" : { "start": 39107, "cols": 12, "rows": 14 },
    "Zearla" : { "start": 306155, "cols": 17, "rows": 16 },
    "Zelada" : { "start": 85577, "cols": 14, "rows": 20 },
    "Zeolen" : { "start": 14873, "cols": 15, "rows": 12 },
    "Zezela" : { "start": 31548, "cols": 14, "rows": 10 },
    "Zirr" : { "start": 24008, "cols": 25, "rows": 18 },
    "ZP 2-989" : { "start": 58440, "cols": 13, "rows": 14 },
    "ZS 3-798" : { "start": 306427, "cols": 13, "rows": 20 },
    "ZU 3-239" : { "start": 381297, "cols": 13, "rows": 22 },
    "Zuben Elakrab" : { "start": 101100, "cols": 25, "rows": 17 },
    "ZZ 2986" : { "start": 6334, "cols": 15, "rows": 5 },
};

;// ./node_modules/pardus-library/src/classes/static/sectors.js



const Sectors = new Map();

for (const sector of Object.keys(sectors)) {
    Sectors.set(sector, new Sector(sector, sectors[sector].start, sectors[sector].cols, sectors[sector].rows));
}

Sectors.getSectorForTile = function(tileId) {
    for (const sector of this.getSectors()) {
        if (sector.contains(tileId)) {
            return sector;
        }
    }

    throw new Error(`No sector found for tile id ${tileId}`);
};

Sectors.getSectorAndCoordsForTile = function(tileId) {
    return this.getSectorForTile(tileId).getTileHumanString(tileId);
};

Sectors.getTileIdFromSectorAndCoords = function(sector, x, y) {
    let actualSector = sector;

    if (actualSector.endsWith('NE')) {
        actualSector = actualSector.substring(0, actualSector.length - 3);
    }

    if (actualSector.endsWith('East') || actualSector.endsWith('West')) {
        actualSector = actualSector.substring(0, actualSector.length - 5);
    }

    if (actualSector.endsWith('North') || actualSector.endsWith('South') || actualSector.endsWith('Inner')) {
        actualSector = actualSector.substring(0, actualSector.length - 6);
    }

    if (!this.has(actualSector)) {
        throw new Error(`No data for sector '${actualSector}'!`);
    }

    return this.get(actualSector).getTileByCoords(x, y);
};

Sectors.getSectors = function * () {
    for (const sector of this) {
        yield sector[1];
    }
};

/* harmony default export */ const static_sectors = (Sectors);

;// ./node_modules/pardus-library/src/classes/main/nav.js




class NavArea extends Refreshable {
    #squad;
    #navElement;
    #height;
    #width;
    #grid = [];
    #centreTile;

    constructor(options = {
        squad: false,
    }) {
        super();
        this.#squad = options.squad;
        this.refresh();
    }

    get height() {
        return this.#height;
    }

    get width() {
        return this.#width;
    }

    get grid() {
        return this.#grid;
    }

    get centreTile() {
        return this.#centreTile;
    }

    addTilesHighlights(tilesToHighlight) {
        for (const tile of this.clickableTiles()) {
            if (tilesToHighlight.has(tile.id)) {
                tile.addHighlights(tilesToHighlight.get(tile.id));
            }
        }
    }

    addTilesHighlight(tilesToHighlight) {
        for (const tile of this.clickableTiles()) {
            if (tilesToHighlight.has(tile.id)) {
                tile.addHighlight(tilesToHighlight.get(tile.id));
            }
        }
    }

    clearTilesHighlights() {
        for (const tile of this.clickableTiles()) {
            tile.clearHighlight();
        }
    }

    refreshTilesToHighlight(tilesToHighlight) {
        this.tilesToHighlight = tilesToHighlight;
        this.refresh();
    }

    _reload() {
        this.#navElement = document.getElementById('navareatransition');

        if (!this.#navElement || this.#navElement.style.display === 'none') {
            this.#navElement = document.getElementById('navarea');
        }

        this.#height = this.#navElement.rows.length;
        this.#width = this.#navElement.rows[0].childElementCount;
        this.#grid = [];

        this.tilesMap = new Map();

        let scannedX = 0;
        let scannedY = 0;

        for (const row of this.#navElement.rows) {
            const rowArray = [];

            for (const tileTd of row.children) {
                let tileNumber;

                /* There's probably no reason not to use the squad logic for normal ships, too */
                if (this.#squad) {
                    tileNumber = (scannedY * this.#width) + scannedX;
                } else {
                    tileNumber = parseInt(tileTd.id.match(/[^\d]*(\d*)/)[1], 10);
                }

                const tileX = tileNumber % this.#width;
                const tileY = Math.floor(tileNumber / this.#width);
                const tile = new Tile(tileTd, tileX, tileY);

                rowArray.push(tile);
                this.tilesMap.set(tile.id, tile);

                scannedX++;
            }

            this.#grid.push(rowArray);
            scannedY++;
            scannedX = 0;
        }

        const centreX = Math.floor(this.#width / 2);
        const centreY = Math.floor(this.#height / 2);

        this.#centreTile = this.#grid[centreY][centreX];
        this.#centreTile.isCentre = true;

        /* For squads or other situations where no userloc is available */
        if (!this.#centreTile.id || this.#centreTile.id === '-1') {
            if (this.#grid[centreY - 1][centreX].id !== '-1') {
                const newId = parseInt(this.#grid[centreY - 1][centreX].id, 10) + 1;
                this.#centreTile.id = newId;
            }
        }
    }

    getTileOrVirtual(x, y, reference) {
        if (x >= this.#grid[0].length || x < 0 || y < 0 || y >= this.#grid.length) {
            return static_sectors.getSectorForTile(reference.id).getVirtualTile(x, y, reference);
        }

        return this.#grid[y][x];
    }

    * yieldPathBetween(from, to, ignoreNavigatable = false) {
        let currentTile = from;
        yield currentTile;

        while (currentTile.x !== to.x || currentTile.y !== to.y) {
            let directionX = 0;
            let directionY = 0;

            // Which way do we want to move?
            if (currentTile.x > to.x) {
                directionX = -1;
            } else if (currentTile.x < to.x) {
                directionX = 1;
            }

            if (currentTile.y > to.y) {
                directionY = -1;
            } else if (currentTile.y < to.y) {
                directionY = 1;
            }

            if (directionX === 0 && directionY === 0) {
                // We should never end up here, as it implies the two co-ords have the same x and y
                break;
            }

            let candidateTile = this.#grid[currentTile.y + directionY][currentTile.x + directionX];

            // Check to see if it's an unpassable tile, in which case the auto-pilot kicks in
            if (!candidateTile.isNavigatable()) {
                if (candidateTile.isVirtualTile()) {
                    break;
                }

                // If we're still going diagonally, the auto-pilot cannot do anything smart, so try to go in just one direction
                if (directionX !== 0 && directionY !== 0) {
                    candidateTile = this.getTileOrVirtual(currentTile.x, currentTile.y + directionY, currentTile);

                    if (!candidateTile.isNavigatable()) {
                        candidateTile = this.getTileOrVirtual(currentTile.x + directionX, currentTile.y, currentTile);

                        if (!candidateTile.isNavigatable()) {
                            break;
                        }
                    }
                } else if (directionX === 0) {
                    // Vertical auto-pilot will attempt to navigate right, then left
                    candidateTile = this.getTileOrVirtual(currentTile.x + 1, currentTile.y + directionY, currentTile);

                    if (!candidateTile.isNavigatable() && !candidateTile.isVirtualTile()) {
                        candidateTile = this.getTileOrVirtual(currentTile.x - 1, currentTile.y + directionY, currentTile);

                        if (!candidateTile.isNavigatable() && !candidateTile.isVirtualTile()) {
                            break;
                        }
                    }
                } else if (directionY === 0) {
                    // Horizontal auto-pilot will attempt to navigate down, then up
                    candidateTile = this.getTileOrVirtual(currentTile.x + directionX, currentTile.y + 1, currentTile);

                    if (!candidateTile.isNavigatable() && !candidateTile.isVirtualTile()) {
                        candidateTile = this.getTileOrVirtual(currentTile.x + directionX, currentTile.y - 1, currentTile);

                        if (!candidateTile.isNavigatable() && !candidateTile.isVirtualTile()) {
                            break;
                        }
                    }
                }
            }

            currentTile = candidateTile;
            yield currentTile;
        }
    }

    getPathBetween(from, to) {
        return Array.from(this.yieldPathBetween(from, to));
    }

    getPathTo(tile) {
        return this.getPathBetween(this.#centreTile, tile);
    }

    getPathFrom(tile) {
        return this.getPathBetween(tile, this.#centreTile);
    }

    * yieldPathTo(tile) {
        yield* this.yieldPathBetween(this.#centreTile, tile);
    }

    * yieldPathFrom(id, ignoreNavigatable = false) {
        const fromTile = this.getTile(id);
        yield* this.yieldPathBetween(fromTile, this.#centreTile, ignoreNavigatable);
    }

    getTile(id) {
        if (this.tilesMap.has(id)) {
            return this.tilesMap.get(id);
        }

        return null;
    }

    * tiles() {
        for (const row of this.#grid) {
            for (const tile of row) {
                yield tile;
            }
        }
    }

    * clickableTiles() {
        for (const tile of this.tiles()) {
            if (tile.isClickable()) {
                yield tile;
            }
        }
    }

    * navigatableTiles() {
        for (const tile of this.tiles()) {
            if (tile.isNavigatable()) {
                yield tile;
            }
        }
    }

    getTileOnNav(id) {
        for (const tile of this.tiles()) {
            if (tile.id === id) {
                return tile;
            }
        }

        return null;
    }

    nav(id) {
        if (typeof navAjax === 'function') {
            return navAjax(id);  
        }

        if (typeof nav === 'function') {
            return nav(id);  
        }

        throw new Error('No function for nav or navAjax found!');
    }

    warp(id) {
        if (typeof warpAjax === 'function') {
            return warpAjax(id);  
        }

        if (typeof warp === 'function') {
            return warp(id);  
        }

        throw new Error('No function for warp or warpAjax found!');
    }

    xhole(id) {
        const validXHoles = [
            '44580', // Nex-0002
            '47811', // Nex-Kataam
            '55343', // Nex-0003
            '83339', // Nex-0001
            '97698', // Nex-0004
            '324730', // Nex-0005
            '379305', // Nex-0006
        ];

        if (!validXHoles.includes(id)) {
            throw new Error(`Destination ${id} is not a valid X-hole!`);
        }

        const xHoleBoxElement = document.getElementById('xholebox');
        xHoleBoxElement.elements.warpx.value = id;

        if (typeof warpX === 'function') {
            return warpX();  
        }

        return xHoleBoxElement.submit();
    }
}

;// ./node_modules/pardus-library/src/classes/main/other-ships.js


class OtherShips extends Refreshable {
    constructor() {
        super();
        this.element = document.getElementById('otherships');
        this.content = document.getElementById('otherships_content');
        this.addMutationObserver(this.element);
    }

    mutationCallback(mutationsList, observer) {
        for (const mutationRecord of mutationsList) {
            // We only care about new elements being added, not any _gc_X elements being cleaned up
            if (!('addedNodes' in mutationRecord) || mutationRecord.addedNodes.length === 0) {
                continue;
            }

            // We only care about the otherships_content div being replaced
            for (const addedNode of mutationRecord.addedNodes) {
                if (!('id' in addedNode) || addedNode.id !== 'otherships_content') {
                    continue;
                }

                // console.log(this);
                this.content = addedNode;
                this.refresh();
            }
        }
    }

    isFocusedOnSingleShip() {
        return !!document.getElementById('divDetailsPlayerTop');
    }

    getShips() {
        if (this.isFocusedOnSingleShip()) {
            return null;
        }

        const ships = [];
        const shipsElements = this.content.querySelectorAll('table');

        for (const shipElement of shipsElements) {
            const playerId = shipElement.id.slice(16); // tableScannerShip12345
            const online = !!shipElement.querySelector('img')?.src.endsWith('online.png');
            const [playerNameElement, allianceNameElement] = shipElement.querySelectorAll('a');
            const playerName = playerNameElement.innerText;
            const allianceName = allianceNameElement?.innerText;
            const shipType = this.#extractShipNameFromBackgroundImage(shipElement.querySelector('td').style.backgroundImage);
            const ship = {
                playerId,
                online,
                playerName,
                allianceName,
                shipType,
                shipElement
            };

            ships.push(ship);
        }

        return ships;
    }

    #extractShipNameFromBackgroundImage(backgroundImageStr) {
        // 'url("//static.pardus.at/img/stdhq/ships/harvester_paint04.png")'
        const url = backgroundImageStr.split('"')[1];
        const shipImageWithPaintAndExtension = url.split('/')[url.split('/').length - 1];
        const shipImageWithPaint = shipImageWithPaintAndExtension.slice(0, -4);

        if (shipImageWithPaint.endsWith('_paint01') || shipImageWithPaint.endsWith('_paint02') || shipImageWithPaint.endsWith('_paint03') || shipImageWithPaint.endsWith('_paint04')) {
            return shipImageWithPaint.slice(0, -8);
        }

        if (shipImageWithPaint.endsWith('_xmas')) {
            return shipImageWithPaint.slice(0, -5);
        }

        return shipImageWithPaint;
    }
}

;// ./node_modules/pardus-library/src/classes/pages/main.js




class Main extends AbstractPage {
    #navArea;

    constructor() {
        super('/main.php');

        this.#navArea = new NavArea();
        this.otherShips = new OtherShips();
        // this.otherShips.addAfterRefreshHook(() => {
        //     console.log('Other ships refreshed!');
        // });

        this.#handlePartialRefresh(() => {
            this.#navArea.refresh();
        });
    }

    get nav() {
        return this.#navArea;
    }

    #handlePartialRefresh(func) {
        const mainElement = document.getElementById('tdSpaceChart');
        const navElement = mainElement ? document.getElementById('tdSpaceChart').getElementsByTagName('table')[0].rows[1] : document.querySelectorAll('table td[valign="top"]')[1];

        // This would be more specific, but it doesn't trigger enough refreshes
        //const navElement = document.getElementById('nav').parentNode;

        // Options for the observer (which mutations to observe)
        const config = {
            attributes: false,
            childList: true,
            subtree: true,
        };

        // Callback function to execute when mutations are observed
        const callback = function(mutationsList, observer) {
            func(mutationsList, observer);
        };

        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(callback);

        // Start observing the target node for configured mutations
        observer.observe(navElement, config);
    }
}

;// ./node_modules/pardus-library/src/classes/pages/msgframe.js



class Msgframe extends AbstractPage {
    #centreTd;

    constructor() {
        super('/msgframe.php');
        this.#centreTd = document.querySelector('td[align="center"]');

        if (window.parent) {
            window.parent.window.addEventListener('pardus-message', (event) => {
                this.addMessage(event.detail.msg, event.detail.type);
            });
        }
    }

    hasMessage() {
        if (this.#centreTd.querySelector('table')) {
            return true;
        }

        return false;
    }

    addMessage(msg, type) {
        let icon = 'gnome-info';
        let colour = '#CCCCCC';

        switch (type) {
            case 'error':
                icon = 'gnome-error';
                colour = '#FF3300';
                break;
            default:
                icon = 'gnome-info';
                colour = '#CCCCCC';
        }

        this.#setMessage(msg, icon, colour);
    }

    #setMessage(msg, icon, colour) {
        const str = `<table style="background-image:url(${PardusLibrary.getImagePackUrl()}bgmedium.gif);border-style:ridge;border-color:#2b2b51;border-width:2px;" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td><img src="${PardusLibrary.getImagePackUrl()}${icon}.png" alt="" width="32" height="32"></td><td style="padding-left:2px;padding-right:4px;"><font style="font-weight:bold;font-size:13px;" color="${colour}"> ${msg}</font></td></tr></tbody></table>`;
        this.#centreTd.innerHTML = str;
    }

    addErrorMessage(msg) {
        this.addMessage(msg, 'error');
    }

    static sendMessage(msg, type) {
        const messageDetail = {
            detail: {
                msg,
                type,
            },
        };
        const pardusMessageEvent = new CustomEvent('pardus-message', messageDetail);

        const target = window.parent ? window.parent.window : window;
        target.dispatchEvent(pardusMessageEvent);
    }
}

;// ./node_modules/pardus-library/src/classes/pages/logout.js


class Logout extends AbstractPage {
    constructor() {
        super('/logout.php');
    }
}

;// ./node_modules/pardus-library/src/classes/pardus/commodity.js
class Commodity {
    #name;
    #sellElement = null;
    #buyElement = null;
    sellPrice = 0;
    buyPrice = 0;
    shipStock = 0;
    tradeStock = 0;
    bal = 0;
    min = 0;
    max = 0;

    constructor(name) {
        this.#name = name;
    }

    get name() {
        return this.#name;
    }

    set sellElement(element) {
        this.#sellElement = element;
    }

    get buyElement() {
        return this.#buyElement;
    }

    set buyElement(element) {
        this.#buyElement = element;
    }

    sell(quantity) {
        if (this.#sellElement !== null) {
            this.#sellElement.value = quantity;
            this.#sellElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    buy(quantity) {
        if (this.#buyElement !== null) {
            this.#buyElement.value = quantity;
            this.#buyElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    getSelling() {
        if (this.#sellElement !== null && this.#sellElement !== undefined) {
            const parsed = parseInt(this.#sellElement.value, 10);
            if (!Number.isNaN(parsed)) {
                return parsed;
            }
        }
        return 0;
    }

    getBuying() {
        if (this.#buyElement !== null && this.#buyElement !== undefined) {
            const parsed = parseInt(this.#buyElement.value, 10);
            if (!Number.isNaN(parsed)) {
                return parsed;
            }
        }
        return 0;
    }
}

;// ./node_modules/pardus-library/src/data/commodities.js
const commodities = [
    'Food',
    'Energy',
    'Water',
    'Animal embryos',
    'Ore',
    'Metal',
    'Electronics',
    'Robots',
    'Heavy plastics',
    'Hand weapons',
    'Medicines',
    'Nebula gas',
    'Chemical supplies',
    'Gem stones',
    'Liquor',
    'Hydrogen fuel',
    'Exotic matter',
    'Optical components',
    'Radioactive cells',
    'Droid modules',
    'Bio-waste',
    'Leech baby',
    'Nutrient clods',
    'Cybernetic X-993 Parts',
    'X-993 Repair-Drone',
    'Neural Stimulator',
    'Battleweapon Parts',
    'Slaves',
    'Drugs',
    'Package',
    'Faction package',
    'Explosives',
    'VIP',
    'Christmas Glitter',
    'Military Explosives',
    'Human intestines',
    'Skaari limbs',
    'Keldon brains',
    'Rashkir bones',
    'Exotic Crystal',
    'Blue Sapphire jewels',
    'Ruby jewels',
    'Golden Beryl jewels',
    'Stim Chip',
    'Neural Tissue',
    'Capri Stim',
    'Crimson Stim',
    'Amber Stim'
];

;// ./node_modules/pardus-library/src/classes/pardus/ship-space.js
class ShipSpace {
    #hasMagscoop;
    #startingShipSpace;
    #startingMagscoopSpace;
    #endingShipSpace;
    #endingMagscoopSpace;
    #magscoopSize = 150;

    get hasMagscoop() {
        return this.#hasMagscoop;
    }

    constructor(startingShipSpace, startingMagscoopSpace, hasMagscoop = false, magscoopSize = 150) {
        this.#startingShipSpace = startingShipSpace;
        this.#startingMagscoopSpace = startingMagscoopSpace;
        this.#endingShipSpace = startingShipSpace;
        this.#endingMagscoopSpace = startingMagscoopSpace;
        this.#hasMagscoop = hasMagscoop;
        this.#magscoopSize = magscoopSize;
    }

    calculateAvailableShipSpace(commodities) {
        this.#calculateShipSpace(commodities);
        return this.#endingShipSpace;
    }

    calculateAvailableMagscoopSpace(commodities) {
        this.#calculateShipSpace(commodities);
        return this.#endingMagscoopSpace;
    }

    calculateAvailableTotalSpace(commodities) {
        this.#calculateShipSpace(commodities);
        return this.#endingShipSpace + this.#endingMagscoopSpace;
    }

    getShipSpaceString() {
        if (this.#hasMagscoop) {
            return `${this.#endingShipSpace} + ${this.#endingMagscoopSpace}t`;
        }
        return `${this.#endingShipSpace}t`;
    }

    #calculateShipSpace(commodities) {
        let toSell = 0;
        let toBuy = 0;

        for (const [commodityName, commodity] of commodities) {
            if (commodity.shipStock > 0) {
                toSell += commodity.getSelling();
            }
            if (commodity.tradeStock > commodity.min) {
                toBuy += commodity.getBuying();
            }
        }

        this.#endingShipSpace = this.#startingShipSpace;

        if (this.#hasMagscoop) {
            if (this.#endingShipSpace > 0) {
                this.#endingMagscoopSpace = this.#startingMagscoopSpace;
                this.#endingShipSpace = this.#endingShipSpace + toSell - toBuy;
                if (this.#endingShipSpace < 0) {
                    this.#endingMagscoopSpace += this.#endingShipSpace;
                    this.#endingShipSpace = 0;
                }
            } else {
                this.#endingMagscoopSpace = this.#startingMagscoopSpace + toSell - toBuy;
                if (this.#endingMagscoopSpace > this.#magscoopSize) {
                    this.#endingShipSpace += this.#endingMagscoopSpace - this.#magscoopSize;
                    this.#endingMagscoopSpace = this.#magscoopSize;
                }
            }
        } else {
            this.#endingShipSpace = this.#endingShipSpace + toSell - toBuy;
        }
    }

    allowedSpace(magscoopAllowed) {
        if (this.#hasMagscoop && magscoopAllowed) {
            return Number(this.#endingShipSpace) + Number(this.#endingMagscoopSpace);
        }
        return Number(this.#endingShipSpace);
    }
}

;// ./node_modules/pardus-library/src/classes/pardus/building-space.js
class BuildingSpace {

    #startingBuildingSpace;
    #endingBuildingSpace;

    constructor(startingBuildingSpace) {
        this.#startingBuildingSpace = startingBuildingSpace;
    }

    calculateAvailableBuildingSpace(commodities) {
        this.#calculateBuildingSpace(commodities);
        return this.#endingBuildingSpace;
    }

    getBuildingSpaceString() {
        return `${this.#endingBuildingSpace}t`;
    }

    #calculateBuildingSpace(commodities) {
        let toSell = 0;
        let toBuy = 0;

        for (const [commodityName, commodity] of commodities) {
            if (commodity.shipStock > 0) {
                toSell += commodity.getSelling();
            }
            if (commodity.tradeStock > commodity.min) {
                toBuy += commodity.getBuying();
            }
        }

        this.#endingBuildingSpace = this.#startingBuildingSpace + toSell - toBuy;
    }
}

;// ./node_modules/pardus-library/src/classes/abstract/tradeable-page.js






class TradeablePage extends AbstractPage {
    #buyTable;
    #sellTable;
    #transferButton;
    #isPlayerOwned = false;
    #commodities = new Map();
    #shipSpace = null;
    #buildingSpace = null;
    #shipSpaceElement = null;
    #buildingSpaceElement = null;
    #spaceRecalcPending = false;
    #parseOptions;

    constructor(pageName = '', options = {}) {
        super(pageName);
        this.#parseOptions = options;

        this.#findTables();
        this.#parseTables();
        this.#findTransferButton();
        this.#wireSpaceListeners();
    }

    #parseInt(data) {
        let toReturn = data.replace(/[,\-t]/g, '');

        if (toReturn.search(/\+/g) !== -1) {
            toReturn = 0;
        }

        return parseInt(toReturn, 10);
    }

    #decodeString(data) {
        let toReturn = data.replace(/&nbsp;/g, ' ');
        toReturn = toReturn.replace(/\xA0/g, ' ');

        return toReturn;
    }

    #findTransferButton() {
        const inputs = document.getElementsByTagName('input');

        for (const input of inputs) {
            if (input.value.trim() === '<- Transfer ->') {
                this.#transferButton = input;
            }
        }

        if (!this.#transferButton) {
            this.#transferButton = document.querySelector('input[type="submit"][value*="Transfer"]');
        }
    }

    #findTables() {
        const tablesWithHeaders = document.getElementsByTagName('TH');

        for (const tableToSearch of tablesWithHeaders) {
            if (!this.#sellTable && this.#decodeString(tableToSearch.innerText) === 'Price (sell)') {
                this.#sellTable = tableToSearch.parentNode.parentNode;
            } else if (!this.#buyTable && this.#decodeString(tableToSearch.innerText) === 'Price (buy)') {
                this.#buyTable = tableToSearch.parentNode.parentNode;
            }

            if (tableToSearch.innerText === 'Min') {
                this.#isPlayerOwned = true;
            }
        }
    }

    get commodities() {
        return this.#commodities;
    }

    get shipSpace() {
        return this.#shipSpace;
    }

    get availableShipSpace() {
        return this.#shipSpace.calculateAvailableShipSpace(this.#commodities);
    }

    get availableTotalSpace() {
        return this.#shipSpace.calculateAvailableTotalSpace(this.#commodities);
    }

    get availableMagscoopSpace() {
        return this.#shipSpace.calculateAvailableMagscoopSpace(this.#commodities);
    }

    allowedSpace(magscoopAllowed) {
        if (magscoopAllowed && this.#shipSpace?.hasMagscoop) {
            return this.availableTotalSpace;
        }
        return this.availableShipSpace;
    }

    get availableBuildingSpace() {
        if (this.#buildingSpace === null) {
            return null;
        }
        return this.#buildingSpace.calculateAvailableBuildingSpace(this.#commodities);
    }

    get transferButton() {
        return this.#transferButton;
    }

    get isPlayerOwned() {
        return this.#isPlayerOwned;
    }

    transfer() {
        if (this.#transferButton) {
            this.#transferButton.click();
        }
    }

    recalculateSpace() {
        if (this.#spaceRecalcPending) {
            return;
        }
        this.#spaceRecalcPending = true;
        setTimeout(() => {
            this.#spaceRecalcPending = false;
            this.#doRecalculateSpace();
        }, 0);
    }

    #doRecalculateSpace() {
        const shipSpace = this.availableShipSpace;
        const magscoopSpace = this.#shipSpace?.hasMagscoop
            ? this.availableMagscoopSpace : 0;
        const totalSpace = this.#shipSpace?.hasMagscoop
            ? this.availableTotalSpace : shipSpace;
        const buildingSpace = this.availableBuildingSpace;
        const hasMagscoop = this.#shipSpace?.hasMagscoop ?? false;

        if (this.#shipSpaceElement) {
            this.#shipSpaceElement.textContent = this.#shipSpace.getShipSpaceString();
        }
        if (this.#buildingSpaceElement && this.#buildingSpace) {
            this.#buildingSpaceElement.textContent = this.#buildingSpace.getBuildingSpaceString();
        }

        document.dispatchEvent(new CustomEvent('pardus-trade-space-changed', {
            detail: {
                shipSpace, magscoopSpace, totalSpace, buildingSpace, hasMagscoop,
            },
        }));
    }

    #wireSpaceListeners() {
        const handler = () => this.recalculateSpace();

        if (this.#sellTable) {
            this.#sellTable.addEventListener('keyup', handler, true);
            this.#sellTable.addEventListener('click', handler, true);
            this.#sellTable.addEventListener('input', handler, true);
        }
        if (this.#buyTable) {
            this.#buyTable.addEventListener('keyup', handler, true);
            this.#buyTable.addEventListener('click', handler, true);
            this.#buyTable.addEventListener('input', handler, true);
        }
    }

    #parseBuyCommodity(commodity, row) {
        const overrides = this.#parseOptions.buyOverrides;

        if (overrides) {
            commodity.buyPrice = this.#parseInt(row.cells[overrides.buyPrice].innerText);
            commodity.buyElement = row.cells[overrides.buyElement]?.childNodes[0] ?? null;

            if (overrides.synthetic) {
                commodity.tradeStock = overrides.synthetic.tradeStock;
                commodity.bal = overrides.synthetic.bal;
                commodity.min = overrides.synthetic.min;
                commodity.max = overrides.synthetic.max;
            }

            if (overrides.shortageCheck && commodity.buyElement == null) {
                commodity.tradeStock = 0;
            }
        } else if (this.#isPlayerOwned) {
            commodity.tradeStock = this.#parseInt(row.cells[2].innerText);
            commodity.min = this.#parseInt(row.cells[4].innerText);
            commodity.max = this.#parseInt(row.cells[5].innerText);
            commodity.buyPrice = this.#parseInt(row.cells[6].innerText);
            commodity.buyElement = row.cells[7]?.childNodes[0] ?? null;
        } else {
            commodity.tradeStock = this.#parseInt(row.cells[2].innerText);
            commodity.bal = this.#parseInt(row.cells[3].innerText);
            commodity.min = commodity.bal;
            commodity.max = this.#parseInt(row.cells[4].innerText);
            commodity.buyPrice = this.#parseInt(row.cells[5].innerText);
            commodity.buyElement = row.cells[6]?.childNodes[0] ?? null;
        }
    }

    #parseTable(table, type) {
        for (const row of table.rows) {
            // Skip header row
            if (row.cells[0].tagName === 'TH') {
                continue;
            }

            // Skip break rows
            if (row.cells.length < 2) {
                continue;
            }

            // Free space row
            if (this.#decodeString(row.cells[0].innerText) === 'free space:') {
                switch (type) {
                    case 'sell':
                        this.#shipSpaceElement = row.cells[1];
                        const shipSpaceLocation = row.cells[1];
                        let hasMagscoop = false;
                        let startingShipSpace = 0;
                        let startingMagscoopSpace = 0;
                        let magscoopSize = 150;

                        // Do they have a magscoop?
                        if (shipSpaceLocation.innerText.indexOf('+') !== -1) {

                            const tmpFreeSpace = shipSpaceLocation.innerText.split('+');
                            hasMagscoop = true;

                            startingShipSpace = this.#parseInt(tmpFreeSpace[0]);
                            startingMagscoopSpace = this.#parseInt(tmpFreeSpace[1]);

                            if (startingMagscoopSpace > 150) {
                                magscoopSize = 250;
                            } else if (startingShipSpace > 0) {
                                magscoopSize = 150;
                            }

                        } else {
                            startingShipSpace = this.#parseInt(shipSpaceLocation.innerText);
                        }

                        if (!this.#shipSpace) {
                            this.#shipSpace = new ShipSpace(startingShipSpace, startingMagscoopSpace, hasMagscoop, magscoopSize);
                        }
                        break;
                    case 'buy':
                        this.#buildingSpaceElement = row.cells[1];
                        const buildingSpaceLocation = row.cells[1];
                        const startingBuildingSpace = this.#parseInt(buildingSpaceLocation.innerText);

                        if (!this.#buildingSpace) {
                            this.#buildingSpace = new BuildingSpace(startingBuildingSpace);
                        }

                        break;
                }

            }

            const commodityName = row.cells[1].innerText;

            // Skip non-commodity row
            if (!commodities.includes(commodityName)) {
                continue;
            }

            let commodity = this.#commodities.get(commodityName);

            if (!commodity) {
                commodity = new Commodity(commodityName);
            }

            switch (type) {
                case 'sell':
                    commodity.shipStock = this.#parseInt(row.cells[2].innerText);
                    commodity.sellPrice = this.#parseInt(row.cells[3].innerText);
                    commodity.sellElement = row.cells[4]?.childNodes[0] ?? null;
                    break;
                case 'buy':
                    this.#parseBuyCommodity(commodity, row);
                    break;
            }

            this.#commodities.set(commodityName, commodity);
        }
    }

    #parseTables() {
        if (this.#sellTable) {
            this.#parseTable(this.#sellTable, 'sell');
        }
        if (this.#buyTable) {
            this.#parseTable(this.#buyTable, 'buy');
        }

        if (this.#parseOptions.syntheticBuildingSpace !== undefined && this.#buildingSpace === null) {
            this.#buildingSpace = new BuildingSpace(this.#parseOptions.syntheticBuildingSpace);
        }
    }
}

;// ./node_modules/pardus-library/src/classes/pages/planet-trade.js


class PlanetTrade extends TradeablePage {
    #planetType;

    constructor() {
        super('/planet_trade.php');
        this.#identifyPlanet();
    }

    get type() {
        return this.#planetType;
    }

    #identifyPlanet() {
        const planetImage = document.getElementsByTagName('img')[3].src.split('/');
        const imageString = planetImage[planetImage.length - 1];

        switch (imageString) {
            case 'planet_i.png':
                this.#planetType = 'i';
                break;
            case 'planet_r.png':
                this.#planetType = 'r';
                break;
            case 'planet_m.png':
                this.#planetType = 'm';
                break;
            case 'planet_a.png':
                this.#planetType = 'a';
                break;
            case 'planet_d.png':
                this.#planetType = 'd';
                break;
            case 'planet_g.png':
                this.#planetType = 'g';
                break;
            default:
                this.#planetType = 'm';
        }
    }
}

;// ./node_modules/pardus-library/src/classes/pages/starbase-trade.js


class StarbaseTrade extends TradeablePage {
    constructor() {
        super('/starbase_trade.php');
    }
}

;// ./node_modules/pardus-library/src/classes/pages/blackmarket.js


class Blackmarket extends TradeablePage {
    constructor() {
        super('/blackmarket.php', {
            buyOverrides: {
                buyPrice: 3,
                buyElement: 4,
                synthetic: {
                    tradeStock: 999,
                    bal: 0,
                    min: 0,
                    max: 1999,
                },
                shortageCheck: true,
            },
            syntheticBuildingSpace: 999,
        });
    }
}

;// ./node_modules/pardus-library/src/classes/pages/drop-cargo.js



class DropCargo extends AbstractPage {
    #dropTable;
    #commodities = new Map();

    constructor() {
        super('/drop_cargo.php');
        this.#findTable();
        this.#parseTable();
    }

    get commodities() {
        return this.#commodities;
    }

    #parseInt(data) {
        let toReturn = data.replace(/[,\-t]/g, '');

        if (toReturn.search(/\+/g) !== -1) {
            toReturn = 0;
        }

        return parseInt(toReturn, 10);
    }

    #findTable() {
        const headers = document.getElementsByTagName('TH');

        for (const header of headers) {
            if (header.innerText === 'Resource') {
                this.#dropTable = header.parentNode.parentNode;
                break;
            }
        }
    }

    #parseTable() {
        if (!this.#dropTable) {
            return;
        }

        for (const row of this.#dropTable.rows) {
            if (row.cells[0].tagName === 'TH') {
                continue;
            }

            if (row.cells.length < 2) {
                continue;
            }

            const commodityName = row.cells[1].innerText;

            if (!commodities.includes(commodityName)) {
                continue;
            }

            this.#commodities.set(commodityName, {
                name: commodityName,
                shipStock: this.#parseInt(row.cells[2].innerText),
                dropElement: row.cells[3]?.childNodes[0] ?? null,
                drop(quantity) {
                    if (this.dropElement !== null) {
                        this.dropElement.value = quantity;
                    }
                },
            });
        }
    }
}

;// ./node_modules/pardus-library/src/classes/pages/ship-transfer.js


class ShipTransfer extends AbstractPage {
    #form;
    #resourcesTable;
    #resources = new Map();

    constructor() {
        super('/ship2ship_transfer.php');
        this.#form = document.getElementById('ship2ship_transfer');
        this.#resourcesTable = document.querySelector('form table.messagestyle');
        this.#parseResources();
    }

    get form() {
        return this.#form;
    }

    get resourcesTable() {
        return this.#resourcesTable;
    }

    get resources() {
        return this.#resources;
    }

    get playerId() {
        return document.querySelector('input[name="playerid"]').value;
    }

    get freeSpace() {
        const freeSpaceElements = document.getElementsByTagName('b');
        return freeSpaceElements.length === 1 ? parseInt(freeSpaceElements[0].textContent, 10) : 0;
    }

    submit() {
        if (this.#form) {
            this.#form.submit();
        }
    }

    getRedirectUrl() {
        const currentUrl = new URL(window.location);
        return `${currentUrl.protocol}//${currentUrl.hostname}${currentUrl.pathname}?playerid=${this.playerId}`;
    }

    #parseResources() {
        if (!this.#resourcesTable) {
            return;
        }

        for (const row of this.#resourcesTable.rows) {
            if (row.cells.length < 4) {
                continue;
            }

            const resourceName = row.cells[1].textContent;
            const amount = parseInt(row.cells[2].textContent, 10);
            const inputElement = row.cells[3].childNodes[0] ?? null;

            if (Number.isNaN(amount)) {
                continue;
            }

            this.#resources.set(resourceName, {
                name: resourceName,
                amount,
                inputElement,
                row,
                transfer(quantity) {
                    if (this.inputElement !== null) {
                        this.inputElement.value = quantity;
                    }
                },
            });
        }
    }
}

;// ./node_modules/pardus-library/src/classes/pages/index.js









;// ./node_modules/pardus-library/src/classes/pardus-library.js


class PardusLibrary {
    #currentPage;

    constructor() {
        switch (document.location.pathname) {
            case '/main.php':
                this.#currentPage = new Main();
                break;
            case '/logout.php':
                this.#currentPage = new Logout();
                break;
            case '/planet_trade.php':
                this.#currentPage = new PlanetTrade();
                break;
            case '/starbase_trade.php':
                this.#currentPage = new StarbaseTrade();
                break;
            case '/blackmarket.php':
                this.#currentPage = new Blackmarket();
                break;
            case '/drop_cargo.php':
                this.#currentPage = new DropCargo();
                break;
            case '/ship2ship_transfer.php':
                this.#currentPage = new ShipTransfer();
                break;
            default:
                this.#currentPage = 'No page implemented!';
        }
    }

    get page() {
        return document.location.pathname;
    }

    get currentPage() {
        return this.#currentPage;
    }

    get main() {
        if (this.page === '/main.php') {
            return this.#currentPage;
        }

        return null;
    }

    static getImagePackUrl() {
        const defaultImagePackUrl = '//static.pardus.at/img/std/';
        const imagePackUrl = String(document.querySelector('body').style.backgroundImage).replace(/url\("*|"*\)|[a-z0-9]+\.gif/g, '');

        return imagePackUrl !== '' ? imagePackUrl : defaultImagePackUrl;
    }

    /**
     *  Returns the active universe
     *  @returns {string} One of 'orion', 'artemis', or 'pegasus'
     *  @throws Will throw an error if no universe could be determined.
     */
    static getUniverse() {
        switch (document.location.hostname) {
            case 'orion.pardus.at':
                return 'orion';
            case 'artemis.pardus.at':
                return 'artemis';
            case 'pegasus.pardus.at':
                return 'pegasus';
            default:
                throw new Error('Unable to determine universe');
        }
    }
}

;// ./node_modules/pardus-library/src/index.js





;// ./src/variables.js
// Variable keys used with PardusOptionsUtility.getVariableValue/setVariableValue
const VAR = {
    PREVIEW: 'preview',
    AUTO_UNLOAD: 'auto_unload',
    FUEL_SPACE_LEFT: 'fuel_space_left',
    FUEL_TO_PURCHASE: 'fuel_to_purchase',
    MAGSCOOP_ALLOWED: 'magscoop_allowed',
    DROID_WASH_MODE: 'droid_washing_mode_enabled',
    DROID_WASH_LEVEL: 'droid_washing_level',
    DROID_WASH_PLANET_M: 'droid_washing_planet_m_enabled',
    DROID_WASH_PLANET_I: 'droid_washing_planet_i_enabled',
    DROID_WASH_PLANET_D: 'droid_washing_planet_d_enabled',
    DROID_WASH_PLANET_G: 'droid_washing_planet_g_enabled',
    DROID_WASH_PLANET_R: 'droid_washing_planet_r_enabled',
    DROID_WASH_PLANET_A: 'droid_washing_planet_a_enabled',
    DROID_WASH_STARBASE: 'droid_washing_starbase_enabled',

    // Planet buttons
    PLANET_A_STARBASE_RUN: 'planet_a_starbase_run_enabled',
    PLANET_A_STOCK_RUN: 'planet_a_stock_run_enabled',
    PLANET_A_LOAD_FOOD: 'planet_a_load_food_enabled',
    PLANET_A_LOAD_WATER: 'planet_a_load_water_enabled',
    PLANET_M_STARBASE_RUN: 'planet_m_starbase_run_enabled',
    PLANET_M_STOCK_RUN: 'planet_m_stock_run_enabled',
    PLANET_M_LOAD_FOOD: 'planet_m_load_food_enabled',
    PLANET_M_LOAD_WATER: 'planet_m_load_water_enabled',
    PLANET_I_PLANET_RUN: 'planet_i_planet_run_enabled',
    PLANET_I_LOAD_WATER: 'planet_i_load_water_enabled',
    PLANET_R_COMBO_RUN: 'planet_r_combo_run_enabled',
    PLANET_R_LOAD_EMBRYOS: 'planet_r_load_embryos_enabled',
    PLANET_R_LOAD_METAL: 'planet_r_load_metal_enabled',
    PLANET_R_LOAD_ORE: 'planet_r_load_ore_enabled',
    PLANET_R_LOAD_RADS: 'planet_r_load_rads_enabled',
    PLANET_G_LOAD_EMBRYOS: 'planet_g_load_embryos_enabled',
    PLANET_G_LOAD_NEBULA: 'planet_g_load_nebula_enabled',
    PLANET_G_LOAD_CHEMS: 'planet_g_load_chems_enabled',
    PLANET_D_LOAD_SLAVES: 'planet_d_load_slaves_enabled',

    // Starbase buttons
    PO_STARBASE_PLANET_RUN: 'po_starbase_planet_run_enabled',
    PO_STARBASE_LOAD_ROBOTS: 'po_starbase_load_robots_enabled',
    PO_STARBASE_LOAD_MO: 'po_starbase_load_mo_enabled',
    PO_STARBASE_LOAD_METAL: 'po_starbase_load_metal_enabled',
    PO_STARBASE_LOAD_ORE: 'po_starbase_load_ore_enabled',
    NPC_STARBASE_PLANET_RUN: 'npc_starbase_planet_run_enabled',

    // Blackmarket buttons
    BM_LOAD_MOE: 'blackmarket_load_moe_enabled',
    BM_LOAD_ENERGY: 'blackmarket_load_energy_enabled',
    BM_LOAD_METAL: 'blackmarket_load_metal_enabled',
    BM_LOAD_ORE: 'blackmarket_load_ore_enabled',
    BM_SELL_DRUGS: 'blackmarket_sell_drugs_enabled',
    BM_DRUGS_TO_SELL: 'blackmarket_drugs_to_sell',
    BM_LOAD_GEM_MERCHANT: 'blackmarket_load_gem_merchant_enabled',

    // Ship transfer
    SHIP2SHIP_REFRESH: 'ship2ship_enable_refresh_button',
    SHIP2SHIP_OP_MODE: 'ship2ship_transfer_op_mode',
    FUEL_TO_PRELOAD: 'fuel_to_preload',
    BOTS_TO_PRELOAD: 'bots_to_preload',
    DRUGS_TO_PRELOAD: 'drugs_to_preload',
    AMBER_STIMS_TO_PRELOAD: 'amber_stims_to_preload',

    // Cargo dropping
    CARGO_DROP_ENABLED: 'cargo_drop_enabled',
    DROP_EXCESS_FUEL: 'drop_excess_fuel',
};

const DEFAULTS = {
    [VAR.PREVIEW]: true,
    [VAR.AUTO_UNLOAD]: true,
    [VAR.FUEL_SPACE_LEFT]: 5,
    [VAR.FUEL_TO_PURCHASE]: 5,
    [VAR.MAGSCOOP_ALLOWED]: false,
    [VAR.DROID_WASH_MODE]: false,
    [VAR.DROID_WASH_LEVEL]: 20,
    [VAR.DROID_WASH_PLANET_M]: false,
    [VAR.DROID_WASH_PLANET_I]: true,
    [VAR.DROID_WASH_PLANET_D]: true,
    [VAR.DROID_WASH_PLANET_G]: true,
    [VAR.DROID_WASH_PLANET_R]: true,
    [VAR.DROID_WASH_PLANET_A]: false,
    [VAR.DROID_WASH_STARBASE]: false,

    [VAR.PLANET_A_STARBASE_RUN]: true,
    [VAR.PLANET_A_STOCK_RUN]: true,
    [VAR.PLANET_A_LOAD_FOOD]: true,
    [VAR.PLANET_A_LOAD_WATER]: true,
    [VAR.PLANET_M_STARBASE_RUN]: true,
    [VAR.PLANET_M_STOCK_RUN]: true,
    [VAR.PLANET_M_LOAD_FOOD]: true,
    [VAR.PLANET_M_LOAD_WATER]: true,
    [VAR.PLANET_I_PLANET_RUN]: true,
    [VAR.PLANET_I_LOAD_WATER]: true,
    [VAR.PLANET_R_COMBO_RUN]: true,
    [VAR.PLANET_R_LOAD_EMBRYOS]: true,
    [VAR.PLANET_R_LOAD_METAL]: true,
    [VAR.PLANET_R_LOAD_ORE]: true,
    [VAR.PLANET_R_LOAD_RADS]: true,
    [VAR.PLANET_G_LOAD_EMBRYOS]: true,
    [VAR.PLANET_G_LOAD_NEBULA]: true,
    [VAR.PLANET_G_LOAD_CHEMS]: true,
    [VAR.PLANET_D_LOAD_SLAVES]: true,

    [VAR.PO_STARBASE_PLANET_RUN]: true,
    [VAR.PO_STARBASE_LOAD_ROBOTS]: true,
    [VAR.PO_STARBASE_LOAD_MO]: true,
    [VAR.PO_STARBASE_LOAD_METAL]: true,
    [VAR.PO_STARBASE_LOAD_ORE]: true,
    [VAR.NPC_STARBASE_PLANET_RUN]: true,

    [VAR.BM_LOAD_MOE]: true,
    [VAR.BM_LOAD_ENERGY]: true,
    [VAR.BM_LOAD_METAL]: true,
    [VAR.BM_LOAD_ORE]: true,
    [VAR.BM_SELL_DRUGS]: true,
    [VAR.BM_DRUGS_TO_SELL]: 2,
    [VAR.BM_LOAD_GEM_MERCHANT]: true,

    [VAR.SHIP2SHIP_REFRESH]: true,
    [VAR.SHIP2SHIP_OP_MODE]: true,
    [VAR.FUEL_TO_PRELOAD]: 3,
    [VAR.BOTS_TO_PRELOAD]: 20,
    [VAR.DRUGS_TO_PRELOAD]: 6,
    [VAR.AMBER_STIMS_TO_PRELOAD]: 1,

    [VAR.CARGO_DROP_ENABLED]: true,
    [VAR.DROP_EXCESS_FUEL]: true,
};

function getVar(key) {
    return PardusOptionsUtility.getVariableValue(key, DEFAULTS[key]);
}

function setVar(key, value) {
    PardusOptionsUtility.setVariableValue(key, value);
}

;// ./src/trade-helper.js


let ensureFuelSpace = 0;

function attemptSell(page, commodityName, quantity) {
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

function attemptBuy(page, commodityName, quantity) {
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

function ensureFuel(page) {
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

function hasTradeQueued(page) {
    for (const [, commodity] of page.commodities) {
        if (commodity.getSelling() !== 0 || commodity.getBuying() !== 0) {
            return true;
        }
    }
    return false;
}

function submitIfNotPreview(page) {
    if (!getVar(VAR.PREVIEW) && hasTradeQueued(page)) {
        page.transfer();
    }
}

function unload(page, excludes = []) {
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

function trade_helper_reset(page) {
    for (const [, commodity] of page.commodities) {
        if (commodity.shipStock > 0 && commodity.getSelling() !== 0) {
            commodity.sell('');
        }
        if (commodity.tradeStock > commodity.min && commodity.getBuying() !== 0) {
            commodity.buy('');
        }
    }
}

function loadMultiBuy(page, saveString, itemsToBuy = [], ratios = []) {
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

function getEnsureFuelSpace() {
    return ensureFuelSpace;
}

function resetEnsureFuelSpace() {
    ensureFuelSpace = 0;
}

;// ./src/buttons.js



class Buttons {
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
            trade_helper_reset(page);
        });
        document.addPardusKeyDownListener('unload_keypress', { code: 85 }, () => {
            unload(page);
            submitIfNotPreview(page);
        });
        document.addPardusKeyDownListener('reset_keypress', { code: 82 }, () => {
            trade_helper_reset(page);
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

;// ./src/droid-wash.js



function findItemsToDroidwash(page) {
    const droidWashLevel = getVar(VAR.DROID_WASH_LEVEL);
    const items = [];

    for (const [name, commodity] of page.commodities) {
        if (commodity.max <= droidWashLevel && commodity.max > 0) {
            items.push(name);
        }
    }

    return items;
}

function ableToDroidWashItem(page, itemName) {
    const commodity = page.commodities.get(itemName);
    if (!commodity) {
        return false; 
    }
    return commodity.shipStock + commodity.tradeStock > commodity.bal + 1;
}

function isReadyToDroidWash(page, itemsToDroidwash) {
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

function droidWash(page, itemsToDroidwash) {
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

function endDroidWash(page, itemsToDroidwash) {
    trade_helper_reset(page);
    ensureFuel(page);

    for (const itemName of itemsToDroidwash) {
        if (ableToDroidWashItem(page, itemName)) {
            attemptBuy(page, itemName, 999);
        }
    }

    submitIfNotPreview(page);
}

;// ./src/pages/planet.js





class Planet {
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

;// ./src/pages/starbase.js





class Starbase {
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

;// ./src/pages/blackmarket.js




class blackmarket_Blackmarket {
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

;// ./src/pages/drop-cargo.js


class drop_cargo_DropCargo {
    constructor(page) {
        if (!getVar(VAR.CARGO_DROP_ENABLED)) {
            return; 
        }

        const fuelSpaceLeft = getVar(VAR.FUEL_SPACE_LEFT);

        if (getVar(VAR.DROP_EXCESS_FUEL)) {
            const fuel = page.commodities.get('Hydrogen fuel');
            if (fuel && fuel.shipStock > fuelSpaceLeft) {
                fuel.drop(fuel.shipStock - fuelSpaceLeft);
            }
        }
    }
}

;// ./src/pages/ship-transfer.js


class ship_transfer_ShipTransfer {
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

;// ./src/pages/options.js


class Options {
    constructor() {
        const troderOptionsTab = PardusOptions.addTab({
            heading: 'Troder Options',
            id: 'troder-options',
            refresh: false,
            defaultLabel: 'General',
        });

        troderOptionsTab.addBoxTop({
            heading: 'Introduction',
            description: 'Welcome to the Pardus Troder script\'s options. The settings are specific to the universe you are in.<br><br>You can request additional features by sending a message to Tro (Artemis) or Troll (Orion).',
        });

        const planetsSubtab = troderOptionsTab.addSubTab({ label: 'Planets' });
        const sbSubtab = troderOptionsTab.addSubTab({ label: 'Starbases' });
        const bmSubtab = troderOptionsTab.addSubTab({ label: 'Black Market' });
        const droidwashingSubtab = troderOptionsTab.addSubTab({ label: 'Droid Washing', padding: '10px' });
        const shipTransferSubtab = troderOptionsTab.addSubTab({ label: 'Ship Transfer' });
        const cargoDropSubtab = troderOptionsTab.addSubTab({ label: 'Cargo Dropping' });

        Options.#droidWashingOptions(droidwashingSubtab);
        Options.#fuelOptions(troderOptionsTab);
        Options.#planetAOptions(planetsSubtab);
        Options.#planetMOptions(planetsSubtab);
        Options.#planetIOptions(planetsSubtab);
        Options.#planetROptions(planetsSubtab);
        Options.#planetGOptions(planetsSubtab);
        Options.#planetDOptions(planetsSubtab);
        Options.#planetKeyboardOptions(planetsSubtab);
        Options.#starbaseOptions(sbSubtab);
        Options.#blackmarketOptions(bmSubtab);
        Options.#shipTransferOptions(shipTransferSubtab);
        Options.#cargoDroppingOptions(cargoDropSubtab);

        const keyboardOptions = troderOptionsTab.addBox({
            heading: 'Key Commands',
            description: 'These options control the key bindings for general trading.',
        });

        keyboardOptions.addKeyDownOption({
            variable: 'transfer_keypress',
            description: 'Transfer',
            defaultValue: { code: 13, key: 'Enter', description: 'Enter' },
        });

        keyboardOptions.addKeyDownOption({
            variable: 'exit_to_nav_keypress',
            description: 'Exit to nav',
            defaultValue: { code: 27, key: 'Escape', description: 'Escape' },
        });

        keyboardOptions.addKeyDownOption({
            variable: 'unload_keypress',
            description: 'Unload',
            defaultValue: { code: 85, key: 'U', description: 'U' },
        });

        keyboardOptions.addKeyDownOption({
            variable: 'reset_keypress',
            description: 'Reset',
            defaultValue: { code: 82, key: 'R', description: 'R' },
        });

        troderOptionsTab.refreshElement();
    }

    static #cargoDroppingOptions(subtab) {
        const mainBox = subtab.addBox({
            heading: 'Cargo Dropping',
            description: 'These options control cargo dropping.',
        });

        mainBox.addBooleanOption({
            variable: VAR.CARGO_DROP_ENABLED,
            description: 'Enable cargo dropping',
            defaultValue: true,
        });

        const itemsBox = subtab.addBox({
            heading: 'Items',
            description: 'These options configure the individual resources to drop.',
        });

        itemsBox.addBooleanOption({
            variable: VAR.DROP_EXCESS_FUEL,
            description: 'Drop excess fuel',
            defaultValue: true,
            info: {
                title: 'Excess Fuel',
                description: 'Excess fuel is any fuel above the configured amount of fuel to leave on the ship. This value can be configured in the \'General\' tab of the Pardus Troder options, and defaults to 5t.',
            },
        });
    }

    static #shipTransferOptions(subtab) {
        const mainBox = subtab.addBox({
            heading: 'Ship Transfer',
            description: 'These options control the buttons displayed on the ship-to-ship transfer screen.',
            imageLeft: 'https://static.pardus.at/img/std/ships/leviathan.png',
        });

        mainBox.addBooleanOption({
            variable: VAR.SHIP2SHIP_REFRESH,
            description: 'Enable \'Refresh\' button',
            defaultValue: true,
        });

        const opModeBox = subtab.addBox({
            heading: 'OP Mode',
            description: 'OP mode enables quick transfer of specific items to other players, designed to make the role of a support trader during operations much easier.',
            imageLeft: 'https://static.pardus.at/img/std/factions/relation_war_b.png',
        });

        opModeBox.addBooleanOption({
            variable: VAR.SHIP2SHIP_OP_MODE,
            description: 'Enable \'OP\' mode',
            defaultValue: true,
            info: {
                title: 'OP Mode',
                description: 'OP mode enables the use of quick transfer buttons with predefined amounts for specific resources.',
            },
        });

        opModeBox.addNumericOption({
            variable: VAR.FUEL_TO_PRELOAD, description: 'Fuel to preload', defaultValue: 3, min: 0, max: 500,
        });
        opModeBox.addNumericOption({
            variable: VAR.BOTS_TO_PRELOAD, description: 'Bots to preload', defaultValue: 20, min: 0, max: 500,
        });
        opModeBox.addNumericOption({
            variable: VAR.DRUGS_TO_PRELOAD, description: 'Drugs to preload', defaultValue: 6, min: 0, max: 500,
        });
        opModeBox.addNumericOption({
            variable: VAR.AMBER_STIMS_TO_PRELOAD, description: 'Amber Stims to preload', defaultValue: 1, min: 0, max: 500,
        });
    }

    static #planetAOptions(subtab) {
        const box = subtab.addPremiumBoxLeft({
            heading: 'Planets: Class A',
            description: 'These options control the buttons displayed on the trade screen for Class A planets (which are only available in the Pardus Cluster).',
            imageLeft: 'https://static.pardus.at/img/std/foregrounds/planet_a.png',
        });

        box.addBooleanOption({ variable: VAR.PLANET_A_STARBASE_RUN, description: 'Enable \'Starbase Run\' button', defaultValue: true });
        box.addBooleanOption({ variable: VAR.PLANET_A_STOCK_RUN, description: 'Enable \'Stock Run\' button', defaultValue: true });
        box.addBooleanOption({ variable: VAR.PLANET_A_LOAD_FOOD, description: 'Enable \'Load Food\' button', defaultValue: true });
        box.addBooleanOption({ variable: VAR.PLANET_A_LOAD_WATER, description: 'Enable \'Load Water\' button', defaultValue: true });
    }

    static #planetMOptions(subtab) {
        const box = subtab.addBoxRight({
            heading: 'Planets: Class M',
            description: 'These options control the buttons displayed on the trade screen for Class M planets.',
            imageLeft: 'https://static.pardus.at/img/std/foregrounds/planet_m.png',
        });

        box.addBooleanOption({ variable: VAR.PLANET_M_STARBASE_RUN, description: 'Enable \'Starbase Run\' button', defaultValue: true });
        box.addBooleanOption({ variable: VAR.PLANET_M_STOCK_RUN, description: 'Enable \'Stock Run\' button', defaultValue: true });
        box.addBooleanOption({ variable: VAR.PLANET_M_LOAD_FOOD, description: 'Enable \'Load Food\' button', defaultValue: true });
        box.addBooleanOption({ variable: VAR.PLANET_M_LOAD_WATER, description: 'Enable \'Load Water\' button', defaultValue: true });
    }

    static #planetIOptions(subtab) {
        const box = subtab.addBoxLeft({
            heading: 'Planets: Class I',
            description: 'These options control the buttons displayed on the trade screen for Class i planets.',
            imageLeft: 'https://static.pardus.at/img/std/foregrounds/planet_i.png',
        });

        box.addBooleanOption({ variable: VAR.PLANET_I_PLANET_RUN, description: 'Enable \'Planet Run\' button', defaultValue: true });
        box.addBooleanOption({ variable: VAR.PLANET_I_LOAD_WATER, description: 'Enable \'Load Water\' button', defaultValue: true });
    }

    static #planetROptions(subtab) {
        const box = subtab.addBoxLeft({
            heading: 'Planets: Class R',
            description: 'These options control the buttons displayed on the trade screen for Class R planets.',
            imageLeft: 'https://static.pardus.at/img/std/foregrounds/planet_r.png',
        });

        box.addBooleanOption({ variable: VAR.PLANET_R_COMBO_RUN, description: 'Enable \'Combo Run\' button', defaultValue: true });
        box.addBooleanOption({ variable: VAR.PLANET_R_LOAD_EMBRYOS, description: 'Enable \'Load Embryos\' button', defaultValue: true });
        box.addBooleanOption({ variable: VAR.PLANET_R_LOAD_METAL, description: 'Enable \'Load Metal\' button', defaultValue: true });
        box.addBooleanOption({ variable: VAR.PLANET_R_LOAD_ORE, description: 'Enable \'Load Ore\' button', defaultValue: true });
        box.addBooleanOption({ variable: VAR.PLANET_R_LOAD_RADS, description: 'Enable \'Load Rads\' button', defaultValue: true });
    }

    static #planetGOptions(subtab) {
        const box = subtab.addBoxRight({
            heading: 'Planets: Class G',
            description: 'These options control the buttons displayed on the trade screen for Class G planets.',
            imageLeft: 'https://static.pardus.at/img/std/foregrounds/planet_g.png',
        });

        box.addBooleanOption({ variable: VAR.PLANET_G_LOAD_EMBRYOS, description: 'Enable \'Load Embryos\' button', defaultValue: true });
        box.addBooleanOption({ variable: VAR.PLANET_G_LOAD_NEBULA, description: 'Enable \'Load Nebula\' button', defaultValue: true });
        box.addBooleanOption({ variable: VAR.PLANET_G_LOAD_CHEMS, description: 'Enable \'Load Chems\' button', defaultValue: true });
    }

    static #planetDOptions(subtab) {
        const box = subtab.addBoxRight({
            heading: 'Planets: Class D',
            description: 'These options control the buttons displayed on the trade screen for Class D planets.',
            imageLeft: 'https://static.pardus.at/img/std/foregrounds/planet_d.png',
        });

        box.addBooleanOption({ variable: VAR.PLANET_D_LOAD_SLAVES, description: 'Enable \'Load Slaves\' button', defaultValue: true });
    }

    static #planetKeyboardOptions(subtab) {
        const box = subtab.addBox({
            heading: 'Key Commands',
            description: 'These options control the key bindings for trading planets.',
        });

        box.addKeyDownOption({ variable: 'planet_starbase_run_keypress', description: 'Starbase run', defaultValue: { code: 83, key: 'KeyS', description: 's' } });
        box.addKeyDownOption({ variable: 'planet_food_run_keypress', description: 'Food run', defaultValue: { code: 70, key: 'KeyF', description: 'f' } });
        box.addKeyDownOption({ variable: 'planet_water_run_keypress', description: 'Water run', defaultValue: { code: 87, key: 'KeyW', description: 'w' } });
    }

    static #starbaseOptions(subtab) {
        const poBox = subtab.addBoxRight({
            heading: 'Player-Owned Starbases',
            description: 'These options control the buttons displayed on the trade screen for player-owned Starbases.',
            imageLeft: 'https://static.pardus.at/img/std/foregrounds/starbase_p0_s4.png',
        });

        poBox.addBooleanOption({ variable: VAR.PO_STARBASE_PLANET_RUN, description: 'Enable \'Planet Run\' button', defaultValue: true });
        poBox.addBooleanOption({ variable: VAR.PO_STARBASE_LOAD_ROBOTS, description: 'Enable \'Load Robots\' button', defaultValue: true });
        poBox.addBooleanOption({ variable: VAR.PO_STARBASE_LOAD_MO, description: 'Enable \'Load MO\' button', defaultValue: true });
        poBox.addBooleanOption({ variable: VAR.PO_STARBASE_LOAD_METAL, description: 'Enable \'Load Metal\' button', defaultValue: true });
        poBox.addBooleanOption({ variable: VAR.PO_STARBASE_LOAD_ORE, description: 'Enable \'Load Ore\' button', defaultValue: true });

        const npcBox = subtab.addBoxLeft({
            heading: 'NPC Starbases',
            description: 'These options control the buttons displayed on the trade screen for NPC Starbases.',
            imageLeft: 'https://static.pardus.at/img/std/foregrounds/starbase_f0_s4.png',
        });

        npcBox.addBooleanOption({ variable: VAR.NPC_STARBASE_PLANET_RUN, description: 'Enable \'Planet Run\' button', defaultValue: true });

        const kbBox = subtab.addBox({
            heading: 'Key Commands',
            description: 'These options control the key bindings for trading starbases.',
        });

        kbBox.addKeyDownOption({ variable: 'starbase_planet_run_keypress', description: 'Planet run', defaultValue: { code: 83, key: 'KeyS', description: 's' } });
    }

    static #blackmarketOptions(subtab) {
        const box = subtab.addBox({
            heading: 'Black Market',
            description: 'These options control the buttons displayed on the trade screen for the Black Market.',
            imageLeft: 'https://static.pardus.at/img/std/foregrounds/dark_dome.png',
        });

        box.addBooleanOption({ variable: VAR.BM_LOAD_MOE, description: 'Enable \'Load MOE\' button', defaultValue: true });
        box.addBooleanOption({ variable: VAR.BM_LOAD_ENERGY, description: 'Enable \'Load Energy\' button', defaultValue: true });
        box.addBooleanOption({ variable: VAR.BM_LOAD_METAL, description: 'Enable \'Load Metal\' button', defaultValue: true });
        box.addBooleanOption({ variable: VAR.BM_LOAD_ORE, description: 'Enable \'Load Ore\' button', defaultValue: true });
        box.addBooleanOption({ variable: VAR.BM_SELL_DRUGS, description: 'Enable \'Sell Drugs\' button', defaultValue: true });
        box.addNumericOption({
            variable: VAR.BM_DRUGS_TO_SELL, description: 'Quantity of drugs to sell', defaultValue: 2, min: 1, max: 100,
        });
        box.addBooleanOption({ variable: VAR.BM_LOAD_GEM_MERCHANT, description: 'Enable \'Gem Merchant\' button', defaultValue: true });
    }

    static #droidWashingOptions(subtab) {
        subtab.addBox({
            heading: 'Instructions',
            description: 'The droid washing mode provides special buttons on configured planets and starbases, designed to make droid washing as simple and efficient as possible.<br><br><ul><li>On the trade screen, items listed in <font color="#FFAA00">orange</font> are able to be droid washed efficiently on the planet/SB, however none are currently available in either your ship\'s hold or the planet/SB stock to do so.</li><li>On the trade screen, items listed in <font color="#009900">green</font> are both able to be droid washed efficiently and are currently available to do so.</li><li>Ensure that you have at least one item available to be droid washed (i.e. the item is listed in <font color="#009900">green</font> on the trade screen). The more items you have, the faster (and more AP-efficient) the droid wash will be.</li></ul>',
        });

        subtab.addBoxLeft({
            heading: 'Quick Start Guide',
            description: 'The quick start guide assumes default settings.<ul type="1"><li>Identify a nearby planet or NPC SB with under 5,000 population.</li><li>Obtain 20t of droids, battleweapons, handweapons, all varieties of stim chips, and robots. It is not necessary to get all of these items, but the more the better.</li><li>On the trade screen, select \'Start Droid Wash\'. You should see a variety of items set to be sold and possibly bought.</li><li>Click the \'Transfer\' button. The droid wash is now set up, and you should continue clicking the \'Transfer\' button until you wish to stop.</li><li>Click the \'Stop Droid Wash\' button to end droid washing, which will attempt to rebuy as many goods as possible.</li></ul>',
        });

        subtab.addBoxLeft({
            heading: 'FAQ',
            description: '<i>Why should I use more expensive items to droid wash?</i><br><br>You gain ATPs at a fixed ratio, proportional to the base price of an item. By using more expensive items for droid washing, you still lose the same amount of credits to gain the same number of ATPs, however the number of trades required is less. Using more expensive items is a more efficient usage of APs.<br><br><i>Why should I use a planet or NPC SB with a population below 5,000?</i><br><br>The amount of credits you lose per ATP is dependent on the maximum quantity a planet or NPC SB will buy for the particular items you are droid washing. The lower the maximum quantity, the cheaper the ATP will cost. The smallest the maximum quantity for most items can be is 20, which is only available when a planet or NPC SB is below a population of 5,000. If the population reaches 5,000 the maximum quantity of most items is increased to 40, which will increase the cost of a single ATP from 456k to 720k (with no trade uplink).<br><br><i>What is the exact formula for the cost of one ATP?</i><br><br>The cost of one ATP is determined using the maximum quantity of an item you can sell to a planet or NPC SB.<br><br>The formula is:<pre>4000000 * ((10^(-1 / item_max) * 1.25) - 1)</pre>',
        });

        const masterBox = subtab.addBoxRight({
            heading: 'Droid Washing Mode',
            description: 'If you are not actively using the droid washing mode it is recommended you disable it.',
        });

        masterBox.addBooleanOption({ variable: VAR.DROID_WASH_MODE, description: 'Enable droid washing mode', defaultValue: false });

        const optionsBox = subtab.addBox({
            heading: 'Droid Washing',
            description: 'These options let you balance the cost-efficiency of droid washing with speed and availability of suitable locations. It is recommended to use the most cost-efficient option as increased speed and availability is rarely worth the price difference.',
        });

        const droidWashInnerHtml = '<tr><td><div><table><tbody><tr><td><label for="droidwash-level">Mode</label></td><td><input type="range" id="droidwash-level" name="droidwash-level" min="20" max="80" step="20" value="20" style="background:url(//static.pardus.at/img/std/bgd.gif)"></td></tr></tbody></table></div></td></tr><tr><td><div id="droidwash-level-info"><table><tbody><tr><td>Credits / ATP:</td><td><div id="credits-per-atp" style="color:#009900">465254</div></td><td><img src="//static.pardus.at/img/std/credits.png" title="Credits" alt="Credits"></td></tr><tr><td>Credits / ATP *:</td><td><div id="credits-per-atp-neutral-div-6" style="color:#009900"></div></td><td><img src="//static.pardus.at/img/std/credits.png" title="Credits" alt="Credits"></td></tr><tr><td>Speed:</td><td><div id="speed-for-atp" style="color:#FFAA00">Moderate</div></td></tr></tbody></table></div></td></tr><tr><td><div>* Neutral div-6 trade uplink</div></td></tr><tr><td><table><tbody><tr><td>Planets:</td><td><table><tbody><tr><td><input id="troder-droid-washing-m-planet-enabled" type="checkbox"><label>M Class</label></td><td><input id="troder-droid-washing-i-planet-enabled" type="checkbox"><label>I Class</label></td><td><input id="troder-droid-washing-d-planet-enabled" type="checkbox"><label>D Class</label></td></tr><tr><td><input id="troder-droid-washing-g-planet-enabled" type="checkbox"><label>G Class</label></td><td><input id="troder-droid-washing-r-planet-enabled" type="checkbox"><label>R Class</label></td><td><input id="troder-droid-washing-a-planet-enabled" type="checkbox"><label>A Class</label></td></tr></tbody></table></td></tr><tr><td>Starbases:</td><td><table><tbody><tr><td><input id="troder-droid-washing-starbase-enabled" type="checkbox"><label>NPC Starbase</label></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td align="right"><input value="Save" id="troder-droid-washing-save" type="button"></td></tr>';
        optionsBox.innerHtml = droidWashInnerHtml;
        optionsBox.addAfterRefreshHook(Options.#droidWashAfterRefresh);
    }

    static #droidWashAfterRefresh() {
        document.getElementById('droidwash-level').value = getVar(VAR.DROID_WASH_LEVEL);
        document.getElementById('droidwash-level').addEventListener('input', Options.#setCreditsPerATP, true);
        Options.#setCreditsPerATP();

        document.getElementById('troder-droid-washing-m-planet-enabled').checked = getVar(VAR.DROID_WASH_PLANET_M);
        document.getElementById('troder-droid-washing-i-planet-enabled').checked = getVar(VAR.DROID_WASH_PLANET_I);
        document.getElementById('troder-droid-washing-d-planet-enabled').checked = getVar(VAR.DROID_WASH_PLANET_D);
        document.getElementById('troder-droid-washing-g-planet-enabled').checked = getVar(VAR.DROID_WASH_PLANET_G);
        document.getElementById('troder-droid-washing-r-planet-enabled').checked = getVar(VAR.DROID_WASH_PLANET_R);
        document.getElementById('troder-droid-washing-a-planet-enabled').checked = getVar(VAR.DROID_WASH_PLANET_A);
        document.getElementById('troder-droid-washing-starbase-enabled').checked = getVar(VAR.DROID_WASH_STARBASE);

        document.getElementById('troder-droid-washing-save').addEventListener('click', Options.#saveDroidWashingOptions, false);
    }

    static #setCreditsPerATP() {
        const sliderValue = document.getElementById('droidwash-level').valueAsNumber;
        const creditsPerAtp = 4000000 * ((10 ** (-1 / sliderValue) * 1.25) - 1);
        const creditsPerAtpNeutralDiv6 = creditsPerAtp / (1 + (6 * 0.08));

        const creditsPerAtpElem = document.getElementById('credits-per-atp');
        const creditsPerAtpNeutralDiv6Elem = document.getElementById('credits-per-atp-neutral-div-6');
        const speedPerAtpElem = document.getElementById('speed-for-atp');

        creditsPerAtpElem.innerHTML = creditsPerAtp.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        creditsPerAtpNeutralDiv6Elem.innerHTML = creditsPerAtpNeutralDiv6.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

        switch (sliderValue) {
            case 20:
                creditsPerAtpElem.setAttribute('style', 'color:#009900');
                creditsPerAtpNeutralDiv6Elem.setAttribute('style', 'color:#009900');
                speedPerAtpElem.setAttribute('style', 'color:#FFAA00');
                speedPerAtpElem.innerHTML = 'Moderate';
                break;
            case 40:
                creditsPerAtpElem.setAttribute('style', 'color:#FFFF00');
                creditsPerAtpNeutralDiv6Elem.setAttribute('style', 'color:#FFFF00');
                speedPerAtpElem.setAttribute('style', 'color:#FFFF00');
                speedPerAtpElem.innerHTML = 'Fast';
                break;
            case 60:
                creditsPerAtpElem.setAttribute('style', 'color:#FFAA00');
                creditsPerAtpNeutralDiv6Elem.setAttribute('style', 'color:#FFAA00');
                speedPerAtpElem.setAttribute('style', 'color:#99FF00');
                speedPerAtpElem.innerHTML = 'Faster';
                break;
            case 80:
                creditsPerAtpElem.setAttribute('style', 'color:#CC0000');
                creditsPerAtpNeutralDiv6Elem.setAttribute('style', 'color:#CC0000');
                speedPerAtpElem.setAttribute('style', 'color:#009900');
                speedPerAtpElem.innerHTML = 'Fastest';
                break;
            default:
                break;
        }
    }

    static #saveDroidWashingOptions() {
        setVar(VAR.DROID_WASH_PLANET_M, document.getElementById('troder-droid-washing-m-planet-enabled').checked);
        setVar(VAR.DROID_WASH_PLANET_I, document.getElementById('troder-droid-washing-i-planet-enabled').checked);
        setVar(VAR.DROID_WASH_PLANET_D, document.getElementById('troder-droid-washing-d-planet-enabled').checked);
        setVar(VAR.DROID_WASH_PLANET_G, document.getElementById('troder-droid-washing-g-planet-enabled').checked);
        setVar(VAR.DROID_WASH_PLANET_R, document.getElementById('troder-droid-washing-r-planet-enabled').checked);
        setVar(VAR.DROID_WASH_PLANET_A, document.getElementById('troder-droid-washing-a-planet-enabled').checked);
        setVar(VAR.DROID_WASH_STARBASE, document.getElementById('troder-droid-washing-starbase-enabled').checked);
        setVar(VAR.DROID_WASH_LEVEL, document.getElementById('droidwash-level').valueAsNumber);

        const saveButton = document.getElementById('troder-droid-washing-save');
        saveButton.setAttribute('disabled', 'true');
        saveButton.value = 'Saved';
        saveButton.setAttribute('style', 'color:green;background-color:silver');
        setTimeout(() => {
            saveButton.removeAttribute('disabled');
            saveButton.value = 'Save';
            saveButton.removeAttribute('style');
        }, 2000);
    }

    static #fuelOptions(subtab) {
        const box = subtab.addBox({
            heading: 'Refueling',
            description: 'These options control the amount of space to leave for fuel, and whether or not you wish to purchase additional fuel automatically.',
        });

        const permittedFuelAmounts = [];
        for (let i = 0; i <= 20; i++) {
            permittedFuelAmounts.push({ value: String(i), text: i === 0 ? 'None' : String(i) });
        }

        const fuelAmountSelect = box.addSelectOption({
            variable: VAR.FUEL_SPACE_LEFT,
            description: 'Amount of space left for fuel',
            options: permittedFuelAmounts,
            defaultValue: '5',
        });

        let fuelToPurchaseOptions = permittedFuelAmounts.slice(0, parseInt(fuelAmountSelect.getValue(), 10) + 1);

        const fuelAutoPurchaseSelect = box.addSelectOption({
            variable: VAR.FUEL_TO_PURCHASE,
            description: 'Amount of fuel to automatically purchase',
            options: fuelToPurchaseOptions,
            defaultValue: '5',
        });

        fuelAmountSelect.addEventListener('change', () => {
            const allOptions = fuelAmountSelect.options;
            const currentSpaceForFuel = parseInt(fuelAmountSelect.getCurrentValue(), 10);

            fuelToPurchaseOptions = allOptions.slice(0, currentSpaceForFuel + 1);

            for (const obj of fuelToPurchaseOptions) {
                delete obj.default;
            }

            fuelToPurchaseOptions[Math.min(fuelAutoPurchaseSelect.getValue() + 1, fuelToPurchaseOptions.length - 1)].default = true;

            fuelAutoPurchaseSelect.options = fuelToPurchaseOptions;
            fuelAutoPurchaseSelect.refreshElement();
        });
    }
}

;// ./src/index.js








class PardusTroder {
    constructor() {
        const pardus = new PardusLibrary();

        switch (document.location.pathname) {
            case '/planet_trade.php':
                new Planet(pardus.currentPage);
                break;
            case '/starbase_trade.php':
                new Starbase(pardus.currentPage);
                break;
            case '/blackmarket.php':
                new blackmarket_Blackmarket(pardus.currentPage);
                break;
            case '/drop_cargo.php':
                new drop_cargo_DropCargo(pardus.currentPage);
                break;
            case '/ship2ship_transfer.php':
                new ship_transfer_ShipTransfer(pardus.currentPage);
                break;
            case '/options.php':
                new Options();
                break;
            default:
                break;
        }
    }
}

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});