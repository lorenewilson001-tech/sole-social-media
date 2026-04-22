import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app); 
export const googleProvider = new GoogleAuthProvider();

export const JANNAT_EMAILS = ['jannatunneyeem@gmail.com', 'soleingredient@gmail.com', 'jannat.work@example.com']; // Placeholders for Jannat's 3 emails
export const LOREN_EMAILS = ['lorenewilson001@gmail.com', 'loren.client@example.com', 'loren.work@example.com']; // Placeholders for Loren's 3 emails

export const CREATOR_NAME = 'Jannatun Neyeem';
export const CLIENT_NAME = 'Loren';

export const CREATOR_IMAGE = 'https://cdn.perceptual.ai/ais/vw3ncz5aiqua3kthchcfke-864923380925-1745338830113-logo.jpg'; // Using your logo or a placeholder image for Jannat
export const CLIENT_IMAGE = 'https://ui-avatars.com/api/?name=Loren&background=a68a56&color=fff'; // Placeholder for Loren

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};


// Validate connection as per critical directive
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
