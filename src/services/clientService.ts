
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
  where, // Import where
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase'; // Import auth
import type { Client } from '@/lib/schemas/client';

const CLIENTS_COLLECTION = 'clients';

const clientFromDoc = (docSnap: QueryDocumentSnapshot<DocumentData>): Client => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    userId: data.userId, // Include userId
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || '',
    createdAt: (data.createdAt as Timestamp)?.toDate(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate(),
  };
};

export const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado.");

  const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), {
    ...clientData,
    userId: user.uid, // Add userId
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getClients = async (): Promise<Client[]> => {
  const user = auth.currentUser;
  if (!user) return []; // Or throw error if user must be authenticated

  const q = query(
    collection(db, CLIENTS_COLLECTION),
    where('userId', '==', user.uid), // Filter by userId
    orderBy('name', 'asc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(clientFromDoc);
};

// updateClient and deleteClient will be protected by Firestore rules
// ensuring only the owner or admin can modify.
export const updateClient = async (id: string, clientData: Partial<Omit<Client, 'id' | 'createdAt' | 'userId'>>): Promise<void> => {
  const clientRef = doc(db, CLIENTS_COLLECTION, id);
  // Firestore rules will verify ownership or admin role before allowing update
  await updateDoc(clientRef, {
    ...clientData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteClient = async (id: string): Promise<void> => {
  const clientRef = doc(db, CLIENTS_COLLECTION, id);
  // Firestore rules will verify ownership or admin role before allowing delete
  await deleteDoc(clientRef);
};
