const cancionRecomendar = document.querySelector("#search-song");

cancionRecomendar.addEventListener('submit', async (e) => {
  e.preventDefault();
  const cancionIngresada = cancionRecomendar['buscar-cancion'].value;
  console.log(cancionIngresada);
  
  const token = await APIController.getToken();
  var songs = await APIController._searchSongs(token , cancionIngresada, 10,0); // resultados de la primera busqueda (Ejemplo: buscar Rule ado , salen x canciones de ese resultado y luego se elige con cual desea la recomendación)
  songs = songs.tracks.items; // ya acá está simplificado
  const songSelected = songs[0]; // digamos que el usuario elgió la primera canción ( Deberia de servir para cualquiera del array :b ) 
  APIController._getRecomendationsArray(token , songSelected);
  /*console.log(await APIController._getSongByAlbum(token, songSelected));
  console.log("por artista");
  console.log(APIController._getSongByArtist(token , songSelected));
  console.log("por genero y año");
  APIController._getSongByGenreAndYear(token, songSelected);
  console.log("solo genero");
  console.log(APIController._getSongsByOnlyGenre(token , songSelected));
  */
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
      //console.log('Access token:', data.access_token); //show token   
      return data.access_token; 
    
  }


    //devuelve un array con los resultados de la busqueda (hacer)
  const _searchSongs = async(token, track, limit, offset )=>{ //el offset es de donde se empeiza a buscar 
    const trackId = await fetch('https://api.spotify.com/v1/search?q='+ track +'&type=track&limit=' + limit + '&offset='+offset , { // Type = tipo que se desea buscar el id
      method: 'GET' , 
      headers: {'Authorization': 'Bearer '+ token}
    });
    const trackResult = trackId.json()
    return trackResult; 
  }

  const _artistGenres = async(token, songSelected) =>{
    const artistId = songSelected.artists[0].id;
    const artist = await fetch('https://api.spotify.com/v1/artists/' + artistId , { //se busca el artista por el id
      method: 'GET' , 
      headers: {'Authorization': 'Bearer '+ token}
    });
    const artistResult = await artist.json();
    //console.log(artistResult.genres);
    return artistResult.genres;
  }

  const _songCharacteristics = async(token , songSelected) =>{//returns the song album id and the release year of the album 
    const songId = songSelected.id; 
    const song=  await fetch('https://api.spotify.com/v1/tracks/' + songId , { //se busca la canción por el id (innescesario )
      method: 'GET' , 
      headers: {'Authorization': 'Bearer '+ token}//parametros que pide el uso de la api (aplica para todo lo que usamos)
    });
    const songResult = await song.json();
    var releaseYear = '';
    for(var i=0; i<4; i++){
      releaseYear+= songResult.album.release_date[i];//se consiguen los primero 4 digitos de la fecha de publicación que está en formati año-mes-dia = xxxx-xx-xx
    }
    const album = songResult.album.id; 
    const characteristics = [releaseYear, album]; 
    //console.log("characteristics " +characteristics);
    return characteristics; // año y album
  }


const _getSongByArtist = async(token, songSelected) =>{
    const artistName = songSelected.artists[0].name;
    const artistGenre = await _artistGenres(token, songSelected);
    const randomNum =  Math.floor(Math.random() * 20);  
    const resultado = await fetch('https://api.spotify.com/v1/search?q=artist%3A'+ artistName +'+genre:'+artistGenre[0]+'&type=track&limit=2&offset='+ randomNum, { // se buscan 2 canciones del artista
      method: 'GET' , 
      headers: {'Authorization': 'Bearer '+ token}
    });
    const songs = await resultado.json()
    const songsEnded = await songs.tracks.items;
    return songsEnded; 
  }


  const _getSongByAlbum = async(token, songSelected) => {
    const albumType = songSelected.album.album_type; 
    const albumResult= [songSelected, songSelected]; 

    if(albumType == 'single'){
      return null; 

    }else{

      const albumName = songSelected.album.name; 
      var number=0; 

      for(var i=0; i<2 ; i++){

        
        
        while(songSelected.name==albumResult[i].name ){

          const resultado = await fetch('https://api.spotify.com/v1/search?q=album%3A'+ albumName +'&type=track&limit=1&offset='+number, { // se buscan 2 canciones del artista
          method: 'GET' , 
          headers: {'Authorization': 'Bearer '+ token}
          });

          albumResult[i]= await resultado.json(); 
          albumResult[i]= albumResult[i].tracks.items[0];

          if(i==1){
            while (albumResult[i].name==albumResult[i-1].name){
              console.log(number);
              number++; 
              const resultado = await fetch('https://api.spotify.com/v1/search?q=album%3A'+ albumName +'&type=track&limit=1&offset='+number, { // se buscan 2 canciones del artista
              method: 'GET' , 
              headers: {'Authorization': 'Bearer '+ token}
              });
              albumResult[i]= await resultado.json(); 
              albumResult[i]= albumResult[i].tracks.items[0];
              console.log('a');
              
            }
        }
        //console.log(albumResult[i].name);
        number++
      }
    }
      return albumResult; 
    }
  }
  

  const _getSongByGenreAndYear = async(token, songSelected) => {
    const artistGenre = await _artistGenres(token, songSelected);
    const characteristics = await _songCharacteristics(token, songSelected);

    var genreAndYearResult= null; 
    //console.log(artistGenre);
    
    //console.log(artistGenre.length , artistGenre); // generos del artista 
    if(artistGenre.length==1){

        const resultado = await fetch('https://api.spotify.com/v1/search?q=genre%3A'+ artistGenre[0] +'+year%3A'+characteristics[0]+'&type=track&limit=2', { // se buscan 2 canciones del artista
        method: 'GET' , 
        headers: {'Authorization': 'Bearer '+ token}
        });

        genreAndYearResult= await resultado.json(); 
        


    }else if(artistGenre.length>1){
      genreAndYearResult= [];
      for(var i=0; i<artistGenre.length ; i++){
        const resultado = await fetch('https://api.spotify.com/v1/search?q=genre%3A'+ artistGenre[i] +'+year%3A'+characteristics[0]+'&type=track&limit=1', { // se buscan 2 canciones del artista
        method: 'GET' , 
        headers: {'Authorization': 'Bearer '+ token}
        });
        const resultadoCancion= await resultado.json();
        genreAndYearResult[i]= resultadoCancion.tracks.items[0]; 
      }
      

    }
    return genreAndYearResult; 
    
  }

  const _getSongsByOnlyGenre = async(token, songSelected) =>  {

    var number=Math.floor(Math.random() );  
    const artistGenre = await _artistGenres(token, songSelected);
    const resultado = await fetch('https://api.spotify.com/v1/search?q=genre%3A'+ artistGenre[0] +'&type=track&limit=5&offset='+ number, { // se buscan 2 canciones del artista
        method: 'GET' , 
        headers: {'Authorization': 'Bearer '+ token}
      });

    const genreSongs = await resultado.json();
    const genreSongs2= genreSongs.tracks.items;
    return genreSongs2; 

  }
  const _getRecomendationsArray = async(token,songSelected)=>{
    var arregloRecomendaciones = []
    var i=0
    const arregloAlbum= await APIController._getSongByAlbum(token, songSelected); 
    const arregloGenero= await APIController._getSongsByOnlyGenre(token , songSelected);
    const arregloGeneroYAnio = await APIController._getSongByGenreAndYear(token, songSelected); 
    const arregloArtista = await APIController._getSongByArtist(token , songSelected); 
    for( var j=0  ; j< arregloAlbum.length ; j++){
      arregloRecomendaciones[i]= arregloAlbum[j];
      i++;
    }
    for( var j=0  ; j< arregloGenero.length ; j++){
      arregloRecomendaciones[i]= arregloGenero[j];
      i++;
    }
    for( var j=0  ; j< arregloGeneroYAnio.length ; j++){
      arregloRecomendaciones[i]= arregloGeneroYAnio[j];
      i++;
    }
    for( var j=0  ; j< arregloArtista.length ; j++){
      arregloRecomendaciones[i]= arregloArtista[j];
      i++;
    }
    /*console.log("prueba");
    
    arregloRecomendaciones.forEach(cancion =>{
      console.log(cancion); 
    })*/
   return arregloRecomendaciones; 
  }

  //acá está para conseguir la imagen y el nombre :b es un ejemplo , asi lo puede hacer en otros lados ( supongo -_- )
  const _getNameAndImage = async(token,songSelected)=>{
    const imagen = songSelected.album.images[0];// imagen
    const nombre = songSelected.name;//nombre
    return imagen,nombre; 
  }

  return {
    getToken,
    //_getGenres,
    _searchSongs,
    _artistGenres,
    _songCharacteristics,
    _getSongByArtist,
    _getSongByAlbum,
    _getSongByGenreAndYear,
    _getSongsByOnlyGenre,
    _getNameAndImage,
    _getRecomendationsArray
  };

  
})(); 