import { Session, SessionParams } from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";
import { FirebaseOptions, initializeApp } from "firebase/app";
import {
  DocumentData,
  FieldValue,
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";

type SerializedSession = ReturnType<
  InstanceType<typeof Session>["toPropertyArray"]
>;
type SessionDocument = {
  shopID: string;
  value: SerializedSession;
};

export class FirestoreSessionStorage implements SessionStorage {
  private firestore: Firestore;
  private converter: FirestoreDataConverter<SessionDocument>;

  constructor(firebaseConfiguration: FirebaseOptions) {
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
    await setDoc(
      doc(this.firestore, "__sessions").withConverter(this.converter),
      {
        shopID: session.shop,
        value: session.toPropertyArray(),
      }
    );
    return true;
  }

  async loadSession(id: string): Promise<Session | undefined> {
    const snapshot = await getDoc<SessionDocument>(
      doc(this.firestore, "__sessions", id).withConverter(this.converter)
    );
    if (snapshot.exists()) {
      const data = snapshot.data();
      return Session.fromPropertyArray(data.value);
    }
  }

  deleteSession(id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  deleteSessions(ids: string[]): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  findSessionsByShop(shop: string): Promise<Session[]> {
    throw new Error("Method not implemented.");
  }
}
