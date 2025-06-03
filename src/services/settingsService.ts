
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

// Helper to convert Firestore doc to EstablishmentSettings
const settingsFromDoc = (docSnap: DocumentData | undefined): EstablishmentSettings | null => {
  if (!docSnap || !docSnap.exists()) {
    return null;
  }
  const data = docSnap.data() as EstablishmentSettings;
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
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return settingsFromDoc(docSnap);
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

  const currentSettings = await getDoc(docRef).then(snap => settingsFromDoc(snap));


  if (logoFile) {
    const logoStorageRef = ref(storage, LOGO_STORAGE_PATH);
    // If a logo already exists at LOGO_STORAGE_PATH, delete it before uploading new one.
    // This handles replacement correctly.
    try {
        await getDownloadURL(logoStorageRef); // Check if file exists
        await deleteObject(logoStorageRef); // Delete if it exists
    } catch (error: any) {
        if (error.code !== 'storage/object-not-found') {
            console.warn("Could not delete old logo, it might not exist or another error occurred:", error);
        }
        // If object not found, it's fine, just proceed to upload.
    }
    await uploadBytes(logoStorageRef, logoFile);
    newLogoUrl = await getDownloadURL(logoStorageRef);

  } else if (logoFile === null && currentSettings?.logoUrl) {
    // Explicitly removing logo if logoFile is null and a logoUrl exists
    try {
        // Try to delete from the specific path if currentSettings.logoUrl is the generic one,
        // or from the full URL if it's different (though LOGO_STORAGE_PATH is now fixed).
        const logoToDeleteRef = ref(storage, LOGO_STORAGE_PATH); 
        await deleteObject(logoToDeleteRef);
    } catch (error: any) {
        if (error.code !== 'storage/object-not-found') {
             console.warn("Could not delete logo during removal, it might not exist or path is incorrect:", error);
        }
    }
    newLogoUrl = ""; // Set to empty string to remove from DB
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
    dataToSave.logoUrl = ""; // Default to empty if no current and no new
  }


  await setDoc(docRef, dataToSave, { merge: true }); 
  
  return {
      ...settingsData,
      logoUrl: dataToSave.logoUrl
  };
};
