
const DB_NAME = 'vydora-audio-library';
const STORE_NAME = 'audio-files';
const DB_VERSION = 1;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, {
          keyPath: 'id',
        });

        store.createIndex('createdAt', 'createdAt', {
          unique: false,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function runTransaction(mode, operation) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);

    let result;

    try {
      result = operation(store);
    } catch (error) {
      database.close();
      reject(error);
      return;
    }

    transaction.oncomplete = () => {
      database.close();
      resolve(result?.result);
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error || result?.error);
    };

    transaction.onabort = () => {
      database.close();
      reject(transaction.error || new Error('Storage operation was cancelled.'));
    };
  });
}

export async function saveAudio({ name, blob, type }) {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const record = {
    id,
    name,
    blob,
    type: type || blob.type || 'audio/mpeg',
    size: blob.size,
    createdAt: new Date().toISOString(),
  };

  await runTransaction('readwrite', (store) => store.add(record));

  return record;
}

export async function getAllAudio() {
  const records = await runTransaction('readonly', (store) =>
    store.getAll(),
  );

  return (records || []).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
}

export async function getAudioById(id) {
  return runTransaction('readonly', (store) => store.get(id));
}

export async function renameAudio(id, name) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      if (!request.result) {
        transaction.abort();
        return;
      }

      store.put({
        ...request.result,
        name,
      });
    };

    transaction.oncomplete = () => {
      database.close();
      resolve(true);
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };

    transaction.onabort = () => {
      database.close();
      resolve(false);
    };
  });
}

export async function deleteAudio(id) {
  await runTransaction('readwrite', (store) => store.delete(id));
}
