import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import firebaseConfig from "../keys"; 
import { initializeApp } from "firebase/app";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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