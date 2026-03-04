import { PardusOptions } from 'pardus-options-library';
import { VAR, getVar, setVar } from '../variables.js';

export default class Options {
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
