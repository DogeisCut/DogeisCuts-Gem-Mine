// Config
const TICK_INTERVAL = 1;

let gameTime = 0;


// Definitions
const areasDefinitions = [
    {
        "name": "Quartz Mine 1",
        "maxOres": 30,
        "oreContents": [
            {
                "type": "quartz",
                "spawnRate": {"baseValue": 8.0, "randomRange": 2.6} 
                // spawns quartz every 8 seconds with 1.3 or -1.3 seconds of variance
            },
            {
                "type": [
                    {"ore": "quartz", "chance": 0.75},
                    {"ore": "iron", "chance": 0.25},
                ],
                "spawnRate": {"baseValue": 10.0, "randomRange": 0} 
                // spawns quartz, iron, every 10 seconds
            }
        ],
        "monsterContents": []
    }
];

const oreDefinitions = {
    "quartz": {
        "id": "quartz",
        "dropId": "quartz",
        "name": "Quartz",
        "hitsUntilTotalBreak": {"baseValue": 100, "randomRange": 10},
        "hitDropAmount": {"baseValue": 100, "randomRange": 33},
        "breakDropAmount": {"baseValue": 250, "randomRange": 50},
        "tier": 1
    },
    "iron": {
        "id": "iron",
        "dropId": "iron",
        "name": "Iron",
        "hitsUntilTotalBreak": {"baseValue": 100, "randomRange": 10},
        "hitDropAmount": {"baseValue": 100, "randomRange": 33},
        "breakDropAmount": {"baseValue": 250, "randomRange": 50},
        "tier": 3
    },
    "diamond": {
        "id": "diamond",
        "dropId": "diamond",
        "name": "Diamond",
        "hitsUntilTotalBreak": {"baseValue": 100, "randomRange": 10},
        "hitDropAmount": {"baseValue": 100, "randomRange": 33},
        "breakDropAmount": {"baseValue": 250, "randomRange": 50},
        "tier": 10
    }
}

const pickaxeDefinitions = {
    "ironBasic1": {
        "id": "ironBasic1",
        "name": "Iron Picakaxe",
        "special": [],
        "dropMultiplier": 1.0,
        "mineSpeed": 8.0,
        "tier": 1,
        "softTier": 2,
        "orePrices": [
            {"iron": 2250}
        ],
        "cashPrice": 6000
    },
    "devTest": {
        "id": "devTest",
        "name": "[DEV ONLY] test pick",
        "special": [
            {
                "type": "muliplier",
                "target": [{"type": "ore", "value": "quartz"}],
                "value": 10.0
            },
            {
                "type": "muliplier",
                "target": [{"type": "tierAndBelow", "value": 5}],
                "value": 10.0
            },
            {
                "type": "damageEffect",
                "target": [{"type": "all"}],
                "value": {"type": "poison", "level": 3}
            }
        ],
        "dropMultiplier": 10.0,
        "mineSpeed": 4.0,
        "tier": 10,
        "softTier": 20,
        "orePrices": [
            {"iron": 2250, "quartz": 3},
            {"diamond": 100}
        ],
        "cashPrice": 60000
    }
}

const minionDefinitions = {
    "minionBasic1": {
        "id": "minionBasic1",
        "name": "Basic Minion",
        "maxHealth": 100,
        "dropMultiplier": 1,
        "damageResistance": 0.1,
        "critMineChance": 0,
        "mineSpeedMultiplier": 1,
        "tierAddition": 0,
        "softTierAddition": 0,
        "maxPickaxes": 1,
        "reactionTime": 1.0,
        "mineBetweenOresCooldown": 1.0,
        "baseDamage": 2.0,
        "startingPickaxes": ["ironBasic1"]
    }
}

function verifyDefinitions(definitions) {
    for (const key in definitions) {
        if (definitions.hasOwnProperty(key)) {
            const definition = definitions[key];
            if (definition.id !== key) {
                console.error(`Error: ID mismatch for key "${key}". Expected ID: "${key}", but found ID: "${definition.id}".`);
                return false; // Return false to indicate failure
            }
        }
    }
    console.log("All definitions verified successfully.");
    return true; // Return true to indicate success
}


// Minions should prefer to mine the heighest tier ore they can that isnt going into the softTier.
// They will still mine an ore within their softTier range if they dont have a choice.
// Minions should prefer to not mine the same ore as another Minion.

// a few of these behaviors should be adjustable
class Minion {
    constructor(definition, options = {}) {
        this.id = definition.id;
        this.name = definition.name;
        this.maxHealth = definition.maxHealth;
        this.currentHealth = definition.maxHealth;
        this.dropMultiplier = definition.dropMultiplier;
        this.damageResistance = definition.damageResistance;
        this.critMineChance = definition.critMineChance;
        this.mineSpeedMultiplier = definition.mineSpeedMultiplier;
        this.tierAddition = definition.tierAddition;
        this.maxPickaxes = definition.maxPickaxes;
        this.pickaxes = definition.startingPickaxes;

        this.currentOre = null;
        this.nextMineTime = 0;
        this.nextOreTime = 0;

        this.avoidSameOre = options.avoidSameOre !== false;
        this.maxTierPreference = options.maxTierPreference !== false;
    }

