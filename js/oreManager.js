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
                    new Notification(`${oreDefinition.name} spawned in the room.`, 3, "tooFrequent");
                }
            } else {
                const oreDefinition = oreDefinitions[oreContent.type];
                
                // Check the number of non-broken ores
                const nonBrokenOres = currentRoom.ores.filter(ore => !ore.isBroken());
                if (nonBrokenOres.length < area.maxOres) {
                    currentRoom.ores.push(new Ore(oreDefinition));
                    new Notification(`${oreDefinition.name} spawned in the room.`, 3, "tooFrequent");
                }
            }
        }, spawnInterval * 1000); // Convert to milliseconds
    });
}