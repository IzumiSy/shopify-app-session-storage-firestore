import test from "ava";
import { FirestoreSessionStorage } from "../build/firestore.js";
import { Session } from "@shopify/shopify-api";

const shop1IDs = [
  "3c1d055d-7d95-42db-ae49-c20f305149cd",
  "7848bc70-dee5-4520-8cff-6c9c7e198946",
];
const shop2ID = "c5d5e244-f179-43a8-85c6-6f2fc488fdef";
const shops = [
  new Session({
    id: shop1IDs[0],
    shop: "shop1",
    state: "state",
    isOnline: false,
    expires: null,
    accessToken: "12345",
    scope: ["test_scope"].toString(),
  }),
  new Session({
    id: shop1IDs[1],
    shop: "shop1",
    state: "state",
    isOnline: false,
    expires: null,
    accessToken: "12345",
    scope: ["test_scope"].toString(),
  }),
  new Session({
    id: shop2ID,
    shop: "shop2",
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
    tableName: "__query_sessions",
  });
  storage.useEmulator();

  shops.forEach(async (session) => {
    t.is(await storage.storeSession(session), true);
  });

  t.context = { storage };
});

test.serial("query", async (t) => {
  const sessions = await t.context.storage.findSessionsByShop("shop1");
  t.is(sessions.length, 2);
  const sessionIDs = sessions.map((session) => session.id);
  t.true(sessionIDs.includes(shop1IDs[0]));
  t.true(sessionIDs.includes(shop1IDs[1]));
  t.not(sessionIDs.includes(shop2ID));
});
