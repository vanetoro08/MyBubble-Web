import { showMessage } from './showMessageHome.js'
import { auth } from './firebase.js';

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { 
  guardarCancion, 
  eliminarCancion, 
  obtenerCancionesGuardadas,
  guardarRecomendaciones, 
  cancionEstaGuardada   
} from './database.js';

import {APIController} from './spotifyApi.js'

const cancionRecomenda = document.querySelector("#search-song");
const songList = document.querySelector('#cancionesBusqueda');
const recommendationsList = document.querySelector('#recomendaciones');
const input = document.querySelector('#buscar-cancion');
const ambientes = document.querySelector('#ambientes');

let songs = [];
let currentToken = null;
let selectedSong = null; 

let cancionesGuardadasIds = new Set();
let currentBusquedaId = null;
let usuarioAutenticado = false;

// Obtener token al cargar
window.addEventListener('DOMContentLoaded', async() => {
  currentToken = await APIController.getToken(); 
  console.log('Token listo');

  // Esperar autenticación de Firebase
  onAuthStateChanged(auth, async (user) => {
    if (user && user.emailVerified) {
      console.log("Usuario autenticado:", user.email);
      usuarioAutenticado = true;
      await cargarCancionesGuardadas();
    } else {
      console.log("Usuario no autenticado");
      usuarioAutenticado = false;
      cancionesGuardadasIds = new Set();
    }
  });
});

async function cargarCancionesGuardadas() {
  try {
    const canciones = await obtenerCancionesGuardadas();
    cancionesGuardadasIds = new Set(canciones.map(c => c.spotifyId));
    console.log('Canciones guardadas cargadas:', cancionesGuardadasIds.size);
  } catch (error) {
    console.error('Error cargando canciones guardadas:', error);
  }
}

// Buscar mientras el usuario escribe
input.addEventListener('input', async (e) => {
  const query = input.value.trim();
  
  // Si el input está vacio, limpiar resultados
  if (query.length === 0) {
    songList.innerHTML = '';
    songs = [];
    selectedSong = null;
    currentBusquedaId = null; 
    return;
  }
  
  // Esperar a que escriba al menos 2 caracteres
  if (query.length < 2) return;
  
  // Buscar canciones
  songList.innerHTML = "<p class='loaded'> Buscando...</p>";
  
  try {
    if (!currentToken) {
      currentToken = await APIController.getToken();
    }
    
    const data = await APIController._searchSongs(currentToken, query, 10, 0);
    songs = data.tracks.items;
    
    mostrarSugerencias(songs);
    
  } catch(error) {
    console.error('Error:', error);
    songList.innerHTML = '<p class="p-recomend"> Error al buscar</p>';
  }
});

// MOSTRAR SUGERENCIAS MIENTRAS ESCRIBE
function mostrarSugerencias(songs) {
  if (songs.length === 0) {
    songList.innerHTML = '<p class="p-recomend"> No se encontraron canciones</p>';
    return;
  }
  
  const html = songs.map(song => `
      <li class="suggestion-item"
          data-song-id="${song.id}">
        <img src="${song.album.images[2]?.url || song.album.images[0]?.url}" 
            alt="${song.name}">
        <div>
          <h2>${song.name}</h2>
          <p>${song.artists[0].name}</p>
        </div>
      </li>
  `).join('');
  
  songList.innerHTML = html;
  
  addSuggestionClickEvents();
}

// CUANDO EL USUARIO SELECCIONA LA CANCION DE SUGERENCIAS
function addSuggestionClickEvents() {
    const suggestionItems = document.querySelectorAll('.suggestion-item');
    
    suggestionItems.forEach(item => {
        item.addEventListener('click', () => {
            const songId = item.dataset.songId;
            selectedSong = songs.find(song => song.id === songId);

            input.value = `${selectedSong.name} - ${selectedSong.artists[0].name}`;
            
            console.log('Canción seleccionada:', selectedSong.name);

            songList.innerHTML = '';
        });
    });
}

