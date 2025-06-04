
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
  where,
  limit,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/schemas/product';

const PRODUCTS_COLLECTION = 'products';

const productFromDoc = (docSnap: QueryDocumentSnapshot<DocumentData>): Product => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data.name || '',
    sku: data.sku || '',
    price: data.price || 0,
    stock: data.stock || 0,
    createdAt: (data.createdAt as Timestamp)?.toDate(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate(),
  };
};

export const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getProducts = async (): Promise<Product[]> => {
  const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('name', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(productFromDoc);
};

export const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<void> => {
  const productRef = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(productRef, {
    ...productData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteProduct = async (id: string): Promise<void> => {
  const productRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(productRef);
};

export const getProductBySku = async (sku: string): Promise<Product | null> => {
  if (!sku || sku.trim() === "") {
    return null;
  }
  const q = query(
    collection(db, PRODUCTS_COLLECTION), 
    where("sku", "==", sku.trim().toUpperCase()), // Assuming SKU is stored in uppercase or ensuring case-insensitive comparison if possible
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return productFromDoc(querySnapshot.docs[0]);
  }
  return null;
};
