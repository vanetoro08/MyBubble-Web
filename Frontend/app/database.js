
import { db, auth } from './firebase.js';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

//---- USUARIOS--- //

// Crear perfil de usuario (cuando se registra)
export async function crearPerfilUsuario(userId, email, nombre) {
  try {
    await setDoc(doc(db, 'Usuarios', userId), {
      email: email,
      nombre: nombre,
      createdAt: serverTimestamp()
    });
    
    console.log('Perfil de usuario creado en Firestore');
    return true;
  } catch (error) {
    console.error(' Error creando perfil:', error);
    throw error;
  }
}

// Obtener datos del usuario
export async function obtenerUsuario(userId) {
  try {
    const docRef = doc(db, 'Usuarios', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log('Usuario no encontrado');
      return null;
    }
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    throw error;
  }
}

// ------CANCIONES---- //

// Guardar una cancion
export async function guardarCancion(cancionData, busquedaId = null) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Usuario no autenticado');
  }
  
  try {
    // Usar el spotifyId como ID del documento
    await setDoc(doc(db, 'canciones', cancionData.spotifyId), {
      userId: user.uid,
      spotifyId: cancionData.spotifyId,
      nombre: cancionData.nombre,
      artista: cancionData.artista,
      album: cancionData.album,
      imagenUrl: cancionData.imagenUrl,
      spotifyUrl: cancionData.spotifyUrl,
      origenBusqueda: busquedaId,
      guardadaEn: serverTimestamp()
    });
    
    console.log('Cancion guardada en Firestore');
    
    if (busquedaId) {
      await marcarRecomendacionGuardada(busquedaId, cancionData.spotifyId, true);
    }
    
    return true;

  } catch (error) {
    console.error('Error guardando cancion:', error);
    throw error;
  }

  
}

// Obtener canciones guardadas del usuario
export async function obtenerCancionesGuardadas() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Usuario no autenticado');
  }
  
  try {
    const cancionesRef = collection(db, 'canciones');
    const q = query(
      cancionesRef, 
      where('userId', '==', user.uid),
      orderBy('guardadaEn', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const canciones = [];
    querySnapshot.forEach((doc) => {
      canciones.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(` ${canciones.length} canciones obtenidas`);
    return canciones;
  } catch (error) {
    console.error('Error obteniendo canciones:', error);
    throw error;
  }
}

// Eliminar cancion guardada
export async function eliminarCancion(spotifyId) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Usuario no autenticado');
  }
  
  try {
    // Obtener la cancion antes de eliminarla para saber su origenBusqueda
    const docRef = doc(db, 'canciones', spotifyId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const cancionData = docSnap.data();
      
      // Eliminar la cancion
      await deleteDoc(docRef);
      console.log('Cancion eliminada de Firestore');
      
      // Si tenía origenBusqueda, actualizar el estado en recomendaciones
      if (cancionData.origenBusqueda) {
        await marcarRecomendacionGuardada(cancionData.origenBusqueda, spotifyId, false);
      }
    }
    
    return true;

  } catch (error) {
    console.error('Error eliminando canción:', error);
    throw error;
  }
}

// Verificar si una cancion está guardada
export async function cancionEstaGuardada(spotifyId) {
  const user = auth.currentUser;
  if (!user) return false;
  
  try {
    const docRef = doc(db, 'canciones', spotifyId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() && docSnap.data().userId === user.uid;
  } catch (error) {
    console.error('Error verificando cancion:', error);
    return false;
  }
}

// -----RECOMENDACIONES ------//

// Guardar historial de recomendaciones
export async function guardarRecomendaciones(cancionBuscada, listaRecomendaciones) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Usuario no autenticado');
  }
  
  try {
    const docRef = await addDoc(collection(db, 'recomendaciones'), {
      userId: user.uid,
      cancionBuscada: {
        nombre: cancionBuscada.name,
        artista: cancionBuscada.artists[0].name,
        spotifyId: cancionBuscada.id
      },
      informacionRecomendaciones: listaRecomendaciones.map(song => ({
        nombre: song.name,
        artista: song.artists[0].name,
        spotifyId: song.id,
        spotifyUrl: song.external_urls.spotify,
        guardada: false
      })),
      fecha: serverTimestamp()
    });
    
    console.log('Recomendaciones guardadas con ID:', docRef.id);
    return docRef.id; // Retornar el ID para vincular canciones guardadas

  } catch (error) {
    console.error('Error guardando recomendaciones:', error);
    throw error;
  }
}

// Obtener historial de recomendaciones
export async function obtenerHistorialRecomendaciones(limite = 10) {
  const user = auth.currentUser;
  if (!user) return [];
  
  try {
    const recRef = collection(db, 'recomendaciones');
    const q = query(
      recRef, 
      where('userId', '==', user.uid),
      orderBy('fecha', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const historial = [];
    querySnapshot.forEach((doc) => {
      historial.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(` ${historial.length} busquedas obtenidas`);
    return historial;

  } catch (error) {
    console.error('Error obteniendo historial:', error);
    return [];
  }
}

// Marcar una recomendacion como guardada o no guardada
export async function marcarRecomendacionGuardada(busquedaId, spotifyId, guardada = true) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Usuario no autenticado');
  }
  
  try {
    const docRef = doc(db, 'recomendaciones', busquedaId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.warn('Busqueda no encontrada');
      return false;
    }
    
    const data = docSnap.data();
    
    // Actualizar el estado "guardada" de la cancion 
    const recomendacionesActualizadas = data.informacionRecomendaciones.map(rec => 
      rec.spotifyId === spotifyId 
        ? { ...rec, guardada } 
        : rec
    );
    
    await setDoc(docRef, {
      ...data,
      informacionRecomendaciones: recomendacionesActualizadas
    });
    
    console.log(`Recomendacion marcada como guardada: ${guardada}`);
    return true;

  } catch (error) {
    console.error('Error actualizando recomendacion:', error);
    throw error;
  }
}

