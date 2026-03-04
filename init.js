
var commodities = [];

var has_magscoop = false;
var magscoop_size = 0;

var ship_free_space = 0;
var magscoop_free_space = 0;
var total_free_space = 0;
var allowed_free_space = 0;
var magscoop_allowed = false;

var universe = '';
var fuel = 0;
var fuel_space_left = 5;
var fuel_to_purchase = 5;
var ensure_fuel_space = 0;

var droid_wash_mode = false;
var droid_wash_planet_m_enabled, droid_wash_planet_i_enabled, droid_wash_planet_d_enabled, droid_wash_planet_g_enabled, droid_wash_planet_r_enabled, droid_wash_planet_a_enabled = false;

var ship_space_location;
var ship_space_location_top;
var building_space;
var building_space_location;

var transfer_button = null;
var preview = true;

var auto_unload;

var ship_space = {
    starting_ship_space: 0,
    starting_magscoop_space: 0,
    ending_ship_space: 0,
    ending_magscoop_space: 0,
    getShipSpaceString: function() {
        if (has_magscoop) {
            return this.ending_ship_space + " + " + this.ending_magscoop_space + "t";
        }
        return this.ending_ship_space + "t";
    },
    calculateShipSpace: function() {
        var to_sell = 0;
        var to_buy = 0;
        for (var i = 0; i < items.length; i++) {
            if (commodities[i].ship_stock > 0) {
                if (commodities[i].sellValue() != '') {
                    to_sell += Number(commodities[i].sellValue());
                }
            }
            if (commodities[i].trade_stock > commodities[i].min) {
                if (commodities[i].buyValue() != '') {
                    to_buy += Number(commodities[i].buyValue());
                }
            }
        }

        this.ending_ship_space = this.starting_ship_space;

        if (has_magscoop) {
            if (this.ending_ship_space > 0) {
                this.ending_magscoop_space = this.starting_magscoop_space;
                this.ending_ship_space = this.ending_ship_space + to_sell - to_buy;
                if (this.ending_ship_space < 0) {
                    this.ending_magscoop_space += this.ending_ship_space;
                    this.ending_ship_space = 0;
                }
            } else {
                this.ending_magscoop_space = this.starting_magscoop_space + to_sell - to_buy;
                if (this.ending_magscoop_space > magscoop_size) {
                    this.ending_ship_space += this.ending_magscoop_space - magscoop_size;
                    this.ending_magscoop_space = magscoop_size;
                }
            }
        } else {
            this.ending_ship_space = this.ending_ship_space + to_sell - to_buy;
        }

        if (ship_space_location_top != null) {
            ship_space_location_top.innerHTML = 'Free Space: ' + this.getShipSpaceString();
            ship_space_location.innerHTML = this.getShipSpaceString();
        }
    },
    allowedSpace: function() {
        if (has_magscoop && magscoop_allowed) {
            return Number(this.ending_ship_space) + Number(this.ending_magscoop_space);
        } else {
            return Number(this.ending_ship_space);
        }
    }
};

