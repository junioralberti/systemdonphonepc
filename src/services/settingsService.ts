
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
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return settingsFromDocData(docSnap.data());
  }
  // Return null if no settings are found in Firestore, prompting for new setup
  return null;
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
        // Attempt to delete old logo only if a new one is being uploaded
        const existingLogoUrl = currentSettings?.logoUrl;
        if (existingLogoUrl && !existingLogoUrl.startsWith('https://placehold.co')) { // Avoid deleting placeholder
            // Check if the existing logo is the one we manage
            // This check can be tricky if the URL isn't exactly LOGO_STORAGE_PATH's derived URL
            // For simplicity, we assume if a logoUrl exists and isn't placeholder, it's ours.
            // More robust check might involve checking if LOGO_STORAGE_PATH is part of existingLogoUrl
             await deleteObject(ref(storage, LOGO_STORAGE_PATH)).catch(err => {
                if (err.code !== 'storage/object-not-found') console.warn("Old logo deletion attempt failed (might not exist or other issue):", err);
            });
        }
    } catch (error: any) {
        if (error.code !== 'storage/object-not-found') {
            console.warn("Could not delete old logo, it might not exist or another error occurred:", error);
        }
    }
    await uploadBytes(logoStorageRef, logoFile);
    newLogoUrl = await getDownloadURL(logoStorageRef);

  } else if (logoFile === null && currentSettings?.logoUrl && !currentSettings.logoUrl.startsWith('https://placehold.co')) {
    // logoFile is explicitly null (meaning user wants to remove it) AND there was a logo previously that wasn't a placeholder
    try {
        const logoToDeleteRef = ref(storage, LOGO_STORAGE_PATH); 
        await deleteObject(logoToDeleteRef);
    } catch (error: any) {
        if (error.code !== 'storage/object-not-found') {
             console.warn("Could not delete logo during removal, it might not exist or path is incorrect:", error);
        }
    }
    newLogoUrl = ""; // Set to empty string to indicate no logo
  }


  const dataToSave: EstablishmentSettings = {
    ...settingsData,
    updatedAt: serverTimestamp() as Timestamp,
  };
  
  if (newLogoUrl !== undefined) { // If newLogoUrl was set (either to a URL or to "")
    dataToSave.logoUrl = newLogoUrl;
  } else if (currentSettings?.logoUrl) { // Otherwise, retain the existing logo URL
    dataToSave.logoUrl = currentSettings.logoUrl;
  } else { // If no current logo and no new one, set to empty
    dataToSave.logoUrl = ""; 
  }


  await setDoc(docRef, dataToSave, { merge: true }); 
  
  // Return the saved data including the potentially updated logoUrl
  return {
      ...settingsData,
      logoUrl: dataToSave.logoUrl
  };
};

