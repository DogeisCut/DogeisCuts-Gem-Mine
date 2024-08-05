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
        "purchasePrice": -1,
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
                throw new Error(`Error: ID mismatch for key "${key}". Expected ID: "${key}", but found ID: "${definition.id}".`);
            }
        }
    }
    //console.log("All definitions verified successfully.");
}