import test from "ava";
import { FirestoreSessionStorage } from "../build/firestore.js";
import { Session } from "@shopify/shopify-api";

const session = new Session({
  id: "2f13bcdf-33cb-4bd2-a020-5ef130ec9073",
  shop: "test-shop",
  state: "state",
  isOnline: false,
  expires: null,
  accessToken: "12345",
  scope: ["test_scope"].toString(),
});

test.before((t) => {
  const storage = new FirestoreSessionStorage({
    projectId: "shopify-session-app",
    tableName: "__simple_sessions",
  });
  storage.useEmulator();

  t.context = { storage };
});

test.serial("session should be stored", async (t) => {
  t.is(await t.context.storage.storeSession(session), true);
});

test.serial("stored session should be loaded", async (t) => {
  const storedSession = await t.context.storage.loadSession(session.id);
  t.not(storedSession, undefined);
  t.true(storedSession.equals(session));
});

test.serial("stored session should be deleted", async (t) => {
  t.is(await t.context.storage.deleteSession(session.id), true);
});

test.serial("deleted session should not be loaded", async (t) => {
  const storedSession = await t.context.storage.loadSession(session.id);
  t.is(storedSession, undefined);
});
