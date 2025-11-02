const cancionRecomendar = document.querySelector("#search-song");

cancionRecomendar.addEventListener('submit', async (e) => {
  e.preventDefault();
  const cancionIngresada = cancionRecomendar['buscar-cancion'].value;
  console.log(cancionIngresada);
  
  const token = await APIController.getToken();
  const genres = await APIController._getGenres(token);
  const songs = await APIController._getSongs(token , cancionIngresada);
  console.log(songs.tracks.items);
  /*genres.forEach(genre => {
    console.log(genre.name);
  });*///ts shows the genres
  songs.tracks.items.forEach(song => {
    console.log(song.name);
  });
})

const APIController = (function() {  

  const clientId = 'f223935525294f5fb019d66c85716c51';
  const clientSecret = '553ee20fd0434b3eae86c90babfea86f';

  const getToken = async () => {
   
      const resultado = await fetch('https://accounts.spotify.com/api/token', { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
      });

      const data = await resultado.json();
      console.log('Access token:', data.access_token); 
      return data.access_token; 
    
  }

  const _getGenres = async (token) => {
    const resultado = await fetch('https://api.spotify.com/v1/browse/categories?locale=sv_CO', {
      method: 'GET', 
      headers: {'Authorization': 'Bearer ' + token}
    });

    const data = await resultado.json();
   
    return data.categories.items;
  }

  const _getSongs = async(token, track )=>{
    const trackId = await fetch('https://api.spotify.com/v1/search?q='+ track +'&type=track&limit=10' , { // Type = tipo que se desea buscar el id
      method: 'GET' , 
      headers: {'Authorization': 'Bearer '+ token}
    });
    const trackResult = trackId.json()
    return trackResult; 
  }
  return {
    getToken,
    _getGenres,
    _getSongs
  };

  
})(); 