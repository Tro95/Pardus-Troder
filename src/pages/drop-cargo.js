import { VAR, getVar } from '../variables.js';

export default class DropCargo {
    constructor(page) {
        if (!getVar(VAR.CARGO_DROP_ENABLED)) {
            return; 
        }

        const fuelSpaceLeft = getVar(VAR.FUEL_SPACE_LEFT);

        if (getVar(VAR.DROP_EXCESS_FUEL)) {
            const fuel = page.commodities.get('Hydrogen fuel');
            if (fuel && fuel.shipStock > fuelSpaceLeft) {
                fuel.drop(fuel.shipStock - fuelSpaceLeft);
            }
        }
    }
}
