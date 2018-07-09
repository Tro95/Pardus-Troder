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