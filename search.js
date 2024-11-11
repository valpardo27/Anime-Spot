import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, query, onValue } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
    // ...
    // The value of `databaseURL` depends on the location of the database
    apiKey: "AIzaSyDYhW2kw2ltjKqbEEIVo2FT4CCnnGhCago",
    authDomain: "anime-spot-c5abd.firebaseapp.com",
    databaseURL: "https://anime-spot-c5abd-default-rtdb.firebaseio.com",
    projectId: "anime-spot-c5abd",
    storageBucket: "anime-spot-c5abd.appspot.com",
    messagingSenderId: "503857389985",
    appId: "1:503857389985:web:34a0c699d98a298a6f6be0",
    measurementId: "G-5GZMM8ERL6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Realtime Database and get a reference to the service
const db = getDatabase(app);
const animesRef = ref(db, "animes");


// Escucha el evento de búsqueda cuando el documento esté cargado
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const searchResultsContainer = document.getElementById("searchResults");

    if (!searchInput || !searchButton || !searchResultsContainer) {
        console.error("Uno o más elementos necesarios para la búsqueda no se encontraron.");
        return;
    }

    searchButton.addEventListener("click", () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm) {
            realizarBusqueda(searchTerm, searchResultsContainer);
        } else {
            searchResultsContainer.innerHTML = "<p>Por favor, ingrese un término de búsqueda.</p>";
        }
    });

    // Evento para realizar la búsqueda al presionar "Enter"
    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            realizarBusqueda(searchInput.value.trim().toLowerCase(), searchResultsContainer);
        }
    });
});

// Función para realizar la búsqueda
function realizarBusqueda(term, container) {
    const animesQuery = query(animesRef);

    onValue(animesQuery, (snapshot) => {
        const animes = snapshot.val();
        const resultados = Object.values(animes).filter(anime =>
            anime.Name.toLowerCase().includes(term) ||
            anime.English_name.toLowerCase().includes(term) ||
            anime.Other_name.toLowerCase().includes(term)
        );

        console.info(`Cantidad de resultados encontrados: ${resultados.length}`);
        mostrarAnimes(resultados, container);
    });
}

// Función para mostrar los resultados de búsqueda
function mostrarAnimes(animes, container) {
    container.innerHTML = ""; // Limpiar el contenido actual

    if (animes.length === 0) {
        container.innerHTML = "<p>No se encontraron resultados.</p>";
        return;
    }

    animes.forEach(anime => {
        const animeItem = document.createElement("div");
        animeItem.className = "movie-list-item";

        const animeImg = document.createElement("img");
        animeImg.className = "movie-list-item-img";
        animeImg.src = anime.Image_URL;
        animeImg.alt = anime.Name;

        const animeTextContainer = document.createElement("div");
        animeTextContainer.className = "movie-list-item-text";

        const animeTitle = document.createElement("span");
        animeTitle.className = "movie-list-item-title";
        animeTitle.textContent = anime.Name;

        const animeDesc = document.createElement("p");
        animeDesc.className = "movie-list-item-desc";
        const maxLength = 100;
        animeDesc.textContent = anime.Synopsis.length > maxLength
            ? anime.Synopsis.substring(0, maxLength) + "..."
            : anime.Synopsis;

        const animeButton = document.createElement("button");
        animeButton.className = "movie-list-item-button";
        animeButton.textContent = "Más info";

        animeButton.addEventListener("click", () => {
            // Guardar el ID del anime en localStorage
            localStorage.setItem("animeID", anime.anime_id);
            // Redirigir a la página de información
            window.location.href = "index-info.html";
        });

        animeTextContainer.appendChild(animeTitle);
        animeTextContainer.appendChild(animeDesc);
        animeTextContainer.appendChild(animeButton);

        animeItem.appendChild(animeImg);
        animeItem.appendChild(animeTextContainer);

        container.appendChild(animeItem);
    });
}
