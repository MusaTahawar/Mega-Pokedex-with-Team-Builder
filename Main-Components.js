window.addEventListener("DOMContentLoaded", async () => {
    await loadMegaData();
    PokemonDetails(defaultPokemon);
    await GetPokemon(800); // Load first 50 Pokémon initially
});

async function GetPokemon(limit =850) {
    pokemon_list.innerHTML = "";
    for (let i = 1; i <= limit; i++) {
        try {
            const res = await fetch(base_url + i);
            const pokemon = await res.json();

            let card = document.createElement('div');
            card.classList.add('pokemon-card');

            let img = document.createElement('img');
            img.classList.add('poke-img');
            img.src = pokemon.sprites.other['official-artwork'].front_default;

            let p = document.createElement('p');
            p.classList.add('poke-name');
            p.innerText = pokemon.name;

            card.appendChild(img);
            card.appendChild(p);
            card.addEventListener('click', () => PokemonDetails(pokemon.name));

            pokemon_list.appendChild(card);
        } catch (err) {
            console.warn(`Failed to load Pokémon ${i}`, err);
        }
    }
}

async function PokemonDetails(pokemonName) {
    try {
        const res = await fetch(base_url + pokemonName.toLowerCase());
        if (!res.ok) throw new Error();
        const data = await res.json();

        pokemain.src = data.sprites.other["official-artwork"].front_default;
        shiny.src = data.sprites.other["official-artwork"].front_shiny;
        

        nameBox.innerText = `#${data.id} - ${data.name}`;
        heightBox.innerText = `Height: ${data.height}`;
        weightBox.innerText = `Weight: ${data.weight}`;
        typesBox.innerText = `Types: ${data.types.map(t => t.type.name).join(', ')}`;
        movesBox.innerText = `Moves: ${data.moves.slice(0, 6).map(m => m.move.name).join(', ')}`;

        home.innerHTML = "";

        const speciesRes = await fetch(data.species.url);
        const speciesData = await speciesRes.json();

        const evoRes = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoRes.json();

        let evoList = [];
        function explore(chain) {
            evoList.push(chain.species.name);
            chain.evolves_to.forEach(e => explore(e));
        }
        explore(evoData.chain);

        for (let evoName of evoList) {
            const evoReq = await fetch(base_url + evoName);
            const evoPoke = await evoReq.json();

            let card = document.createElement('div');
            card.classList.add('pokemon-card');

            let img = document.createElement('img');
            img.classList.add('poke-img');
            img.src = evoPoke.sprites.other['official-artwork'].front_default;

            let p = document.createElement('p');
            p.classList.add('poke-name');
            p.innerText = evoName;

            card.appendChild(img);
            card.appendChild(p);
            card.addEventListener('click', () => PokemonDetails(evoName));
            home.appendChild(card);
        }

        const weaknessBox = document.querySelector('#weakness');
        weaknessBox.innerHTML = "<h5>Weaknesses</h5>";

        let weaknesses = new Set();
        for (let t of data.types) {
            const typeRes = await fetch(t.type.url);
            const typeData = await typeRes.json();
            typeData.damage_relations.double_damage_from.forEach(w => weaknesses.add(w.name));
        }
        weaknessBox.innerHTML += `<p>${[...weaknesses].map(w => `<span class="badge bg-danger me-1">${w}</span>`).join(' ')}</p>`;

        formsTab.innerHTML = "";
        let header = document.createElement("h5");
        header.textContent = "Forms & Transformations";
        formsTab.appendChild(header);

        let container = document.createElement("div");
        container.classList.add("forms-container");
        formsTab.appendChild(container);

        let movesTab = document.querySelector('#moves');
        movesTab.innerHTML = "<h5>Moves</h5>";
        if (data.moves.length > 0) {
            const movesList = document.createElement('ul');
            movesList.classList.add('list-group');
            data.moves.forEach(m => {
                let li = document.createElement('li');
                li.classList.add('list-group-item');
                li.innerText = m.move.name;
                movesList.appendChild(li);
            });
            movesTab.appendChild(movesList);
        } else movesTab.innerHTML += "<p>No moves available.</p>";

        let statsTab = document.querySelector('#stats');
        statsTab.innerHTML = "<h5>Stats</h5>";
        if (data.stats.length > 0) {
            const statsList = document.createElement('ul');
            statsList.classList.add('list-group');
            data.stats.forEach(s => {
                let li = document.createElement('li');
                li.classList.add('list-group-item');
                li.innerHTML = `<strong>${s.stat.name.toUpperCase()}:</strong> ${s.base_stat}`;
                statsList.appendChild(li);
            });
            statsTab.appendChild(statsList);
        } else statsTab.innerHTML += "<p>No stats available.</p>";

        function createCard(name, url) {
            let card = document.createElement('div');
            card.classList.add('pokemon-card');

            let img = document.createElement('img');
            img.classList.add('poke-img');
            img.src = url;

            let p = document.createElement('p');
            p.classList.add('poke-name');
            p.innerText = name;

            card.appendChild(img);
            card.appendChild(p);
            card.addEventListener("click", () => PokemonDetails(name));

            container.appendChild(card);
        }

        if (megaList.length > 0) {
            const base = data.name.toLowerCase();
            const megas = megaList.filter(m => m.pokemon_name.toLowerCase() === base);
            megas.forEach(m => {
                let slug = m.mega_name.toLowerCase().replace(/ /g, "-");
                let sprite = `https://img.pokemondb.net/sprites/bank/normal/${slug}.png`;
                createCard(m.mega_name, sprite);
            });
        }

        if (["groudon", "kyogre"].includes(data.name.toLowerCase())) {
            let slug = `${data.name.toLowerCase()}-primal`;
            let sprite = `https://img.pokemondb.net/sprites/bank/normal/${slug}.png`;
            createCard(`Primal ${data.name}`, sprite);
        }

        const gmaxList = [
            "charizard","blastoise","venusaur","pikachu","eevee","snorlax",
            "gengar","machamp","kingler","orbeetle","drednaw","coalossal",
            "flapple","appletun","sandaconda","toxtricity","centiskorch",
            "hatterene","grimmsnarl","alcremie","copperajah","durant",
            "duraludon","urshifu-single-strike","urshifu-rapid-strike"
        ];

        if (gmaxList.includes(data.name.toLowerCase())) {
            let slug = `${data.name.toLowerCase()}-gmax`;
            let sprite = `https://img.pokemondb.net/sprites/bank/normal/${slug}.png`;
            createCard(`Gigantamax ${data.name}`, sprite);
        }

        const regionalWords = ["alola","galar","hisui","paldea"];
        for (let v of speciesData.varieties) {
            let formName = v.pokemon.name.toLowerCase();
            if (regionalWords.some(r => formName.includes(r))) {
                const vRes = await fetch(v.pokemon.url);
                const vData = await vRes.json();
                let sprite = vData.sprites.other["official-artwork"].front_default || vData.sprites.front_default;
                createCard(v.pokemon.name, sprite);
            }
        }

        for (let v of speciesData.varieties) {
            if (!v.is_default) {
                const vRes = await fetch(v.pokemon.url);
                const vData = await vRes.json();
                let sprite = vData.sprites.other["official-artwork"].front_default || vData.sprites.front_default;
                createCard(v.pokemon.name, sprite);
            }
        }

        if (container.children.length === 0) {
            container.innerHTML = `<p class="text-muted">This Pokémon has no alternate forms.</p>`;
        }
    

    } catch {
        error_box.innerText = "Pokémon not found";
        error_box.classList.remove('hidden');
    }
}
