
const cancionRecomendar = document.querySelector("#search-song");

cancionRecomendar.addEventListener('submit',async (e) =>{
  e.preventDefault();
  const cancionIngresada = cancionRecomendar['buscar-cancion'].value;
  console.log(cancionIngresada);
})