import { PardusOptionsUtility } from 'pardus-options-library';

// Variable keys used with PardusOptionsUtility.getVariableValue/setVariableValue
export const VAR = {
    PREVIEW: 'preview',
    AUTO_UNLOAD: 'auto_unload',
    FUEL_SPACE_LEFT: 'fuel_space_left',
    FUEL_TO_PURCHASE: 'fuel_to_purchase',
    MAGSCOOP_ALLOWED: 'magscoop_allowed',
    DROID_WASH_MODE: 'droid_washing_mode_enabled',
    DROID_WASH_LEVEL: 'droid_washing_level',
    DROID_WASH_PLANET_M: 'droid_washing_planet_m_enabled',
    DROID_WASH_PLANET_I: 'droid_washing_planet_i_enabled',
    DROID_WASH_PLANET_D: 'droid_washing_planet_d_enabled',
    DROID_WASH_PLANET_G: 'droid_washing_planet_g_enabled',
    DROID_WASH_PLANET_R: 'droid_washing_planet_r_enabled',
    DROID_WASH_PLANET_A: 'droid_washing_planet_a_enabled',
    DROID_WASH_STARBASE: 'droid_washing_starbase_enabled',

    // Planet buttons
    PLANET_A_STARBASE_RUN: 'planet_a_starbase_run_enabled',
    PLANET_A_STOCK_RUN: 'planet_a_stock_run_enabled',
    PLANET_A_LOAD_FOOD: 'planet_a_load_food_enabled',
    PLANET_A_LOAD_WATER: 'planet_a_load_water_enabled',
    PLANET_M_STARBASE_RUN: 'planet_m_starbase_run_enabled',
    PLANET_M_STOCK_RUN: 'planet_m_stock_run_enabled',
    PLANET_M_LOAD_FOOD: 'planet_m_load_food_enabled',
    PLANET_M_LOAD_WATER: 'planet_m_load_water_enabled',
    PLANET_I_PLANET_RUN: 'planet_i_planet_run_enabled',
    PLANET_I_LOAD_WATER: 'planet_i_load_water_enabled',
    PLANET_R_COMBO_RUN: 'planet_r_combo_run_enabled',
    PLANET_R_LOAD_EMBRYOS: 'planet_r_load_embryos_enabled',
    PLANET_R_LOAD_METAL: 'planet_r_load_metal_enabled',
    PLANET_R_LOAD_ORE: 'planet_r_load_ore_enabled',
    PLANET_R_LOAD_RADS: 'planet_r_load_rads_enabled',
    PLANET_G_LOAD_EMBRYOS: 'planet_g_load_embryos_enabled',
    PLANET_G_LOAD_NEBULA: 'planet_g_load_nebula_enabled',
    PLANET_G_LOAD_CHEMS: 'planet_g_load_chems_enabled',
    PLANET_D_LOAD_SLAVES: 'planet_d_load_slaves_enabled',

    // Starbase buttons
    PO_STARBASE_PLANET_RUN: 'po_starbase_planet_run_enabled',
    PO_STARBASE_LOAD_ROBOTS: 'po_starbase_load_robots_enabled',
    PO_STARBASE_LOAD_MO: 'po_starbase_load_mo_enabled',
    PO_STARBASE_LOAD_METAL: 'po_starbase_load_metal_enabled',
    PO_STARBASE_LOAD_ORE: 'po_starbase_load_ore_enabled',
    NPC_STARBASE_PLANET_RUN: 'npc_starbase_planet_run_enabled',

    // Blackmarket buttons
    BM_LOAD_MOE: 'blackmarket_load_moe_enabled',
    BM_LOAD_ENERGY: 'blackmarket_load_energy_enabled',
    BM_LOAD_METAL: 'blackmarket_load_metal_enabled',
    BM_LOAD_ORE: 'blackmarket_load_ore_enabled',
    BM_SELL_DRUGS: 'blackmarket_sell_drugs_enabled',
    BM_DRUGS_TO_SELL: 'blackmarket_drugs_to_sell',
    BM_LOAD_GEM_MERCHANT: 'blackmarket_load_gem_merchant_enabled',

    // Ship transfer
    SHIP2SHIP_REFRESH: 'ship2ship_enable_refresh_button',
    SHIP2SHIP_OP_MODE: 'ship2ship_transfer_op_mode',
    FUEL_TO_PRELOAD: 'fuel_to_preload',
    BOTS_TO_PRELOAD: 'bots_to_preload',
    DRUGS_TO_PRELOAD: 'drugs_to_preload',
    AMBER_STIMS_TO_PRELOAD: 'amber_stims_to_preload',

    // Cargo dropping
    CARGO_DROP_ENABLED: 'cargo_drop_enabled',
    DROP_EXCESS_FUEL: 'drop_excess_fuel',
};

