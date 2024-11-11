const arrows = document.querySelectorAll(".arrow");
const movieLists = document.querySelectorAll(".movie-list-wrapper");

// document.querySelectorAll('.movie-list-container').forEach(container => {
//   const listWrapper = container.querySelector('.movie-list-wrapper');
//   const arrow = container.querySelector('.arrow');
//   const itemWidth = 320; // Ajusta según el tamaño de cada `.movie-list-item`
  
//   arrow.addEventListener("click", () => {
//       const maxScrollLeft = listWrapper.scrollWidth - listWrapper.clientWidth;

//       // Verificar si estamos al final del scroll y volver al inicio si es así
//       if (listWrapper.scrollLeft + itemWidth >= maxScrollLeft) {
//           listWrapper.scrollLeft = 0; // Volver al inicio
//       } else {
//           listWrapper.scrollLeft += itemWidth; // Desplazar hacia la derecha
//       }
//   });
// });


//TOGGLE

const ball = document.querySelector(".toggle-ball");
const items = document.querySelectorAll(
  ".container,.movie-list-title,.navbar-container,.sidebar,.left-menu-icon,.toggle,.anime-content"
);

ball.addEventListener("click", () => {
  items.forEach((item) => {
    item.classList.toggle("active");
  });
  ball.classList.toggle("active");
});


//Functions

function gotoHome() {
  window.location.href = "index.html";
}

// function gotoAnime() {
//   window.location.href = "index-info.html";
// }

function gotoMovie() {
  window.location.href = "index-movies.html";
}

function gotoTrend() {
  window.location.href = "index-trend.html";
}

function gotoSearch() {
  window.location.href = "index-search.html";
}

function gotoFavs() {
  window.location.href = "index-favorites.html"
}