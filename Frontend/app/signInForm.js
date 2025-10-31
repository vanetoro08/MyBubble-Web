import { signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js"
import { auth } from './firebase.js'
import { showMessage } from './showMessage.js'

const signInForm = document.querySelector('#login-form');


signInForm.addEventListener('submit',async (e) =>{
  e.preventDefault();

  const email = signInForm['login-email'].value;
  const password = signInForm['login-password'].value;
  
  try {
    const userCredentials = await signInWithEmailAndPassword(auth,email,password)
    console.log(userCredentials)

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


auth.onAuthStateChanged(user => {
  if(user){
    console.log("Usuario Activo");
    var email = user.emailVerified;

    if(email){
      window.location.href = "./home.html";
    }else{
      auth.signOut();
    }
  }else{
    console.log("Usuario inactivo");
  }
})