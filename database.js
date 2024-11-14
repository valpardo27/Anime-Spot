import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, query, orderByChild, limitToLast, onValue } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

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
const db = getDatabase(app);
const animesRef = ref(db, "animes");
const firestoreDB = getFirestore(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
    const pathname = window.location.pathname;

    // Selecciona los contenedores según la categoría
    const ultimosAgregadosContainer = document.querySelector(".ultimos-agregados-list");
    const masVistosContainer = document.querySelector(".mas-vistos-list");
    const recomendacionesContainar = document.querySelector(".recomendaciones-list");

    // Cargar recomendaciones basadas en los favoritos del usuario una vez autenticado
    onAuthStateChanged(auth, (user) => {
        if (user) {

            let tipo;
            if (pathname.includes("index.html")) {
                tipo = "TV";
            } else if (pathname.includes("index-movies.html")) {
                tipo = "Movie";
            } else if (pathname.includes("index-trend.html")) {
                tipo = "Trend";
            }

            // Si se encuentra una categoría, llama a las funciones correspondientes
            if (tipo) {
                if (ultimosAgregadosContainer) {
                    obtenerUltimosAnimesPublicados(ultimosAgregadosContainer, tipo);
                }
                if (masVistosContainer) {
                    obtenerAnimesMasPopulares(masVistosContainer, tipo);
                }
                if (recomendacionesContainar) {
                    obtenerFavoritosYRecomendaciones(user.uid);
                }
            }
        }
    });




});

function obtenerUltimosAnimesPublicados(container, tipo) {
    const ultimosAnimesQuery = query(animesRef, orderByChild("Aired/Start"));

    onValue(ultimosAnimesQuery, (snapshot) => {
        let animes = snapshot.val();
        animes = Object.values(animes);

        if (tipo !== "Trend") {
            // Filtrar por tipo "TV" o "Movie" si no es "Trend"
            animes = animes.filter(anime => anime.Type.toLowerCase() === tipo.toLowerCase());
        }

        // Filtrar y ordenar los animes: excluir los que tienen "Not available" en Aired.Start
        const animesFiltrados = animes
            .filter(anime => anime.Aired.Start !== "Not available")
            .sort((a, b) => new Date(b.Aired.Start) - new Date(a.Aired.Start));


        // Limitar a los últimos 10 animes después de ordenar
        animes = animesFiltrados.slice(0, 10);

        console.info(`Cantidad de animes obtenidos para ${tipo} en Últimos Agregados:`, animes.length);
        mostrarAnimes(animes, container);
    });
}

function obtenerAnimesMasPopulares(container, tipo) {
    const orderAttribute = tipo === "Trend" ? "Popularity" : "Scored_By";
    const popularAnimesQuery = query(animesRef, orderByChild(orderAttribute));

    onValue(popularAnimesQuery, (snapshot) => {
        let animes = snapshot.val();
        animes = Object.values(animes);

        if (tipo !== "Trend") {
            // Filtrar por tipo "TV" o "Movie" si no es "Trend"
            animes = animes.filter(anime => anime.Type.toLowerCase() === tipo.toLowerCase());
        }

        // Ordenar los animes por el atributo correspondiente (Popularidad o Scored_By) en orden descendente
        animes.sort((a, b) => b[orderAttribute] - a[orderAttribute]);

        // Limitar a los 10 animes más populares después de ordenar
        animes = animes.slice(0, 10);

        console.info(`Cantidad de animes obtenidos para ${tipo} en Más Vistos:`, animes.length);
        mostrarAnimes(animes, container);
    });
}

function mostrarAnimes(animes, container) {
    const movieListWrapper = container.querySelector(".movie-list-wrapper");
    movieListWrapper.innerHTML = ""; // Limpiar el contenido actual

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
            ? anime.Synopsis.substring(0, maxLength) + '...'
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
        movieListWrapper.appendChild(animeItem);
    });

    if (!container.querySelector(".arrow")) {
        const arrow = document.createElement("i");
        arrow.className = "fas fa-chevron-right arrow";
        container.appendChild(arrow);

        arrow.addEventListener("click", () => {
            const maxScrollLeft = movieListWrapper.scrollWidth - movieListWrapper.clientWidth;
            const itemWidth = 480;
            if (movieListWrapper.scrollLeft + itemWidth >= maxScrollLeft) {
                movieListWrapper.scrollLeft = 0;
            } else {
                movieListWrapper.scrollLeft += itemWidth;
            }
        });
    }
}

