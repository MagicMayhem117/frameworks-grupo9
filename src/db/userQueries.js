import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
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