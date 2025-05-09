function planet() {
    var sell_table;
    var buy_table;
    var planet_type;
    var items_to_droidwash = [];

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
            case "planet_d.png":
                this.planet_type = "d";
                break;
            case "planet_g.png":
                this.planet_type = "g";
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
    }

    function addButtons() {

        buttons.createButtonsBox();

        if (droid_wash_mode) {

            droid_washing_defaults = {
                'i': true,
                'a': false,
                'm': false,
                'g': true,
                'r': true,
                'd': true,
            };

            if (GM_getValue(universe + "_droid_washing_planet_" + this.planet_type + "_enabled", droid_washing_defaults[this.planet_type]) == true) {
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

        switch(this.planet_type) {
            case "a":
                if (GM_getValue(universe + '_planet_a_starbase_run_enabled', true)) {
                    buttons.addButton("Starbase Run", loadStarbase);

                    document.addPardusKeyDownListener('planet_starbase_run_keypress', {code: 83}, (event) => {
                        loadStarbase();
                    });

                    document.addPardusKeyDownListener('planet_food_run_keypress', {code: 70}, (event) => {
                        unload(["Food", "Capri Stim", "Crimson Stim", "Amber Stim"]);
                        ensureFuel();
                        attempt_buy("Food", ship_space.allowedSpace());
                        submitIfNotPreview();
                    });

                    document.addPardusKeyDownListener('planet_water_run_keypress', {code: 87}, (event) => {
                        unload(["Water", "Capri Stim", "Crimson Stim", "Amber Stim"]);
                        ensureFuel();
                        attempt_buy("Water", ship_space.allowedSpace());
                        submitIfNotPreview();
                    });
                }
                if (GM_getValue(universe + '_planet_a_stock_run_enabled', true)) {
                    buttons.addButton("Stock Run", loadStockRun);
                }
                if (GM_getValue(universe + '_planet_a_load_food_enabled', true)) {
                    buttons.addButton("Load Food", function() {unload(["Food", "Capri Stim", "Crimson Stim", "Amber Stim"]);ensureFuel();attempt_buy("Food", ship_space.allowedSpace());submitIfNotPreview();});
                }
                if (GM_getValue(universe + '_planet_a_load_water_enabled', true)) {
                    buttons.addButton("Load Water", function() {unload(["Water", "Capri Stim", "Crimson Stim", "Amber Stim"]);ensureFuel();attempt_buy("Water", ship_space.allowedSpace());submitIfNotPreview();});
                }
                break;
            case "m":
                if (GM_getValue(universe + '_planet_m_starbase_run_enabled', true)) {
                    buttons.addButton("Starbase Run", loadStarbase);

                    document.addPardusKeyDownListener('planet_starbase_run_keypress', {code: 83}, (event) => {
                        loadStarbase();
                    });

                    document.addPardusKeyDownListener('planet_food_run_keypress', {code: 70}, (event) => {
                        unload(["Food", "Capri Stim", "Crimson Stim", "Amber Stim"]);
                        ensureFuel();
                        attempt_buy("Food", ship_space.allowedSpace());
                        submitIfNotPreview();
                    });

                    document.addPardusKeyDownListener('planet_water_run_keypress', {code: 87}, (event) => {
                        unload(["Water", "Capri Stim", "Crimson Stim", "Amber Stim"]);
                        ensureFuel();
                        attempt_buy("Water", ship_space.allowedSpace());
                        submitIfNotPreview();
                    });
                }
                if (GM_getValue(universe + '_planet_m_stock_run_enabled', true)) {
                    buttons.addButton("Stock Run", loadStockRun);
                }
                if (GM_getValue(universe + '_planet_m_load_food_enabled', true)) {
                    buttons.addButton("Load Food", function() {unload(["Food", "Capri Stim", "Crimson Stim", "Amber Stim"]);ensureFuel();attempt_buy("Food", ship_space.allowedSpace());submitIfNotPreview();});
                }
                if (GM_getValue(universe + '_planet_m_load_water_enabled', true)) {
                    buttons.addButton("Load Water", function() {unload(["Water", "Capri Stim", "Crimson Stim", "Amber Stim"]);ensureFuel();attempt_buy("Water", ship_space.allowedSpace());submitIfNotPreview();});
                }
                break;
            case "i":
                if (GM_getValue(universe + '_planet_i_planet_run_enabled', true)) {
                    buttons.addButton("Planet Run", function() {unload(["Food","Water"]);ensureFuel();attempt_buy("Water", ship_space.allowedSpace());submitIfNotPreview();});
                }
                if (GM_getValue(universe + '_planet_i_load_water_enabled', true)) {
                    buttons.addButton("Load Water", function() {unload(["Water"]);ensureFuel();attempt_buy("Water", ship_space.allowedSpace());submitIfNotPreview();});
                }
                break;
            case "r":
                if (GM_getValue(universe + '_planet_r_combo_run_enabled', true)) {
                    buttons.addButton("Combo Run", function() {loadMultiBuy("planet_r_combo", ["Animal embryos", "Metal", "Ore", "Radioactive cells"], [10,5,15,1]);});
                }
                if (GM_getValue(universe + '_planet_r_load_embryos_enabled', true)) {
                    buttons.addButton("Load Embryos", function() {unload(["Animal embryos"]);ensureFuel();attempt_buy("Animal embryos", ship_space.allowedSpace());submitIfNotPreview();});
                }
                if (GM_getValue(universe + '_planet_r_load_metal_enabled', true)) {
                    buttons.addButton("Load Metal", function() {unload(["Metal"]);ensureFuel();attempt_buy("Metal", ship_space.allowedSpace());submitIfNotPreview();});
                }
                if (GM_getValue(universe + '_planet_r_load_ore_enabled', true)) {
                    buttons.addButton("Load Ore", function() {unload(["Ore"]);ensureFuel();attempt_buy("Ore", ship_space.allowedSpace());submitIfNotPreview();});
                }
                if (GM_getValue(universe + '_planet_r_load_rads_enabled', true)) {
                    buttons.addButton("Load Rads", function() {unload(["Radioactive cells"]);ensureFuel();attempt_buy("Radioactive cells", ship_space.allowedSpace());submitIfNotPreview();});
                }
                break;
            case "g":
                if (GM_getValue(universe + '_planet_g_load_embryos_enabled', true)) {
                    buttons.addButton("Load Embryos", function() {unload(["Animal embryos"]);ensureFuel();attempt_buy("Animal embryos", ship_space.allowedSpace());submitIfNotPreview();});
                }
                if (GM_getValue(universe + '_planet_g_load_nebula_enabled', true)) {
                    buttons.addButton("Load Nebula", function() {unload(["Nebula gas"]);ensureFuel();attempt_buy("Nebula gas", ship_space.allowedSpace());submitIfNotPreview();});
                }
                if (GM_getValue(universe + '_planet_g_load_chems_enabled', true)) {
                    buttons.addButton("Load Chemicals", function() {unload(["Chemical supplies"]);ensureFuel();attempt_buy("Chemical supplies", ship_space.allowedSpace());submitIfNotPreview();});
                }
            case "d":
                if (GM_getValue(universe + '_planet_d_load_slaves_enabled', true)) {
                    buttons.addButton("Load Slaves", function() {unload(["Slaves"]);ensureFuel();attempt_buy("Slaves", ship_space.allowedSpace());submitIfNotPreview();});
                }
                break;
            default:
                break;
        }

        buttons.addStandardButtons();
    }

    function loadStarbase() {
        unload(["Food", "Water", "Capri Stim", "Crimson Stim", "Amber Stim"]);
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
        unload(["Food", "Water", "Capri Stim", "Crimson Stim", "Amber Stim"]);
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
        unload(["Food", "Capri Stim", "Crimson Stim", "Amber Stim"]);
        ensureFuel();
        attempt_buy("Food", ship_space.allowedSpace());
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
                    console.log("Item '" + items_to_droidwash[i] + "' has too many items planet-side to begin the droidwash!");
                    return false;
                }
                if (commodities[items.indexOf(items_to_droidwash[i])].trade_stock <= commodities[items.indexOf(items_to_droidwash[i])].bal) {
                    console.log("Item '" + items_to_droidwash[i] + "' doesn't have enough items planet-side to begin the droidwash!");
                    return false;
                }
            }
        }
        return true;
    }
}