var buttons = {
    buttons_box: null,
    number_of_buttons: 0,
    createButtonsBox: function() {

        var buttons_box_html = '<div id="troder-buttons-container"><table style="background:url(//static.pardus.at/img/std/bgd.gif)" width="90%" cellpadding="3" align="center" id="troder-buttons-table"><tbody><tr><th>Troder Buttons</th></tr><tr><td><table align="center" width="90%" frame="box" style="border-style:dashed;border-color:yellow;" id="troder-options-box"><tbody><tr><td align="center">Unload ship:</td><td align="center"><input type="checkbox" id="autoUnload"></td></tr><tr><td align="center">Preview Trade:</td><td align="center"><input type="checkbox" id="troder-preview-trade"></td></tr></tbody></table></td></tr><tr><td><table align="center" width="90%" frame="box" style="border-style:dashed;border-color:yellow;border-spacing:10px;" id="troder-buttons-box"><tbody></tbody></table></td></tr></tbody></table></div>';

        transfer_button.parentNode.innerHTML = transfer_button.parentNode.innerHTML + buttons_box_html;

        this.buttons_box = document.getElementById("troder-buttons-box").lastChild;

        if (has_magscoop) {
            var magscoop_option = document.createElement('tr');
            magscoop_option.innerHTML = '<td align="center">Use Magscoop:</td><td align="center"><input type="checkbox" id="useMagScoop"></td>';

            document.getElementById('troder-options-box').appendChild(magscoop_option);

            if (GM_getValue(universe + '_magscoop_allowed', defaults['use_magscoop'])) {
                document.getElementById("useMagScoop").checked = true;
            } else {
                document.getElementById("useMagScoop").checked = false;
            }

            document.getElementById('useMagScoop').addEventListener("change", isMagscoopAllowed, true);
        }

        if (preview) {
            document.getElementById("troder-preview-trade").checked = true;
        }

        if (auto_unload) {
            document.getElementById("autoUnload").checked = true;
        }

        document.getElementById('autoUnload').addEventListener("change", isAutoUnload, true);
        document.getElementById('troder-preview-trade').addEventListener("change", isPreview, true);

        function isMagscoopAllowed() {
            if (document.getElementById('useMagScoop').checked == true) {
                GM_setValue(universe + "_magscoop_allowed", true);
                magscoop_allowed = true;
            } else {
                GM_setValue(universe + "_magscoop_allowed", false);
                magscoop_allowed = false;
            }
        }

        function isAutoUnload() {
            if (document.getElementById('autoUnload').checked == true) {
                GM_setValue(universe + "_auto_unload", true);
                auto_unload = true;
            } else {
                GM_setValue(universe + "_auto_unload", false);
                auto_unload = false;
            }
        }

        function isPreview() {
            if (document.getElementById('troder-preview-trade').checked == true) {
                GM_setValue(universe + "_preview", true);
                preview = true;
            } else {
                GM_setValue(universe + "_preview", false);
                preview = false;
            }
        }

        document.addPardusKeyDownListener('transfer_keypress', {code: 13}, (event) => {
            for (const button of document.querySelectorAll('input[type="submit"]')) {
                if (button.value === '<- Transfer ->') {
                    button.click();
                }
            }
        });

        console.log('Adding exit keydown!')
        document.addPardusKeyDownListener('exit_to_nav_keypress', {code: 27}, (event) => {
            console.log('Escape key pressed');
            document.location.assign(`${document.location.origin}/main.php`);
            console.log(`${document.location.origin}/main.php`);
            console.log(window);
            console.log(document.location);
            event.preventDefault();
        });
    },
    addButton: function(label, function_to_set) {
        if (this.buttons_box == null) {
            return;
        }

        var new_button = document.createElement('tr');
        new_button.innerHTML = '<td width="90%" align="center" colspan=2><input type="button" style="width:90%;height:150%;" id="troder-button-' + this.number_of_buttons + '" value="' + label + '"></td>';
        this.buttons_box.appendChild(new_button);
        document.getElementById("troder-button-" + this.number_of_buttons).addEventListener("click", function_to_set, true);
        this.number_of_buttons = this.number_of_buttons + 1;
    },
    addStandardButtons: function() {
        this.addButton("Unload Ship", function() {unload();submitIfNotPreview();});
        this.addButton("Reset", reset);
        document.addPardusKeyDownListener('unload_keypress', {code: 85}, (event) => {
            unload();
            submitIfNotPreview();
        });
        document.addPardusKeyDownListener('reset_keypress', {code: 82}, (event) => {
            reset();
        });
    },
    addDroidwashableItems: function(droidwash_items) {
        var i;

        var droidwash_items_box = document.createElement('tr');
        droidwash_items_box.innerHTML = '<td><table align="center" width="90%" frame="box" style="border-style:dashed;border-color:yellow;border-spacing:10px;" id="troder-droidwash-items"><tbody></tbody></table></td>';
        document.getElementById("troder-buttons-table").firstChild.appendChild(droidwash_items_box);
        
        if (droidwash_items.length == 0) {
            document.getElementById("troder-droidwash-items").firstChild.innerHTML = '<tr><td align="center"><font color="#FF0000">No items capable of being droidwashed</font></td></tr>';
            return;
        } else {
            document.getElementById("troder-droidwash-items").firstChild.innerHTML = '<tr><td align="center">Items capable of being droidwashed:</td></tr><tr><td align="center" style="font-size:11px;"><ul style="list-style-type:none;padding-left:0;" id="troder-droidwash-items-list"></ul></td></tr>';            
        }

        for (i = 0; i < droidwash_items.length; i++) {

            var new_item = document.createElement('li');

            if (commodities[items.indexOf(droidwash_items[i])].ship_stock + commodities[items.indexOf(droidwash_items[i])].trade_stock < commodities[items.indexOf(droidwash_items[i])].bal + 2) {
                // Valid item but none in stock
                new_item.innerHTML = '<font color="#FFAA00">' + droidwash_items[i] + '</font>';
            } else {
                // Valid item with some in stock
                new_item.innerHTML = '<font color="#009900">' + droidwash_items[i] + '</font>';
            }

            document.getElementById("troder-droidwash-items-list").appendChild(new_item);
        }
    }
};

