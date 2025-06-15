let weight={
1: {
    main: ["hp"],
    sub: ["hp", "atk", "def","crit_rate", "crit_dmg",'elem','charge' ]
},
2: {
    main: ["atk"],
    sub: ["hp", "atk", "def","crit_rate", "crit_dmg",'elem','charge' ]
},
3: {
    main: ["atk", "hp", "def","charge","elem"],
    sub: ["hp", "atk", "def","crit_rate", "crit_dmg",'elem','charge' ]
},
4: {
    main: ["atk", "hp", "def",'elem', "physical_dmg", "fire_dmg", "ice_dmg", "elec_dmg", "wind_dmg", "rock_dmg", "water_dmg",'grass_dmg'],
    sub: ["hp", "atk", "def","crit_rate", "crit_dmg",'elem','charge' ]
},
5: {
    main: ["atk", "hp", "def","crit_rate", "crit_dmg","elem",'heal'],
    sub: ["hp", "atk", "def","crit_rate", "crit_dmg",'elem','charge' ]
}};

export default weight;