export const DEFAULTS = {
    [VAR.PREVIEW]: true,
    [VAR.AUTO_UNLOAD]: true,
    [VAR.FUEL_SPACE_LEFT]: 5,
    [VAR.FUEL_TO_PURCHASE]: 5,
    [VAR.MAGSCOOP_ALLOWED]: false,
    [VAR.DROID_WASH_MODE]: false,
    [VAR.DROID_WASH_LEVEL]: 20,
    [VAR.DROID_WASH_PLANET_M]: false,
    [VAR.DROID_WASH_PLANET_I]: true,
    [VAR.DROID_WASH_PLANET_D]: true,
    [VAR.DROID_WASH_PLANET_G]: true,
    [VAR.DROID_WASH_PLANET_R]: true,
    [VAR.DROID_WASH_PLANET_A]: false,
    [VAR.DROID_WASH_STARBASE]: false,

    [VAR.PLANET_A_STARBASE_RUN]: true,
    [VAR.PLANET_A_STOCK_RUN]: true,
    [VAR.PLANET_A_LOAD_FOOD]: true,
    [VAR.PLANET_A_LOAD_WATER]: true,
    [VAR.PLANET_M_STARBASE_RUN]: true,
    [VAR.PLANET_M_STOCK_RUN]: true,
    [VAR.PLANET_M_LOAD_FOOD]: true,
    [VAR.PLANET_M_LOAD_WATER]: true,
    [VAR.PLANET_I_PLANET_RUN]: true,
    [VAR.PLANET_I_LOAD_WATER]: true,
    [VAR.PLANET_R_COMBO_RUN]: true,
    [VAR.PLANET_R_LOAD_EMBRYOS]: true,
    [VAR.PLANET_R_LOAD_METAL]: true,
    [VAR.PLANET_R_LOAD_ORE]: true,
    [VAR.PLANET_R_LOAD_RADS]: true,
    [VAR.PLANET_G_LOAD_EMBRYOS]: true,
    [VAR.PLANET_G_LOAD_NEBULA]: true,
    [VAR.PLANET_G_LOAD_CHEMS]: true,
    [VAR.PLANET_D_LOAD_SLAVES]: true,

    [VAR.PO_STARBASE_PLANET_RUN]: true,
    [VAR.PO_STARBASE_LOAD_ROBOTS]: true,
    [VAR.PO_STARBASE_LOAD_MO]: true,
    [VAR.PO_STARBASE_LOAD_METAL]: true,
    [VAR.PO_STARBASE_LOAD_ORE]: true,
    [VAR.NPC_STARBASE_PLANET_RUN]: true,

    [VAR.BM_LOAD_MOE]: true,
    [VAR.BM_LOAD_ENERGY]: true,
    [VAR.BM_LOAD_METAL]: true,
    [VAR.BM_LOAD_ORE]: true,
    [VAR.BM_SELL_DRUGS]: true,
    [VAR.BM_DRUGS_TO_SELL]: 2,
    [VAR.BM_LOAD_GEM_MERCHANT]: true,

    [VAR.SHIP2SHIP_REFRESH]: true,
    [VAR.SHIP2SHIP_OP_MODE]: true,
    [VAR.FUEL_TO_PRELOAD]: 3,
    [VAR.BOTS_TO_PRELOAD]: 20,
    [VAR.DRUGS_TO_PRELOAD]: 6,
    [VAR.AMBER_STIMS_TO_PRELOAD]: 1,

    [VAR.CARGO_DROP_ENABLED]: true,
    [VAR.DROP_EXCESS_FUEL]: true,
};

export function getVar(key) {
    return PardusOptionsUtility.getVariableValue(key, DEFAULTS[key]);
}

export function setVar(key, value) {
    PardusOptionsUtility.setVariableValue(key, value);
}
