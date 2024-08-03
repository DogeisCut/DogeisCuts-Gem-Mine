// Config
const TICK_INTERVAL = 1;

let gameTime = 0;


// Definitions
//todo: convert areas to use an ID system like other definitions, and define the order within the definitions themselves.
const areasDefinitions = {
    "quartzMine1": {
        "id": "quartzMine1",
        "name": "Quartz Mine I",
        "maxOres": 30,
        "rewards": [
            {
                "cash": 30000,
                "minions": [
                    "minionBasic2"
                ],
                "pickaxes": [

                ],
                "areas": [
                    "quartzMine2"
                ],
                "clearArea": true,
                "requirements": [ // multiple requirements within the array means only one needs to be satisfied.
                    {
                        "roomCashEarned": 0,
                        "roomMonstersSlayed": 0,
                        "roomOresGathered": {
                            "quartz": 5000
                        },
                        "roomItemsCrafted": {

                        }
                    }
                ],
            }
        ],
        
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
    },
};

const oreDefinitions = {
    "quartz": {
        "id": "quartz",
        "dropId": "quartz",
        "name": "Quartz",
        "hitsUntilTotalBreak": {"baseValue": 25, "randomRange": 8},
        "hitDropAmount": {"baseValue": 100, "randomRange": 33},
        "breakDropAmount": {"baseValue": 250, "randomRange": 50},
        "tier": 1,
        "sellPrice": 0.1,
        "isDerivative": false
    },
    "iron": {
        "id": "iron",
        "dropId": "iron",
        "name": "Iron",
        "hitsUntilTotalBreak": {"baseValue": 100, "randomRange": 10},
        "hitDropAmount": {"baseValue": 100, "randomRange": 33},
        "breakDropAmount": {"baseValue": 250, "randomRange": 50},
        "tier": 3,
        "sellPrice": 0.2,
        "isDerivative": false
    },
    "ironBig": {
        "id": "ironBig",
        "dropId": "iron",
        "name": "Iron Big",
        "hitsUntilTotalBreak": {"baseValue": 250, "randomRange": 33},
        "hitDropAmount": {"baseValue": 200, "randomRange": 55},
        "breakDropAmount": {"baseValue": 500, "randomRange": 100},
        "tier": 4,
        "sellPrice": -1,
        "isDerivative": true
    },
    "diamond": {
        "id": "diamond",
        "dropId": "diamond",
        "name": "Diamond",
        "hitsUntilTotalBreak": {"baseValue": 100, "randomRange": 10},
        "hitDropAmount": {"baseValue": 100, "randomRange": 33},
        "breakDropAmount": {"baseValue": 250, "randomRange": 50},
        "tier": 10,
        "sellPrice": 23.1,
        "isDerivative": false
    },
    "piss": {
        "id": "piss",
        "dropId": "piss",
        "name": "Piss",
        "hitsUntilTotalBreak": {"baseValue": 1, "randomRange": 0},
        "hitDropAmount": {"baseValue": 100000, "randomRange": 0},
        "breakDropAmount": {"baseValue": 100000, "randomRange": 0},
        "tier": 69,
        "sellPrice": 1000000.0,
        "isDerivative": false
    },
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
        "craftPrices": [
            {"iron": 500}
        ],
        "purchasePrice": 300, // usually 3 times the sell price of the crafting ingredients
        "unlockPrice": -1
    },
    "ironBasic2": {
        "id": "ironBasic2",
        "name": "Iron Picakaxe II",
        "special": [],
        "dropMultiplier": 1.01,
        "mineSpeed": 7.0,
        "tier": 1,
        "softTier": 3,
        "craftPrices": [
            {"iron": 3250}
        ],
        "purchasePrice": 1950,
        "unlockPrice": 6000
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
        "craftPrices": [
            {"iron": 2250, "quartz": 3},
            {"diamond": 100}
        ],
        "unlockPrice": -1
    }
}

