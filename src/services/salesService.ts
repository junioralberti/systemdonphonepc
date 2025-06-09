
import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
  getDocs,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Tipos replicados de onde são usados ou inferidos
export type PaymentMethod = "Dinheiro" | "Cartão de Crédito" | "Cartão de Débito" | "PIX";

export interface CartItemInput {
  name: string;
  quantity: number;
  price: number; // No counter-sales, é price. Em OS é unitPrice. Usaremos 'price' para este contexto.
  // totalPrice é calculado no frontend para counter-sales e não é explicitamente parte do CartItemInput original
}

export interface SaleInput {
  clientName: string | null;
  items: CartItemInput[];
  paymentMethod: PaymentMethod | null;
  totalAmount: number;
  // saleId e date são adicionados/gerenciados pelo serviço/backend
}

export interface Sale extends SaleInput {
  id: string;
  createdAt: Date | Timestamp;
}

const SALES_COLLECTION = 'sales';

const saleFromDoc = (docSnap: QueryDocumentSnapshot<DocumentData>): Sale => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    clientName: data.clientName || null,
    items: data.items || [],
    paymentMethod: data.paymentMethod || null,
    totalAmount: data.totalAmount || 0,
    createdAt: (data.createdAt instanceof Timestamp) ? data.createdAt.toDate() : (data.createdAt || new Date()),
  };
};

export const addSale = async (saleData: SaleInput): Promise<string> => {
  const docRef = await addDoc(collection(db, SALES_COLLECTION), {
    ...saleData,
    createdAt: serverTimestamp(),
  });
  // O componente counter-sales usa o ID da venda na notificação
  return docRef.id; 
};

export const getSales = async (): Promise<Sale[]> => {
  const q = query(collection(db, SALES_COLLECTION), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(saleFromDoc);
};

export const getSalesByDateRange = async (startDate: Date, endDate: Date): Promise<Sale[]> => {
  const startTimestamp = Timestamp.fromDate(startDate);
  const endTimestamp = Timestamp.fromDate(new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999)); // Ensure end of day

  const q = query(
    collection(db, SALES_COLLECTION),
    where('createdAt', '>=', startTimestamp),
    where('createdAt', '<=', endTimestamp),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(saleFromDoc);
};

export const getTotalSalesRevenue = async (): Promise<number> => {
  const querySnapshot = await getDocs(collection(db, SALES_COLLECTION));
  let totalRevenue = 0;
  querySnapshot.forEach((doc) => {
    totalRevenue += (doc.data().totalAmount as number) || 0;
  });
  return totalRevenue;
};
