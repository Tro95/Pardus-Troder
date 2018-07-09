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







function starbase() {
    var sell_table;
    var buy_table;
    var player_owned = false;

    findStarbaseTables();
    parseStarbaseTables();
    addButtons();
    addKeyBindings();

    function findStarbaseTables() {

        var tables_with_headers = document.getElementsByTagName('TH');

        for (var i = 0; i < tables_with_headers.length; i++) {
            var table_to_search = tables_with_headers[i];

            if (table_to_search.innerHTML == 'Price&nbsp;(sell)') {
                sell_table = table_to_search.parentNode.parentNode;
            }

            if (table_to_search.innerHTML == 'Price&nbsp;(buy)') {
                buy_table = table_to_search.parentNode.parentNode;
            }

            if (table_to_search.innerHTML == 'Min') {
                player_owned = true;
            }
        }
    }

    function parseStarbaseTables() {
        var i = 0;
        var cell = null;
        var item_number = null;

        for(i = 0; i < sell_table.getElementsByTagName('TD').length; i++) {

            cell = sell_table.getElementsByTagName('TD')[i];
            item_number = items.indexOf(cell.textContent);

            if (item_number != -1) {

                // Get shipStock and sell price values
                commodities[item_number].ship_stock = scrubData(cell.nextSibling.nextSibling.textContent);
                commodities[item_number].sell_price = scrubData(cell.nextSibling.nextSibling.nextSibling.textContent);
                commodities[item_number].sell_element = cell.nextSibling.nextSibling.nextSibling.nextSibling.lastChild;

                // insert id tag into commodity name cell
                //cell.innerHTML = "<a id = 'sell" + item_number + "'>" + cell.innerHTML + "</a>";
            }

            // Search for available Space in ship.
            if (cell.innerHTML == 'free&nbsp;space:') {

                ship_space_location = cell.nextSibling;
                ship_space_location_top = ship_space_location.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.firstChild.lastChild.previousSibling.previousSibling;
                ship_space_location_top.innerHTML = 'Free Space: ' + ship_space_location.innerHTML;

                // Do they have a magscoop?
                if (ship_space_location.innerHTML.indexOf('+') != -1) {

                    var tmp_free_space = ship_space_location.innerHTML.split('+');
                    setHasMagscoop(true);

                    ship_free_space = scrubData(tmp_free_space[0]);
                    magscoop_free_space = scrubData(tmp_free_space[1]);

                    ship_space.starting_ship_space = ship_free_space;
                    ship_space.starting_magscoop_space = magscoop_free_space;

                    if (magscoop_free_space > 150) {
                        setMagscoopSize(250);
                    } else if (ship_free_space > 0) {
                        setMagscoopSize(150);
                    }

                } else {
                    ship_free_space = scrubData(ship_space_location.innerHTML.substr(0,cell.nextSibling.innerHTML.length - 1));
                    ship_space.starting_ship_space = ship_free_space;
                    setHasMagscoop(false);
                }

                allowed_free_space = ship_free_space + magscoop_free_space - magscoop_size;

                if (magscoop_allowed) {
                    allowed_free_space += magscoop_size;
                }
            }
        }

        // Get info from ship side table and store into "commodity"
        for(i = 0; i < buy_table.getElementsByTagName('TD').length; i++) {

            cell = buy_table.getElementsByTagName('TD')[i];
            item_number = items.indexOf(cell.textContent);

            if (item_number != -1) {

                // Get building stock price values for Player Starbase
                if (player_owned) {

                    commodities[item_number].trade_stock = scrubData(cell.nextSibling.textContent);
                    commodities[item_number].min = scrubData(cell.nextSibling.nextSibling.nextSibling.textContent);
                    commodities[item_number].max = scrubData(cell.nextSibling.nextSibling.nextSibling.nextSibling.textContent);
                    commodities[item_number].buy_price = scrubData(cell.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.lastChild.textContent);
                    commodities[item_number].buy_element = cell.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.lastChild;

                    //      alert('PS St:' + buildingStock[item_number] + ' Mi:' + min[item_number] + ' Ma:' + max[item_number] + ' Pr:' + buyPrice[item_number]);
                }

                // Get info for planet/NPC SB
                else {

                    commodities[item_number].trade_stock = scrubData(cell.nextSibling.textContent);
                    commodities[item_number].bal = scrubData(cell.nextSibling.nextSibling.textContent);
                    commodities[item_number].max = scrubData(cell.nextSibling.nextSibling.nextSibling.textContent);
                    commodities[item_number].buy_price = scrubData(cell.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.lastChild.textContent);
                    commodities[item_number].min = commodities[item_number].bal;
                    commodities[item_number].buy_element = cell.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.lastChild;

                }

                // insert id tag into commodity name cell
                //cell.innerHTML = cell.innerHTML.replace(cell.textContent, "<a id = 'buy" + item_number + "'>" + cell.textContent + "</a>");

            }

            // Search for available Space in building.
            if (cell.innerHTML == 'free&nbsp;space:') {

                building_space_location = cell.nextSibling;
                building_space = scrubData(building_space_location.innerHTML.substring(0,cell.nextSibling.innerHTML.length - 1));

            }
        }
    }

    function addKeyBindings() {
        sell_table.addEventListener('keyup',updateSpace,true);
        sell_table.addEventListener('click',updateSpace,true);
        buy_table.addEventListener('keyup',updateSpace,true);
        buy_table.addEventListener('click',updateSpace,true);

        /*for (var i = 0; i < items.length; i++) {
            if (commodities[i].ship_stock > 0) {
                commodities[i].sell_element.addEventListener('keyup',function(){ship_space.calculateShipSpace();}, true);
            }
            if (commodities[i].trade_stock > commodities[i].min) {
                commodities[i].buy_element.addEventListener('keyup',function(){ship_space.calculateShipSpace();}, true);
            }
        }*/

    }

    function addButtons() {

        buttons.createButtonsBox();
        buttons.addButton("Planet Run", loadPlanet);
        buttons.addButton("Load Robots", loadRobots);
        buttons.addButton("Load MO", function() {loadMultiBuy("sb_mo_materials", ["Metal", "Ore"]);});
        buttons.addButton("Load Metal", function() {unload(["Metal"]);ensureFuel();attempt_buy("Metal", ship_space.allowedSpace());submitIfNotPreview();});
        buttons.addButton("Load Ore", function() {unload(["Ore"]);ensureFuel();attempt_buy("Ore", ship_space.allowedSpace());submitIfNotPreview();});
        buttons.addStandardButtons();
    }

    function loadPlanet() {
        unload(["Energy"]);
        ensureFuel();
        attempt_buy("Energy", ship_space.allowedSpace());
        submitIfNotPreview();
    }

    function loadRobots() {
        unload(["Robots"]);
        ensureFuel();
        attempt_buy("Robots", ship_space.allowedSpace());
        submitIfNotPreview();
    }
}





