"use strict";

(function initDatabaseApi() {
  const DB_NAME = "lea-ops-console-db";
  const DB_VERSION = 1;
  const STORE = "records";
  const STATE_KEY = "state";

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB is not available in this browser."));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "key" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Unable to open IndexedDB."));
    });
  }

  async function withStore(mode, callback) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const store = tx.objectStore(STORE);
      let result;
      tx.oncomplete = () => {
        db.close();
        resolve(result);
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error || new Error("Database transaction failed."));
      };
      result = callback(store);
    });
  }

  async function load() {
    return withStore("readonly", store => {
      return new Promise(resolve => {
        const request = store.get(STATE_KEY);
        request.onsuccess = () => resolve(request.result ? request.result.value : null);
        request.onerror = () => resolve(null);
      });
    });
  }

  async function save(value) {
    const snapshot = JSON.parse(JSON.stringify(value));
    snapshot.savedAt = new Date().toISOString();
    return withStore("readwrite", store => {
      store.put({ key: STATE_KEY, value: snapshot, savedAt: snapshot.savedAt });
      return true;
    });
  }

  async function clear() {
    return withStore("readwrite", store => {
      store.delete(STATE_KEY);
      return true;
    });
  }

  async function stats(value) {
    const text = JSON.stringify(value || {});
    return {
      engine: "IndexedDB",
      database: DB_NAME,
      bytes: new Blob([text]).size,
      savedAt: value && value.savedAt ? value.savedAt : "",
      available: "indexedDB" in window
    };
  }

  window.LeaDatabase = { load, save, clear, stats };
})();
