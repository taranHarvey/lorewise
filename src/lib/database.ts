import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { 
  User, 
  Novel, 
  Series, 
  Chapter, 
  Character, 
  Location, 
  PlotPoint, 
  AIInteraction, 
  UploadedDocument 
} from '@/types/database';

// Helper function to convert Firestore timestamps to Date objects
const convertTimestamps = (data: any) => {
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    }
  });
  return converted;
};

// User operations
export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'users'), {
    ...userData,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const getUser = async (userId: string): Promise<User | null> => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return convertTimestamps({ id: docSnap.id, ...docSnap.data() }) as User;
  }
  return null;
};

// Novel operations
export const createNovel = async (novelData: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'novels'), {
    ...novelData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

export const getNovelsByUser = async (userId: string): Promise<Novel[]> => {
  // For now, get all novels and filter client-side to avoid index requirement
  // Once the index is created, we can use the more efficient query below
  const q = query(collection(db, 'novels'));
  const querySnapshot = await getDocs(q);
  
  const allNovels = querySnapshot.docs.map(doc => 
    convertTimestamps({ id: doc.id, ...doc.data() })
  ) as Novel[];
  
  // Filter by userId and sort by custom order, then by updatedAt
  return allNovels
    .filter(novel => novel.userId === userId)
    .sort((a, b) => {
      // If both have order, sort by order
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      // If only one has order, prioritize it
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      // If neither has order, sort by updatedAt
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
};

export const updateNovel = async (novelId: string, updates: Partial<Novel>) => {
  const docRef = doc(db, 'novels', novelId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

export const deleteNovel = async (novelId: string) => {
  const docRef = doc(db, 'novels', novelId);
  await deleteDoc(docRef);
};

// Series operations
export const createSeries = async (seriesData: Omit<Series, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'series'), {
    ...seriesData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

export const getSeriesByUser = async (userId: string): Promise<Series[]> => {
  // For now, get all series and filter client-side to avoid index requirement
  // Once the index is created, we can use the more efficient query below
  const q = query(collection(db, 'series'));
  const querySnapshot = await getDocs(q);
  
  const allSeries = querySnapshot.docs.map(doc => 
    convertTimestamps({ id: doc.id, ...doc.data() })
  ) as Series[];
  
  // Filter by userId and sort by updatedAt
  return allSeries
    .filter(series => series.userId === userId)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
};

// Character operations
export const createCharacter = async (characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'characters'), {
    ...characterData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

export const getCharactersByUser = async (userId: string, seriesId?: string): Promise<Character[]> => {
  let q = query(
    collection(db, 'characters'),
    where('userId', '==', userId),
    orderBy('name')
  );
  
  if (seriesId) {
    q = query(
      collection(db, 'characters'),
      where('userId', '==', userId),
      where('seriesId', '==', seriesId),
      orderBy('name')
    );
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => 
    convertTimestamps({ id: doc.id, ...doc.data() })
  ) as Character[];
};

// Location operations
export const createLocation = async (locationData: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'locations'), {
    ...locationData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

export const getLocationsByUser = async (userId: string, seriesId?: string): Promise<Location[]> => {
  let q = query(
    collection(db, 'locations'),
    where('userId', '==', userId),
    orderBy('name')
  );
  
  if (seriesId) {
    q = query(
      collection(db, 'locations'),
      where('userId', '==', userId),
      where('seriesId', '==', seriesId),
      orderBy('name')
    );
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => 
    convertTimestamps({ id: doc.id, ...doc.data() })
  ) as Location[];
};

// Chapter operations
export const createChapter = async (chapterData: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'chapters'), {
    ...chapterData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

export const getChaptersByNovel = async (novelId: string): Promise<Chapter[]> => {
  const q = query(
    collection(db, 'chapters'),
    where('novelId', '==', novelId),
    orderBy('chapterNumber')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => 
    convertTimestamps({ id: doc.id, ...doc.data() })
  ) as Chapter[];
};

export const updateChapter = async (chapterId: string, updates: Partial<Chapter>) => {
  const docRef = doc(db, 'chapters', chapterId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

// AI Interaction operations
export const saveAIInteraction = async (interactionData: Omit<AIInteraction, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'aiInteractions'), {
    ...interactionData,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const getAIInteractionsByUser = async (userId: string, limitCount: number = 50): Promise<AIInteraction[]> => {
  const q = query(
    collection(db, 'aiInteractions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => 
    convertTimestamps({ id: doc.id, ...doc.data() })
  ) as AIInteraction[];
};
