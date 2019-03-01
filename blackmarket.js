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

        if (GM_getValue(universe + '_blackmarket_load_moe_enabled', true)) {
            buttons.addButton("Load MOE", function() {loadMultiBuy("bm_construction_materials", ["Energy", "Metal", "Ore"]);});
        }
        if (GM_getValue(universe + '_blackmarket_load_energy_enabled', true)) {
            buttons.addButton("Load Energy", function() {unload(["Energy"]);ensureFuel();attempt_buy("Energy", ship_space.allowedSpace());submitIfNotPreview();});
        }
        if (GM_getValue(universe + '_blackmarket_load_metal_enabled', true)) {
            buttons.addButton("Load Metal", function() {unload(["Metal"]);ensureFuel();attempt_buy("Metal", ship_space.allowedSpace());submitIfNotPreview();});
        }
        if (GM_getValue(universe + '_blackmarket_load_ore_enabled', true)) {
            buttons.addButton("Load Ore", function() {unload(["Ore"]);ensureFuel();attempt_buy("Ore", ship_space.allowedSpace());submitIfNotPreview();});
        }
        if (GM_getValue(universe + '_blackmarket_sell_drugs_enabled', true)) {
            buttons.addButton("Sell Drugs", unloadDrugs);
        }
        
        buttons.addStandardButtons();
    }

    function unloadDrugs() {
        ensureFuel();
        attempt_sell("Drugs", GM_getValue(universe + '_blackmarket_drugs_to_sell', 2));
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