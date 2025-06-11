
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
  where,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Sale, SaleInput, SaleStatus, PaymentMethod, CartItemInput } from '@/lib/schemas/sale'; // Import SaleStatus

// Exportando tipos para uso externo se necessário, mas eles também são definidos em sale.ts
export type { PaymentMethod, CartItemInput, SaleInput, Sale, SaleStatus };

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
    status: data.status || "Concluída", // Default to Concluída if not present
    cancellationReason: data.cancellationReason || null,
    cancelledAt: data.cancelledAt instanceof Timestamp ? data.cancelledAt.toDate() : (data.cancelledAt || null),
  };
};

export const addSale = async (saleData: SaleInput): Promise<string> => {
  const docRef = await addDoc(collection(db, SALES_COLLECTION), {
    ...saleData,
    status: "Concluída", // Explicitly set status on creation
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(), // Add updatedAt for consistency
  });
  return docRef.id; 
};

export const getSales = async (): Promise<Sale[]> => {
  const q = query(collection(db, SALES_COLLECTION), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(saleFromDoc);
};

export const cancelSale = async (saleId: string, reason: string): Promise<void> => {
  const saleRef = doc(db, SALES_COLLECTION, saleId);
  await updateDoc(saleRef, {
    status: "Cancelada",
    cancellationReason: reason,
    cancelledAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  // TODO: Implementar lógica para reverter o estoque dos produtos vendidos.
  // Para isso, será necessário:
  // 1. Ler os itens da venda (docSnap.data().items).
  // 2. Para cada item, encontrar o produto correspondente (pelo SKU ou ID do produto, que precisaria ser salvo na venda).
  // 3. Incrementar o estoque do produto.
  // 4. Idealmente, fazer isso dentro de uma transação do Firestore para garantir atomicidade.
};


export const getSalesByDateRange = async (startDate: Date, endDate: Date): Promise<Sale[]> => {
  const startTimestamp = Timestamp.fromDate(startDate);
  const endTimestamp = Timestamp.fromDate(new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999));

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
  const q = query(collection(db, SALES_COLLECTION), where('status', '==', 'Concluída'));
  const querySnapshot = await getDocs(q);
  let totalRevenue = 0;
  querySnapshot.forEach((docSnap) => { // Renamed doc to docSnap to avoid conflict
    totalRevenue += (docSnap.data().totalAmount as number) || 0;
  });
  return totalRevenue;
};

