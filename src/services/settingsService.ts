
import { doc, getDoc, setDoc, serverTimestamp, Timestamp, type DocumentData } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

const SETTINGS_COLLECTION = 'systemSettings';
const ESTABLISHMENT_DOC_ID = 'establishmentDetails';
const LOGO_STORAGE_PATH = 'establishment_logo/donphone_logo'; // Fixed path for a single logo

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
  return settingsFromDoc(docSnap);
};

export const saveEstablishmentSettings = async (
  settingsData: Omit<EstablishmentSettings, 'updatedAt' | 'logoUrl'>,
  logoFile?: File | null
): Promise<EstablishmentSettings> => {
  const docRef = doc(db, SETTINGS_COLLECTION, ESTABLISHMENT_DOC_ID);
  let newLogoUrl: string | undefined = undefined;

  const currentSettings = await getEstablishmentSettings();

  if (logoFile) {
    // If there's an old logo and it's different from the new one (or if new one is uploaded), delete old one.
    // For simplicity, we always try to upload if a file is provided.
    // More robust logic could check if the old logoUrl exists and delete it.
    const logoStorageRef = ref(storage, LOGO_STORAGE_PATH);
    await uploadBytes(logoStorageRef, logoFile);
    newLogoUrl = await getDownloadURL(logoStorageRef);
  } else if (logoFile === null && currentSettings?.logoUrl) {
    // Explicitly removing logo
    try {
        const oldLogoRef = ref(storage, currentSettings.logoUrl); // Assumes logoUrl is the full path or reconstructable
        await deleteObject(oldLogoRef);
    } catch (error) {
        console.warn("Could not delete old logo, it might not exist or path is incorrect:", error);
    }
    newLogoUrl = ""; // Set to empty string to remove from DB
  }


  const dataToSave: EstablishmentSettings = {
    ...settingsData,
    logoUrl: newLogoUrl !== undefined ? newLogoUrl : currentSettings?.logoUrl, // Keep old if no new/removal
    updatedAt: serverTimestamp() as Timestamp,
  };
  
  // If newLogoUrl is undefined (meaning no new file and no explicit removal),
  // and currentSettings has a logoUrl, keep it.
  // If newLogoUrl is an empty string (explicit removal), it will be saved.
  // If newLogoUrl has a value (new upload), it will be saved.
  if (newLogoUrl === undefined && currentSettings?.logoUrl) {
    dataToSave.logoUrl = currentSettings.logoUrl;
  }


  await setDoc(docRef, dataToSave, { merge: true }); // Use setDoc with merge to create if not exists, or update
  
  return {
      ...settingsData,
      logoUrl: dataToSave.logoUrl
  };
};
