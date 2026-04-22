import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Post, Comment, PostStatus, FirestoreErrorInfo } from '../types';

const handleFirestoreError = (error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null) => {
  const user = auth.currentUser;
  const errorInfo: FirestoreErrorInfo = {
    error: error.message || 'Unknown Firestore error',
    operationType,
    path,
    authInfo: {
      userId: user?.uid || 'anonymous',
      email: user?.email || 'none',
      emailVerified: user?.emailVerified || false,
      isAnonymous: user?.isAnonymous || true,
      providerInfo: user?.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || ''
      })) || []
    }
  };
  console.error("Firestore Error:", errorInfo);
  throw new Error(JSON.stringify(errorInfo));
};

export const transformDriveUrl = (url: string, isVideo = false): string => {
  if (!url) return url;
  
  // Handle Google Drive
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const id = match[1];
      if (isVideo) {
        // For video preview/embed in iframe
        return `https://drive.google.com/file/d/${id}/preview`;
      }
      // For images
      return `https://lh3.googleusercontent.com/d/${id}`;
    }
  }
  
  return url;
};

export const postService = {
  async createPost(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'authorId' | 'status'>) {
    // If not authenticated, we use a fixed ID for Jannat's workflow
    const authorId = auth.currentUser?.uid || 'jannat-creator-id';
    const id = doc(collection(db, 'posts')).id;
    
    // Transform Drive links for compatibility
    const sanitizedData = {
      ...data,
      imageUrl: transformDriveUrl(data.imageUrl),
      videoUrl: data.videoUrl ? transformDriveUrl(data.videoUrl) : ''
    };

    const postData = {
      ...sanitizedData,
      authorId,
      status: 'pending' as PostStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    try {
      await setDoc(doc(db, 'posts', id), postData);
      return { id, ...postData };
    } catch (e) {
      handleFirestoreError(e, 'create', `posts/${id}`);
    }
  },

  async updatePost(postId: string, data: Partial<Post>) {
    const sanitizedData: any = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    if (data.imageUrl) sanitizedData.imageUrl = transformDriveUrl(data.imageUrl);
    if (data.videoUrl) sanitizedData.videoUrl = transformDriveUrl(data.videoUrl);

    try {
      await updateDoc(doc(db, 'posts', postId), sanitizedData);
      return true;
    } catch (e) {
      handleFirestoreError(e, 'update', `posts/${postId}`);
    }
  },

  async updatePostStatus(postId: string, status: PostStatus) {
    return this.updatePost(postId, { status });
  },

  async updatePostContent(postId: string, data: Partial<Pick<Post, 'title' | 'imageUrl' | 'caption'>>) {
    try {
      await updateDoc(doc(db, 'posts', postId), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, 'update', `posts/${postId}`);
    }
  },

  subscribeToPosts(callback: (posts: Post[]) => void) {
    // Show all posts for the creator panel if no user is logged in
    const q = auth.currentUser 
      ? query(collection(db, 'posts'), where('authorId', '==', auth.currentUser.uid), orderBy('createdAt', 'desc'))
      : query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      
    return onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      callback(posts);
    }, (e) => handleFirestoreError(e, 'list', 'posts'));
  },

  subscribeToClientPosts(clientEmail: string, callback: (posts: Post[]) => void) {
    const q = query(
      collection(db, 'posts'),
      where('clientEmail', '==', clientEmail),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      callback(posts);
    }, (e) => handleFirestoreError(e, 'list', 'posts'));
  },

  async addComment(postId: string, text: string, forcedAuthorName?: string) {
    const authorId = auth.currentUser?.uid || 'anonymous-user';
    const authorName = forcedAuthorName || auth.currentUser?.displayName || auth.currentUser?.email || 'Guest';
    
    const commentData = {
      postId,
      text,
      authorId,
      authorName,
      createdAt: serverTimestamp()
    };
    try {
      const docRef = await addDoc(collection(db, 'posts', postId, 'comments'), commentData);
      return { id: docRef.id, ...commentData };
    } catch (e) {
      handleFirestoreError(e, 'create', `posts/${postId}/comments`);
    }
  },

  subscribeToComments(postId: string, callback: (comments: Comment[]) => void) {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      callback(comments);
    }, (e) => handleFirestoreError(e, 'list', `posts/${postId}/comments`));
  }
};