// CUANDO PRESIONA EL BOTON "RECOMENDAR"
cancionRecomenda.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Verificar que haya una canción seleccionada
  if (!selectedSong) {
    showMessage('Por favor selecciona una canción de la lista primero', 'error');
    return;
  }
  
  console.log('Recomendaciones para:', selectedSong.name); 
  songList.innerHTML = '';
  recommendationsList.innerHTML = '<p class="p-recomend"> Buscando la música perfecta para ti....</p>';
  
  try {
    const recomendaciones = await APIController._getRecomendationsArray(currentToken, selectedSong);

    const recomendacionesValidas = recomendaciones.filter(rec => 
      rec && rec.name && rec.artists && rec.artists[0]   
    );

    //Guarda en Firestore y obtiene el ID de la búsqueda
    try {
      currentBusquedaId = await guardarRecomendaciones(selectedSong, recomendacionesValidas.slice(0, 10));
      console.log('Búsqueda guardada con ID:', currentBusquedaId);
    } catch (error) {
      console.error('Error guardando búsqueda:', error);
    }

    mostrarRecomendaciones(recomendacionesValidas.slice(0, 10));
    
  } catch(error) {
    console.error('Error:', error);
    recommendationsList.innerHTML = '<p class="p-recomend">Error al obtener recomendaciones</p>';
    showMessage('Error al obtener recomendaciones', 'error');
  }
});

// MOSTRAR RECOMENDACIONES
function mostrarRecomendaciones(recomendaciones) {
  ambientes.style.display = 'none';

  const validRecommendations = recomendaciones.filter(rec => rec && rec.name);

  if (validRecommendations.length === 0) {
    recommendationsList.innerHTML = '<p class="p-recomend">No se encontraron recomendaciones</p>';
    return;
  }
  
  const html = validRecommendations.map((song) => {
    const estaGuardada = cancionesGuardadasIds.has(song.id);
    
    return`
    <div class="info-songs">
      <img src="${song.album.images[2]?.url || song.album.images[0]?.url}" 
           alt="${song.name}" >

      <div class="info">
        <h1> Nombre</h1>
        <p> ${song.name} </p>
      </div>

      <div class="info">
        <h1>Artista</h1>
        <p>${song.artists[0].name}</p>
      </div>

      <div class="info">
        <h1>Album</h1>
        <p>${song.album.name}</p>
      </div>

      <div class="boton">
        <a href="${song.external_urls.spotify}" class="btnAñadir" target="_blank" rel="noopener noreferrer"> + </a>
        <button class="btnGuardar ${estaGuardada ? 'guardada' : ''}" data-song-id="${song.id}">
          ${estaGuardada ? '<ion-icon name="heart"></ion-icon>':'<ion-icon name="heart-outline"></ion-icon>'}
        </button>
      </div>
    </div>
  `}).join('');
  
  recommendationsList.innerHTML = `
   <div class ="titulos">
    <h1>Recomendaciones para ti</h1>
    <p>Explora la selección detallada de canciones.</p>
   </div>
    ${html}
  `;

  agregarEventosGuardar();
}

// GUARDAR Y ELIMINAR CANCIONES
function agregarEventosGuardar() {
  const botonesGuardar = document.querySelectorAll('.btnGuardar');
  
  botonesGuardar.forEach(boton => {
    boton.addEventListener('click', async (e) => {
      e.preventDefault();
      const songId = boton.dataset.songId;
      const estaGuardada = cancionesGuardadasIds.has(songId);
      
      // Encontrar la cancion en las recomendaciones
      const cancionContainer = boton.closest('.info-songs');
      const nombreElement = cancionContainer.querySelector('.info p');
      const artistaElement = cancionContainer.querySelectorAll('.info p')[1];
      const albumElement = cancionContainer.querySelectorAll('.info p')[2];
      const imagenElement = cancionContainer.querySelector('img');
      const spotifyLink = cancionContainer.querySelector('.btnAñadir').href;
      
      const cancionData = {
        spotifyId: songId,
        nombre: nombreElement.textContent.trim(),
        artista: artistaElement.textContent.trim(),
        album: albumElement.textContent.trim(),
        imagenUrl: imagenElement.src,
        spotifyUrl: spotifyLink
      };
      
      try {
        if (estaGuardada) {
          // Eliminar
          await eliminarCancion(songId);
          cancionesGuardadasIds.delete(songId);
          boton.innerHTML = '<ion-icon name="heart-outline"></ion-icon>';
          boton.classList.remove('guardada');
          showMessage('Canción eliminada de favoritos', 'success');
        } else {
          // Guardar (con el ID de la búsqueda actual)
          await guardarCancion(cancionData, currentBusquedaId);
          cancionesGuardadasIds.add(songId);
          boton.innerHTML = '<ion-icon name="heart"></ion-icon>'; 
          boton.classList.add('guardada');
          showMessage('Canción guardada en favoritos', 'success');
        }
      } catch (error) {
        console.error('Error:', error);
        showMessage('Error al guardar/eliminar canción', 'error');
      }
    });
  });
}

document.addEventListener('click', (e) => {
  if (!songList.contains(e.target) && e.target !== input) {
    songList.innerHTML = ''; 
  }
});