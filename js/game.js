const currentRoom = {
    id: 'none',
    ores: [],
    monsters: [],
    minions: [],
};

function makeRoom(id) {
    const area = areasDefinitions[id];
    if (!area) { return; }

    currentRoom.id = id;
    currentRoom.ores = [];
    currentRoom.monsters = [];

    scheduleOres(area);
    new Notification(`Entered room ${area.name}!`, 3, "action", ["playerAction"])
    console.log();
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

    // i really gotta figure this out
    // i dont think a status system is gonna work here. i may need multiple bars.
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
            <td><progress value="${-Math.abs(minion.nextMineTime - gameTime) + 8}" max="${8}"></progress> ${Math.abs(gameTime - minion.nextMineTime).toFixed(1)} Seconds</td> 
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