let search = document.querySelector('#search');
let error_box = document.querySelector('#errorbox');
let pokemon_list = document.querySelector('.pokemon-list');
let search_btn = document.querySelector('#search-btn');
let clear_btn = document.querySelector('#clear-btn');

let nameBox   = document.querySelector('.name');
let heightBox = document.querySelector('.height');
let weightBox = document.querySelector('.weight');
let typesBox  = document.querySelector('.types');
let pokemain  = document.querySelector('.pokemain-img');
let shiny     = document.querySelector('.pokemain-img-shiny');
let home = document.querySelector('#home');
let formsTab = document.querySelector('#forms');
let movesBox = document.querySelector('#moves');
let weaknessBox = document.querySelector('#weakness');
let statsBox = document.querySelector('#stats');



const base_url = "https://pokeapi.co/api/v2/pokemon/";
const defaultPokemon = "bulbasaur";

let megaList = [];
let allPokemon = [];

async function loadMegaData() {
    try {
        const res = await fetch("https://pogoapi.net/api/v1/mega_pokemon.json");
        if (!res.ok) throw new Error();
        megaList = await res.json();
    } catch {
        console.warn("Could not load Mega Evolution data.");
    }
}



search_btn.addEventListener("click", async () => {
    const query = search.value.trim().toLowerCase();
    if (!query) {
        error_box.innerText = "Please enter a Pokémon name or ID";
        error_box.classList.remove('hidden');
        return;
    }

    try {
        const res = await fetch(`${base_url}${query}`);
        if (!res.ok) throw new Error();
        const poke = await res.json();

        pokemon_list.innerHTML = "";

        let card = document.createElement('div');
        card.classList.add('pokemon-card');

        let img = document.createElement('img');
        img.classList.add('poke-img');
        img.src = poke.sprites.other['official-artwork'].front_default;

        let p = document.createElement('p');
        p.classList.add('poke-name');
        p.innerText = poke.name;

        card.appendChild(img);
        card.appendChild(p);
        card.addEventListener('click', () => PokemonDetails(poke.name));

        pokemon_list.appendChild(card);

    } catch {
        error_box.innerText = "Pokémon not found";
        error_box.classList.remove('hidden');
    }
});

clear_btn.addEventListener("click", () => {
    search.value = "";
    error_box.classList.add("hidden");
    pokemon_list.innerHTML = "";
});

let draggingPokemon = null;

const observer = new MutationObserver(() => {
    document.querySelectorAll(".pokemon-card").forEach(card => {
        if (!card.draggable) {
            card.draggable = true;
            card.addEventListener("dragstart", onDragStart);
        }
    });
});
observer.observe(pokemon_list, { childList: true, subtree: true });

function onDragStart(e) {
    const img = this.querySelector("img").src;
    const name = this.querySelector(".poke-name").innerText;
    draggingPokemon = { name, img };
}

document.querySelectorAll(".team-box").forEach(box => {
    box.addEventListener("dragover", e => {
        e.preventDefault();
        box.classList.add("drag-over");
    });

    box.addEventListener("dragleave", () => {
        box.classList.remove("drag-over");
    });

    box.addEventListener("drop", () => {
        box.classList.remove("drag-over");
        addToTeam(box);
    });
});