function mostrarMensajeNoFavoritos(container) {
    const noFavoritesMessage = document.createElement("p");
    noFavoritesMessage.className = "no-favorites-message";
    noFavoritesMessage.textContent = "Aún no tienes animes en tu lista de favoritos.";
    container.appendChild(noFavoritesMessage);
}

function obtenerFavoritosYRecomendaciones(userId) {
    const userDocRef = doc(firestoreDB, "usuarios", userId);
    const recomendacionesContainer = document.querySelector(".recomendaciones-list .movie-list-wrapper");

    getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
            const favoritos = docSnap.data().favoritos || [];
            if (favoritos.length > 0) {
                const pathname = window.location.pathname;
                let tipo;
                if (pathname.includes("index.html")) {
                    tipo = "TV";
                } else if (pathname.includes("index-movies.html")) {
                    tipo = "Movie";
                } 
                
                obtenerRecomendaciones(favoritos, tipo, recomendacionesContainer); // Pasamos el tipo aquí
            } else {
                console.log("No hay favoritos para el usuario.");
                mostrarMensajeNoFavoritos(recomendacionesContainer);
            }
        } else {
            console.log("No se encontró el documento del usuario.");
            mostrarMensajeNoFavoritos(recomendacionesContainer);
        }
    }).catch((error) => {
        console.error("Error al obtener favoritos:", error);
        mostrarMensajeNoFavoritos(recomendacionesContainer);
    });
}

function obtenerRecomendaciones(favoritos, tipo, recomendacionesContainer) {
    // Convierte los IDs de favoritos en una cadena de parámetros separados
    const favoritosParams = favoritos.map(id => `anime_id=${id}`).join("&");

    // Llamada a la API de recomendación con los IDs de los favoritos
    fetch(`https://animespot.eastus2.cloudapp.azure.com/recommendations?${favoritosParams}&top_n=10`)
        .then(response => response.json())
        .then(data => {
            // Filtra las recomendaciones por el tipo de anime
            const recomendacionesFiltradas = data.filter(anime => anime.Type.toLowerCase() === tipo.toLowerCase());
            // Si no hay recomendaciones para el tipo especificado, muestra un mensaje
            if (recomendacionesFiltradas.length === 0) {
                mostrarMensajeNoTipo(recomendacionesContainer, tipo); // Mostrar mensaje específico de tipo
            } else {
                mostrarRecomendaciones(recomendacionesFiltradas);
            }
        })
        .catch(error => console.error("Error obteniendo recomendaciones:", error));
}

function mostrarMensajeNoTipo(container, tipo) {
    const noTipoMessage = document.createElement("p");
    noTipoMessage.className = "no-tipo-message";
    noTipoMessage.textContent = `No hay recomendaciones de tipo ${tipo}.`;
    container.appendChild(noTipoMessage);
}

function mostrarRecomendaciones(recommendations) {
    const movieListContainer = document.querySelector(".recomendaciones-list .movie-list-wrapper");
    movieListContainer.innerHTML = ""; // Limpiar el contenido actual

    recommendations.forEach(anime => {
        const animeItem = document.createElement("div");
        animeItem.className = "movie-list-item";

        const animeImg = document.createElement("img");
        animeImg.className = "movie-list-item-img";
        animeImg.src = anime["Image URL"];
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
            ? anime.Synopsis.substring(0, maxLength) + '...'
            : anime.Synopsis;

        const animeButton = document.createElement("button");
        animeButton.className = "movie-list-item-button";
        animeButton.textContent = "Más info";
        animeButton.addEventListener("click", () => {
            localStorage.setItem("animeID", anime.anime_id);
            window.location.href = "index-info.html";
        });

        animeTextContainer.appendChild(animeTitle);
        animeTextContainer.appendChild(animeDesc);
        animeTextContainer.appendChild(animeButton);

        animeItem.appendChild(animeImg);
        animeItem.appendChild(animeTextContainer);
        movieListContainer.appendChild(animeItem);
    });

    // Configuración de la flecha para deslizar la lista de recomendaciones
    if (!document.querySelector(".recomendaciones-list .arrow")) {
        const arrow = document.createElement("i");
        arrow.className = "fas fa-chevron-right arrow";
        document.querySelector(".recomendaciones-list").appendChild(arrow);
    
        arrow.addEventListener("click", () => {
            const maxScrollLeft = movieListContainer.scrollWidth - movieListContainer.clientWidth;
            const itemWidth = 480;
            if (movieListContainer.scrollLeft + itemWidth >= maxScrollLeft) {
                movieListContainer.scrollLeft = 0;
            } else {
                movieListContainer.scrollLeft += itemWidth;
            }
        });
    }
}
