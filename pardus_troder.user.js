// ==UserScript==
// @name            Pardus Troder
// @namespace       Tro
// @author          Tro (Artemis)
// @version         1.6.2
// @description     Trading script to assist in the buying and selling on planets and starbases
// @include         *.pardus.at/starbase_trade.php
// @include         *.pardus.at/planet_trade.php
// @include         *.pardus.at/blackmarket.php
// @include         *.pardus.at/options.php
// @include         *.pardus.at/drop_cargo.php
// @downloadURL     https://github.com/Tro95/Pardus-Troder/raw/master/pardus_troder.user.js
// @updateURL       https://github.com/Tro95/Pardus-Troder/raw/master/pardus_troder.meta.js
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           unsafeWindow
// @require         https://gist.github.com/Tro95/3b102f4b834682bd2d2793b66e47845a/raw/pardus_options.js
// @require         https://github.com/Tro95/Pardus-Troder/raw/file-split/starbase.js
// @require         https://github.com/Tro95/Pardus-Troder/raw/file-split/planet.js
// @require         https://github.com/Tro95/Pardus-Troder/raw/file-split/blackmarket.js
// @require         https://github.com/Tro95/Pardus-Troder/raw/file-split/drop_cargo.js
// @require         https://github.com/Tro95/Pardus-Troder/raw/file-split/options.js
//
// ==/UserScript==

// v1.6.2 Fixed multibuy issue when minimum stock values were conflicting with amount attempting to be bought.
// v1.6.1 Fixed issue with values being calculated incorrectly if there was already values in the buy or sell elements
// v1.6   Added fuel dropping from the drop cargo screen
// v1.5.1 Fixed SB metal and ore buttons from unloading any metal and ore before rebuying it
// v1.5   Added R class planet buttons and extended black market buttons.
// v1.4   Migrated to the Pardus Options script, revamping the options page and adding additional options for droid washing
// v1.3   Added support for the black market
// v1.2.1 Fixed two semi-colon issues
// v1.2   New options tab and droid washing capabilities
// v1.1.1 Fixed a bug with preview on starbases
// v1.1   Added preview option
// v1.0   Initial script still with work to do

var version = GM_getValue('version', 0);
if (version < 1.2) {
    GM_setValue('version', 1.2);
}

var items = ['Food','Energy','Water','Animal embryos','Ore','Metal','Electronics','Robots','Heavy plastics','Hand weapons','Medicines','Nebula gas','Chemical supplies','Gem stones','Liquor','Hydrogen fuel','Exotic matter','Optical components','Radioactive cells','Droid modules','Bio-waste','Leech baby','Nutrient clods','Cybernetic X-993 Parts','X-993 Repair-Drone','Neural Stimulator','Battleweapon Parts','Slaves','Drugs','Package','Faction package','Explosives','VIP','Christmas Glitter','Military Explosives','Human intestines','Skaari limbs','Keldon brains','Rashkir bones','Exotic Crystal','Blue Sapphire jewels','Ruby jewels','Golden Beryl jewels','Stim Chip','Neural Tissue','Capri Stim','Crimson Stim','Amber Stim'];
var commodities = [];

var items_to_droidwash = ['Metal', 'Electronics', 'Heavy plastics', 'Hand weapons', 'Droid modules', 'Robots', 'Capri Stim', 'Battleweapon Parts', 'Slaves'];

var has_magscoop = false;
var magscoop_size = 0;

var ship_free_space = 0;
var magscoop_free_space = 0;
var total_free_space = 0;
var allowed_free_space = 0;
var magscoop_allowed = false;
var drugs_to_sell = 2;


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
                    to_sell += commodities[i].sellValue() * 1;
                }
            }
            if (commodities[i].trade_stock > commodities[i].min) {
                if (commodities[i].buyValue() != '') {
                    to_buy += commodities[i].buyValue() * 1;
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
            return this.ending_ship_space + this.ending_magscoop_space;
        } else {
            return this.ending_ship_space;
        }
    }
};

