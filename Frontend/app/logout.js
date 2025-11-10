
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js"
import {auth} from './firebase.js'
import { showMessage } from './showMessage.js'

const logout = document.querySelector('#logout')

if(logout){
  
  logout.addEventListener('click',async () =>{
    
    try {
    
      await signOut(auth)
      console.log('Sesión cerrada')
      showMessage("Sesión cerrada correctamente")
      
      setTimeout(() => {
        window.location.href = 'index.html'; 
      }, 1000);
      
    } catch (error) {
      showMessage("Error al cerrar sesión: " + error.message, "error")
    }
  })

  document.addEventListener('click', (e) => {
    if (menu && !menu.contains(e.target) && !logout.contains(e.target)) {
      menu.classList.remove('menu-active')
    }
  })

}

