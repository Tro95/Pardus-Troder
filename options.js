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

    // Set the default values
    document.getElementById('troder-fuel').value = fuel;
    document.getElementById('troder-droid-wash').checked = droid_wash_mode;

    // Let the save button work
    var main_save_button = document.getElementById('troder-save');
    if (main_save_button.addEventListener) {
            main_save_button.addEventListener("click", saveMainOptions, false);
    } else if (main_save_button.attachEvent) {
            main_save_button.attachEvent('onclick', saveMainOptions);
    }

    function droidWashingOptions() {
        var droid_washing_options_box = troder_options_tab.addBox("Droid Washing");
        var droid_washing_inner_html = `<tr><td>The droid washing mode is something that you can activate to assist in droid washing. If you are not actively droid washing it is recommended you disable droid washing mode. These options control how the droid washing mode works.</td></tr><tr> <td> <table> <tbody> <tr> <td>Enable Droid Washing Mode:</td><td> <input id="troder-droid-washing-mode-enabled" type="checkbox"> </td></tr></tbody> </table> </td></tr><tr><td><div><input type="range" id="droidwash-level" name="droidwash-level" min="20" max="80" step="20" value="20" style="background:url(//static.pardus.at/img/std/bgd.gif)"><label for="droidwash-level">Mode</label></div></td></tr><tr><td><div id="droidwash-level-info"><table><tbody><tr><td>Credits / ATP: </td><td><div id="credits-per-atp" style="color:#009900">465254</div></td><td><img src="//static.pardus.at/img/std/credits.png" title="Credits" alt="Credits"></td></tr><tr><td>Speed: </td><td><div id="speed-for-atp" style="color:#FFAA00">Moderate</div></td></tr></tbody></table></div></td></tr><tr><td><table><tbody><tr><td>Planets:</td><td><table><tbody> <tr> <td><input id="troder-droid-washing-m-planet-enabled" type="checkbox"> <label>M Class</label></td><td><input id="troder-droid-washing-i-planet-enabled" type="checkbox"> <label>I Class</label></td><td><input id="troder-droid-washing-d-planet-enabled" type="checkbox"> <label>D Class</label></td></tr><tr> <td><input id="troder-droid-washing-g-planet-enabled" type="checkbox"> <label>G Class</label></td><td><input id="troder-droid-washing-r-planet-enabled" type="checkbox"> <label>R Class</label></td><td><input id="troder-droid-washing-a-planet-enabled" type="checkbox"> <label>A Class</label></td></tr></tbody> </table></td></tr></tbody></table></td></tr><tr> <td align="right"> <input value="Save" id="troder-droid-washing-save" type="button"> </td></tr>`;
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
            var level_slider = document.getElementById('droidwash-level').valueAsNumber;
            //var fuel_to_purchase = document.getElementById('troder-options-fuel-purchase').value;
            GM_setValue(universe + '_droid_washing_mode_enabled', droid_wash_enabled);
            GM_setValue(universe + '_droid_washing_planet_m_enabled', planet_m);
            GM_setValue(universe + '_droid_washing_planet_i_enabled', planet_i);
            GM_setValue(universe + '_droid_washing_planet_d_enabled', planet_d);
            GM_setValue(universe + '_droid_washing_planet_g_enabled', planet_g);
            GM_setValue(universe + '_droid_washing_planet_r_enabled', planet_r);
            GM_setValue(universe + '_droid_washing_planet_a_enabled', planet_a);

            GM_setValue(universe + '_droid_washing_level', level_slider);

            //GM_setValue(universe + '_fuel_to_purchase', fuel_to_purchase);
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

    function saveMainOptions() {
        var fuel_to_save = document.getElementById('troder-fuel').value;
        var droid_wash_mode = document.getElementById('troder-droid-wash').checked;
        GM_setValue(universe + '_fuel', fuel_to_save);
        GM_setValue(universe + '_droid_wash_mode', droid_wash_mode);
        //displaySaved();
        //window.scrollTo(0,0);
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
}