const minionDefinitions = {
    "userMinion": { // This minion is used internally for calcuating stats with the player manually mining.
        "id": "userMinion",
        "name": "%USER_MINION%",
        "maxHealth": -1,
        "dropMultiplier": 1,
        "damageResistance": 1.0,
        "critMineChance": 0,
        "mineSpeedMultiplier": 1,
        "tierAddition": 0,
        "softTierAddition": 0,
        "maxPickaxes": 0,
        "reactionTime": 0.0,
        "mineBetweenOresCooldown": 0.0,
        "baseDamage": 1.0,
        "startingPickaxes": [],
        "craftPrices": [
        ],
        "unlockPrice": -1,
        "purchasePrice": -1,
    },
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
        "startingPickaxes": ["ironBasic1"],
        "craftPrices": [ // crafting or "summoning" minions is not something that will appear at the start of the game
        ],
        "unlockPrice": -1,
        "purchasePrice": 1050,
    },
    "minionBasic2": {
        "id": "minionBasic2",
        "name": "Basic Minion II",
        "maxHealth": 101,
        "dropMultiplier": 1.01,
        "damageResistance": 0.11,
        "critMineChance": 0.01,
        "mineSpeedMultiplier": 1.1,
        "tierAddition": 0.1,
        "softTierAddition": 0.1,
        "maxPickaxes": 1,
        "reactionTime": 0.9,
        "mineBetweenOresCooldown": 0.9,
        "baseDamage": 2.1,
        "startingPickaxes": ["ironBasic1"],
        "craftPrices": [
        ],
        "unlockPrice": -1,
        "purchasePrice": 1350,
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
        this.status = "idle";

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
                    this.status = 'cooldown';
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
            this.status = 'idle';
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

        this.status = 'mining';
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
    if (!areaStats[currentRoom.id].roomOresGathered[oreId]) {
        areaStats[currentRoom.id].roomOresGathered[oreId] = amount
    } else {
        areaStats[currentRoom.id].roomOresGathered[oreId] += amount
    }
}

function calculateRandomRangeValue({ baseValue, randomRange }) {
    return baseValue + Math.floor(Math.random() * randomRange) - Math.round(randomRange/2);
}

class Ore {
    constructor(definition) {
        this.id = definition.id
        this.dropId = definition.dropId
        this.name = definition.name;
        this.hitsUntilTotalBreak = calculateRandomRangeValue(definition.hitsUntilTotalBreak);
        this.breakDropAmount = calculateRandomRangeValue(definition.breakDropAmount);
        this.hitDropAmount = definition.hitDropAmount;
        
        this.currentHits = 0;
    }

    calculateValue({ baseValue, randomRange }) {
        return baseValue + Math.floor(Math.random() * randomRange) - Math.round(randomRange/2);
    }