    startMining() {
        if (this.currentOre && this.currentOre.isBroken()) {
            this.currentOre = null; // Current ore is broken, so reset
        }
        
        if (!this.currentOre) {
            this.pickNewOre();
        }

        if (this.currentOre) {
            const currentTime = gameTime;
            if (currentTime >= this.nextMineTime) {
                this.currentOre.hit(this.pickaxes[0], this.id); // Mining with the first pickaxe in the list
                this.nextMineTime = currentTime + (this.mineSpeedMultiplier * pickaxeDefinitions[this.pickaxes[0]].mineSpeed);
                
                if (this.currentOre.isBroken()) {
                    this.nextOreTime = currentTime + this.mineBetweenOresCooldown;
                    this.currentOre = null; // Reset current ore after it's broken
                }
            }
        }
        
        if (this.currentOre === null && gameTime >= this.nextOreTime) {
            this.pickNewOre();
        }
    }

    pickNewOre() {
        let availableOres = currentRoom.ores.filter(ore => !ore.isBroken());

        if (availableOres.length === 0) {
            // No ores available to mine
            //console.log(`${this.name} found no ores to mine.`);
            return;
        }

        // Filter ores based on minion's tier preferences
        if (this.maxTierPreference) {
            availableOres = availableOres.filter(ore => oreDefinitions[ore.id].tier <= this.getMaxAllowedTier());
        }

        if (this.avoidSameOre) {
            // Prefer ores not currently mined by other minions
            availableOres = availableOres.filter(ore => !currentRoom.minions.some(minion => minion.currentOre === ore));
        }

        if (availableOres.length === 0) {
            // Fallback if no ores left to mine
            availableOres = currentRoom.ores.filter(ore => !ore.isBroken());
        }

        // Pick the highest tier ore available
        this.currentOre = availableOres.reduce((highestOre, ore) => {
            if (!highestOre || oreDefinitions[ore.id].tier > oreDefinitions[highestOre.id].tier) {
                return ore;
            }
            return highestOre;
        }, null);

        console.log(`${this.name} started mining ${this.currentOre.name}.`);
        this.nextMineTime = gameTime + (this.mineSpeedMultiplier * pickaxeDefinitions[this.pickaxes[0]].mineSpeed);
    }

    getMaxAllowedTier() {
        // Calculate the maximum tier ore this minion can mine considering its tier addition
        const pickDef = pickaxeDefinitions[this.pickaxes[0]];
        const minionDef = minionDefinitions[this.id];
        const totalTier = pickDef.tier + minionDef.tierAddition;
        return totalTier;
    }

    takeDamage(amount) {
        const damageTaken = amount * (1 - this.damageResistance);
        this.currentHealth -= damageTaken;
        console.log(`${this.name} took ${damageTaken} damage! Current health: ${this.currentHealth}`);
    }

    isAlive() {
        return this.currentHealth > 0;
    }
}

function addOrMakeOre(oreId, amount) {
    if (!orePocket[oreId]) {
        orePocket[oreId] = amount
    } else {
        orePocket[oreId] += amount
    }
}

class Ore {
    constructor(definition) {
        this.id = definition.id
        this.dropId = definition.dropId
        this.name = definition.name;
        this.hitsUntilTotalBreak = this.calculateValue(definition.hitsUntilTotalBreak);
        this.breakDropAmount = this.calculateValue(definition.breakDropAmount);
        this.hitDropAmount = definition.hitDropAmount;
        
        this.currentHits = 0;
    }

    calculateValue({ baseValue, randomRange }) {
        return baseValue + Math.floor(Math.random() * randomRange) - randomRange/2;
    }

