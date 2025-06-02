
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, UserRole } from '@/lib/schemas/user';

const USERS_COLLECTION = 'users';

// Tipo para dados que realmente serão salvos, omitindo senhas e campos de confirmação.
type StorableUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'password' | 'confirmPassword'>;

const userFromDoc = (docSnap: QueryDocumentSnapshot<DocumentData>): User => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data.name || '',
    email: data.email || '',
    role: data.role || 'user',
    // Campos de senha não são lidos do Firestore
    createdAt: (data.createdAt as Timestamp)?.toDate(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate(),
  };
};

export const addUser = async (userData: StorableUserData): Promise<string> => {
  // userData aqui já não deve conter password ou confirmPassword
  const docRef = await addDoc(collection(db, USERS_COLLECTION), {
    ...userData, // Salva apenas name, email, role
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getUsers = async (): Promise<User[]> => {
  const q = query(collection(db, USERS_COLLECTION), orderBy('name', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(userFromDoc);
};

export const updateUser = async (id: string, userData: Partial<StorableUserData>): Promise<void> => {
  // userData aqui também não deve conter password ou confirmPassword
  const userRef = doc(db, USERS_COLLECTION, id);
  await updateDoc(userRef, {
    ...userData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteUser = async (id: string): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, id);
  await deleteDoc(userRef);
};
