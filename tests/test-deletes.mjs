import test from "ava";
import { FirestoreSessionStorage } from "../build/firestore.js";
import { Session } from "@shopify/shopify-api";

const shopIDs = [
  "43140129-511d-422c-ad56-bd6828e033df",
  "335c0be8-0b31-4a31-be09-61310f10efff",
  "56d1f3f4-eeb1-4b0e-b40a-a1f37ba13621",
];
const shops = [
  new Session({
    id: shopIDs[0],
    shop: "shop",
    state: "state",
    isOnline: false,
    expires: null,
    accessToken: "12345",
    scope: ["test_scope"].toString(),
  }),
  new Session({
    id: shopIDs[1],
    shop: "shop",
    state: "state",
    isOnline: false,
    expires: null,
    accessToken: "12345",
    scope: ["test_scope"].toString(),
  }),
  new Session({
    id: shopIDs[2],
    shop: "shop",
    state: "state",
    isOnline: false,
    expires: null,
    accessToken: "12345",
    scope: ["test_scope"].toString(),
  }),
];

test.before(async (t) => {
  const storage = new FirestoreSessionStorage({
    projectId: "shopify-session-app",
    tableName: "__deletes_sessions",
  });
  storage.useEmulator();

  shops.forEach(async (session) => {
    t.is(await storage.storeSession(session), true);
  });

  t.context = { storage };
});

test.serial("multiple sessions should be deleted", async (t) => {
  t.true(await t.context.storage.deleteSessions(shopIDs));
});

test.serial("all deleted sessions should not be loaded", async (t) => {
  const sessions = await t.context.storage.findSessionsByShop("shop");
  t.is(sessions.length, 0);
});