function bootstrap() {

    identifyUniverse();
    loadVariables();
    bootstrapCommodities();
    findTransferButton();

    function identifyUniverse() {
        switch (document.location.hostname) {
            case "orion.pardus.at":
                universe = "orion";
                break;
            case "artemis.pardus.at":
                universe = "artemis";
                break;
            case "pegasus.pardus.at":
                universe = "pegasus";
                break;
        }
    }

    function loadVariables() {
        magscoop_size = GM_getValue(universe + "_magscoop_size", 150);
        has_magscoop = GM_getValue(universe + "_has_magscoop", false);
        fuel_to_purchase = GM_getValue(universe + "_fuel_to_purchase", 5);
        fuel_space_left = GM_getValue(universe + "_fuel_space_left", 5);
        droid_wash_mode = GM_getValue(universe + "_droid_washing_mode_enabled", false);
        droid_wash_planet_m_enabled = GM_getValue(universe + "_droid_washing_planet_m_enabled", false);
        droid_wash_planet_i_enabled = GM_getValue(universe + "_droid_washing_planet_i_enabled", true);
        droid_wash_planet_d_enabled = GM_getValue(universe + "_droid_washing_planet_d_enabled", true);
        droid_wash_planet_g_enabled = GM_getValue(universe + "_droid_washing_planet_g_enabled", true);
        droid_wash_planet_r_enabled = GM_getValue(universe + "_droid_washing_planet_r_enabled", true);
        droid_wash_planet_a_enabled = GM_getValue(universe + "_droid_washing_planet_a_enabled", false);
        droid_wash_level = GM_getValue(universe + "_droid_washing_level", 20);
        magscoop_allowed = GM_getValue(universe + "_magscoop_allowed", defaults['use_magscoop']);
        preview = GM_getValue(universe + "_preview", true);
        auto_unload = GM_getValue(universe + "_auto_unload", true);
    }

    // Preload all the commodities into the right structure for use later
    function bootstrapCommodities() {
        for (var i = 0; i < items.length; i++) {
            commodities.push({
                item: items[i],
                id: i,
                min: 0,
                bal: 0,
                max: 0,
                buy_price: 0,
                sell_price: 0,
                ship_stock: 0,
                trade_stock: 0,
                buy_element: null,
                sell_element: null,
                sell: function (quantity) {
                    if (this.sell_element != null) {
                        this.sell_element.value = quantity;
                        updateSpace();
                    }
                },
                buy: function (quantity) {
                    if (this.buy_element != null) {
                        this.buy_element.value = quantity;
                        updateSpace();
                    } else {
                    }
                },
                sellValue: function() {
                    if (this.sell_element != null) {
                        if (!isNaN(this.sell_element.value) && (this.sell_element.value != "")) {
                            return parseInt(this.sell_element.value);
                        }
                    }
                    return 0;
                },
                buyValue: function() {
                    if (this.buy_element != null) {
                        if (!isNaN(this.buy_element.value) && (this.buy_element.value != "")) {
                            return parseInt(this.buy_element.value);
                        }
                    }
                    return 0;
                }
            });
        }
    }

    function findTransferButton() {

        var inputs = document.getElementsByTagName('input');

        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].value=="<- Transfer ->") {
                transfer_button = inputs[i];
            }
        }
    }
}