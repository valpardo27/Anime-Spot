import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            // Recuperar el documento del usuario desde Firestore usando su UID
            const userDoc = await getDoc(doc(db, "usuarios", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const userName = userData.nombre;

                // Muestra el nombre en el campo HTML específico
                const userNameDisplay = document.getElementById("user_name_display");
                userNameDisplay.innerHTML = `${userName} <i class="fas fa-caret-down"></i>`;
            } else {
                console.log("El documento del usuario no existe.");
            }
        } catch (error) {
            console.error("Error al obtener el nombre del usuario:", error);
        }
    } else {
        console.log("Ningún usuario conectado");
    }
});

const logout = document.getElementById("logout");
logout.addEventListener("click", function (event) {
    event.preventDefault();

    signOut(auth).then(() => {
        // Sign-out successful.
        window.location.href = "index-login.html";
    }).catch((error) => {
        // An error happened.
    });
});


const logout_footer = document.getElementById("logout_footer");
logout_footer.addEventListener("click", function (event) {
    event.preventDefault();

    signOut(auth).then(() => {
        // Sign-out successful.
        window.location.href = "index-login.html";
    }).catch((error) => {
        // An error happened.
    });
});