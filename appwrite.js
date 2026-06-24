/* ===========================
   appwrite.js — SDK Config
   =========================== */

const APPWRITE_CONFIG = {
  endpoint:     'https://cloud.appwrite.io/v1',
  projectId:    '6a2fc2580023bce75ca1',
  databaseId:   '6a2fc2cb0032ec66ae4b',
  collectionId: 'projects',   // ⚠️ Replace with real Collection ID from Appwrite Console → collection → Settings
  bucketId:     '6a2fca8c002e71339acb',
};

(function loadAppwriteSDK() {
  function dispatchReady() {
    window.AppwriteReady = true;
    window.dispatchEvent(new Event('appwrite-ready'));
  }
  const local = document.createElement('script');
  local.src = 'appwrite-sdk.js';
  local.onload = dispatchReady;
  local.onerror = () => {
    const cdn = document.createElement('script');
    cdn.src = 'https://unpkg.com/appwrite@14/dist/iife/sdk.js';
    cdn.onload = dispatchReady;
    cdn.onerror = () => console.error('Appwrite SDK failed to load.');
    document.head.appendChild(cdn);
  };
  document.head.appendChild(local);
})();

function getAppwriteClient() {
  const client = new Appwrite.Client();
  client.setEndpoint(APPWRITE_CONFIG.endpoint).setProject(APPWRITE_CONFIG.projectId);
  return client;
}
function getDatabase() { return new Appwrite.Databases(getAppwriteClient()); }
function getStorage()  { return new Appwrite.Storage(getAppwriteClient()); }
function getAccount()  { return new Appwrite.Account(getAppwriteClient()); }

// Use /view endpoint — works for public files in Appwrite v14
function getImagePreviewUrl(fileId) {
  if (!fileId) return null;
  return `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${fileId}/view?project=${APPWRITE_CONFIG.projectId}`;
}

window.APPWRITE_CONFIG    = APPWRITE_CONFIG;
window.getAppwriteClient  = getAppwriteClient;
window.getDatabase        = getDatabase;
window.getStorage         = getStorage;
window.getAccount         = getAccount;
window.getImagePreviewUrl = getImagePreviewUrl;