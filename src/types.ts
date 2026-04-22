export type PostStatus = 'pending' | 'approved' | 'revision';

export interface Post {
  id: string;
  title: string;
  imageUrl?: string;
  videoUrl?: string;
  caption: string;
  status: PostStatus;
  authorId: string;
  clientEmail: string;
  createdAt: any;
  updatedAt: any;
}

export interface Comment {
  id: string;
  postId: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: any;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}
