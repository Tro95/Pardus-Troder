/**
 *  Major credit to Miche (Orion) for a lot of the
 *  original code in his Pardus Dog Trader script.
 */
function ship_transfer() {
    const main_form = document.getElementById('ship2ship_transfer');
    const centre_row = main_form.children[1].children[0].children[1].children[0];
    const resources_table = document.querySelector('form table.messagestyle');

    if (GM_getValue(PardusOptionsUtility.getVariableName('ship2ship_enable_refresh_button'), true)) {
        create_refresh_button();
    }

    if (GM_getValue(PardusOptionsUtility.getVariableName('ship2ship_transfer_op_mode'), true)) {
        preload_resources();
    }

    function get_ship_id() {
        return document.querySelector('input[name="playerid"]').value;
    }

    function get_redirect_url() {
        const current_url = new URL(window.location);
        return `${current_url.protocol}//${current_url.hostname}${current_url.pathname}?playerid=${get_ship_id()}`;
    }

    function create_refresh_button() {
        const refresh_button = document.createElement('input');
        refresh_button.type = 'button';
        refresh_button.value = 'Refresh';
        refresh_button.addEventListener('click', () => {
            window.location.href = get_redirect_url();
        }, false);
        centre_row.insertBefore(refresh_button, centre_row.children[1]);
        centre_row.insertBefore(document.createElement('br'), centre_row.children[1]);
    }

    function get_free_space() {
        const free_space_element = document.getElementsByTagName('b');
        return free_space_element.length == 1 ? parseInt(free_space_element[0].textContent) : 0;
    }

    function preload_resources() {
        const free_space = get_free_space();

        if (free_space === 0) {
            return;
        }

        const fuel_to_preload = GM_getValue(PardusOptionsUtility.getVariableName('fuel_to_preload'), 3);
        const bots_to_preload = GM_getValue(PardusOptionsUtility.getVariableName('bots_to_preload'), 20);
        const drugs_to_preload = GM_getValue(PardusOptionsUtility.getVariableName('bots_to_preload'), 6);
        const amber_stims_to_preload = GM_getValue(PardusOptionsUtility.getVariableName('amber_stims_to_preload'), 1);

        for (const row of resources_table.rows) {
            // Skip over the break row
            if (row.cells.length < 4) {
                continue;
            }

            const resource = row.cells[1].textContent;
            const amount = parseInt(row.cells[2].textContent);
            const input_element = row.cells[3].childNodes[0];

            switch (resource) {
                case 'Hydrogen fuel': {
                    if (fuel_to_preload === 0) {
                        break;
                    }
                    const button = create_button('Hydrogen fuel');
                    row.cells[3].appendChild(button);
                    input_element.value = Math.min(fuel_to_preload, amount, free_space);
                    break;
                }
                case 'Robots': {
                    if (bots_to_preload === 0) {
                        break;
                    }
                    const button = create_button('Robots');
                    row.cells[3].appendChild(button);
                    input_element.value = Math.min(bots_to_preload, amount, free_space);
                    break;
                }
                case 'Drugs': {
                    if (drugs_to_preload === 0) {
                        break;
                    }
                    const button = create_button('Drugs');
                    row.cells[3].appendChild(button);
                    input_element.value = Math.min(drugs_to_preload, amount, free_space);
                    break;
                }
                case 'Amber Stim': {
                    if (amber_stims_to_preload === 0) {
                        break;
                    }
                    const button = create_button('Amber Stim');
                    row.cells[3].appendChild(button);
                    input_element.value = Math.min(amber_stims_to_preload, amount, free_space);
                    break;
                }
                default:
                    // Do nothing
                    break;
            }
        }
    }

    function create_button(resource) {
        const button_element = document.createElement('input');
        button_element.type = 'button';
        button_element.value = 'Transfer';
        button_element.setAttribute('style', 'padding:2px; margin:6px 0px 6px 10px;min-width:90px;vertical-align:middle;');
        button_element.addEventListener('click', () => {
            for (const row of resources_table.rows) {
                // Skip over the break row
                if (row.cells.length < 4) {
                    continue;
                }

                const current_resource = row.cells[1].textContent;
                const input_element = row.cells[3].childNodes[0];

                if (resource !== current_resource) {
                    input_element.value = '';
                }

                main_form.submit();
            }
        });
        return button_element;
    }
}