function planet() {
    var sell_table;
    var buy_table;
    var planet_type;

    identifyPlanet();
    findPlanetTables();
    parsePlanetTables();
    addButtons();
    addKeyBindings();

    function identifyPlanet() {

        var planet_image = document.getElementsByTagName('img')[3].src.split('/');
        var image_string = planet_image[planet_image.length - 1];

        switch (image_string) {
            case "planet_i.png":
                this.planet_type = "i";
                break;
            case "planet_r.png":
                this.planet_type = "r";
                break;
            case "planet_m.png":
                this.planet_type = "m";
                break;
            case "planet_a.png":
                this.planet_type = "a";
                break;
            default:
                this.planet_type = "m";
        }
    }

    function findPlanetTables() {

        var tables_with_headers = document.getElementsByTagName('TH');

        for (var i = 0; i < tables_with_headers.length; i++) {
            var table_to_search = tables_with_headers[i];

            if (table_to_search.innerHTML == 'Price&nbsp;(sell)') {
                sell_table = table_to_search.parentNode.parentNode;
            }

            if (table_to_search.innerHTML == 'Price&nbsp;(buy)') {
                buy_table = table_to_search.parentNode.parentNode;
            }
        }
    }

    function parsePlanetTables() {
        var i = 0;
        var cell = null;
        var item_number = null;

        for(i = 0; i < sell_table.getElementsByTagName('TD').length; i++) {

            cell = sell_table.getElementsByTagName('TD')[i];
            item_number = items.indexOf(cell.textContent);

            if (item_number != -1) {

                // Get shipStock and sell price values
                commodities[item_number].ship_stock = scrubData(cell.nextSibling.nextSibling.textContent);
                commodities[item_number].sell_price = scrubData(cell.nextSibling.nextSibling.nextSibling.textContent);
                commodities[item_number].sell_element = cell.nextSibling.nextSibling.nextSibling.nextSibling.lastChild;

            }

            // Search for available Space in ship.
            if (cell.innerHTML == 'free&nbsp;space:') {

                ship_space_location = cell.nextSibling;
                ship_space_location_top = ship_space_location.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.firstChild.lastChild.previousSibling.previousSibling;
                ship_space_location_top.innerHTML = 'Free Space: ' + ship_space_location.innerHTML;

                // Do they have a magscoop?
                if (ship_space_location.innerHTML.indexOf('+') != -1) {

                    var tmp_free_space = ship_space_location.innerHTML.split('+');
                    setHasMagscoop(true);

                    ship_free_space = scrubData(tmp_free_space[0]);
                    magscoop_free_space = scrubData(tmp_free_space[1]);

                    ship_space.starting_ship_space = ship_free_space;
                    ship_space.starting_magscoop_space = magscoop_free_space;

                    if (magscoop_free_space > 150) {
                        setMagscoopSize(250);
                    } else if (ship_free_space > 0) {
                        setMagscoopSize(150);
                    }

                } else {
                    ship_free_space = scrubData(ship_space_location.innerHTML.substr(0,cell.nextSibling.innerHTML.length - 1));
                    ship_space.starting_ship_space = ship_free_space;
                    setHasMagscoop(false);
                }

                allowed_free_space = ship_free_space + magscoop_free_space - magscoop_size;

                if (magscoop_allowed) {
                    allowed_free_space += magscoop_size;
                }
            }
        }

        // Get info from ship side table and store into "commodity"
        for(i = 0; i < buy_table.getElementsByTagName('TD').length; i++) {

            cell = buy_table.getElementsByTagName('TD')[i];
            item_number = items.indexOf(cell.textContent);

            if (item_number != -1) {

                commodities[item_number].trade_stock = scrubData(cell.nextSibling.textContent);
                commodities[item_number].bal = scrubData(cell.nextSibling.nextSibling.textContent);
                commodities[item_number].max = scrubData(cell.nextSibling.nextSibling.nextSibling.textContent);
                commodities[item_number].buy_price = scrubData(cell.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.lastChild.textContent);
                commodities[item_number].min = commodities[item_number].bal;
                commodities[item_number].buy_element = cell.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.lastChild;

            }

            // Search for available Space in building.
            if (cell.innerHTML == 'free&nbsp;space:') {

                building_space_location = cell.nextSibling;
                building_space = scrubData(building_space_location.innerHTML.substring(0,cell.nextSibling.innerHTML.length - 1));

            }
        }
    }

    function addKeyBindings() {
        sell_table.addEventListener('keyup',updateSpace,true);
        sell_table.addEventListener('click',updateSpace,true);
        buy_table.addEventListener('keyup',updateSpace,true);
        buy_table.addEventListener('click',updateSpace,true);

        /*for (var i = 0; i < items.length; i++) {
            if (commodities[i].ship_stock > 0) {
                commodities[i].sell_element.addEventListener('keyup',function(){ship_space.calculateShipSpace();}, true);
            }
            if (commodities[i].trade_stock > commodities[i].min) {
                commodities[i].buy_element.addEventListener('keyup',function(){ship_space.calculateShipSpace();}, true);
            }
        }*/

    }

    function addButtons() {

        buttons.createButtonsBox();

        if (droid_wash_mode) {
            if (GM_getValue(universe + "_droid_washing_planet_" + this.planet_type + "_enabled", false) == true) {
                if (isReadyToDroidWash()) {
                    droidWash();
                    buttons.addButton("Stop Droid Wash", endDroidWash);
                } else {
                    buttons.addButton("Start Droid Wash", droidWash);
                }
            }
        }

        switch(this.planet_type) {
            case "a":
            case "m":
                buttons.addButton("Starbase Run", loadStarbase);
                buttons.addButton("Stock Run", loadStockRun);
                buttons.addButton("Load Food", loadFood);
                buttons.addButton("Load Water", function() {unload(["Water"]);ensureFuel();attempt_buy("Water", ship_space.allowedSpace());submitIfNotPreview();});
                break;
            case "i":
                buttons.addButton("Planet Run", function() {unload(["Food","Water"]);ensureFuel();attempt_buy("Water", ship_space.allowedSpace());submitIfNotPreview();});
                buttons.addButton("Load Water", function() {unload(["Water"]);ensureFuel();attempt_buy("Water", ship_space.allowedSpace());submitIfNotPreview();});
                break;
            case "r":
                buttons.addButton("Combo Run", function() {loadMultiBuy("planet_r_combo", ["Animal embryos", "Metal", "Ore", "Radioactive cells"], [10,5,15,1]);});
                buttons.addButton("Load Embryos", function() {unload(["Animal embryos"]);ensureFuel();attempt_buy("Animal embryos", ship_space.allowedSpace());submitIfNotPreview();});
                buttons.addButton("Load Metal", function() {unload(["Metal"]);ensureFuel();attempt_buy("Metal", ship_space.allowedSpace());submitIfNotPreview();});
                buttons.addButton("Load Ore", function() {unload(["Ore"]);ensureFuel();attempt_buy("Ore", ship_space.allowedSpace());submitIfNotPreview();});
                buttons.addButton("Load Rads", function() {unload(["Radioactive cells"]);ensureFuel();attempt_buy("Radioactive cells", ship_space.allowedSpace());submitIfNotPreview();});
                break;
            default:
                break;
        }

        buttons.addStandardButtons();
    }

    function loadStarbase() {
        unload(["Food", "Water"]);
        ensureFuel();

        var total_carry = GM_getValue(universe + "_total_carry", 0);
        var food_carry = 0;
        var water_carry = 0;

        var left_over = (ship_space.allowedSpace() - ensure_fuel_space + commodities[items.indexOf("Food")].ship_stock + commodities[items.indexOf("Water")].ship_stock) % 5; 
        var one_fifth = Math.floor((ship_space.allowedSpace() - ensure_fuel_space - left_over + commodities[items.indexOf("Food")].ship_stock + commodities[items.indexOf("Water")].ship_stock) / 5);

        GM_setValue(universe + "_total_carry", (total_carry + left_over) % 5);

        while (left_over > 0) {
            if (((total_carry + left_over) % 5) < 3) {
                food_carry++;
            } else {
                water_carry++;
            }
            left_over--;
        }

        // Is there even enough food to buy?
        if ((commodities[items.indexOf("Food")].trade_stock - commodities[items.indexOf("Food")].min) < (3 * one_fifth + food_carry - commodities[items.indexOf("Food")].ship_stock)) {
            water_carry = 999;
        }
        // Is there even enough water to buy?
        if ((commodities[items.indexOf("Water")].trade_stock - commodities[items.indexOf("Water")].min) < (2 * one_fifth + food_carry - commodities[items.indexOf("Water")].ship_stock)) {
            food_carry = 999;
        }

        attempt_buy("Food", 3 * one_fifth + food_carry - commodities[items.indexOf("Food")].ship_stock);
        attempt_buy("Water", 2 * one_fifth + water_carry - commodities[items.indexOf("Water")].ship_stock);
        submitIfNotPreview();
    }

    function loadStockRun() {
        unload(["Food", "Water"]);
        ensureFuel();

        var total_carry = GM_getValue(universe + "_stock_run_carry", 0);
        var food_carry = 0;
        var water_carry = 0;

        var left_over = (ship_space.allowedSpace() - ensure_fuel_space + commodities[items.indexOf("Food")].ship_stock + commodities[items.indexOf("Water")].ship_stock) % 2;
        var one_half = Math.floor((ship_space.allowedSpace() - ensure_fuel_space - left_over + commodities[items.indexOf("Food")].ship_stock + commodities[items.indexOf("Water")].ship_stock) / 2);

        GM_setValue(universe + "_stock_run_carry", (total_carry + left_over) % 2);

        while (left_over > 0) {
            if (((total_carry + left_over) % 2) < 1) {
                food_carry++;
            } else {
                water_carry++;
            }
            left_over--;
        }

        // Is there even enough food to buy?
        if ((commodities[items.indexOf("Food")].trade_stock - commodities[items.indexOf("Food")].min) < (one_half + food_carry - commodities[items.indexOf("Food")].ship_stock)) {
            water_carry = 999;
        }
        // Is there even enough water to buy?
        if ((commodities[items.indexOf("Water")].trade_stock - commodities[items.indexOf("Water")].min) < (one_half + food_carry - commodities[items.indexOf("Water")].ship_stock)) {
            water_carry = 999;
        }

        attempt_buy("Food", one_half + food_carry - commodities[items.indexOf("Food")].ship_stock);
        attempt_buy("Water", one_half + water_carry - commodities[items.indexOf("Water")].ship_stock);

        submitIfNotPreview();
    }

    function loadFood() {
        unload(["Food"]);
        ensureFuel();
        attempt_buy("Food", ship_space.allowedSpace());
        submitIfNotPreview();
    }

    function droidWash() {
        var i;
        unload(items_to_droidwash);
        ensureFuel();

        if (isReadyToDroidWash()) {
            for (i = 0; i < items_to_droidwash.length; i++) {
                attempt_sell(items_to_droidwash[i], 999);
                attempt_buy(items_to_droidwash[i], 999);
                commodities[items.indexOf(items_to_droidwash[i])].buy(parseInt(commodities[items.indexOf(items_to_droidwash[i])].buyValue()) + parseInt(commodities[items.indexOf(items_to_droidwash[i])].sellValue()) - 1);
            }
        } else {
            for (i = 0; i < items_to_droidwash.length; i++) {
                attempt_sell(items_to_droidwash[i], commodities[items.indexOf(items_to_droidwash[i])].bal - commodities[items.indexOf(items_to_droidwash[i])].trade_stock + 1);
            }
        }
    }

    function endDroidWash() {
        reset();
        ensureFuel();

        for (var i = 0; i < items_to_droidwash.length; i++) {
            attempt_buy(items_to_droidwash[i], 999);
        }

        submitIfNotPreview();
    }

    function isReadyToDroidWash() {
        for (var i = 0; i < items_to_droidwash.length; i++) {
            if (commodities[items.indexOf(items_to_droidwash[i])].buy_element == null && commodities[items.indexOf(items_to_droidwash[i])].sell_element != null) {
                console.log(items_to_droidwash[i]);
                return false;
            }
        }
        return true;
    }
}





