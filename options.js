/* global PardusOptions, PardusOptionsUtility, universe */
/**
 *  Places the configuration options for this script on the Options page in Pardus.
 *
 *  Allows the user to configure the amount of fuel they wish to guarantee and/or purchase,
 *  as well as enabling/disabling droid wash mode
 */
function troderOptions() {
    var troder_options_tab = PardusOptions.addTab({
        heading: 'Troder Options',
        id: 'troder-options',
        refresh: false,
        defaultLabel: 'General',
    });

    var main_options_box = troder_options_tab.addBoxTop({
        heading: 'Introduction',
        description: 'Welcome to the Pardus Troder script\'s options. The settings are specific to the universe you are in.<br><br>You can request additional features by sending a message to Tro (Artemis) or Troll (Orion).',
    });

    var planets_subtab = troder_options_tab.addSubTab({
        label: 'Planets',
    });

    var sb_subtab = troder_options_tab.addSubTab({
        label: 'Starbases',
    });

    var bm_subtab = troder_options_tab.addSubTab({
        label: 'Black Market',
    });

    var droidwashing_subtab = troder_options_tab.addSubTab({
        label: 'Droid Washing',
        padding: '10px',
    });

    var ship_transfer_subtab = troder_options_tab.addSubTab({
        label: 'Ship Transfer',
    });

    var cargo_drop_subtab = troder_options_tab.addSubTab({
        label: 'Cargo Dropping',
    });

    droidWashingOptions(droidwashing_subtab);
    fuelOptions(troder_options_tab);
    planetAOptions(planets_subtab);
    planetMOptions(planets_subtab);
    planetIOptions(planets_subtab);
    planetROptions(planets_subtab);
    planetGOptions(planets_subtab);
    planetDOptions(planets_subtab);
    planetKeyboardOptions(planets_subtab);
    starbaseOptions(sb_subtab);
    blackmarketOptions(bm_subtab);
    shipTransferOptions(ship_transfer_subtab);
    cargoDroppingOptions(cargo_drop_subtab);

    const keyboard_options = troder_options_tab.addBox({
        heading: 'Key Commands',
        description: 'These options control the key bindings for general trading.',
    });

    keyboard_options.addKeyDownOption({
        variable: 'transfer_keypress',
        description: 'Transfer',
        defaultValue: {
            code: 13,
            key: "Enter",
            description: "Enter"
        },
    });

    keyboard_options.addKeyDownOption({
        variable: 'exit_to_nav_keypress',
        description: 'Exit to nav',
        defaultValue: {
            code: 27,
            key: "Escape",
            description: "Escape"
        },
    });

    troder_options_tab.refreshElement();

    function cargoDroppingOptions(subtab) {
        const cargo_dropping_main_box = subtab.addBox({
            heading: 'Cargo Dropping',
            description: 'These options control cargo dropping.'
        });

        cargo_dropping_main_box.addBooleanOption({
            variable: 'cargo_drop_enabled',
            description: 'Enable cargo dropping',
            defaultValue: true,
        });

        const cargo_dropping_items_box = subtab.addBox({
            heading: 'Items',
            description: 'These options configure the individual resources to drop.'
        });

        cargo_dropping_items_box.addBooleanOption({
            variable: 'drop_excess_fuel',
            description: 'Drop excess fuel',
            defaultValue: true,
            info: {
                title: 'Excess Fuel',
                description: 'Excess fuel is any fuel above the configured amount of fuel to leave on the ship. This value can be configured in the \'General\' tab of the Pardus Troder options, and defaults to 5t.'
            },
        });
    }

    function shipTransferOptions(subtab) {
        const ship_transfer_options_box = subtab.addBox({
            heading: 'Ship Transfer',
            description: 'These options control the buttons displayed on the ship-to-ship transfer screen.',
            imageLeft: 'https://static.pardus.at/img/std/ships/leviathan.png',
        });

        ship_transfer_options_box.addBooleanOption({
            variable: 'ship2ship_enable_refresh_button',
            description: 'Enable \'Refresh\' button',
            defaultValue: true,
        });

        const op_mode_box = subtab.addBox({
            heading: 'OP Mode',
            description: 'OP mode enables quick transfer of specific items to other players, designed to make the role of a support trader during operations much easier.',
            imageLeft: 'https://static.pardus.at/img/std/factions/relation_war_b.png',
        });


        op_mode_box.addBooleanOption({
            variable: 'ship2ship_transfer_op_mode',
            description: 'Enable \'OP\' mode',
            defaultValue: true,
            info: {
                title: 'OP Mode',
                description: 'OP mode enables the use of quick transfer buttons with predefined amounts for specific resources.'
            },
        });

        op_mode_box.addNumericOption({
            variable: 'fuel_to_preload',
            description: 'Fuel to preload',
            defaultValue: 3,
            min: 0,
            max: 500,
        });

        op_mode_box.addNumericOption({
            variable: 'bots_to_preload',
            description: 'Bots to preload',
            defaultValue: 20,
            min: 0,
            max: 500,
        });

        op_mode_box.addNumericOption({
            variable: 'drugs_to_preload',
            description: 'Drugs to preload',
            defaultValue: 6,
            min: 0,
            max: 500,
        });

        op_mode_box.addNumericOption({
            variable: 'amber_stims_to_preload',
            description: 'Amber Stims to preload',
            defaultValue: 1,
            min: 0,
            max: 500,
        });
    }

    function planetAOptions(subtab) {
        var planet_a_options_box = subtab.addPremiumBoxLeft({
            heading: 'Planets: Class A',
            description: 'These options control the buttons displayed on the trade screen for Class A planets (which are only available in the Pardus Cluster).',
            imageLeft: 'https://static.pardus.at/img/std/foregrounds/planet_a.png',
        });

        planet_a_options_box.addBooleanOption({
            variable: 'planet_a_starbase_run_enabled',
            description: 'Enable \'Starbase Run\' button',
            defaultValue: true,
        });

        planet_a_options_box.addBooleanOption({
            variable: 'planet_a_stock_run_enabled',
            description: 'Enable \'Stock Run\' button',
            defaultValue: true,
        });

        planet_a_options_box.addBooleanOption({
            variable: 'planet_a_load_food_enabled',
            description: 'Enable \'Load Food\' button',
            defaultValue: true,
        });

        planet_a_options_box.addBooleanOption({
            variable: 'planet_a_load_water_enabled',
            description: 'Enable \'Load Water\' button',
            defaultValue: true,
        });
    }

    function planetMOptions(subtab) {
        var planet_m_options_box = subtab.addBoxRight({
            heading: 'Planets: Class M',
            description: 'These options control the buttons displayed on the trade screen for Class M planets.',
            imageLeft: 'https://static.pardus.at/img/std/foregrounds/planet_m.png',
        });

        planet_m_options_box.addBooleanOption({
            variable: 'planet_m_starbase_run_enabled',
            description: 'Enable \'Starbase Run\' button',
            defaultValue: true,
        });

        planet_m_options_box.addBooleanOption({
            variable: 'planet_m_stock_run_enabled',
            description: 'Enable \'Stock Run\' button',
            defaultValue: true,
        });

        planet_m_options_box.addBooleanOption({
            variable: 'planet_m_load_food_enabled',
            description: 'Enable \'Load Food\' button',
            defaultValue: true,
        });

        planet_m_options_box.addBooleanOption({
            variable: 'planet_m_load_water_enabled',
            description: 'Enable \'Load Water\' button',
            defaultValue: true,
        });
    }

    function planetIOptions(subtab) {
        var planet_i_options_box = subtab.addBoxLeft({
            heading: 'Planets: Class I',
            description: 'These options control the buttons displayed on the trade screen for Class i planets.',
            imageLeft: 'https://static.pardus.at/img/std/foregrounds/planet_i.png',
        });

        planet_i_options_box.addBooleanOption({
            variable: 'planet_i_planet_run_enabled',
            description: 'Enable \'Planet Run\' button',
            defaultValue: true,
        });

        planet_i_options_box.addBooleanOption({
            variable: 'planet_i_load_water_enabled',
            description: 'Enable \'Load Water\' button',
            defaultValue: true,
        });
    }

    function planetROptions(subtab) {
        var planet_r_options_box = subtab.addBoxLeft({
            heading: 'Planets: Class R',
            description: 'These options control the buttons displayed on the trade screen for Class R planets.',
            imageLeft: 'https://static.pardus.at/img/std/foregrounds/planet_r.png',
        });

        planet_r_options_box.addBooleanOption({
            variable: 'planet_r_combo_run_enabled',
            description: 'Enable \'Combo Run\' button',
            defaultValue: true,
        });

        planet_r_options_box.addBooleanOption({
            variable: 'planet_r_load_embryos_enabled',
            description: 'Enable \'Load Embryos\' button',
            defaultValue: true,
        });

        planet_r_options_box.addBooleanOption({
            variable: 'planet_r_load_metal_enabled',
            description: 'Enable \'Load Metal\' button',
            defaultValue: true,
        });

        planet_r_options_box.addBooleanOption({
            variable: 'planet_r_load_ore_enabled',
            description: 'Enable \'Load Ore\' button',
            defaultValue: true,
        });

        planet_r_options_box.addBooleanOption({
            variable: 'planet_r_load_rads_enabled',
            description: 'Enable \'Load Rads\' button',
            defaultValue: true,
        });
    }

    function planetGOptions(subtab) {
        var planet_g_options_box = subtab.addBoxRight({
            heading: 'Planets: Class G',
            description: 'These options control the buttons displayed on the trade screen for Class G planets.',
            imageLeft: 'https://static.pardus.at/img/std/foregrounds/planet_g.png',
        });

        planet_g_options_box.addBooleanOption({
            variable: 'planet_g_load_embryos_enabled',
            description: 'Enable \'Load Embryos\' button',
            defaultValue: true,
        });

        planet_g_options_box.addBooleanOption({
            variable: 'planet_g_load_nebula_enabled',
            description: 'Enable \'Load Nebula\' button',
            defaultValue: true,
        });

        planet_g_options_box.addBooleanOption({
            variable: 'planet_g_load_chems_enabled',
            description: 'Enable \'Load Chems\' button',
            defaultValue: true,
        });
    }

    function planetDOptions(subtab) {
        var planet_d_options_box = subtab.addBoxRight({
            heading: 'Planets: Class D',
            description: 'These options control the buttons displayed on the trade screen for Class D planets.',
            imageLeft: 'https://static.pardus.at/img/std/foregrounds/planet_d.png',
        });

        planet_d_options_box.addBooleanOption({
            variable: 'planet_d_load_slaves_enabled',
            description: 'Enable \'Load Slaves\' button',
            defaultValue: true,
        });
    }

    function planetKeyboardOptions(subtab) {
        const keyboard_options = subtab.addBox({
            heading: 'Key Commands',
            description: 'These options control the key bindings for trading planets.',
        });

        keyboard_options.addKeyDownOption({
            variable: 'planet_starbase_run_keypress',
            description: 'Starbase run',
            defaultValue: {
                code: 83,
                key: "KeyS",
                description: "s"
            },
        });
    }

    function starbaseOptions(subtab) {
        var po_starbase_options_box = subtab.addBoxRight({
            heading: 'Player-Owned Starbases',
            description: 'These options control the buttons displayed on the trade screen for player-owned Starbases.',
            imageLeft: 'https://static.pardus.at/img/std/foregrounds/starbase_p0_s4.png',
        });

        po_starbase_options_box.addBooleanOption({
            variable: 'po_starbase_planet_run_enabled',
            description: 'Enable \'Planet Run\' button',
            defaultValue: true,
        });

        po_starbase_options_box.addBooleanOption({
            variable: 'po_starbase_load_robots_enabled',
            description: 'Enable \'Load Robots\' button',
            defaultValue: true,
        });

        po_starbase_options_box.addBooleanOption({
            variable: 'po_starbase_load_mo_enabled',
            description: 'Enable \'Load MO\' button',
            defaultValue: true,
        });

        po_starbase_options_box.addBooleanOption({
            variable: 'po_starbase_load_metal_enabled',
            description: 'Enable \'Load Metal\' button',
            defaultValue: true,
        });

        po_starbase_options_box.addBooleanOption({
            variable: 'po_starbase_load_ore_enabled',
            description: 'Enable \'Load Ore\' button',
            defaultValue: true,
        });

        var npc_starbase_options_box = subtab.addBoxLeft({
            heading: 'NPC Starbases',
            description: 'These options control the buttons displayed on the trade screen for NPC Starbases.',
            imageLeft: 'https://static.pardus.at/img/std/foregrounds/starbase_f0_s4.png',
        });

        npc_starbase_options_box.addBooleanOption({
            variable: 'npc_starbase_planet_run_enabled',
            description: 'Enable \'Planet Run\' button',
            defaultValue: true,
        });

        const keyboard_options = subtab.addBox({
            heading: 'Key Commands',
            description: 'These options control the key bindings for trading starbases.',
        });

        keyboard_options.addKeyDownOption({
            variable: 'starbase_planet_run_keypress',
            description: 'Planet run',
            defaultValue: {
                code: 83,
                key: "KeyS",
                description: "s"
            },
        });
    }

    function blackmarketOptions(subtab) {
        var blackmarket_options_box = subtab.addBox({
            heading: 'Black Market',
            description: 'These options control the buttons displayed on the trade screen for the Black Market.',
            imageLeft: 'https://static.pardus.at/img/std/foregrounds/dark_dome.png',
        });

        blackmarket_options_box.addBooleanOption({
            variable: 'blackmarket_load_moe_enabled',
            description: 'Enable \'Load MOE\' button',
            defaultValue: true,
        });

        blackmarket_options_box.addBooleanOption({
            variable: 'blackmarket_load_energy_enabled',
            description: 'Enable \'Load Energy\' button',
            defaultValue: true,
        });

        blackmarket_options_box.addBooleanOption({
            variable: 'blackmarket_load_metal_enabled',
            description: 'Enable \'Load Metal\' button',
            defaultValue: true,
        });

        blackmarket_options_box.addBooleanOption({
            variable: 'blackmarket_load_ore_enabled',
            description: 'Enable \'Load Ore\' button',
            defaultValue: true,
        });

        blackmarket_options_box.addBooleanOption({
            variable: 'blackmarket_sell_drugs_enabled',
            description: 'Enable \'Sell Drugs\' button',
            defaultValue: true,
        });

        blackmarket_options_box.addNumericOption({
            variable: 'blackmarket_drugs_to_sell',
            description: 'Quantity of drugs to sell',
            defaultValue: 2,
            min: 1,
            max: 100,
        });
    }

    function droidWashingOptions(subtab) {
        var droid_washing_instructions_box = subtab.addBox({
            heading: 'Instructions',
            description: 'The droid washing mode provides special buttons on configured planets and starbases, designed to make droid washing as simple and efficient as possible.<br><br><ul><li>On the trade screen, items listed in <font color="#FFAA00">orange</font> are able to be droid washed efficiently on the planet/SB, however none are currently available in either your ship\'s hold or the planet/SB stock to do so.</li><li>On the trade screen, items listed in <font color="#009900">green</font> are both able to be droid washed efficiently and are currently available to do so.</li><li>Ensure that you have at least one item available to be droid washed (i.e. the item is listed in <font color="#009900">green</font> on the trade screen). The more items you have, the faster (and more AP-efficient) the droid wash will be.</li></ul>',
        });

        var droid_washing_quickstart_box = subtab.addBoxLeft({
            heading: 'Quick Start Guide',
            description: 'The quick start guide assumes default settings.<ul type="1"><li>Identify a nearby planet or NPC SB with under 5,000 population.</li><li>Obtain 20t of droids, battleweapons, handweapons, all varieties of stim chips, and robots. It is not necessary to get all of these items, but the more the better.</li><li>On the trade screen, select \'Start Droid Wash\'. You should see a variety of items set to be sold and possibly bought.</li><li>Click the \'Transfer\' button. The droid wash is now set up, and you should continue clicking the \'Transfer\' button until you wish to stop.</li><li>Click the \'Stop Droid Wash\' button to end droid washing, which will attempt to rebuy as many goods as possible.</li></ul>',
        });

        var droid_washing_faq_box = subtab.addBoxLeft({
            heading: 'FAQ',
            description: '<i>Why should I use more expensive items to droid wash?</i><br><br>You gain ATPs at a fixed ratio, proportional to the base price of an item. By using more expensive items for droid washing, you still lose the same amount of credits to gain the same number of ATPs, however the number of trades required is less. Using more expensive items is a more efficient usage of APs.<br><br><i>Why should I use a planet or NPC SB with a population below 5,000?</i><br><br>The amount of credits you lose per ATP is dependent on the maximum quantity a planet or NPC SB will buy for the particular items you are droid washing. The lower the maximum quantity, the cheaper the ATP will cost. The smallest the maximum quantity for most items can be is 20, which is only available when a planet or NPC SB is below a population of 5,000. If the population reaches 5,000 the maximum quantity of most items is increased to 40, which will increase the cost of a single ATP from 456k to 720k (with no trade uplink).<br><br><i>What is the exact formula for the cost of one ATP?</i><br><br>The cost of one ATP is determined using the maximum quantity of an item you can sell to a planet or NPC SB.<br><br>The formula is:<pre>4000000 * ((10^(-1 / item_max) * 1.25) - 1)</pre>',
        });

        var droid_washing_master_box = subtab.addBoxRight({
            heading: 'Droid Washing Mode',
            description: 'If you are not actively using the droid washing mode it is recommended you disable it.',
        });

        droid_washing_master_box.addBooleanOption({
            variable: 'droid_washing_mode_enabled',
            description: 'Enable droid washing mode',
            defaultValue: false,
        });

        var droid_washing_options_box = subtab.addBox({
            heading: 'Droid Washing',
            description: 'These options let you balance the cost-efficiency of droid washing with speed and availability of suitable locations. It is recommended to use the most cost-efficient option as increased speed and availability is rarely worth the price difference.',
        });

        var droid_washing_inner_html = '<tr><td><div><table><tbody><tr><td><label for="droidwash-level">Mode</label></td><td><input type="range" id="droidwash-level" name="droidwash-level" min="20" max="80" step="20" value="20" style="background:url(//static.pardus.at/img/std/bgd.gif)"></td></tr></tbody></table></div></td></tr><tr><td><div id="droidwash-level-info"><table><tbody><tr><td>Credits / ATP:</td><td><div id="credits-per-atp" style="color:#009900">465254</div></td><td><img src="//static.pardus.at/img/std/credits.png" title="Credits" alt="Credits"></td></tr><tr><td>Credits / ATP *:</td><td><div id="credits-per-atp-neutral-div-6" style="color:#009900"></div></td><td><img src="//static.pardus.at/img/std/credits.png" title="Credits" alt="Credits"></td></tr><tr><td>Speed:</td><td><div id="speed-for-atp" style="color:#FFAA00">Moderate</div></td></tr></tbody></table></div></td></tr><tr><td><div>* Neutral div-6 trade uplink</div></td></tr><tr><td><table><tbody><tr><td>Planets:</td><td><table><tbody><tr><td><input id="troder-droid-washing-m-planet-enabled" type="checkbox"><label>M Class</label></td><td><input id="troder-droid-washing-i-planet-enabled" type="checkbox"><label>I Class</label></td><td><input id="troder-droid-washing-d-planet-enabled" type="checkbox"><label>D Class</label></td></tr><tr><td><input id="troder-droid-washing-g-planet-enabled" type="checkbox"><label>G Class</label></td><td><input id="troder-droid-washing-r-planet-enabled" type="checkbox"><label>R Class</label></td><td><input id="troder-droid-washing-a-planet-enabled" type="checkbox"><label>A Class</label></td></tr></tbody></table></td></tr><tr><td>Starbases:</td><td><table><tbody><tr><td><input id="troder-droid-washing-starbase-enabled" type="checkbox"><label>NPC Starbase</label></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td align="right"><input value="Save" id="troder-droid-washing-save" type="button"></td></tr>';
        droid_washing_options_box.innerHtml = droid_washing_inner_html;
        droid_washing_options_box.addAfterRefreshHook(droidWashAfterRefresh);

        function droidWashAfterRefresh() {
            document.getElementById('droidwash-level').value = droid_wash_level;
            document.getElementById('droidwash-level').addEventListener("input", setCreditsPerATP, true);
            setCreditsPerATP();

            document.getElementById('troder-droid-washing-m-planet-enabled').checked = droid_wash_planet_m_enabled;
            document.getElementById('troder-droid-washing-i-planet-enabled').checked = droid_wash_planet_i_enabled;
            document.getElementById('troder-droid-washing-d-planet-enabled').checked = droid_wash_planet_d_enabled;
            document.getElementById('troder-droid-washing-g-planet-enabled').checked = droid_wash_planet_g_enabled;
            document.getElementById('troder-droid-washing-r-planet-enabled').checked = droid_wash_planet_r_enabled;
            document.getElementById('troder-droid-washing-a-planet-enabled').checked = droid_wash_planet_a_enabled;
            document.getElementById('troder-droid-washing-starbase-enabled').checked = GM_getValue(universe + '_droid_washing_starbase_enabled', false);

            var droid_washing_save_button = document.getElementById('troder-droid-washing-save');
            if (droid_washing_save_button.addEventListener) {
                droid_washing_save_button.addEventListener("click", saveDroidWashingOptions, false);
            } else if (droid_washing_save_button.attachEvent) {
                droid_washing_save_button.attachEvent('onclick', saveDroidWashingOptions);
            }

            function setCreditsPerATP() {
                var slider_value = document.getElementById('droidwash-level').valueAsNumber;
                var credits_per_atp = 4000000 * ((Math.pow(10, -1 / slider_value) * 1.25) - 1);
                var credits_per_atp_neutral_div_6 = credits_per_atp / (1 + (6 * 0.08));

                var credits_per_atp_elem = document.getElementById('credits-per-atp');
                var credits_per_atp_neutral_div_6_elem = document.getElementById('credits-per-atp-neutral-div-6');
                var speed_per_atp_elem = document.getElementById('speed-for-atp');

                credits_per_atp_elem.innerHTML = credits_per_atp.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
                credits_per_atp_neutral_div_6_elem.innerHTML = credits_per_atp_neutral_div_6.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

                switch (slider_value) {
                    case 20:
                        credits_per_atp_elem.setAttribute('style','color:#009900');
                        credits_per_atp_neutral_div_6_elem.setAttribute('style','color:#009900');
                        speed_per_atp_elem.setAttribute('style','color:#FFAA00');
                        speed_per_atp_elem.innerHTML = 'Moderate';
                        break;
                    case 40:
                        credits_per_atp_elem.setAttribute('style','color:#FFFF00');
                        credits_per_atp_neutral_div_6_elem.setAttribute('style','color:#FFFF00');
                        speed_per_atp_elem.setAttribute('style','color:#FFFF00');
                        speed_per_atp_elem.innerHTML = 'Fast';
                        break;
                    case 60:
                        credits_per_atp_elem.setAttribute('style','color:#FFAA00');
                        credits_per_atp_neutral_div_6_elem.setAttribute('style','color:#FFAA00');
                        speed_per_atp_elem.setAttribute('style','color:#99FF00');
                        speed_per_atp_elem.innerHTML = 'Faster';
                        break;
                    case 80:
                        credits_per_atp_elem.setAttribute('style','color:#CC0000');
                        credits_per_atp_neutral_div_6_elem.setAttribute('style','color:#CC0000');
                        speed_per_atp_elem.setAttribute('style','color:#009900');
                        speed_per_atp_elem.innerHTML = 'Fastest';
                        break;
                }
            }

            function saveDroidWashingOptions() {
                var planet_m = document.getElementById('troder-droid-washing-m-planet-enabled').checked;
                var planet_i = document.getElementById('troder-droid-washing-i-planet-enabled').checked;
                var planet_d = document.getElementById('troder-droid-washing-d-planet-enabled').checked;
                var planet_g = document.getElementById('troder-droid-washing-g-planet-enabled').checked;
                var planet_r = document.getElementById('troder-droid-washing-r-planet-enabled').checked;
                var planet_a = document.getElementById('troder-droid-washing-a-planet-enabled').checked;
                var starbase = document.getElementById('troder-droid-washing-starbase-enabled').checked;
                var level_slider = document.getElementById('droidwash-level').valueAsNumber;

                GM_setValue(universe + '_droid_washing_planet_m_enabled', planet_m);
                GM_setValue(universe + '_droid_washing_planet_i_enabled', planet_i);
                GM_setValue(universe + '_droid_washing_planet_d_enabled', planet_d);
                GM_setValue(universe + '_droid_washing_planet_g_enabled', planet_g);
                GM_setValue(universe + '_droid_washing_planet_r_enabled', planet_r);
                GM_setValue(universe + '_droid_washing_planet_a_enabled', planet_a);
                GM_setValue(universe + '_droid_washing_starbase_enabled', starbase);
                GM_setValue(universe + '_droid_washing_level', level_slider);

                displaySaved('troder-droid-washing-save');
            }
        }
    }

    function fuelOptions(subtab) {
        var fuel_options_box = subtab.addBox({
            heading: 'Refueling',
            description: 'These options control the amount of space to leave for fuel, and whether or not you wish to purchase additional fuel automatically.',
        });

        var permitted_fuel_amounts = [
            { value: "0", text: "None" },
            { value: "1", text: "1" },
            { value: "2", text: "2" },
            { value: "3", text: "3" },
            { value: "4", text: "4" },
            { value: "5", text: "5" },
            { value: "6", text: "6" },
            { value: "7", text: "7" },
            { value: "8", text: "8" },
            { value: "9", text: "9" },
            { value: "10", text: "10" },
            { value: "11", text: "11" },
            { value: "12", text: "12" },
            { value: "13", text: "13" },
            { value: "14", text: "14" },
            { value: "15", text: "15" },
            { value: "16", text: "16" },
            { value: "17", text: "17" },
            { value: "18", text: "18" },
            { value: "19", text: "19" },
            { value: "20", text: "20" },
        ];

        var fuel_amount_select = fuel_options_box.addSelectOption({
            variable: 'fuel_space_left',
            description: 'Amount of space left for fuel',
            options: permitted_fuel_amounts,
            defaultValue: '5',
        });

        var fuel_to_purchase = permitted_fuel_amounts.slice(0, parseInt(fuel_amount_select.getValue()) + 1);

        var fuel_auto_purchase_select = fuel_options_box.addSelectOption({
            variable: 'fuel_to_purchase',
            description: 'Amount of fuel to automatically purchase',
            options: fuel_to_purchase,
            defaultValue: '5',
        });

        fuel_amount_select.addEventListener('change', () => {
            const permitted_fuel_amounts = fuel_amount_select.options;
            const value_to_set = fuel_auto_purchase_select.getValue();
            const current_space_for_fuel = parseInt(fuel_amount_select.getCurrentValue());

            let fuel_to_purchase = permitted_fuel_amounts.slice(0, current_space_for_fuel + 1);

            for (const obj of fuel_to_purchase) {
                delete obj.default;
            }

            fuel_to_purchase[Math.min(fuel_auto_purchase_select.getValue() + 1, fuel_to_purchase.length - 1)].default = true;

            fuel_auto_purchase_select.options = fuel_to_purchase;
            fuel_auto_purchase_select.refreshElement();
        });
    }

    function displaySaved(id) {
        var save_button = document.getElementById(id);
        save_button.setAttribute('disabled', 'true');
        save_button.value = 'Saved';
        save_button.setAttribute('style', 'color:green;background-color:silver');
        setTimeout(function() {
            save_button.removeAttribute('disabled');
            save_button.value = 'Save';
            save_button.removeAttribute('style');
        }, 2000);
    }

    function displayPremiumSaved(id) {
        var save_button = document.getElementById(id);
        save_button.setAttribute('disabled', 'true');
        save_button.value = 'Saved';
        save_button.setAttribute('style', 'color:green;background-color:silver');
        setTimeout(function() {
            save_button.removeAttribute('disabled');
            save_button.value = 'Save';
            save_button.setAttribute('style', 'color:#FFCC11');
        }, 2000);
    }
}
