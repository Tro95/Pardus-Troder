/* global PardusOptions, PardusOptionsUtility */
function drop_cargo() {
    var drop_table;

    if (!GM_getValue(PardusOptionsUtility.getVariableName('cargo_drop_enabled'), true)) {
        return;
    }

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
        if (GM_getValue(PardusOptionsUtility.getVariableName('drop_excess_fuel'), true) && commodities[items.indexOf("Hydrogen fuel")].ship_stock > fuel_space_left) {
            commodities[items.indexOf("Hydrogen fuel")].sell(commodities[items.indexOf("Hydrogen fuel")].ship_stock - fuel_space_left);
        }
    }
}