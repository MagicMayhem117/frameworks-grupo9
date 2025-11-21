import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";


export async function getUserByEmail(email) {
  if (!email) return null;
  try {
    const q = query(collection(db, "Usuarios"), where("correo", "==", email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  } catch (err) {
    console.error('getUserByEmail failed', err);
    return null;
  }
}


export function listenUserByEmail(email, onChange) {
  if (!email || typeof onChange !== 'function') {
    console.warn('listenUserByEmail requires an email and a callback');
    return () => {};
  }
  const q = query(collection(db, 'Usuarios'), where('correo', '==', email));
  const unsub = onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onChange(null);
        return;
      }
      const docSnap = snapshot.docs[0];
      onChange({ id: docSnap.id, ...docSnap.data() });
    },
    (err) => {
      console.error('listenUserByEmail error', err);
      onChange(null);
    }
  );
  return unsub;
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

export async function getActividadesPublicas(ids) {
  if (!ids) return [];
  const idsArray = Array.isArray(ids) ? ids : [ids];
  const activities = [];
  for (const id of idsArray) {
    try {
      const docRef = doc(db, "Actividades", id);
      const docSnap = await getDoc(docRef);
      if (docSnap && docSnap.exists && docSnap.exists()) {
        const activity = { id: docSnap.id, ...docSnap.data() };
        if (activity.publico) {
          activities.push(activity);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch activity', id, err);
    }
  }
  return activities;
}

export function listenActividades(ids, onChange) {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    if (typeof onChange === 'function') onChange([]);
    return () => {};
  }
  const unsubscribes = [];
  const activitiesMap = new Map();

  ids.forEach((id) => {
    try {
      const ref = doc(db, 'Actividades', id);
      const unsub = onSnapshot(
        ref,
        (snap) => {
          if (snap.exists()) {
            activitiesMap.set(snap.id, { id: snap.id, ...snap.data() });
          } else {
            activitiesMap.delete(id);
          }
          if (typeof onChange === 'function') onChange(Array.from(activitiesMap.values()));
        },
        (err) => {
          console.error('listenActividades error for', id, err);
        }
      );
      unsubscribes.push(unsub);
    } catch (err) {
      console.error('listenActividades setup failed for', id, err);
    }
  });

  return () => {
    unsubscribes.forEach((u) => {
      try {
        u();
      } catch (e) {
        // ignore
      }
    });
  };
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