
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
  getDoc, // Import getDoc for deleteProduct
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '@/lib/firebase'; // Import auth
import type { Product } from '@/lib/schemas/product';

const PRODUCTS_COLLECTION = 'products';
const PRODUCT_IMAGES_STORAGE_PATH = 'product_images';

const productFromDoc = (docSnap: QueryDocumentSnapshot<DocumentData>): Product => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    userId: data.userId, // Include userId
    name: data.name || '',
    sku: data.sku || '',
    price: data.price || 0,
    stock: data.stock || 0,
    imageUrl: data.imageUrl || '',
    createdAt: (data.createdAt as Timestamp)?.toDate(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate(),
  };
};

const handleImageUpload = async (userId: string, productId: string, imageFile: File): Promise<string> => {
  // Include userId in the storage path for better organization if needed, though productId should be unique
  const imageRef = ref(storage, `${PRODUCT_IMAGES_STORAGE_PATH}/${userId}/${productId}/${imageFile.name}`);
  await uploadBytes(imageRef, imageFile);
  return getDownloadURL(imageRef);
};

const deleteImageFromStorage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl || imageUrl.includes('placehold.co')) return;
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      console.warn('Image to delete not found in storage:', imageUrl);
    } else {
      console.error('Error deleting image from storage:', error);
    }
  }
};

export const addProduct = async (
  productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'imageUrl' | 'userId'>,
  imageFile?: File | null
): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado.");

  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...productData,
    userId: user.uid, // Add userId
    imageUrl: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  let imageUrl = '';
  if (imageFile) {
    imageUrl = await handleImageUpload(user.uid, docRef.id, imageFile);
    await updateDoc(docRef, { imageUrl });
  }

  return docRef.id;
};

export const getProducts = async (): Promise<Product[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    where('userId', '==', user.uid), // Filter by userId
    orderBy('name', 'asc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(productFromDoc);
};

export const updateProduct = async (
  id: string,
  productData: Partial<Omit<Product, 'id' | 'createdAt' | 'imageUrl' | 'userId'>>,
  imageFile?: File | null | undefined,
  currentImageUrl?: string
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado.");

  const productRef = doc(db, PRODUCTS_COLLECTION, id);
  // Firestore rules will verify ownership or admin role
  const updateData: Partial<Product> = { ...productData, updatedAt: serverTimestamp() as Timestamp };

  if (imageFile === null) {
    if (currentImageUrl) {
      await deleteImageFromStorage(currentImageUrl);
    }
    updateData.imageUrl = '';
  } else if (imageFile instanceof File) {
    if (currentImageUrl) {
      await deleteImageFromStorage(currentImageUrl);
    }
    updateData.imageUrl = await handleImageUpload(user.uid, id, imageFile);
  }

  await updateDoc(productRef, updateData);
};

export const deleteProduct = async (id: string): Promise<void> => {
  const productRef = doc(db, PRODUCTS_COLLECTION, id);
  // Firestore rules will verify ownership or admin role
  const productSnap = await getDoc(productRef);
  if (productSnap.exists()) {
    const productData = productSnap.data() as Product;
    if (productData.imageUrl) {
      await deleteImageFromStorage(productData.imageUrl);
    }
  }
  await deleteDoc(productRef);
};

export const getProductBySku = async (sku: string): Promise<Product | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  if (!sku || sku.trim() === "") {
    return null;
  }
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    where('userId', '==', user.uid), // Filter by userId
    where("sku", "==", sku.trim().toUpperCase()),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return productFromDoc(querySnapshot.docs[0]);
  }
  return null;
};
