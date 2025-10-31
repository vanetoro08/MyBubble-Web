
import { createUserWithEmailAndPassword,sendEmailVerification } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js"
import { auth } from './firebase.js'
import { showMessage } from './showMessage.js'

const signupForm = document.querySelector('#signup-form');


signupForm.addEventListener('submit' , async (e) =>{
  e.preventDefault();
  const nombre = signupForm['signup-nombre'].value
  const email = signupForm['signup-email'].value
  const password = signupForm['signup-password'].value

  console.log(nombre,email,password)

  try {
    const userCredentials = await createUserWithEmailAndPassword(auth,email,password)
    console.log(userCredentials)

    sendEmailVerification(auth.currentUser).then(() => {
      showMessage("Se ha enviado un correo de verificacion");
    });

    showMessage("Bienvenido " + nombre)

  } catch (error) {

    if(error.code == 'auth/email-already-in-use'){
      showMessage("El email ya esta en uso", "error")

    }else if(error.code == 'auth/invalid-email'){
      showMessage("Email invalido", "error")

    }else if(error.code == 'auth/weak-password'){
      showMessage("Contraseña debil", "error")

    }else if (error.code){
      showMessage("Algo salio mal", "error")
    }
  }

})


