import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js"
import { auth } from './firebase.js'
import { showMessage } from './showMessage.js'

const googleButton = document.querySelector('#googleLogin')


googleButton.addEventListener('click', async () =>{

  const provider = new GoogleAuthProvider()

  try {
   const credentials = await signInWithPopup(auth,provider) 
   console.log(credentials)

   showMessage("Bienvenido " + credentials.user.displayName, "succes")

  } catch (error) {
    console.log(error)
  }
})

