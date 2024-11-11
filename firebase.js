import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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


const main = document.getElementById("main");

const submit_sign = document.getElementById("submit_sign");
submit_sign.addEventListener("click", function (event) {
    event.preventDefault();
    const name = document.getElementById("name_sign").value;
    const email = document.getElementById("email_sign").value;
    const password = document.getElementById("password_sign").value;
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            //signed up
            const user = userCredential.user;
            alert("Creando cuenta...");
            //...

            // Guardar el nombre en Firestore usando el UID del usuario
            setDoc(doc(db, "usuarios", user.uid), {
                correo: email,
                nombre: name,
                favoritos: []
            });

            console.log("Nombre guardado en Firestore");
            //...

            main.classList.remove("right-panel-active");
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // alert(errorMessage)
            console.error("Error creating user:", errorMessage);

            // Handle specific error codes (e.g., display an error message based on errorCode)
            let errorMessageToDisplay =
                "Ha ocurrido un error. Por favor intenta de nuevo.";
            switch (errorCode) {
                case "auth/weak-password":
                    errorMessageToDisplay =
                        "La contraseña debe tener 6 caracteres de longitud.";
                    break;
                case "auth/email-already-in-use":
                    errorMessageToDisplay = "El correo electrónico ya está en uso.";
                    break;
            }
            alert(errorMessageToDisplay);
        });
});

const submit_log = document.getElementById("submit_log");
submit_log.addEventListener("click", function (event) {
    event.preventDefault();
    const email_log = document.getElementById("email_log").value;
    const password_log = document.getElementById("password_log").value;

    signInWithEmailAndPassword(auth, email_log, password_log)
        .then((userCredential) => {
            const user = userCredential.user;
            alert("Accediendo...");
            window.location.href = "index.html";
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            let errorMessageToDisplay =
                "Ha ocurrido un error por favor intenta de nuevo.";
            switch (errorCode) {
                case "auth/invalid-credential":
                    errorMessageToDisplay = "Correo electrónico o contraseña inválidos."
                    break;
            }
            alert(errorMessageToDisplay);
        });
});

//reset password

const reset = document.getElementById("reset");
reset.addEventListener("click", function (event) {
    event.preventDefault()

    const email_log = document.getElementById("email_log").value;

    sendPasswordResetEmail(auth, email_log)
        .then(() => {
            alert("Correo enviado!")
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage);
        });
});