var buttons = {
    buttons_box: null,
    number_of_buttons: 0,
    createButtonsBox: function() {

        var buttons_box_html = '<div><table style="background:url(//static.pardus.at/img/std/bgd.gif)" width="90%" cellpadding="3" align="center"><tbody><tr><th>Troder Buttons</th></tr><tr><td><table align="center" width="90%" frame="box" style="border-style:dashed;border-color:yellow;" id="troder-options-box"><tbody><tr><td align="center">Unload ship:</td><td align="center"><input type="checkbox" id="autoUnload"></td></tr><tr><td align="center">Preview Trade:</td><td align="center"><input type="checkbox" id="troder-preview-trade"></td></tr></tbody></table></td></tr><tr><td><table align="center" width="90%" frame="box" style="border-style:dashed;border-color:yellow;border-spacing:10px;" id="troder-buttons-box"><tbody></tbody></table></td></tr></tbody></table></div>';

        transfer_button.parentNode.innerHTML = transfer_button.parentNode.innerHTML + buttons_box_html;

        this.buttons_box = document.getElementById("troder-buttons-box").lastChild;

        if (has_magscoop) {
            var magscoop_option = document.createElement('tr');
            magscoop_option.innerHTML = '<td align="center">Use Magscoop:</td><td align="center"><input type="checkbox" id="useMagScoop"></td>';

            document.getElementById('troder-options-box').appendChild(magscoop_option);

            if (magscoop_allowed) {
                document.getElementById("useMagScoop").checked = true;
            }

            document.getElementById('useMagScoop').addEventListener("click", isMagscoopAllowed, true);
        }

        if (preview) {
            document.getElementById("troder-preview-trade").checked = true;
        }

        if (auto_unload) {
            document.getElementById("autoUnload").checked = true;
        }

        document.getElementById('autoUnload').addEventListener("click", isAutoUnload, true);
        document.getElementById('troder-preview-trade').addEventListener("click", isPreview, true);

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
    }
};




bootstrap();

console.log(commodities);

if (document.location.pathname == '/options.php') {
    //placeOptions();
    troderOptions();
}

if (document.location.pathname == '/starbase_trade.php') {
    starbase();
}

if (document.location.pathname == '/planet_trade.php') {
    planet();
}

if (document.location.pathname == '/blackmarket.php') {
    blackmarket();
}

if (document.location.pathname == '/drop_cargo.php') {
    drop_cargo();
}



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
        magscoop_allowed = GM_getValue(universe + "_magscoop_allowed", false);
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

function setMagscoopSize(size) {
    magscoop_size = size;
    GM_setValue(universe + "_magscoop_size", size);
}

function setHasMagscoop(value) {
    has_magscoop = value;
    GM_setValue(universe + "_has_magscoop", value);
}

function ensureFuel() {
    if (commodities[items.indexOf("Hydrogen fuel")].ship_stock < fuel_space_left) {
        ensure_fuel_space = fuel_space_left - commodities[items.indexOf("Hydrogen fuel")].ship_stock - commodities[items.indexOf("Hydrogen fuel")].buyValue();
    }

    if (commodities[items.indexOf("Hydrogen fuel")].ship_stock < fuel_to_purchase) {
        attempt_buy("Hydrogen fuel", fuel_to_purchase - commodities[items.indexOf("Hydrogen fuel")].ship_stock);
        ensure_fuel_space = fuel_space_left - commodities[items.indexOf("Hydrogen fuel")].ship_stock - commodities[items.indexOf("Hydrogen fuel")].buyValue();
    }

    if (commodities[items.indexOf("Hydrogen fuel")].ship_stock > fuel_space_left) {
        attempt_sell("Hydrogen fuel", commodities[items.indexOf("Hydrogen fuel")].ship_stock - fuel_space_left);
        ensure_fuel_space = 0;
    }
}

function submitIfNotPreview() {
    if (!preview) {
        if (document.location.pathname == '/starbase_trade.php') {
            document.getElementsByName('starbase_trade')[0].submit();
        }

        if (document.location.pathname == '/planet_trade.php') {
            document.getElementById('planet_trade').submit();
        }

        if (document.location.pathname == '/blackmarket.php') {
            for (var i = 0; i < document.getElementsByTagName('input').length; i++) {
                if (document.getElementsByTagName('input')[i].value == '<- Transfer ->') {
                    document.getElementsByTagName('input')[i].click();
                }
            }
        }
    }
}

