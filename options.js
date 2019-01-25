/**
 *  Places the configuration options for this script on the Options page in Pardus.
 *
 *  Allows the user to configure the amount of fuel they wish to guarantee and/or purchase,
 *  as well as enabling/disabling droid wash mode
 */
function troderOptions() {
    var main_box_inner_html = '<tr><td>These are the options for the Pardus Troder script.</td></tr>';

    var troder_options_tab = unsafeWindow.Options.addNewTab('Troder Options', 'troder-options');
    var main_options_box = troder_options_tab.addBox("Main Options");
    main_options_box.inner_html = main_box_inner_html;
    main_options_box.refreshElement();

    droidWashingOptions();
    fuelOptions();
    planetAOptions();
    planetMOptions();
    planetIOptions();
    planetROptions();
    planetGOptions();
    planetDOptions();

    function planetAOptions() {
        var planet_a_options_box = troder_options_tab.addPremiumBoxLeft("Planets: Class A");
        var planet_a_inner_html = `<tr><td><table><tbody><tr><td><img src="https://static.pardus.at/img/std/foregrounds/planet_a.png" /></td><td align="center">These options control the buttons displayed on the trade screen for Class A planets (which are only available in the Pardus Cluster).</td></tr></tbody></table></td></tr><tr><td><table><tbody><tr><td>Enable 'Starbase Run' button: </td><td><input id="troder-planet-a-starbase-run-enabled" type="checkbox"></td></tr><tr><td>Enable 'Stock Run' button: </td><td><input id="troder-planet-a-stock-run-enabled" type="checkbox"></td></tr><tr><td>Enable 'Load Food' button: </td><td><input id="troder-planet-a-load-food-enabled" type="checkbox"></td></tr><tr><td>Enable 'Load Water' button: </td><td><input id="troder-planet-a-load-water-enabled" type="checkbox"></td></tr></tbody></table></td></tr><tr><td align="right"><input value="Save" id="troder-planet-a-save" type="button" style="color:#FFCC11"></td></tr>`;
        planet_a_options_box.inner_html = planet_a_inner_html;
        planet_a_options_box.refreshElement();

        document.getElementById('troder-planet-a-starbase-run-enabled').checked = GM_getValue(universe + '_planet_a_starbase_run_enabled', true);
        document.getElementById('troder-planet-a-stock-run-enabled').checked = GM_getValue(universe + '_planet_a_stock_run_enabled', true);
        document.getElementById('troder-planet-a-load-food-enabled').checked = GM_getValue(universe + '_planet_a_load_food_enabled', true);
        document.getElementById('troder-planet-a-load-water-enabled').checked = GM_getValue(universe + '_planet_a_load_water_enabled', true);

        var planet_a_save_button = document.getElementById('troder-planet-a-save');
        if (planet_a_save_button.addEventListener) {
            planet_a_save_button.addEventListener("click", savePlanetAOptions, false);
        } else if (planet_a_save_button.attachEvent) {
            planet_a_save_button.attachEvent('onclick', savePlanetAOptions);
        }

        function savePlanetAOptions() {
            var starbase_run = document.getElementById('troder-planet-a-starbase-run-enabled').checked;
            var stock_run = document.getElementById('troder-planet-a-stock-run-enabled').checked;
            var load_food = document.getElementById('troder-planet-a-load-food-enabled').checked;
            var load_water = document.getElementById('troder-planet-a-load-water-enabled').checked;

            GM_setValue(universe + '_planet_a_starbase_run_enabled', starbase_run);
            GM_setValue(universe + '_planet_a_stock_run_enabled', stock_run);
            GM_setValue(universe + '_planet_a_load_food_enabled', load_food);
            GM_setValue(universe + '_planet_a_load_water_enabled', load_water);

            displayPremiumSaved('troder-planet-a-save');
        }
    }

    function planetMOptions() {
        var planet_m_options_box = troder_options_tab.addBoxRight("Planets: Class M");
        var planet_m_inner_html = `<tr><td><table><tbody><tr><td><img src="https://static.pardus.at/img/std/foregrounds/planet_m.png" /></td><td align="center">These options control the buttons displayed on the trade screen for Class M planets.</td></tr></tbody></table></td></tr><tr><td><table><tbody><tr><td>Enable 'Starbase Run' button: </td><td><input id="troder-planet-m-starbase-run-enabled" type="checkbox"></td></tr><tr><td>Enable 'Stock Run' button: </td><td><input id="troder-planet-m-stock-run-enabled" type="checkbox"></td></tr><tr><td>Enable 'Load Food' button: </td><td><input id="troder-planet-m-load-food-enabled" type="checkbox"></td></tr><tr><td>Enable 'Load Water' button: </td><td><input id="troder-planet-m-load-water-enabled" type="checkbox"></td></tr></tbody></table></td></tr><tr><td align="right"><input value="Save" id="troder-planet-m-save" type="button"></td></tr>`;
        planet_m_options_box.inner_html = planet_m_inner_html;
        planet_m_options_box.refreshElement();

        document.getElementById('troder-planet-m-starbase-run-enabled').checked = GM_getValue(universe + '_planet_m_starbase_run_enabled', true);
        document.getElementById('troder-planet-m-stock-run-enabled').checked = GM_getValue(universe + '_planet_m_stock_run_enabled', true);
        document.getElementById('troder-planet-m-load-food-enabled').checked = GM_getValue(universe + '_planet_m_load_food_enabled', true);
        document.getElementById('troder-planet-m-load-water-enabled').checked = GM_getValue(universe + '_planet_m_load_water_enabled', true);

        var planet_m_save_button = document.getElementById('troder-planet-m-save');
        if (planet_m_save_button.addEventListener) {
            planet_m_save_button.addEventListener("click", savePlanetMOptions, false);
        } else if (planet_m_save_button.attachEvent) {
            planet_m_save_button.attachEvent('onclick', savePlanetMOptions);
        }

        function savePlanetMOptions() {
            var starbase_run = document.getElementById('troder-planet-m-starbase-run-enabled').checked;
            var stock_run = document.getElementById('troder-planet-m-stock-run-enabled').checked;
            var load_food = document.getElementById('troder-planet-m-load-food-enabled').checked;
            var load_water = document.getElementById('troder-planet-m-load-water-enabled').checked;

            GM_setValue(universe + '_planet_m_starbase_run_enabled', starbase_run);
            GM_setValue(universe + '_planet_m_stock_run_enabled', stock_run);
            GM_setValue(universe + '_planet_m_load_food_enabled', load_food);
            GM_setValue(universe + '_planet_m_load_water_enabled', load_water);

            displaySaved('troder-planet-m-save');
        }
    }

    function planetIOptions() {
        var planet_i_options_box = troder_options_tab.addBoxLeft("Planets: Class I");
        var planet_i_inner_html = `<tr><td><table><tbody><tr><td><img src="https://static.pardus.at/img/std/foregrounds/planet_i.png" /></td><td align="center">These options control the buttons displayed on the trade screen for Class I planets.</td></tr></tbody></table></td></tr><tr><td><table><tbody><tr><td>Enable 'Planet Run' button: </td><td><input id="troder-planet-i-planet-run-enabled" type="checkbox"></td></tr><tr><td>Enable 'Load Water' button: </td><td><input id="troder-planet-i-load-water-enabled" type="checkbox"></td></tr></tbody></table></td></tr><tr><td align="right"><input value="Save" id="troder-planet-i-save" type="button"></td></tr>`;
        planet_i_options_box.inner_html = planet_i_inner_html;
        planet_i_options_box.refreshElement();

        document.getElementById('troder-planet-i-planet-run-enabled').checked = GM_getValue(universe + '_planet_i_planet_run_enabled', true);
        document.getElementById('troder-planet-i-load-water-enabled').checked = GM_getValue(universe + '_planet_i_load_water_enabled', true);

        var planet_i_save_button = document.getElementById('troder-planet-i-save');
        if (planet_i_save_button.addEventListener) {
            planet_i_save_button.addEventListener("click", savePlanetIOptions, false);
        } else if (planet_i_save_button.attachEvent) {
            planet_i_save_button.attachEvent('onclick', savePlanetIOptions);
        }

        function savePlanetIOptions() {
            var planet_run = document.getElementById('troder-planet-i-planet-run-enabled').checked;
            var load_water = document.getElementById('troder-planet-i-load-water-enabled').checked;

            GM_setValue(universe + '_planet_i_planet_run_enabled', planet_run);
            GM_setValue(universe + '_planet_i_load_water_enabled', load_water);

            displaySaved('troder-planet-i-save');
        }
    }

    function planetROptions() {
        var planet_r_options_box = troder_options_tab.addBoxLeft("Planets: Class R");
        var planet_r_inner_html = `<tr><td><table><tbody><tr><td><img src="https://static.pardus.at/img/std/foregrounds/planet_r.png" /></td><td align="center">These options control the buttons displayed on the trade screen for Class R planets.</td></tr></tbody></table></td></tr><tr><td><table><tbody><tr><td>Enable 'Combo Run' button: </td><td><input id="troder-planet-r-combo-run-enabled" type="checkbox"></td></tr><tr><td>Enable 'Load Embryos' button: </td><td><input id="troder-planet-r-load-embryos-enabled" type="checkbox"></td></tr><tr><td>Enable 'Load Metal' button: </td><td><input id="troder-planet-r-load-metal-enabled" type="checkbox"></td></tr><tr><td>Enable 'Load Ore' button: </td><td><input id="troder-planet-r-load-ore-enabled" type="checkbox"></td></tr><tr><td>Enable 'Load Rads' button: </td><td><input id="troder-planet-r-load-rads-enabled" type="checkbox"></td></tr></tbody></table></td></tr><tr><td align="right"><input value="Save" id="troder-planet-r-save" type="button"></td></tr>`;
        planet_r_options_box.inner_html = planet_r_inner_html;
        planet_r_options_box.refreshElement();

        document.getElementById('troder-planet-r-combo-run-enabled').checked = GM_getValue(universe + '_planet_r_combo_run_enabled', true);
        document.getElementById('troder-planet-r-load-embryos-enabled').checked = GM_getValue(universe + '_planet_r_load_embryos_enabled', true);
        document.getElementById('troder-planet-r-load-metal-enabled').checked = GM_getValue(universe + '_planet_r_load_metal_enabled', true);
        document.getElementById('troder-planet-r-load-ore-enabled').checked = GM_getValue(universe + '_planet_r_load_ore_enabled', true);
        document.getElementById('troder-planet-r-load-rads-enabled').checked = GM_getValue(universe + '_planet_r_load_rads_enabled', true);

        var planet_r_save_button = document.getElementById('troder-planet-r-save');
        if (planet_r_save_button.addEventListener) {
            planet_r_save_button.addEventListener("click", savePlanetROptions, false);
        } else if (planet_r_save_button.attachEvent) {
            planet_r_save_button.attachEvent('onclick', savePlanetROptions);
        }

        function savePlanetROptions() {
            var combo_run = document.getElementById('troder-planet-r-combo-run-enabled').checked;
            var load_embryos = document.getElementById('troder-planet-r-load-embryos-enabled').checked;
            var load_metal = document.getElementById('troder-planet-r-load-metal-enabled').checked;
            var load_ore = document.getElementById('troder-planet-r-load-ore-enabled').checked;
            var load_rads = document.getElementById('troder-planet-r-load-rads-enabled').checked;

            GM_setValue(universe + '_planet_r_combo_run_enabled', combo_run);
            GM_setValue(universe + '_planet_r_load_embryos_enabled', load_embryos);
            GM_setValue(universe + '_planet_r_load_metal_enabled', load_metal);
            GM_setValue(universe + '_planet_r_load_ore_enabled', load_ore);
            GM_setValue(universe + '_planet_r_load_rads_enabled', load_rads);

            displaySaved('troder-planet-r-save');
        }
    }

    function planetGOptions() {
        var planet_g_options_box = troder_options_tab.addBoxRight("Planets: Class G");
        var planet_g_inner_html = `<tr><td><table><tbody><tr><td><img src="https://static.pardus.at/img/std/foregrounds/planet_g.png" /></td><td align="center">These options control the buttons displayed on the trade screen for Class G planets.</td></tr></tbody></table></td></tr><tr><td><table><tbody><tr><td>Enable 'Load Embryos' button: </td><td><input id="troder-planet-g-load-embryos-enabled" type="checkbox"></td></tr><tr><td>Enable 'Load Nebula' button: </td><td><input id="troder-planet-g-load-nebula-enabled" type="checkbox"></td></tr><tr><td>Enable 'Load Chemicals' button: </td><td><input id="troder-planet-g-load-chems-enabled" type="checkbox"></td></tr></tbody></table></td></tr><tr><td align="right"><input value="Save" id="troder-planet-g-save" type="button"></td></tr>`;
        planet_g_options_box.inner_html = planet_g_inner_html;
        planet_g_options_box.refreshElement();

        document.getElementById('troder-planet-g-load-embryos-enabled').checked = GM_getValue(universe + '_planet_g_load_embryos_enabled', true);
        document.getElementById('troder-planet-g-load-nebula-enabled').checked = GM_getValue(universe + '_planet_g_load_nebula_enabled', true);
        document.getElementById('troder-planet-g-load-chems-enabled').checked = GM_getValue(universe + '_planet_g_load_chems_enabled', true);

        var planet_g_save_button = document.getElementById('troder-planet-g-save');
        if (planet_g_save_button.addEventListener) {
            planet_g_save_button.addEventListener("click", savePlanetGOptions, false);
        } else if (planet_g_save_button.attachEvent) {
            planet_g_save_button.attachEvent('onclick', savePlanetGOptions);
        }

        function savePlanetGOptions() {
            var load_embryos = document.getElementById('troder-planet-g-load-embryos-enabled').checked;
            var load_nebula = document.getElementById('troder-planet-g-load-nebula-enabled').checked;
            var load_chems = document.getElementById('troder-planet-g-load-chems-enabled').checked;

            GM_setValue(universe + '_planet_g_load_embryos_enabled', load_embryos);
            GM_setValue(universe + '_planet_g_load_nebula_enabled', load_nebula);
            GM_setValue(universe + '_planet_g_load_chems_enabled', load_chems);

            displaySaved('troder-planet-g-save');
        }
    }

    function planetDOptions() {
        var planet_d_options_box = troder_options_tab.addBoxRight("Planets: Class D");
        var planet_d_inner_html = `<tr><td><table><tbody><tr><td><img src="https://static.pardus.at/img/std/foregrounds/planet_d.png" /></td><td align="center">These options control the buttons displayed on the trade screen for Class D planets.</td></tr></tbody></table></td></tr><tr><td><table><tbody><tr><td>Enable 'Load Slaves' button: </td><td><input id="troder-planet-d-load-slaves-enabled" type="checkbox"></td></tr></tbody></table></td></tr><tr><td align="right"><input value="Save" id="troder-planet-d-save" type="button"></td></tr>`;
        planet_d_options_box.inner_html = planet_d_inner_html;
        planet_d_options_box.refreshElement();

        document.getElementById('troder-planet-d-load-slaves-enabled').checked = GM_getValue(universe + '_planet_d_load_slaves_enabled', true);
        
        var planet_d_save_button = document.getElementById('troder-planet-d-save');
        if (planet_d_save_button.addEventListener) {
            planet_d_save_button.addEventListener("click", savePlanetDOptions, false);
        } else if (planet_d_save_button.attachEvent) {
            planet_d_save_button.attachEvent('onclick', savePlanetDOptions);
        }

        function savePlanetDOptions() {
            var load_slaves = document.getElementById('troder-planet-d-load-slaves-enabled').checked;

            GM_setValue(universe + '_planet_d_load_slaves_enabled', load_slaves);

            displaySaved('troder-planet-d-save');
        }
    }

    function droidWashingOptions() {
        var droid_washing_options_box = troder_options_tab.addBox("Droid Washing");
        var droid_washing_inner_html = `<tr><td>The droid washing mode is something that you can activate to assist in droid washing. If you are not actively droid washing it is recommended you disable droid washing mode. These options control how the droid washing mode works.</td></tr><tr> <td> <table> <tbody> <tr> <td>Enable Droid Washing Mode:</td><td> <input id="troder-droid-washing-mode-enabled" type="checkbox"> </td></tr></tbody> </table> </td></tr><tr><td><div><input type="range" id="droidwash-level" name="droidwash-level" min="20" max="80" step="20" value="20" style="background:url(//static.pardus.at/img/std/bgd.gif)"><label for="droidwash-level">Mode</label></div></td></tr><tr><td><div id="droidwash-level-info"><table><tbody><tr><td>Credits / ATP: </td><td><div id="credits-per-atp" style="color:#009900">465254</div></td><td><img src="//static.pardus.at/img/std/credits.png" title="Credits" alt="Credits"></td></tr><tr><td>Speed: </td><td><div id="speed-for-atp" style="color:#FFAA00">Moderate</div></td></tr></tbody></table></div></td></tr><tr><td><table><tbody><tr><td>Planets:</td><td><table><tbody> <tr> <td><input id="troder-droid-washing-m-planet-enabled" type="checkbox"> <label>M Class</label></td><td><input id="troder-droid-washing-i-planet-enabled" type="checkbox"> <label>I Class</label></td><td><input id="troder-droid-washing-d-planet-enabled" type="checkbox"> <label>D Class</label></td></tr><tr> <td><input id="troder-droid-washing-g-planet-enabled" type="checkbox"> <label>G Class</label></td><td><input id="troder-droid-washing-r-planet-enabled" type="checkbox"> <label>R Class</label></td><td><input id="troder-droid-washing-a-planet-enabled" type="checkbox"> <label>A Class</label></td></tr></tbody> </table></td></tr><tr><td>Starbases:</td><td><table><tbody><tr><td><input id="troder-droid-washing-starbase-enabled" type="checkbox"> <label>NPC Starbase</label></td></tr></tbody> </table></td></tr></tbody></table></td></tr><tr> <td align="right"> <input value="Save" id="troder-droid-washing-save" type="button"> </td></tr>`;
        droid_washing_options_box.inner_html = droid_washing_inner_html;
        droid_washing_options_box.refreshElement();

        document.getElementById('droidwash-level').value = droid_wash_level;
        document.getElementById('droidwash-level').addEventListener("input", setCreditsPerATP, true);
        setCreditsPerATP();

        document.getElementById('troder-droid-washing-mode-enabled').checked = droid_wash_mode;
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

            var credits_per_atp_elem = document.getElementById('credits-per-atp');
            var speed_per_atp_elem = document.getElementById('speed-for-atp');

            credits_per_atp_elem.innerHTML = credits_per_atp.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

            switch (slider_value) {
                case 20:
                    credits_per_atp_elem.setAttribute('style','color:#009900');
                    speed_per_atp_elem.setAttribute('style','color:#FFAA00');
                    speed_per_atp_elem.innerHTML = 'Moderate';
                    break;
                case 40:
                    credits_per_atp_elem.setAttribute('style','color:#FFFF00');
                    speed_per_atp_elem.setAttribute('style','color:#FFFF00');
                    speed_per_atp_elem.innerHTML = 'Fast';
                    break;
                case 60:
                    credits_per_atp_elem.setAttribute('style','color:#FFAA00');
                    speed_per_atp_elem.setAttribute('style','color:#99FF00');
                    speed_per_atp_elem.innerHTML = 'Faster';
                    break;
                case 80:
                    credits_per_atp_elem.setAttribute('style','color:#CC0000');
                    speed_per_atp_elem.setAttribute('style','color:#009900');
                    speed_per_atp_elem.innerHTML = 'Fastest';
                    break;
            }
        }

        function saveDroidWashingOptions() {
            var droid_wash_enabled = document.getElementById('troder-droid-washing-mode-enabled').checked;
            var planet_m = document.getElementById('troder-droid-washing-m-planet-enabled').checked;
            var planet_i = document.getElementById('troder-droid-washing-i-planet-enabled').checked;
            var planet_d = document.getElementById('troder-droid-washing-d-planet-enabled').checked;
            var planet_g = document.getElementById('troder-droid-washing-g-planet-enabled').checked;
            var planet_r = document.getElementById('troder-droid-washing-r-planet-enabled').checked;
            var planet_a = document.getElementById('troder-droid-washing-a-planet-enabled').checked;
            var starbase = document.getElementById('troder-droid-washing-starbase-enabled').checked;
            var level_slider = document.getElementById('droidwash-level').valueAsNumber;

            GM_setValue(universe + '_droid_washing_mode_enabled', droid_wash_enabled);
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

    function fuelOptions() {
        var fuel_options_box = troder_options_tab.addBox("Refueling");
        var fuel_box_inner_html = `<tr><td>These options control the amount of space to leave for fuel, and whether or not you wish to purchase additional fuel automatically.</td></tr><tr> <td> <table> <tbody> <tr> <td>Amount of space left for fuel:</td> <td> <select id="troder-options-fuel-space-left"> <option value="0">None</option> <option value="1">1</option> <option value="2">2</option> <option value="3">3</option> <option value="4">4</option> <option value="5">5</option> <option value="6">6</option> <option value="7">7</option> <option value="8">8</option> <option value="9">9</option> <option value="10">10</option> </select> </td> </tr> <tr> <td>Amount of fuel to automatically purchase:</td> <td> <select id="troder-options-fuel-purchase"> <option value="0">None</option> <option value="1">1</option> <option value="2">2</option> <option value="3">3</option> <option value="4">4</option> <option value="5">5</option> <option value="6">6</option> <option value="7">7</option> <option value="8">8</option> <option value="9">9</option> <option value="10">10</option> </select> </td> </tr> </tbody> </table> </td></tr><tr> <td align="right"> <input value="Save" id="troder-fuel-save" type="button"> </td></tr>`;

        fuel_options_box.inner_html = fuel_box_inner_html;
        fuel_options_box.refreshElement();

        var fuel_space_allowed = document.getElementById('troder-options-fuel-space-left');
        fuel_space_allowed.value = fuel_space_left;

        setFuelPurchaseOptions();
        if (fuel_space_allowed.addEventListener) {
            fuel_space_allowed.addEventListener("change", setFuelPurchaseOptions, false);
        } else if (fuel_space_allowed.attachEvent) {
            fuel_space_allowed.attachEvent('onchange', setFuelPurchaseOptions);
        }

        var fuel_save_button = document.getElementById('troder-fuel-save');
        if (fuel_save_button.addEventListener) {
            fuel_save_button.addEventListener("click", saveFuelOptions, false);
        } else if (fuel_save_button.attachEvent) {
            fuel_save_button.attachEvent('onclick', saveFuelOptions);
        }

        function setFuelPurchaseOptions() {
            var fuel_purchase_select = document.getElementById('troder-options-fuel-purchase');
            var fuel_space_allowed = document.getElementById('troder-options-fuel-space-left');

            var i = 0;
            var tmp_length = fuel_purchase_select.length;
            for (i = 0; i < tmp_length; i++) {
                fuel_purchase_select.remove(0);
            }

            var select_option = document.createElement("option");
            select_option.text = "None";
            select_option.value = 0;
            fuel_purchase_select.add(select_option);

            for (i = 1; i <= fuel_space_allowed.value; i++) {
                select_option = document.createElement("option");
                select_option.text = i.toString();
                select_option.value = i;
                fuel_purchase_select.add(select_option);
            }

            if (fuel_to_purchase <= fuel_purchase_select.lastChild.value) {
                fuel_purchase_select.selectedIndex = fuel_to_purchase;
            } else {
                fuel_purchase_select.selectedIndex = fuel_purchase_select.length - 1;
            }
        }

        function saveFuelOptions() {
            var fuel_space_to_leave = document.getElementById('troder-options-fuel-space-left').value;
            var fuel_to_purchase = document.getElementById('troder-options-fuel-purchase').value;
            GM_setValue(universe + '_fuel_space_left', fuel_space_to_leave);
            GM_setValue(universe + '_fuel_to_purchase', fuel_to_purchase);
            displaySaved('troder-fuel-save');
        }
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