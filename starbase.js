function starbase() {
    var sell_table;
    var buy_table;
    var player_owned = false;
    var items_to_droidwash = [];

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

        if (player_owned) {
            if (GM_getValue(universe + '_po_starbase_planet_run_enabled', true)) {
                buttons.addButton("Planet Run", loadPlanet);

                document.addPardusKeyDownListener('starbase_planet_run_keypress', {code: 83}, (event) => {
                    loadPlanet();
                });
            }
            if (GM_getValue(universe + '_po_starbase_load_robots_enabled', true)) {
                buttons.addButton("Load Robots", loadRobots);
            }
            if (GM_getValue(universe + '_po_starbase_load_mo_enabled', true)) {
                buttons.addButton("Load MO", function() {loadMultiBuy("sb_mo_materials", ["Metal", "Ore"]);});
            }
            if (GM_getValue(universe + '_po_starbase_load_metal_enabled', true)) {
               buttons.addButton("Load Metal", function() {unload(["Metal"]);ensureFuel();attempt_buy("Metal", ship_space.allowedSpace());submitIfNotPreview();});
            }
            if (GM_getValue(universe + '_po_starbase_load_ore_enabled', true)) {
                buttons.addButton("Load Ore", function() {unload(["Ore"]);ensureFuel();attempt_buy("Ore", ship_space.allowedSpace());submitIfNotPreview();});
            }
        } else {
            if (droid_wash_mode) {
                if (GM_getValue(universe + "_droid_washing_starbase_enabled", false) == true) {
                    findItemsToDroidwash();
                    buttons.addDroidwashableItems(items_to_droidwash);
                    if (items_to_droidwash.length != 0) {
                        if (isReadyToDroidWash()) {
                            droidWash();
                            buttons.addButton("Stop Droid Wash", endDroidWash);
                        } else {
                            buttons.addButton("Start Droid Wash", droidWash);
                        }
                    }
                }
            }

            if (GM_getValue(universe + '_npc_starbase_planet_run_enabled', true)) {
                buttons.addButton("Planet Run", loadPlanet);

                document.addPardusKeyDownListener('starbase_planet_run_keypress', {code: 83}, (event) => {
                    loadPlanet();
                });
            }
        }
          
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

    function findItemsToDroidwash() {
        var i;
        for (i = 0; i < commodities.length; i++) {
            if (commodities[i].max <= droid_wash_level && commodities[i].max > 0) {
                items_to_droidwash.push(commodities[i].item);
            }
        }
    }

    function droidWash() {
        var i;
        unload(items_to_droidwash);
        ensureFuel();

        if (isReadyToDroidWash()) {
            for (i = 0; i < items_to_droidwash.length; i++) {
                if (ableToDroidWashItem(items_to_droidwash[i])) {
                    attempt_sell(items_to_droidwash[i], 999);
                    attempt_buy(items_to_droidwash[i], 999);
                    commodities[items.indexOf(items_to_droidwash[i])].buy(parseInt(commodities[items.indexOf(items_to_droidwash[i])].buyValue()) + parseInt(commodities[items.indexOf(items_to_droidwash[i])].sellValue()) - 1);
                }
            }
        } else {
            for (i = 0; i < items_to_droidwash.length; i++) {
                if (ableToDroidWashItem(items_to_droidwash[i])) {
                    if (commodities[items.indexOf(items_to_droidwash[i])].trade_stock > commodities[items.indexOf(items_to_droidwash[i])].bal) {
                        attempt_buy(items_to_droidwash[i], commodities[items.indexOf(items_to_droidwash[i])].trade_stock - commodities[items.indexOf(items_to_droidwash[i])].bal - 1);
                    }
                    if (commodities[items.indexOf(items_to_droidwash[i])].trade_stock <= commodities[items.indexOf(items_to_droidwash[i])].bal) {
                        attempt_sell(items_to_droidwash[i], commodities[items.indexOf(items_to_droidwash[i])].bal - commodities[items.indexOf(items_to_droidwash[i])].trade_stock + 1);
                    }
                }
            }
        }
    }

    function ableToDroidWashItem(item) {
        if (commodities[items.indexOf(item)].ship_stock + commodities[items.indexOf(item)].trade_stock > commodities[items.indexOf(item)].bal + 1) {
            return true;
        }
        return false;
    }

    function endDroidWash() {
        reset();
        ensureFuel();

        for (var i = 0; i < items_to_droidwash.length; i++) {
            if (ableToDroidWashItem(items_to_droidwash[i])) {
                attempt_buy(items_to_droidwash[i], 999);
            }
        }

        submitIfNotPreview();
    }

    function isReadyToDroidWash() {
        for (var i = 0; i < items_to_droidwash.length; i++) {
            if (ableToDroidWashItem(items_to_droidwash[i])) {
                if (commodities[items.indexOf(items_to_droidwash[i])].trade_stock > commodities[items.indexOf(items_to_droidwash[i])].bal + 1) {
                    console.log("Item '" + items_to_droidwash[i] + "' has too many items starbase-side to begin the droidwash!");
                    return false;
                }
                if (commodities[items.indexOf(items_to_droidwash[i])].trade_stock <= commodities[items.indexOf(items_to_droidwash[i])].bal) {
                    console.log("Item '" + items_to_droidwash[i] + "' doesn't have enough items starbase-side to begin the droidwash!");
                    return false;
                }
            }
        }
        return true;
    }
}