import { Session, SessionParams } from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";
import { FirebaseOptions, initializeApp } from "firebase/app";
import {
  DocumentData,
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";

type SessionDocument = {
  shopID: string;
  value: SessionParams;
};

export class FirestoreSessionStorage implements SessionStorage {
  private firestore: Firestore;
  private converter: FirestoreDataConverter<SessionDocument>;

  constructor(
    firebaseConfiguration: FirebaseOptions,
    private tableName: string = "__sessions"
  ) {
    const app = initializeApp(firebaseConfiguration);
    this.firestore = getFirestore(app);
    this.converter = {
      toFirestore(data: WithFieldValue<SessionDocument>): DocumentData {
        return data;
      },

      fromFirestore(
        snapshot: QueryDocumentSnapshot<SessionDocument>,
        options?: SnapshotOptions
      ): SessionDocument {
        return snapshot.data(options);
      },
    };
  }

  async storeSession(session: Session): Promise<boolean> {
    try {
      await setDoc(
        doc(this.firestore, this.tableName, session.id).withConverter(
          this.converter
        ),
        {
          shopID: session.shop,
          value: session.toObject(),
        }
      );
      return true;
    } catch {
      return false;
    }
  }

  async loadSession(id: string): Promise<Session | undefined> {
    const snapshot = await getDoc<SessionDocument>(
      doc(this.firestore, this.tableName, id).withConverter(this.converter)
    );
    if (snapshot.exists()) {
      const data = snapshot.data();
      return new Session(data.value);
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(this.firestore, this.tableName, id));
      return true;
    } catch {
      return false;
    }
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    try {
      const batch = writeBatch(this.firestore);
      ids.forEach((id) => {
        batch.delete(doc(this.firestore, this.tableName, id));
      });
      await batch.commit();
      return true;
    } catch {
      return false;
    }
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    const sessionsRef = collection(
      this.firestore,
      this.tableName
    ).withConverter(this.converter);
    const q = query(sessionsRef, where("shopID", "==", shop));
    const snapshots = await getDocs(q);
    return snapshots.docs.map((snapshot) => {
      const data = snapshot.data();
      return new Session(data.value);
    });
  }

  useEmulator() {
    connectFirestoreEmulator(this.firestore, "localhost", 8080);
  }
}
