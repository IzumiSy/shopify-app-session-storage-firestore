"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreSessionStorage = void 0;
const shopify_api_1 = require("@shopify/shopify-api");
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
class FirestoreSessionStorage {
    tableName;
    firestore;
    converter;
    constructor(firebaseConfiguration, tableName = "__sessions") {
        this.tableName = tableName;
        const app = (0, app_1.initializeApp)(firebaseConfiguration);
        this.firestore = (0, firestore_1.getFirestore)(app);
        this.converter = {
            toFirestore(data) {
                return data;
            },
            fromFirestore(snapshot, options) {
                return snapshot.data(options);
            },
        };
    }
    async storeSession(session) {
        try {
            await (0, firestore_1.setDoc)((0, firestore_1.doc)(this.firestore, this.tableName, session.id).withConverter(this.converter), {
                shopID: session.shop,
                value: session.toObject(),
            });
            return true;
        }
        catch {
            return false;
        }
    }
    async loadSession(id) {
        const snapshot = await (0, firestore_1.getDoc)((0, firestore_1.doc)(this.firestore, this.tableName, id).withConverter(this.converter));
        if (snapshot.exists()) {
            const data = snapshot.data();
            return new shopify_api_1.Session(data.value);
        }
    }
    async deleteSession(id) {
        try {
            await (0, firestore_1.deleteDoc)((0, firestore_1.doc)(this.firestore, this.tableName, id));
            return true;
        }
        catch {
            return false;
        }
    }
    async deleteSessions(ids) {
        try {
            const batch = (0, firestore_1.writeBatch)(this.firestore);
            ids.forEach((id) => {
                batch.delete((0, firestore_1.doc)(this.firestore, this.tableName, id));
            });
            await batch.commit();
            return true;
        }
        catch {
            return false;
        }
    }
    async findSessionsByShop(shop) {
        const sessionsRef = (0, firestore_1.collection)(this.firestore, this.tableName).withConverter(this.converter);
        const q = (0, firestore_1.query)(sessionsRef, (0, firestore_1.where)("shopID", "==", shop));
        const snapshots = await (0, firestore_1.getDocs)(q);
        return snapshots.docs.map((snapshot) => {
            const data = snapshot.data();
            return new shopify_api_1.Session(data.value);
        });
    }
    useEmulator() {
        (0, firestore_1.connectFirestoreEmulator)(this.firestore, "localhost", 8080);
    }
}
exports.FirestoreSessionStorage = FirestoreSessionStorage;
