
import { doc, getDoc, setDoc, serverTimestamp, Timestamp, type DocumentData } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

const SETTINGS_COLLECTION = 'systemSettings';
const ESTABLISHMENT_DOC_ID = 'establishmentDetails';
const LOGO_STORAGE_PATH = 'establishment_logo/app_logo'; // Generic path for the logo

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
  return null;
};

export const saveEstablishmentSettings = async (
  settingsData: Omit<EstablishmentSettings, 'updatedAt' | 'logoUrl'>,
  logoFile?: File | null // undefined means no change, null means remove, File means upload
): Promise<EstablishmentSettings> => {
  const docRef = doc(db, SETTINGS_COLLECTION, ESTABLISHMENT_DOC_ID);
  let finalLogoUrl: string | undefined = undefined;

  const currentSettingsSnap = await getDoc(docRef);
  const currentLogoUrl = currentSettingsSnap.exists() ? currentSettingsSnap.data()?.logoUrl : undefined;
  const logoStorageRef = ref(storage, LOGO_STORAGE_PATH);

  if (logoFile instanceof File) { // New logo to upload
    // Try to delete old logo if it exists and isn't a placeholder
    if (currentLogoUrl && !currentLogoUrl.startsWith('https://placehold.co')) {
      try {
        // Delete the existing logo at the fixed path
        await deleteObject(logoStorageRef);
      } catch (error: any) {
        if (error.code !== 'storage/object-not-found') {
          console.warn("Old logo deletion failed (might not exist or other issue):", error);
        }
      }
    }
    await uploadBytes(logoStorageRef, logoFile);
    finalLogoUrl = await getDownloadURL(logoStorageRef);
  } else if (logoFile === null) { // Explicit request to remove logo
    if (currentLogoUrl && !currentLogoUrl.startsWith('https://placehold.co')) {
      try {
        // Delete the existing logo at the fixed path
        await deleteObject(logoStorageRef);
      } catch (error: any) {
        if (error.code !== 'storage/object-not-found') {
          console.warn("Logo deletion failed (object not found or other):", error);
        }
      }
    }
    finalLogoUrl = ""; // Set to empty string to indicate no logo
  } else { // No change to logo (logoFile is undefined)
    finalLogoUrl = currentLogoUrl;
  }

  const dataToSave: Partial<EstablishmentSettings> = {
    ...settingsData,
    updatedAt: serverTimestamp() as Timestamp,
  };

  if (finalLogoUrl !== undefined) {
    dataToSave.logoUrl = finalLogoUrl;
  } else if (currentLogoUrl === undefined) { // If no new/removed logo AND no current logo, ensure it's empty
    dataToSave.logoUrl = "";
  }
  // If finalLogoUrl is undefined but currentLogoUrl exists, merge:true will keep currentLogoUrl


  await setDoc(docRef, dataToSave, { merge: true });

  // Construct the full object to return, ensuring all fields are present even if empty
  const savedData = await getDoc(docRef); // Re-fetch to get serverTimestamp resolved
  return settingsFromDocData(savedData.data()) || { 
    // Fallback in case re-fetch fails, though unlikely
    businessName: settingsData.businessName ?? "",
    businessAddress: settingsData.businessAddress ?? "",
    businessCnpj: settingsData.businessCnpj ?? "",
    businessPhone: settingsData.businessPhone ?? "",
    businessEmail: settingsData.businessEmail ?? "",
    logoUrl: finalLogoUrl ?? currentLogoUrl ?? "",
  };
};
