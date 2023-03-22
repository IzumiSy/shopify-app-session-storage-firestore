import { Session } from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";

export class FirestoreSessionStorage implements SessionStorage {
  storeSession(session: Session): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  loadSession(id: string): Promise<Session | undefined> {
    throw new Error("Method not implemented.");
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
