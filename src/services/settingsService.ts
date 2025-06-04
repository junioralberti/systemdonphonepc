
import { doc, getDoc, setDoc, serverTimestamp, Timestamp, type DocumentData } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

const SETTINGS_COLLECTION = 'systemSettings';
const ESTABLISHMENT_DOC_ID = 'establishmentDetails';
const LOGO_STORAGE_PATH = 'establishment_logo/app_logo'; // Generic path

export interface EstablishmentSettings {
  businessName?: string;
  businessAddress?: string;
  businessCnpj?: string;
  businessPhone?: string;
  businessEmail?: string;
  logoUrl?: string;
  updatedAt?: Timestamp;
}

// Helper to convert Firestore doc data to EstablishmentSettings
const settingsFromDocData = (data: DocumentData | undefined): EstablishmentSettings | null => {
  if (!data) {
    return null;
  }
  return {
    businessName: data.businessName || "",
    businessAddress: data.businessAddress || "",
    businessCnpj: data.businessCnpj || "",
    businessPhone: data.businessPhone || "",
    businessEmail: data.businessEmail || "",
    logoUrl: data.logoUrl || "",
    updatedAt: data.updatedAt,
  };
};


export const getEstablishmentSettings = async (): Promise<EstablishmentSettings | null> => {
  const docRef = doc(db, SETTINGS_COLLECTION, ESTABLISHMENT_DOC_ID);
  const docSnap = await getDoc(docRef); // docSnap is DocumentSnapshot
  if (docSnap.exists()) { // Correct check on DocumentSnapshot
    return settingsFromDocData(docSnap.data()); // Pass the data() to settingsFromDocData
  }
  // Return default DonPhone details if no settings are found in Firestore
  return {
    businessName: "DONPHONE INFORMÁTICA E CELULARES",
    businessAddress: "RUA CRISTALINO MACHADO, N°:95, BAIRRO: CENTRO, CIDADE: BARRACÃO, ESTADO: PARANÁ",
    businessCnpj: "58.435.813/0004-94",
    businessPhone: "49991287685",
    businessEmail: "contato@donphone.com",
    logoUrl: "https://placehold.co/180x60.png", // Default placeholder logo
  };
};

export const saveEstablishmentSettings = async (
  settingsData: Omit<EstablishmentSettings, 'updatedAt' | 'logoUrl'>,
  logoFile?: File | null
): Promise<EstablishmentSettings> => {
  const docRef = doc(db, SETTINGS_COLLECTION, ESTABLISHMENT_DOC_ID);
  let newLogoUrl: string | undefined = undefined;

  const currentSettingsSnap = await getDoc(docRef);
  const currentSettings = settingsFromDocData(currentSettingsSnap.data());


  if (logoFile) {
    const logoStorageRef = ref(storage, LOGO_STORAGE_PATH);
    try {
        await getDownloadURL(logoStorageRef); 
        await deleteObject(logoStorageRef); 
    } catch (error: any) {
        if (error.code !== 'storage/object-not-found') {
            console.warn("Could not delete old logo, it might not exist or another error occurred:", error);
        }
    }
    await uploadBytes(logoStorageRef, logoFile);
    newLogoUrl = await getDownloadURL(logoStorageRef);

  } else if (logoFile === null && currentSettings?.logoUrl) {
    try {
        const logoToDeleteRef = ref(storage, LOGO_STORAGE_PATH); 
        await deleteObject(logoToDeleteRef);
    } catch (error: any) {
        if (error.code !== 'storage/object-not-found') {
             console.warn("Could not delete logo during removal, it might not exist or path is incorrect:", error);
        }
    }
    newLogoUrl = ""; 
  }


  const dataToSave: EstablishmentSettings = {
    ...settingsData,
    updatedAt: serverTimestamp() as Timestamp,
  };
  
  if (newLogoUrl !== undefined) {
    dataToSave.logoUrl = newLogoUrl;
  } else if (currentSettings?.logoUrl) {
    dataToSave.logoUrl = currentSettings.logoUrl;
  } else {
    dataToSave.logoUrl = ""; 
  }


  await setDoc(docRef, dataToSave, { merge: true }); 
  
  return {
      ...settingsData,
      logoUrl: dataToSave.logoUrl
  };
};

