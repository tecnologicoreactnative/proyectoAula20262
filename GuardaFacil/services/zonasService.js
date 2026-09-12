import { collection, getDocs, doc, getDoc, serverTimestamp, setDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const obtenerZonas = async () => {
  try {
    const zonasRef = collection(db, 'zonas');
    const snapshot = await getDocs(zonasRef);
    const zonas = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return zonas;
  } catch (error) {
    console.error('Error al obtener zonas:', error);
    throw error;
  }
};

export const obtenerCasilleros = async (zonaId) => {
  try {
    const casillerosRef = collection(db, 'zonas', zonaId, 'casilleros');
    const snapshot = await getDocs(casillerosRef);
    const casilleros = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return casilleros;
  } catch (error) {
    console.error('Error al obtener casilleros:', error);
    throw error;
  }
};

export const obtenerCasillero = async (zonaId, casilleroId) => {
  try {
    const casilleroRef = doc(db, 'zonas', zonaId, 'casilleros', casilleroId);
    const snapshot = await getDoc(casilleroRef);

    if (!snapshot.exists()) {
      throw new Error('El casillero no existe');
    }

    return { id: snapshot.id, ...snapshot.data() };
  } catch (error) {
    console.error('Error al obtener el casillero:', error);
    throw error;
  }
};

export const verificarDisponibilidadCasillero = async ({
  casilleroId,
  fecha,
  franja,
}) => {
  try {
    const reservasRef = collection(db, 'reservas');
    const consulta = query(
      reservasRef,
      where('casilleroId', '==', casilleroId),
      where('fecha', '==', fecha),
      where('franja', '==', franja)
    );

    const snapshot = await getDocs(consulta);
    return snapshot.empty;
  } catch (error) {
    console.error('Error al verificar disponibilidad del casillero:', error);
    throw error;
  }
};

export const reservarCasillero = async ({
  zonaId,
  casilleroId,
  usuarioId,
  usuarioEmail,
  fecha,
  franja,
  zonaNombre,
  casilleroNumero,
}) => {
  try {
    const reservaId = `${casilleroId}_${fecha}_${franja}`;
    const reservaRef = doc(db, 'reservas', reservaId);
    const reservaExistente = await getDoc(reservaRef);

    if (reservaExistente.exists()) {
      throw new Error('Ya existe una reserva para este casillero en la fecha y franja seleccionadas.');
    }

    const reserva = {
      zonaId,
      casilleroId,
      zonaNombre,
      casilleroNumero,
      usuarioId,
      usuarioEmail,
      fecha,
      franja,
      estado: 'confirmada',
      createdAt: serverTimestamp(),
    };

    await setDoc(reservaRef, reserva);

    return { id: reservaRef.id, ...reserva };
  } catch (error) {
    console.error('Error al reservar el casillero:', error);
    throw error;
  }
};
