import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
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
const db = getDatabase(app); // Realtime Database
const firestoreDB = getFirestore(app); // Firestore
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
    // Obtener el ID del anime guardado en localStorage
    const animeId = localStorage.getItem("animeID");

    if (!animeId) {
        console.error("No se encontró el ID del anime.");
        return;
    }

    // Obtener la referencia a la base de datos para este anime
    const animeRef = ref(db, `animes/anime_id_${animeId}`);

    // Leer los datos del anime desde la base de datos
    onValue(animeRef, (snapshot) => {
        const animeData = snapshot.val();
        if (animeData) {
            mostrarAnimeInfo(animeData);
            obtenerRecomendaciones(animeId);
        } else {
            console.error("No se encontraron datos para el ID de anime:", animeId);
        }
    });
});

function mostrarAnimeInfo(animeData) {
    // Limpiar y mostrar el título del anime
    const titleElement = document.querySelector(".anime-title-text");
    titleElement.innerHTML = ""; // Limpiar contenido
    titleElement.textContent = animeData.Name || "Título desconocido";

    // Limpiar y mostrar el tipo y lenguaje
    const typeLanguageElement = document.querySelector(".type-language");
    typeLanguageElement.innerHTML = ""; // Limpiar contenido
    typeLanguageElement.textContent = animeData.Language || "Sub | Dub";

    // Limpiar y mostrar estrellas basadas en la calificación
    const starsContainer = document.querySelector(".stars");
    starsContainer.innerHTML = ""; // Limpiar estrellas previas
    const rating = Math.round((animeData.Score || 0) / 2);
    for (let i = 0; i < 5; i++) {
        const star = document.createElement("i");
        star.className = i < rating ? "fa-solid fa-star active" : "fa-regular fa-star";
        starsContainer.appendChild(star);
    }

    // Mostrar la calificación numérica
    const scoreText = document.createElement("span");
    scoreText.className = "score-text";
    scoreText.textContent = ` ${animeData.Score || 0}/10`;
    starsContainer.appendChild(scoreText);

    // Limpiar y mostrar la sinopsis
    const descriptionElement = document.querySelector(".text-description p");
    descriptionElement.innerHTML = ""; // Limpiar contenido
    descriptionElement.textContent = animeData.Synopsis || "Sin descripción disponible.";

    // Limpiar y mostrar los géneros
    const genresContainer = document.querySelector(".content-genres");
    genresContainer.innerHTML = ""; // Limpiar géneros previos
    if (animeData.Genres && animeData.Genres.length > 0) {
        animeData.Genres.forEach((genre) => {
            const genreDiv = document.createElement("div");
            genreDiv.className = "genre";
            genreDiv.textContent = genre;
            genresContainer.appendChild(genreDiv);
        });
    } else {
        const noGenresMessage = document.createElement("div");
        noGenresMessage.className = "no-genres-message";
        noGenresMessage.textContent = "No hay géneros disponibles.";
        genresContainer.appendChild(noGenresMessage);
    }

    // Limpiar y mostrar detalles adicionales en una tabla
    const details = {
        "Tipo": animeData.Type || "Anime",
        "Estudio": animeData.Studios || "Desconocido",
        "Recurso": animeData.Source || "Desconocido",
        "Duración": animeData.Duration || "Desconocida",
        "Clasificación": animeData.Rating || "Desconocida"
    };

    const tableContainer = document.querySelector(".show-details-table");
    tableContainer.innerHTML = ""; // Limpiar tabla previa
    for (const key in details) {
        const row = document.createElement("div");
        row.className = "table-row";

        const columnName = document.createElement("div");
        columnName.className = "column-name";
        columnName.textContent = key;

        const columnValue = document.createElement("div");
        columnValue.className = "column-value";
        columnValue.textContent = details[key];

        row.appendChild(columnName);
        row.appendChild(columnValue);
        tableContainer.appendChild(row);
    }

    // Limpiar y mostrar imagen del anime
    const animeImg = document.querySelector(".anime-img");
    animeImg.src = animeData.Image_URL; // Imagen por defecto si no hay imagen
    animeImg.alt = animeData.Name;

}

function toggleFavorite(animeID) {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(firestoreDB, "usuarios", user.uid);
    getDoc(userDocRef).then((userDoc) => {
        const userData = userDoc.data();
        const isFavorite = userData.favoritos.includes(animeID);
        const favoriteIcon = document.getElementById("favorite-icon");

        if (isFavorite) {
            updateDoc(userDocRef, {
                favoritos: arrayRemove(animeID)
            }).then(() => {
                favoriteIcon.classList.remove("active");
                console.log("Anime eliminado de favoritos.");
                alert("Anime eliminado de favoritos.");
            });
        } else {
            updateDoc(userDocRef, {
                favoritos: arrayUnion(animeID)
            }).then(() => {
                favoriteIcon.classList.add("active");
                console.log("Anime agregado a favoritos.");
                alert("Anime agregado a favoritos.");
            });
        }
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        const animeID = localStorage.getItem("animeID");
        const favoriteIcon = document.getElementById("favorite-icon");

        const userDocRef = doc(firestoreDB, "usuarios", user.uid);
        getDoc(userDocRef).then((userDoc) => {
            const userData = userDoc.data();
            if (userData.favoritos.includes(animeID)) {
                favoriteIcon.classList.toggle("active");
            }
        });

        favoriteIcon.addEventListener("click", () => toggleFavorite(animeID));
    }
});

function obtenerRecomendaciones(animeId) {
    console.log("Obteniendo recomendaciones para anime ID:", animeId);
    fetch(`http://127.0.0.1:5000/recommendations?anime_id=${animeId}&top_n=5`)
        .then(response => response.json())
        .then(data => {
            mostrarRecomendaciones(data);
        })
        .catch(error => console.error("Error obteniendo recomendaciones:", error));
}

function mostrarRecomendaciones(recommendations) {
    const movieList = document.querySelector(".similar-to-this .movie-list");
    movieList.innerHTML = "";

    recommendations.forEach(anime => {
        const animeItem = document.createElement("div");
        animeItem.className = "movie-list-item";

        const animeImg = document.createElement("img");
        animeImg.className = "movie-list-item-img";
        animeImg.src = anime["Image URL"];
        animeImg.alt = anime.Name;

        const animeTitle = document.createElement("span");
        animeTitle.className = "movie-list-item-title";
        animeTitle.textContent = anime.Name;

        const animeDesc = document.createElement("p");
        animeDesc.className = "movie-list-item-desc";
        animeDesc.textContent = anime.Synopsis.substring(0, 100) + "...";

        const animeButton = document.createElement("button");
        animeButton.className = "movie-list-item-button";
        animeButton.textContent = "Más info";

        animeButton.addEventListener("click", () => {
            // Guardar el ID del anime en localStorage
            localStorage.setItem("animeID", anime.anime_id);
            // Redirigir a la página de información
            window.location.href = "index-info.html";
        });

        animeItem.appendChild(animeImg);
        animeItem.appendChild(animeTitle);
        animeItem.appendChild(animeDesc);
        animeItem.appendChild(animeButton);

        movieList.appendChild(animeItem);
    });
    console.log("Recomendaciones recibidas:", recommendations);
}