function blackmarket() {
    var sell_table = null;
    var buy_table = null;

    findBlackmarketTables();
    parseBlackmarketTables();
    addButtons();
    addKeyBindings();

    function findBlackmarketTables() {

        var tables_with_headers = document.getElementsByTagName('TH');

        for (var i = 0; i < tables_with_headers.length; i++) {
            var table_to_search = tables_with_headers[i];

            if (table_to_search.innerHTML == 'Price (sell)') {
                sell_table = table_to_search.parentNode.parentNode;
            }

            if (buy_table == null && table_to_search.innerHTML == 'Price (buy)') {
                buy_table = table_to_search.parentNode.parentNode;
            }
        }
    }

    function parseBlackmarketTables() {

        var i, cell, item_number;

        for(i = 0; i < sell_table.getElementsByTagName('TD').length; i++) {

            cell = sell_table.getElementsByTagName('TD')[i];
            item_number = items.indexOf(cell.textContent);

            if (item_number != -1) {

                // Get shipStock and sell price values
                commodities[item_number].ship_stock = scrubData(cell.nextSibling.nextSibling.textContent);
                commodities[item_number].sell_price = scrubData(cell.nextSibling.nextSibling.nextSibling.textContent);
                commodities[item_number].sell_element = cell.nextSibling.nextSibling.nextSibling.nextSibling.lastChild;
                // insert id tag into commodity name cell
                //cell.innerHTML = "<a id = 'sell" + item_number + "'>" + cell.innerHTML + "</a>";
            }

            // Search for available Space in ship.
            if (cell.innerHTML == 'free&nbsp;space:') {

                ship_space_location = cell.nextSibling;
                ship_space_location_top = ship_space_location.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.firstChild.lastChild.previousSibling.previousSibling;
                ship_space_location_top.innerHTML = 'Free Space: ' + ship_space_location.innerHTML;

                // Do they have a magscoop?
                if (ship_space_location.innerHTML.indexOf('+') != -1) {

                    var tmp_free_space = ship_space_location.innerHTML.split('+');
                    setHasMagscoop(true);

                    ship_free_space = scrubData(tmp_free_space[0]);
                    magscoop_free_space = scrubData(tmp_free_space[1]);

                    ship_space.starting_ship_space = ship_free_space;
                    ship_space.starting_magscoop_space = magscoop_free_space;

                    if (magscoop_free_space > 150) {
                        setMagscoopSize(250);
                    } else if (ship_free_space > 0) {
                        setMagscoopSize(150);
                    }

                } else {
                    ship_free_space = scrubData(ship_space_location.innerHTML.substr(0,cell.nextSibling.innerHTML.length - 1));
                    ship_space.starting_ship_space = ship_free_space;
                    setHasMagscoop(false);
                }

                allowed_free_space = ship_free_space + magscoop_free_space - magscoop_size;

                if (magscoop_allowed) {
                    allowed_free_space += magscoop_size;
                }
            }
        }

        // Get info from ship side table and store into "commodity"
        for(i = 0; i < buy_table.getElementsByTagName('TD').length; i++) {

            cell = buy_table.getElementsByTagName('TD')[i];
            item_number = items.indexOf(cell.textContent);

            if (item_number != -1) {
                commodities[item_number].trade_stock = 999 //scrubData(cell.nextSibling.textContent);
                commodities[item_number].bal = 0 //scrubData(cell.nextSibling.nextSibling.textContent);
                commodities[item_number].max = 1999 //scrubData(cell.nextSibling.nextSibling.nextSibling.textContent);
                commodities[item_number].buy_price = scrubData(cell.nextSibling.nextSibling.lastChild.textContent);
                commodities[item_number].min = 0 //commodities[item_number].bal;
                commodities[item_number].buy_element = cell.nextSibling.nextSibling.nextSibling.lastChild;
                // Check if there's a shortage
                if (commodities[item_number].buy_element == null) {
                    commodities[item_number].trade_stock = 0;
                }

                // insert id tag into commodity name cell
                //cell.innerHTML = cell.innerHTML.replace(cell.textContent, "<a id = 'buy" + item_number + "'>" + cell.textContent + "</a>");

            }

            // Search for available Space in building.
            if (cell.innerHTML == 'free&nbsp;space:') {

                building_space_location = cell.nextSibling;
                building_space = scrubData(building_space_location.innerHTML.substring(0,cell.nextSibling.innerHTML.length - 1));

            }
        }
    }

    function addKeyBindings() {
        sell_table.addEventListener('keyup',updateSpace,true);
        sell_table.addEventListener('click',updateSpace,true);
        buy_table.addEventListener('keyup',updateSpace,true);
        buy_table.addEventListener('click',updateSpace,true);

        /*for (var i = 0; i < items.length; i++) {
            if (commodities[i].ship_stock > 0) {
                commodities[i].sell_element.addEventListener('keyup',function(){ship_space.calculateShipSpace();}, true);
            }
            if (commodities[i].trade_stock > commodities[i].min) {
                commodities[i].buy_element.addEventListener('keyup',function(){ship_space.calculateShipSpace();}, true);
            }
        }*/

    }

    function addButtons() {

        buttons.createButtonsBox();
        //buttons.addButton("Planet Run", loadPlanet);
        //buttons.addButton("Load Robots", loadRobots);
        buttons.addButton("Load MOE", function() {loadMultiBuy("bm_construction_materials", ["Energy", "Metal", "Ore"]);});
        buttons.addButton("Load Energy", function() {unload(["Energy"]);ensureFuel();attempt_buy("Energy", ship_space.allowedSpace());submitIfNotPreview();});
        buttons.addButton("Load Metal", function() {unload(["Metal"]);ensureFuel();attempt_buy("Metal", ship_space.allowedSpace());submitIfNotPreview();});
        buttons.addButton("Load Ore", function() {unload(["Ore"]);ensureFuel();attempt_buy("Ore", ship_space.allowedSpace());submitIfNotPreview();});
        buttons.addButton("Sell Drugs", unloadDrugs);
        buttons.addStandardButtons();
    }

    function unloadDrugs() {
        ensureFuel();
        attempt_sell("Drugs", drugs_to_sell);
        submitIfNotPreview();
    }

    function loadConstructionMaterials() {
        unload(["Metal", "Ore", "Energy"]);
        ensureFuel();

        var total_carry = GM_getValue(universe + "_bm_construction_carry", 0);
        var energy_carry = 0;
        var metal_carry = 0;
        var ore_carry = 0;

        var left_over = (ship_space.allowedSpace() - ensure_fuel_space + commodities[items.indexOf("Energy")].ship_stock + commodities[items.indexOf("Metal")].ship_stock + commodities[items.indexOf("Ore")].ship_stock) % 3;
        var one_third = Math.floor((ship_space.allowedSpace() - ensure_fuel_space - left_over + commodities[items.indexOf("Energy")].ship_stock + commodities[items.indexOf("Metal")].ship_stock + commodities[items.indexOf("Ore")].ship_stock) / 3);

        GM_setValue(universe + "_bm_construction_carry", (total_carry + left_over) % 5);

        while (left_over > 0) {
            switch ((total_carry + left_over) % 3) {
                case 0:
                    energy_carry++;
                    break;
                case 1:
                    metal_carry++;
                    break;
                case 2:
                    ore_carry++;
                    break;
            }
            left_over--;
        }

        // Is there a shortage?
        if ((commodities[items.indexOf("Energy")].trade_stock - commodities[items.indexOf("Energy")].min) < (one_third + energy_carry - commodities[items.indexOf("Energy")].ship_stock)) {
            //water_carry = 999;
        }
        // Is there a shortage?
        //if ((commodities[items.indexOf("Water")].trade_stock - commodities[items.indexOf("Water")].min) < (2 * one_fifth + food_carry - commodities[items.indexOf("Water")].ship_stock)) {
            //food_carry = 999;
        //}

        //attempt_buy("Food", 3 * one_fifth + food_carry - commodities[items.indexOf("Food")].ship_stock);
        //attempt_buy("Water", 2 * one_fifth + water_carry - commodities[items.indexOf("Water")].ship_stock);
        submitIfNotPreview();
    }
}


