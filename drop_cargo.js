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