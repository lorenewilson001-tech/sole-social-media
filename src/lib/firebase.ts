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

export const JANNAT_EMAILS = [
  'gloccommun@gmail.com'
]; 

export const LOREN_EMAILS = [
  'lorenewilson001@gmail.com'
]; 

export const CREATOR_NAME = 'Jannatun Neyeem';
export const CLIENT_NAME = 'Loren';

export const CREATOR_IMAGE = 'https://i.postimg.cc/9fg7fCHV/R-100376.jpg'; // Jannat's Image
export const CLIENT_IMAGE = 'https://i.postimg.cc/853WNpBX/Photo-1.jpg'; // Loren's Image

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