function updateSpace() {
    ship_space.calculateShipSpace();
}

function unload(excludes = []) {

    var i;

    if (auto_unload == false) {
        return;
    }

    if (typeof excludes !== 'undefined' && excludes.length > 0) {
        for (i = 0; i < items.length; i++) {
            if (excludes.indexOf(items[i]) == -1) {
                if (items[i] == "Hydrogen fuel") {
                    if (commodities[i].ship_stock > fuel_space_left) {
                        attempt_sell(items[i], commodities[i].ship_stock - fuel_space_left);
                    }
                } else {
                    if (commodities[i].ship_stock > 0) {
                        attempt_sell(items[i], commodities[i].ship_stock);
                    }
                }
            }

        }
    } else {
        for (i = 0; i < items.length; i++) {
            if (commodities[i].ship_stock > 0 && items[i] != "Hydrogen fuel") {
                attempt_sell(commodities[i].item, commodities[i].ship_stock);
            } else if (commodities[i].item == "Hydrogen fuel" && commodities[i].ship_stock > fuel_space_left) {
                attempt_sell(commodities[i].item, commodities[i].ship_stock - fuel_space_left);
            }
        }
    }

    updateSpace();
}

function reset() {
    for (var i = 0; i < items.length; i++) {
        if (commodities[i].ship_stock > 0) {
            if (commodities[i].sellValue() != '') {
                commodities[i].sell('');
            }
        }
        if (commodities[i].trade_stock > commodities[i].min) {
            if (commodities[i].buyValue() != '') {
                commodities[i].buy('');
            }
        }
    }

    updateSpace();
}

function attempt_sell(item, quantity) {

    commodities[items.indexOf(item)].sell('');

    if (quantity < 1) {
        return;
    }

    var commodity = commodities[items.indexOf(item)];
    var attempted_quantity = quantity;

    // Do we actually have enough to sell?
    if (commodity.ship_stock < attempted_quantity) {
        attempted_quantity = commodity.ship_stock;
    }

    // Is there enough building space? If not, reduce the amount we will sell.
    if (building_space < attempted_quantity) {
        attempted_quantity = building_space;
    }

    // Do the maxes allow us to sell this much?
    if ((commodity.max - commodity.trade_stock) < attempted_quantity) {
        attempted_quantity = commodity.max - commodity.trade_stock;
    }

    if (attempted_quantity < 1) {
        return;
    }

    commodity.sell(attempted_quantity);
    allowed_free_space += attempted_quantity;
    building_space -= attempted_quantity;
    updateSpace();
}

function attempt_buy(item, quantity) {

    if (quantity < 1) {
        return 0;
    }

    var commodity = commodities[items.indexOf(item)];
    var attempted_quantity = quantity;

    if (commodity.trade_stock < commodity.min) {
        return 0;
    }
    attempted_quantity += commodity.buyValue();
    commodity.buy('');
    if (item != "Hydrogen fuel") {
        // Is there enough ship space? If not, reduce the amount we will buy.
        if ((ship_space.allowedSpace() - ensure_fuel_space) < attempted_quantity) {
            attempted_quantity = ship_space.allowedSpace() - ensure_fuel_space;
        }
    } else {
        // Is there enough ship space? If not, reduce the amount we will buy.
        if (ship_space.allowedSpace() < attempted_quantity) {
            attempted_quantity = ship_space.allowedSpace();
        }
    }

    // Do the mins allow us to buy this much?
    if ((commodity.trade_stock - commodity.min) < attempted_quantity) {
        attempted_quantity = commodity.trade_stock - commodity.min;
    }

    if (attempted_quantity < 1) {
        return 0;
    }

    commodity.buy(attempted_quantity);
    building_space += attempted_quantity;
    updateSpace();

    return attempted_quantity;
}






function scrubData(data) {
    if (data.search(/,/) != -1) {
        data = data.replace(/,/,'');
    }

    if (data.search(/\+/g) != -1) {
        data = 0;
    } else if (data.search(/-/) != -1) {
        data = data.replace('-','');
    } else if (data.search(/t/) != -1) {
        data = data.replace('t','');
    }

    data = data * 1;

    return data;
}