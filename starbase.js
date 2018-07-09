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