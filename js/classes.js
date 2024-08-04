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
        new Notification(`${this.name} started mining ${this.currentOre.name}.`, 3, "frequent", ["minionAction"]);
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
        new Notification(`${this.name} took ${damageTaken} damage! Current health: ${this.currentHealth}.`, 3, "frequentWarning", ["minionAction"]);
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
        if (this.isBroken() || !this.canMineThisOre(pickaxe, minion)) { return; } // failsafe

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
                new Notification(`${minionDef.name} scored a critical hit!`, 3, "frequent", ["minionAction"]);
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
                new Notification(`${this.name} is broken! Dropped ${finalDropAmount} units.`, 3, "frequent", ["minionAction", "ore"]);
            } else {
                new Notification(`${this.name} hit! Dropped ${finalDropAmount} units.`, 3, "frequent", ["minionAction", "ore"]);
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

class Monster {
    constructor(name, health) {
        this.name = name;
        this.health = health;
    }
}