function drop_cargo() {
    var drop_table;

    findTables();
    parseDropCargoTables();
    autodropFuel();

    function findTables() {
        var tables_with_headers = document.getElementsByTagName('TH');
        for (var i = 0; i < tables_with_headers.length; i++) {
            var table_to_search = tables_with_headers[i];
            if (table_to_search.innerHTML == 'Resource') {
                drop_table = table_to_search.parentNode.parentNode;
            }
        }
    }

    function parseDropCargoTables() {
        for(var i = 0; i < drop_table.getElementsByTagName('TD').length; i++) {
            var cell = drop_table.getElementsByTagName('TD')[i];
            var item_number = items.indexOf(cell.textContent);
            if (item_number != -1) {
                commodities[item_number].ship_stock = scrubData(cell.nextSibling.textContent);
                commodities[item_number].sell_element = cell.nextSibling.nextSibling.lastChild;
            }
        }
    }

    function autodropFuel() {
        if (commodities[items.indexOf("Hydrogen fuel")].ship_stock > fuel_space_left) {
            commodities[items.indexOf("Hydrogen fuel")].sell(commodities[items.indexOf("Hydrogen fuel")].ship_stock - fuel_space_left);
        }
    }
}

function loadMultiBuy(save_string, items_to_buy = [], ratios = []) {
    var i = 0;
    // Do we actually have items to buy?
    if (typeof items_to_buy !== 'undefined' && items_to_buy.length > 0) {
        unload(items_to_buy);
        ensureFuel();
        var total_carry = GM_getValue(universe + "_" + save_string + "_total_carry", 0);
        if (isNaN(total_carry)) {
            total_carry = 0;
        }
        var max_ratio = 0;
        var cumulative_ratios = []
        // Have we been provided a ratio to fit them into, or do we just assume equal ratio?
        if (typeof ratios == 'undefined' || ratios.length != items_to_buy.length) {
            ratios = [];
            for (i = 0; i < items_to_buy.length; i++) {
                ratios.push(1);
                cumulative_ratios.push(i);
            }
            max_ratio = ratios.length;
        } else {
            // Ensure all the ratios are sensible
            for (i = 0; i < items_to_buy.length; i++) {
                if (ratios[i] < 1) {
                    ratios[i] = 1;
                }
                cumulative_ratios.push(max_ratio);
                max_ratio += ratios[i];
            }
        }
        // Check that all items are in stock
        for (i = 0; i < items_to_buy.length; i++) {
            if (commodities[items.indexOf(items_to_buy[i])].trade_stock - commodities[items.indexOf(items_to_buy[i])].min < 1) {
                console.log("i: " + i + " - Splicing " + items_to_buy[i]);
                items_to_buy.splice(i, 1);
                max_ratio -= ratios[i];
                ratios.splice(i, 1);
                i--;
            }
        }
        // How many of the needed items do we currently have?
        var current_ship_stock = 0;
        for (i = 0; i < items_to_buy.length; i++) {
            current_ship_stock += commodities[items.indexOf(items_to_buy[i])].ship_stock;
        }
        var total_left_over = ship_space.allowedSpace() - ensure_fuel_space + current_ship_stock;
        var left_over = total_left_over % max_ratio;
        var one_portion = Math.floor((total_left_over - left_over) / max_ratio);
        GM_setValue(universe + "_" + save_string + "_total_carry", (total_carry + left_over) % max_ratio);
        // Set up how many of each item we need to carry over
        var item_carries = [];
        console.log("Max ratio is: " + max_ratio);
        for (i = 0; i < items_to_buy.length; i++) {
            item_carries.push(0);
        }
        // Work out how many items we are carrying over
        while (left_over > 0) {
            for (i = 0; i < items_to_buy.length; i++) {
                if ((total_carry + left_over) % max_ratio <= cumulative_ratios[i]) {
                    item_carries[i]++;
                    break;
                }
            }
            left_over--;
        }
        var tmp_items_to_buy = items_to_buy;
        var tmp_item_ratios = ratios;
        var try_again = false;
        for (i = 0; i < items_to_buy.length; i++) {
            var num_to_try_and_buy = ratios[i] * one_portion + item_carries[i] - commodities[items.indexOf(items_to_buy[i])].ship_stock;
            var num_already_being_bought = commodities[items.indexOf(items_to_buy[i])].buyValue();
            var num_actually_bought = attempt_buy(items_to_buy[i], num_to_try_and_buy);
            if ((num_to_try_and_buy + num_already_being_bought) != num_actually_bought) {
                try_again = true;
                tmp_items_to_buy.splice(i, 1);
                tmp_item_ratios.splice(i, 1);
            }
        }
        if (try_again) {
            loadMultiBuy(save_string, tmp_items_to_buy, tmp_item_ratios);
        }
        submitIfNotPreview();
    }
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
        var droid_washing_inner_html = `<tr><td>The droid washing mode is something that you can activate to assist in droid washing. If you are not actively droid washing it is recommended you disable droid washing mode. These options control how the droid washing mode works.</td></tr><tr> <td> <table> <tbody> <tr> <td>Enable Droid Washing Mode:</td><td> <input id="troder-droid-washing-mode-enabled" type="checkbox"> </td></tr></tbody> </table> </td></tr><tr><td><table><tbody><tr><td>Planets:</td><td><table><tbody> <tr> <td><input id="troder-droid-washing-m-planet-enabled" type="checkbox"> <label>M Class</label></td><td><input id="troder-droid-washing-i-planet-enabled" type="checkbox"> <label>I Class</label></td><td><input id="troder-droid-washing-d-planet-enabled" type="checkbox"> <label>D Class</label></td></tr><tr> <td><input id="troder-droid-washing-g-planet-enabled" type="checkbox"> <label>G Class</label></td><td><input id="troder-droid-washing-r-planet-enabled" type="checkbox"> <label>R Class</label></td><td><input id="troder-droid-washing-a-planet-enabled" type="checkbox"> <label>A Class</label></td></tr></tbody> </table></td></tr></tbody></table></td></tr><tr> <td align="right"> <input value="Save" id="troder-droid-washing-save" type="button"> </td></tr>`;
        droid_washing_options_box.inner_html = droid_washing_inner_html;
        droid_washing_options_box.refreshElement();

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

        function saveDroidWashingOptions() {
            var droid_wash_enabled = document.getElementById('troder-droid-washing-mode-enabled').checked;
            var planet_m = document.getElementById('troder-droid-washing-m-planet-enabled').checked;
            var planet_i = document.getElementById('troder-droid-washing-i-planet-enabled').checked;
            var planet_d = document.getElementById('troder-droid-washing-d-planet-enabled').checked;
            var planet_g = document.getElementById('troder-droid-washing-g-planet-enabled').checked;
            var planet_r = document.getElementById('troder-droid-washing-r-planet-enabled').checked;
            var planet_a = document.getElementById('troder-droid-washing-a-planet-enabled').checked;
            //var fuel_to_purchase = document.getElementById('troder-options-fuel-purchase').value;
            GM_setValue(universe + '_droid_washing_mode_enabled', droid_wash_enabled);
            GM_setValue(universe + '_droid_washing_planet_m_enabled', planet_m);
            GM_setValue(universe + '_droid_washing_planet_i_enabled', planet_i);
            GM_setValue(universe + '_droid_washing_planet_d_enabled', planet_d);
            GM_setValue(universe + '_droid_washing_planet_g_enabled', planet_g);
            GM_setValue(universe + '_droid_washing_planet_r_enabled', planet_r);
            GM_setValue(universe + '_droid_washing_planet_a_enabled', planet_a);

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