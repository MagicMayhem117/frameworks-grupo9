import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function getUserByEmail(email) {
  const q = query(collection(db, "Usuarios"), where("correo", "==", email));
  const querySnapshot = await getDocs(q);
  let user = null;
  querySnapshot.forEach((doc) => {
    user = { id: doc.id, ...doc.data() };
  });
  return user;
}

export async function getActividades(ids) {
  if (!ids) return [];
  const idsArray = Array.isArray(ids) ? ids : [ids];
  const activities = [];
  for (const id of idsArray) {
    try {
      const docRef = doc(db, "Actividades", id);
      const docSnap = await getDoc(docRef);
      if (docSnap && docSnap.exists && docSnap.exists()) {
        activities.push({ id: docSnap.id, ...docSnap.data() });
      }
    } catch (err) {
      console.warn('Failed to fetch activity', id, err);
    }
  }
  return activities;
}

export async function getAmigos(ids) {
  if (!ids) return [];
  const idsArray = Array.isArray(ids) ? ids : [ids];
  const amigos = [];
  for (const id of idsArray) {
    try {
      const docRef = doc(db, "Usuarios", id);
      const docSnap = await getDoc(docRef);
      if (docSnap && docSnap.exists && docSnap.exists()) {
        amigos.push({ id: docSnap.id, ...docSnap.data() });
      }
    } catch (err) {
      console.warn('Failed to fetch activity', id, err);
    }
  }
  return amigos;
}

export async function getUsuarios(busc) {

  // Source - https://stackoverflow.com/a
  // Posted by Kyo Kurosagi, modified by community. See post 'Timeline' for change history
  // Retrieved 2025-11-11, License - CC BY-SA 3.0

  if (!busc || typeof busc !== 'string' || busc.length === 0) return [];

  const strSearch = busc;
  const strlength = strSearch.length;
  const strFrontCode = strSearch.slice(0, strlength - 1);
  const strEndCode = strSearch.slice(strlength - 1, strSearch.length);

  const startcode = strSearch;
  const endcode = strFrontCode + String.fromCharCode(strEndCode.charCodeAt(0) + 1);

  const usuarios = [];
  try {
    const usersQuery = query(collection(db, 'Usuarios'), where('nombre', '>=', startcode), where('nombre', '<', endcode));
    const querySnapshot = await getDocs(usersQuery);
    querySnapshot.forEach((docSnap) => {
      usuarios.push({ id: docSnap.id, ...docSnap.data() });
    });
  } catch (err) {
    console.error('getUsuarios failed', err);
  }

  return usuarios;
}