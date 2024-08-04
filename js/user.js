let cash = 0

const orePocket = {
}; //ores are in grams

const inventory = {
};

const areaStats = { // tracks the stats for each area for requirements and rewards

};

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

function sellOreOfType(id) {
    if (orePocket[id]) {
        cash += Math.ceil(orePocket[id] * oreDefinitions[id].sellPrice);
        areaStats[currentRoom.id].roomCashEarned += Math.ceil(orePocket[id] * oreDefinitions[id].sellPrice)
        orePocket[id] = 0;
        new Notification(`Sold ore '${oreDefinitions[id].name}' for \$${oreDefinitions[id].sellPrice}!`, 3, "action", ["playerAction"]);
        return true;
    }
    return false;
}

function sellMinion(index) {
    if (index>currentRoom.minions.length-1) {
        new Notification(`You cannot sell a minion that doesn't exist!`, 3, "error");
        return false;
    }
    if (currentRoom.minions.length > 1) {
            const minion = currentRoom.minions[index]
            const sellPrice = minionDefinitions[minion.id].purchasePrice*0.80/(minion.currentHealth/minion.maxHealth)
            cash += sellPrice
            new Notification(`Sold minion '${minion.name}' for \$${sellPrice}!`, 3, "action", ["playerAction"]);
            currentRoom.minions.splice(index, 1)
        return true;
    }
    new Notification(`Cannot sell your only minion!`, 3, "error", ["playerAction"]);
    return false;
}