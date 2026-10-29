const databaseName = "feira-da-fruta";
const databaseVersion = 1;
const profileStoreName = "profiles";
const profileRecordId = "local-profile";

export const demoUserProfile = {
  name: "",
  heightCm: 180,
  weightKg: 78,
  email: "",
  energyTargetKcal: 2000,
  activityLevel: "moderate",
};

export const emptyUserProfile = {
  name: "",
  heightCm: "",
  weightKg: "",
  email: "",
  energyTargetKcal: "",
  activityLevel: "",
};

function openProfileDatabase() {
  if (!globalThis.indexedDB) {
    return Promise.reject(
      new Error("Este navegador não disponibiliza o armazenamento IndexedDB."),
    );
  }

  return new Promise((resolve, reject) => {
    const request = globalThis.indexedDB.open(databaseName, databaseVersion);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(profileStoreName)) {
        database.createObjectStore(profileStoreName, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Não foi possível abrir o perfil local."));
    request.onblocked = () =>
      reject(new Error("Feche outras abas do aplicativo para abrir o perfil."));
  });
}

export async function loadUserProfile() {
  const database = await openProfileDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(profileStoreName, "readonly");
    const request = transaction.objectStore(profileStoreName).get(profileRecordId);

    request.onsuccess = () => {
      const { id: _id, ...profile } = request.result ?? {};
      database.close();
      resolve(request.result ? profile : null);
    };
    request.onerror = () => {
      database.close();
      reject(request.error ?? new Error("Não foi possível carregar o perfil local."));
    };
  });
}

export async function saveUserProfile(profile) {
  const database = await openProfileDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(profileStoreName, "readwrite");
    transaction.objectStore(profileStoreName).put({
      ...profile,
      id: profileRecordId,
    });

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("Não foi possível salvar o perfil local."));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error("O salvamento do perfil foi cancelado."));
    };
  });
}

export async function deleteUserProfile() {
  const database = await openProfileDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(profileStoreName, "readwrite");
    transaction.objectStore(profileStoreName).delete(profileRecordId);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("Não foi possível apagar o perfil local."));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error("A exclusão do perfil foi cancelada."));
    };
  });
}
