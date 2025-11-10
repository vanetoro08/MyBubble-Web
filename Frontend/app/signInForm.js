
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js"
import { auth, db } from './firebase.js'
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js"
import { showMessage } from './showMessage.js'

const signInForm = document.querySelector('#login-form');

if(signInForm){
  signInForm.addEventListener('submit',async (e) =>{
    e.preventDefault();

    const email = signInForm['login-email'].value;
    const password = signInForm['login-password'].value;
    
    try {
      const userCredentials = await signInWithEmailAndPassword(auth,email,password)
      console.log(userCredentials)

      // Verifica si el email esta verificado
      if(!userCredentials.user.emailVerified) {
        showMessage("Por favor verifica tu correo electrónico antes de continuar", "error");
        await auth.signOut(); // Cierra sesion si no está verificado
        return;
      }

      showMessage("Bienvenido " + userCredentials.user.email)

      setTimeout(() => {
        window.location.href = 'home.html';
      }, 1000);

    } catch (error) {
      if(error.code == "auth/invalid-credential"){
        showMessage("Cotraseña o email incorrecto", "error")
      }else{
        showMessage(error.message,"error")
      }
    }
  })

}

// Solo ejecuta esto en páginas protegidas (no en login/signup)
const paginaActual = window.location.pathname.toLowerCase();
const paginasPublicas = ['login', 'signin', 'signup', 'registro', 'index'];
const esPublica = paginasPublicas.some(p => paginaActual.includes(p));

if(!esPublica) {
  
  onAuthStateChanged(auth, async (user) => {
    
    if (sessionStorage.getItem('googleAuthRedirect') === 'true') {
      return;
    }

    if(user) {
      console.log("Usuario autenticado:", user.email);
      
      // Verificar si el usuario se registro con Google
      const esUsuarioGoogle = user.providerData.some(provider => provider.providerId === 'google.com');
      
      if(esUsuarioGoogle) {

        // Verificar que exista en Firestore
        const userDocRef = doc(db, 'Usuarios', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if(!userDoc.exists()) {
          console.log("Usuario de Google no registrado en Firestore");
          showMessage("Por favor completa tu registro", "error");
          auth.signOut();
          window.location.href = './login.html?action=register';
        }
      } else {

        // Usuarios con email/password si necesitan verificar email
        if(!user.emailVerified) {
          showMessage("Por favor verifica tu correo electrónico", "error");
          auth.signOut();
          window.location.href = './login.html?action=login';
        } else {
          console.log("Email verificado - Acceso permitido");
        }
      }

    } else {
      console.log("Usuario no autenticado - Redirigiendo a login");
      window.location.href = './login.html?action=login';
    }
  });
}

