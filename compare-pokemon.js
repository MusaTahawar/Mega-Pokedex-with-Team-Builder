// =======================
// Add Pokémon to a Team
// =======================
async function addToTeam(teamBox) {
    if (!draggingPokemon) return;

    const container = teamBox.querySelector(".team-slot-container");

    if (container.children.length >= 6) {
        alert("This team already has 6 Pokémon!");
        return;
    }

    for (let p of container.querySelectorAll(".team-pokemon")) {
        if (p.dataset.name === draggingPokemon.name) {
            alert("This Pokémon is already in the team!");
            return;
        }
    }

    const res = await fetch(base_url + draggingPokemon.name.toLowerCase());
    const data = await res.json();
    const types = data.types.map(t => t.type.name);
    const bst = data.stats.reduce((a, b) => a + b.base_stat, 0);

    let slot = document.createElement("div");
    slot.classList.add("team-pokemon");
    slot.draggable = true;
    slot.dataset.name = draggingPokemon.name;

    slot.addEventListener("dragstart", () => {
        draggingPokemon = { name: slot.dataset.name, img: draggingPokemon.img };
        slot.classList.add("drag-item");
    });

    slot.addEventListener("dragend", () => {
        slot.classList.remove("drag-item");
    });

    let img = document.createElement("img");
    img.src = draggingPokemon.img;

    let nameP = document.createElement("p");
    nameP.classList.add("team-pokemon-name");
    nameP.innerText = draggingPokemon.name;

    let typeDiv = document.createElement("div");
    typeDiv.classList.add("team-types");
    types.forEach(t => {
        let badge = document.createElement("span");
        badge.innerText = t;
        badge.classList.add("type-badge-small", t);
        typeDiv.appendChild(badge);
    });

    let bstP = document.createElement("p");
    bstP.classList.add("team-bst");
    bstP.innerText = `BST: ${bst}`;

    let removeBtn = document.createElement("button");
    removeBtn.classList.add("remove-slot");
    removeBtn.innerHTML = "&times;";
    removeBtn.addEventListener("click", () => slot.remove());

    slot.appendChild(removeBtn);
    slot.appendChild(img);
    slot.appendChild(nameP);
    slot.appendChild(typeDiv);
    slot.appendChild(bstP);

    container.appendChild(slot);
}


// =======================
// Extract team Pokémon
// =======================
function extractTeam(teamSelector) {
    const container = document.querySelector(`${teamSelector} .team-slot-container`);
    const pokemonNames = [];

    container.querySelectorAll(".team-pokemon").forEach(slot => {
        if (slot.dataset.name)
            pokemonNames.push(slot.dataset.name.toLowerCase());
    });

    return pokemonNames;
}


// =======================
// Load Stats for a Team
// =======================
async function loadTeamStats(names) {
    let stats = { bst: 0, avgBST: 0, count: names.length };

    for (let n of names) {
        const res = await fetch(base_url + n);
        const data = await res.json();
        stats.bst += data.stats.reduce((a, b) => a + b.base_stat, 0);
    }

    stats.avgBST = stats.count ? Math.round(stats.bst / stats.count) : 0;
    return stats;
}


// =======================
// Display Comparison
// =======================
function showComparison(t1, t2) {
    const out = document.querySelector("#team-comparison-output");
    out.innerHTML = `
        <h4>Team Comparison</h4>
        <p><strong>Team 1 Total BST:</strong> ${t1.bst}</p>
        <p><strong>Team 2 Total BST:</strong> ${t2.bst}</p>
        <p><strong>Team 1 Avg BST:</strong> ${t1.avgBST}</p>
        <p><strong>Team 2 Avg BST:</strong> ${t2.avgBST}</p>
        <h5>Stronger Team: ${
            t1.avgBST > t2.avgBST ? "Team 1" :
            t2.avgBST > t1.avgBST ? "Team 2" :
            "Equal!"
        }</h5>
    `;
}


// =======================
// Page Initialization
// =======================
document.addEventListener("DOMContentLoaded", () => {

    // Add "Clear Team" buttons
    document.querySelector("#team1").insertAdjacentHTML(
        "beforeend",
        `<button class="btn btn-danger mt-2 clear-team" data-team="team1">Clear Team 1</button>`
    );

    document.querySelector("#team2").insertAdjacentHTML(
        "beforeend",
        `<button class="btn btn-danger mt-2 clear-team" data-team="team2">Clear Team 2</button>`
    );

    // Clear button functionality
    document.querySelectorAll(".clear-team").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelector(`#${btn.dataset.team} .team-slot-container`).innerHTML = "";
        });
    });

    // ===============================
    // SINGLE Compare Teams Handler ✔
    // ===============================
    document.querySelector("#compare-teams-btn").addEventListener("click", async () => {
        const t1 = extractTeam("#team1");
        const t2 = extractTeam("#team2");

        if (t1.length === 0 || t2.length === 0) {
            alert("Both teams need at least 1 Pokémon!");
            return;
        }

        const teamStats1 = await loadTeamStats(t1);
        const teamStats2 = await loadTeamStats(t2);

        showComparison(teamStats1, teamStats2);
    });

});