    hit(pickaxe, minion) {
        if (this.isBroken() && !canMineThisOre(pickaxe, minion)) { return; } // failsafe

            this.currentHits += 1;

            let finalDropAmount = this.isBroken() ? this.breakDropAmount : calculateRandomRangeValue(this.hitDropAmount);

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

// todo: make ore spawning take the place of broken ores
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

function sellOre(id) {
    if (orePocket[id]) {
        cash += Math.ceil(orePocket[id] * oreDefinitions[id].sellPrice);
        areaStats[currentRoom.id].roomCashEarned += Math.ceil(orePocket[id] * oreDefinitions[id].sellPrice)
        orePocket[id] = 0;
        return true;
    }
    return false;
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
    id: 'none',
    ores: [],
    monsters: [],
    minions: [],
};

const areaStats = { // tracks the stats for each area for requirements and rewards

}

const unlocks = {
    pickaxes: [
        "ironBasic1"
    ],
    minions: [
        "minionBasic1"
    ],
    areas: [
        "quartzMine1"
    ]
}

let userPickaxe = "ironBasic1";
//ore.hit(userPickaxe, "userMinion")

function makeRoom(id) {
    const area = areasDefinitions[id];
    if (!area) { return; }

    currentRoom.id = id;
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
    htmlUpdate();
}

function makeAreaStats() {
    for (const areaId in areasDefinitions) {
        areaStats[areaId] = {
            roomCashEarned: 0,
            roomMonstersSlayed: 0,
            roomOresGathered: {
            }
        }
    }
}

const minionStatusTranslations = {
    en: {
        idle: 'Idle',
        mining: 'Mining',
        cooldown: 'Looking For Ore'
    }
}

function htmlUpdate() {
    // Update cash display
    document.getElementById('player-cash').innerText = `${cash}`;

    // Update ore pocket display
    const orePocketDisplay = document.getElementById('ore-pocket');
    orePocketDisplay.innerHTML = '';
    for (const oreId in orePocket) {
        const amount = orePocket[oreId];
        if (amount > 0) {
            orePocketDisplay.innerHTML += `<div>${oreDefinitions[oreId].name}: ${amount}</div>`;
        }
    }

    // Update minions display
    // todo: make a panel of info instead of raw text so it's easier to modify minions
    // probably wanna give minions and ores n stuff numbers so you know which one is being targeted
    // plus being able to name minions
    // probably wanna make timers into bars instead of numbers (or perhaps both)
    const minionsDisplay = document.getElementById('minion-list');
    minionsDisplay.innerHTML = '';
    currentRoom.minions.forEach(minion => {
        minionsDisplay.innerHTML += `
        <div class="panel">
        <table><thead>
        <tr>
            <th>Name:</th>
            <th>${minion.name}</th>
        </tr></thead>
        <tbody>
        <tr>
            <td>Type:</td>
            <td>${minionDefinitions[minion.id].name}</td>
        </tr>
        <tr>
            <td>Health:</td>
            <td>${minion.currentHealth}/${minion.maxHealth} HP</td>
        </tr>
        <tr>
            <td>Target:</td>
            <td>${minion.currentOre ? minion.currentOre.name : 'None'}</td>
        </tr>
        <tr>
            <td>Status:</td>
            <td>${minionStatusTranslations.en[minion.status]}</td> 
        </tr>
        <tr>
            <td>Status Timer:</td>
            <td><progress value="${Math.abs(gameTime - minion.nextMineTime)}" max="8"></progress> ${Math.abs(gameTime - minion.nextMineTime).toFixed(1)} Seconds</td> 
        </tr>
        </tbody>
        </table>
        <div class="button-row">
            <button type="button" class="submenu-button">Pickaxes ⋮ </button>
            <button type="button" class="submenu-button">Items ⋮ </button>
            <button type="button" class="submenu-button">Behavior ⋮ </button>
            <button type="button" class="submenu-button">Stats ⋮ </button>
            <button type="button" class="generic-button">Sell Minion (\$${minionDefinitions[minion.id].purchasePrice*0.80/(minion.currentHealth/minion.maxHealth)})</button>
        </div>
        </div>`;
    });

    // Update ores display
    let availableOres = currentRoom.ores.filter(ore => !ore.isBroken());
    const oresDisplay = document.getElementById('ore-list');
    oresDisplay.innerHTML = '';
    availableOres.forEach(ore => {
        oresDisplay.innerHTML += `
        <div class="panel">
            ${ore.name}: ${ore.hitsUntilTotalBreak-ore.currentHits}/${ore.hitsUntilTotalBreak} Hits
        </div>
        `;
    });

    // Optionally, update any other UI elements here
}

function loadGame() {
    makeAreaStats()
    verifyDefinitions(areasDefinitions);
    verifyDefinitions(oreDefinitions);
    verifyDefinitions(minionDefinitions);
    verifyDefinitions(pickaxeDefinitions);
    makeRoom('quartzMine1');
    setInterval(update, TICK_INTERVAL);
}

currentRoom.minions.push(new Minion(minionDefinitions["minionBasic1"]));