import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import type { VerificationStatus } from './types.ts';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    return true;
  }
}

void testConnection();

export interface DestinationOverrideDoc {
  destinationId: string;
  verificationStatus: VerificationStatus;
  officialTourismUrl: string;
  description: string;
  bestSeason: string;
  safetyInfo: string;
  stayPerNightInr: number;
  foodPerDayInr: number;
  localTransportPerDayInr: number;
  entryFeeInr: number;
  updatedByUid: string;
  updatedByEmail?: string;
}

export async function syncUserProfileToFirestore(params: {
  uid: string;
  name: string;
  email: string;
}): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;
  const userPath = `users/${params.uid}`;
  try {
    const ref = doc(db, 'users', params.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: params.uid,
        name: params.name.slice(0, 100),
        email: params.email.slice(0, 200),
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(
        ref,
        {
          uid: params.uid,
          name: params.name.slice(0, 100),
          email: params.email.slice(0, 200),
          role: 'user',
          createdAt: snap.data().createdAt,
          updatedAt: serverTimestamp(),
        },
        { merge: false }
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

export async function saveBookingToFirestore(params: {
  bookingCode: string;
  destinationId: string;
  destinationName: string;
  packageTitle: string;
  checkIn: string;
  checkOut: string;
  travelers: number;
  totalPriceInr: number;
  guestName: string;
  guestEmail: string;
}): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;
  const docId = params.bookingCode;
  const path = `bookings/${docId}`;
  try {
    await setDoc(doc(db, 'bookings', docId), {
      bookingCode: params.bookingCode.slice(0, 32),
      userId: auth.currentUser.uid,
      destinationId: params.destinationId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128),
      destinationName: params.destinationName.slice(0, 160),
      packageTitle: params.packageTitle.slice(0, 200),
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      travelers: Math.max(1, Math.min(20, Math.round(params.travelers))),
      totalPriceInr: Math.max(1, Math.round(params.totalPriceInr)),
      guestName: params.guestName.slice(0, 100),
      guestEmail: params.guestEmail.slice(0, 200),
      status: 'confirmed',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function saveSubscriberToFirestore(email: string): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;
  const uid = auth.currentUser.uid;
  const path = `subscribers/${uid}`;
  try {
    await setDoc(doc(db, 'subscribers', uid), {
      userId: uid,
      email: email.slice(0, 200),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function saveDestinationOverrideToFirestore(
  override: Omit<DestinationOverrideDoc, 'updatedByUid' | 'updatedByEmail'>
): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) {
    throw new Error('Verified Firebase sign-in is required to update Firestore.');
  }
  const safeId = override.destinationId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  const path = `destinationOverrides/${safeId}`;
  try {
    await setDoc(doc(db, 'destinationOverrides', safeId), {
      destinationId: safeId,
      verificationStatus: override.verificationStatus,
      officialTourismUrl: override.officialTourismUrl.slice(0, 500),
      description: override.description.slice(0, 2000),
      bestSeason: override.bestSeason.slice(0, 120),
      safetyInfo: override.safetyInfo.slice(0, 600),
      stayPerNightInr: Math.max(0, Math.min(50000, Number(override.stayPerNightInr) || 0)),
      foodPerDayInr: Math.max(0, Math.min(50000, Number(override.foodPerDayInr) || 0)),
      localTransportPerDayInr: Math.max(
        0,
        Math.min(50000, Number(override.localTransportPerDayInr) || 0)
      ),
      entryFeeInr: Math.max(0, Math.min(50000, Number(override.entryFeeInr) || 0)),
      updatedByUid: auth.currentUser.uid,
      updatedByEmail: auth.currentUser.email || '',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchDestinationOverridesFromFirestore(): Promise<
  Record<string, DestinationOverrideDoc>
> {
  const path = 'destinationOverrides';
  try {
    const snap = await getDocs(collection(db, path));
    const map: Record<string, DestinationOverrideDoc> = {};
    snap.forEach((docSnap) => {
      const data = docSnap.data() as DestinationOverrideDoc;
      if (data && data.destinationId) {
        map[data.destinationId] = data;
      }
    });
    return map;
  } catch {
    return {};
  }
}
