import { GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js"
import { auth } from './firebase.js'
import { showMessage } from './showMessage.js'
import { crearPerfilUsuario } from './database.js'
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js"
import { db } from './firebase.js'

const googleButton = document.querySelector('#googleLogin');
const googleSignupButton = document.querySelector('#googleSignup');

const handleGoogleAuth = async (isSignup = false) => {
  const provider = new GoogleAuthProvider();
  
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  try {
    const credentials = await signInWithPopup(auth, provider);
    const user = credentials.user;
    
    console.log(credentials);

    // Verificar si el usuario existe en Firestore
    const userDocRef = doc(db, 'Usuarios', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (isSignup) {

      // MODO REGISTRO //
      if (!userDoc.exists()) {
        // Usuario nuevo (crear perfil)
        await crearPerfilUsuario(
          user.uid, 
          user.email, 
          user.displayName || 'Usuario de Google'
        );
        showMessage("Cuenta creada exitosamente. Bienvenido " + user.displayName, "success");
      } else {

        // Usuario ya existe (redirigi a login)
        showMessage("Esta cuenta ya está registrada. Por favor inicia sesión", "error");
        sessionStorage.setItem('googleAuthRedirect', 'true');
        await signOut(auth);
        
        setTimeout(() => {
          sessionStorage.removeItem('googleAuthRedirect');
          window.location.href = './login.html?action=login';
        }, 2000);
        return;

      }
    } else {
      // MODO LOGIN //

      if (!userDoc.exists()) {
        // Usuario no existe 
        showMessage("Esta cuenta no está registrada. Por favor regístrate primero", "error");
        sessionStorage.setItem('googleAuthRedirect', 'true');
        await signOut(auth);
        
        setTimeout(() => {
          sessionStorage.removeItem('googleAuthRedirect');
          window.location.href = './login.html?action=register';
        }, 2000);
        return;

      } else {
        // Usuario existe
        showMessage("Bienvenido de nuevo " + user.displayName, "success");
      }
    }

    // Redirigi a home si todo fue exitoso
    setTimeout(() => {
      window.location.href = './home.html';
    }, 1500);

  } catch (error) {
    console.error(error);
    
    let errorMessage = "Error al autenticar con Google";
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = "La ventana de inicio de sesión fue cerrada";
        break;
      case 'auth/cancelled-popup-request':
        errorMessage = "Operación cancelada";
        break;
      case 'auth/popup-blocked':
        errorMessage = "El popup fue bloqueado por el navegador";
        break;
      case 'auth/account-exists-with-different-credential':
        errorMessage = "Ya existe una cuenta con este correo usando otro método";
        break;
      default:
        errorMessage = error.message;
    }
    
    showMessage(errorMessage, "error");
  }
};

// Boton de Login con Google
if (googleButton) {
  googleButton.addEventListener('click', async () => {
    await handleGoogleAuth(false); // false = es login
  });
}

// Boton de Signup con Google
if (googleSignupButton) {
  googleSignupButton.addEventListener('click', async () => {
    await handleGoogleAuth(true); // true = es registro
  });
}