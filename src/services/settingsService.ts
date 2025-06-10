
import { doc, getDoc, setDoc, serverTimestamp, Timestamp, type DocumentData } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase'; // storage here is the FirebaseStorage instance

const SETTINGS_COLLECTION = 'systemSettings';
const ESTABLISHMENT_DOC_ID = 'establishmentDetails';
const LOGO_STORAGE_PATH = 'establishment_logo/app_logo';

export interface EstablishmentSettings {
  businessName?: string;
  businessAddress?: string;
  businessCnpj?: string;
  businessPhone?: string;
  businessEmail?: string;
  logoUrl?: string;
  updatedAt?: Timestamp;
}

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
  logoFile?: File | null
): Promise<EstablishmentSettings> => {
  console.log("Attempting to save establishment settings. Logo file:", logoFile);
  const docRef = doc(db, SETTINGS_COLLECTION, ESTABLISHMENT_DOC_ID);
  let finalLogoUrl: string | undefined = undefined;

  const currentSettingsSnap = await getDoc(docRef);
  const currentLogoUrl = currentSettingsSnap.exists() ? currentSettingsSnap.data()?.logoUrl : undefined;
  console.log("Current logo URL from Firestore:", currentLogoUrl);

  const logoStorageRef = ref(storage, LOGO_STORAGE_PATH);

  if (logoFile instanceof File) {
    console.log("New logo file provided. Attempting to upload to:", LOGO_STORAGE_PATH);
    try {
      // No need to explicitly delete if overwriting the same path.
      // uploadBytes will replace the file if it exists at logoStorageRef.
      const uploadResult = await uploadBytes(logoStorageRef, logoFile);
      console.log("Logo uploaded successfully:", uploadResult);
      finalLogoUrl = await getDownloadURL(logoStorageRef);
      console.log("New logo URL:", finalLogoUrl);
    } catch (uploadError) {
      console.error("Error uploading new logo to Firebase Storage:", uploadError);
      throw new Error(`Falha no upload do novo logo: ${uploadError.message || 'Erro desconhecido no Storage.'}`);
    }
  } else if (logoFile === null) { // Explicit request to remove logo
    console.log("Request to remove existing logo.");
    if (currentLogoUrl && !currentLogoUrl.startsWith('https://placehold.co')) {
      console.log("Attempting to delete existing logo from storage path:", LOGO_STORAGE_PATH);
      try {
        await deleteObject(logoStorageRef);
        console.log("Existing logo deleted successfully from storage.");
      } catch (error: any) {
        if (error.code === 'storage/object-not-found') {
          console.warn("Logo to delete not found in storage (path: " + LOGO_STORAGE_PATH + "). This is often normal.");
        } else {
          console.error("Error deleting logo from Firebase Storage:", error);
          throw new Error(`Falha ao remover o logo existente: ${error.message || 'Erro desconhecido no Storage.'}`);
        }
      }
    } else {
      console.log("No existing logo to delete or it's a placeholder.");
    }
    finalLogoUrl = ""; // Set to empty string to indicate no logo
  } else { // No change to logo (logoFile is undefined)
    console.log("No change to logo file. Keeping current URL if exists.");
    finalLogoUrl = currentLogoUrl;
  }

  const dataToSave: Partial<EstablishmentSettings> = {
    ...settingsData,
    updatedAt: serverTimestamp() as Timestamp,
  };

  if (finalLogoUrl !== undefined) {
    dataToSave.logoUrl = finalLogoUrl;
  }

  console.log("Data to be saved in Firestore:", dataToSave);
  try {
    await setDoc(docRef, dataToSave, { merge: true });
    console.log("Establishment settings saved successfully to Firestore.");
  } catch (firestoreError) {
    console.error("Error saving settings to Firestore:", firestoreError);
    throw new Error(`Falha ao salvar configurações no banco de dados: ${firestoreError.message || 'Erro desconhecido no Firestore.'}`);
  }
  
  const savedDataSnap = await getDoc(docRef);
  const fullSavedData = settingsFromDocData(savedDataSnap.data());
  console.log("Full settings data after save:", fullSavedData);
  
  return fullSavedData || { 
    businessName: settingsData.businessName ?? "",
    businessAddress: settingsData.businessAddress ?? "",
    businessCnpj: settingsData.businessCnpj ?? "",
    businessPhone: settingsData.businessPhone ?? "",
    businessEmail: settingsData.businessEmail ?? "",
    logoUrl: finalLogoUrl ?? currentLogoUrl ?? "",
  };
};
