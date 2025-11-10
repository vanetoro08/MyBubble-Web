import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js"
import { auth } from './app/firebase.js'
import { getRedirectResult } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js"
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js"
import { crearPerfilUsuario } from './app/database.js'
import { showMessage } from './app/showMessage.js'


//script principal. Se importan los otros archivos de javascript y se llama en la respectiva pagina.
//Ej: en home.html se puso <script type="module" src="./app/logout.js" defer></script>

import './app/signupForm.js'
import './app/signInForm.js'
import './app/logout.js'
import './app/googleLogin.js'


const container = document.getElementById('container');
const btnSignUp = document.getElementById('btn-sign-up');
const btnSignIn = document.getElementById('btn-sign-in');


window.addEventListener('DOMContentLoaded',async () => {
  const params = new URLSearchParams(window.location.search);
  const action = params.get('action');
  
  if (action === 'register') {
    container.classList.add('toggle');
  } else if (action === 'login') {
    container.classList.remove('toggle');
  }
});

if(btnSignUp){
  btnSignUp.addEventListener('click', () => {
    container.classList.add('toggle');
  });
}

if(btnSignIn){
  btnSignIn.addEventListener('click', () => {
    container.classList.remove('toggle');
  });
}