    hit(pickaxe, minion) {
        if (this.isBroken() && !canMineThisOre(pickaxe, minion)) { return; } // failsafe

            this.currentHits += 1;

            let finalDropAmount = this.isBroken() ? this.breakDropAmount : this.calculateValue(this.hitDropAmount);

            const pickDef = pickaxeDefinitions[pickaxe]
            const minionDef = minionDefinitions[minion]
            const oreDef = oreDefinitions[this.id]

            const totalTier = pickDef.tier + minionDef.tierAddition
            const totalSoftTier = pickDef.softTier + minionDef.softTierAddition

            const pickaxeSpecials = pickDef.special || [];
            pickaxeSpecials.forEach(special => {
                if (special.type === "muliplier") {
                    if (special.target.some(target => target.type === "ore" && target.value === this.id)) {
                        finalDropAmount *= special.value;
                    } else if (special.target.some(target => target.type === "tierAndBelow" && oreDef.tier <= target.value)) {
                        finalDropAmount *= special.value;
                    }
                }
            });

            finalDropAmount *= pickDef.dropMultiplier

            if (minion) {
                finalDropAmount *= minionDef.dropMultiplier;
            }

            if (minion && Math.random() < minionDef.critMineChance) {
                finalDropAmount *= 2; // Double the drop amount on crit
                console.log(`${minionDef.name} scored a critical hit!`);
            }

            // Calculate Effective Ore Tier
            let effectiveOreTier = oreDef.tier - totalTier;
            effectiveOreTier = Math.max(effectiveOreTier, 1); // Ensure it's at least 1 to avoid division by zero

            // Calculate Effective Soft Tier
            let effectiveSoftTier = totalSoftTier - totalTier;

            // Calculate Tier Ratio
            let tierRatio = effectiveSoftTier / effectiveOreTier;

            // Resulting Drop Amount
            finalDropAmount = finalDropAmount / tierRatio;

            if (this.isBroken()) {
                console.log(`${this.name} is broken! Dropped ${finalDropAmount} units.`);
            } else {
                console.log(`${this.name} hit! Dropped ${finalDropAmount} units.`);
            }
            addOrMakeOre(this.dropId, finalDropAmount);
    }

    isBroken() {
        return this.currentHits >= this.hitsUntilTotalBreak
    }

    canMineThisOre(pickaxe, minion) {
        const pickDef = pickaxeDefinitions[pickaxe]
        const minionDef = minionDefinitions[minion]
        const oreDef = oreDefinitions[this.id]

        const totalTier = pickDef.tier + minionDef.tierAddition
        const totalSoftTier = pickDef.softTier + minionDef.softTierAddition

        return oreDef.tier <= Math.max(totalSoftTier, totalTier)
    }
}

function getRandomOreType(types) {
    const rand = Math.random();
    let cumulativeChance = 0;
    for (const type of types) {
        cumulativeChance += type.chance;
        if (rand <= cumulativeChance) {
            return type.ore;
        }
    }
    return types[0].ore; // Fallback in case of rounding errors
}

function scheduleOres(area) {
    area.oreContents.forEach(oreContent => {
        const baseRate = oreContent.spawnRate.baseValue;
        const variance = oreContent.spawnRate.randomRange;
        const spawnInterval = baseRate + Math.random() * variance * 2 - variance;

        setInterval(() => {
            if (oreContent.type instanceof Array) {
                const oreType = getRandomOreType(oreContent.type);
                const oreDefinition = oreDefinitions[oreType];
                
                // Check the number of non-broken ores
                const nonBrokenOres = currentRoom.ores.filter(ore => !ore.isBroken());
                if (nonBrokenOres.length < area.maxOres) {
                    currentRoom.ores.push(new Ore(oreDefinition));
                    console.log(`${oreDefinition.name} spawned in the room.`);
                }
            } else {
                const oreDefinition = oreDefinitions[oreContent.type];
                
                // Check the number of non-broken ores
                const nonBrokenOres = currentRoom.ores.filter(ore => !ore.isBroken());
                if (nonBrokenOres.length < area.maxOres) {
                    currentRoom.ores.push(new Ore(oreDefinition));
                    console.log(`${oreDefinition.name} spawned in the room.`);
                }
            }
        }, spawnInterval * 1000); // Convert to milliseconds
    });
}

class Monster {
    constructor(name, health) {
        this.name = name;
        this.health = health;
    }
}

let cash = 0

const orePocket = {
}; //ores are in grams

const currentRoom = {
    id: -1,
    ores: [],
    monsters: [],
    minions: []
};

function calculateTotalOres(oreCount) {
    return oreCount.baseValue + Math.floor(Math.random() * oreCount.randomRange) - oreCount.randomRange/2;
}

function makeRoom(index) {
    const area = areasDefinitions[index];
    if (!area) { return; }

    currentRoom.id = index;
    currentRoom.ores = [];
    currentRoom.monsters = [];

    scheduleOres(area);
    console.log(`Room ${area.name} created with ${currentRoom.ores.length} ores and ${currentRoom.monsters.length} monsters.`);
}

function update() {
    gameTime += 0.0033;

    // Update each minion
    currentRoom.minions.forEach(minion => {
        if (minion.isAlive()) {
            minion.startMining();
        }
    });
}

function loadGame() {
    verifyDefinitions(oreDefinitions);
    verifyDefinitions(minionDefinitions);
    verifyDefinitions(pickaxeDefinitions);
    makeRoom(0);
    setInterval(update, TICK_INTERVAL);
}

currentRoom.minions.push(new Minion(minionDefinitions["minionBasic1"]));