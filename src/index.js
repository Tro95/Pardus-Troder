import { PardusLibrary } from 'pardus-library';
import Planet from './pages/planet.js';
import Starbase from './pages/starbase.js';
import Blackmarket from './pages/blackmarket.js';
import DropCargo from './pages/drop-cargo.js';
import ShipTransfer from './pages/ship-transfer.js';
import Options from './pages/options.js';

export default class PardusTroder {
    constructor() {
        const pardus = new PardusLibrary();

        switch (document.location.pathname) {
            case '/planet_trade.php':
                new Planet(pardus.currentPage);
                break;
            case '/starbase_trade.php':
                new Starbase(pardus.currentPage);
                break;
            case '/blackmarket.php':
                new Blackmarket(pardus.currentPage);
                break;
            case '/drop_cargo.php':
                new DropCargo(pardus.currentPage);
                break;
            case '/ship2ship_transfer.php':
                new ShipTransfer(pardus.currentPage);
                break;
            case '/options.php':
                new Options();
                break;
            default:
                break;
        }
    }
}
