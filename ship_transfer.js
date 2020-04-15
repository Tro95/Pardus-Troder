function ship_transfer() {
    const main_form = document.getElementById('ship2ship_transfer');
    const centre_row = main_form.children[1].children[0].children[1].children[0];
    const resources_box = centre_row.children[0];

    const refresh_button = document.createElement('input');
    refresh_button.type = 'button';
    refresh_button.value = 'Refresh';
    refresh_button.addEventListener('click', () => {
        location.reload();
    }, false);

    centre_row.insertBefore(refresh_button, centre_row.children[1]);
    centre_row.insertBefore(document.createElement('br'), centre_row.children[1]);
}