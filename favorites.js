import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, arrayRemove } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const firebaseConfig = {
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
const auth = getAuth(app);
const firestoreDB = getFirestore(app);
const realtimeDB = getDatabase(app);

function loadFavorites(user) {
    const userDocRef = doc(firestoreDB, "usuarios", user.uid);
    const favoritesList = document.getElementById("favorites-list");
    favoritesList.innerHTML = ""; // Limpiar lista actual

    getDoc(userDocRef)
        .then((userDoc) => {
            if (!userDoc.exists()) {
                console.log("No se encontró el documento del usuario.");
                mostrarMensajeNoFavoritos(favoritesList);
                return;
            }

            const userData = userDoc.data();
            const favorites = userData.favoritos || [];

            if (favorites.length === 0) {
                // Si no hay favoritos, mostrar el mensaje y salir
                mostrarMensajeNoFavoritos(favoritesList);
                return;
            }

            // Cargar detalles de cada anime favorito desde Realtime Database
            favorites.forEach(animeID => cargarAnimeFavorito(animeID, favoritesList, user.uid));
        })
        .catch((error) => {
            console.error("Error al cargar favoritos:", error);
        });
}

function mostrarMensajeNoFavoritos(container) {
    const noFavoritesMessage = document.createElement("p");
    noFavoritesMessage.className = "no-favorites-message";
    noFavoritesMessage.textContent = "Aún no tienes animes en tu lista de favoritos.";
    container.appendChild(noFavoritesMessage);
}

function cargarAnimeFavorito(animeID, container, userId) {
    const animeRef = ref(realtimeDB, `animes/anime_id_${animeID}`);

    get(animeRef).then((snapshot) => {
        if (!snapshot.exists()) {
            console.error("No se encontró el anime en la Realtime Database.");
            return;
        }

        const animeData = snapshot.val();

        const animeItem = document.createElement("div");
        animeItem.className = "movie-list-item";

        const animeImg = document.createElement("img");
        animeImg.className = "movie-list-item-img";
        animeImg.src = animeData.Image_URL;
        animeImg.alt = animeData.Name;

        const animeTitle = document.createElement("span");
        animeTitle.className = "movie-list-item-title";
        animeTitle.textContent = animeData.Name;

        const animeDesc = document.createElement("p");
        animeDesc.className = "movie-list-item-desc";
        const maxLength = 100;
        animeDesc.textContent = animeData.Synopsis.length > maxLength
            ? animeData.Synopsis.substring(0, maxLength) + "..."
            : animeData.Synopsis;

        const moreInfoButton = document.createElement("button");
        moreInfoButton.className = "movie-list-item-button";
        moreInfoButton.textContent = "Más info";
        moreInfoButton.onclick = () => {
            localStorage.setItem("animeID", animeID);
            window.location.href = "index-info.html";
        };

        const removeButton = document.createElement("button");
        removeButton.className = "movie-list-item-button remove-button";
        removeButton.textContent = "Eliminar";
        removeButton.onclick = () => {
            removeFromFavorites(animeID, userId);
        };

        animeItem.appendChild(animeImg);
        animeItem.appendChild(animeTitle);
        animeItem.appendChild(animeDesc);
        animeItem.appendChild(moreInfoButton);
        animeItem.appendChild(removeButton);
        container.appendChild(animeItem);
    }).catch((error) => {
        console.error("Error al cargar datos del anime:", error);
    });
}

function removeFromFavorites(animeID, userId) {
    const userDocRef = doc(firestoreDB, "usuarios", userId);

    updateDoc(userDocRef, {
        favoritos: arrayRemove(animeID)
    })
    .then(() => {
        console.log("Anime eliminado de favoritos.");
        loadFavorites(auth.currentUser); // Recargar la lista de favoritos
    })
    .catch((error) => {
        console.error("Error al eliminar de favoritos:", error);
    });
}

onAuthStateChanged(auth, (user) => {
    const favoritesList = document.getElementById("favorites-list");
    favoritesList.innerHTML = ""; // Limpiar lista actual

    if (user) {
        loadFavorites(user);
    } else {
        console.log("Usuario no autenticado.");
        mostrarMensajeNoFavoritos(favoritesList);
    }
});
