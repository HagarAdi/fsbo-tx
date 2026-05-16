const DB_NAME = 'fsbo_photos'
const DB_VERSION = 1
const STORES = ['step3', 'step4_before', 'step4_after']

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'key' })
        }
      }
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = (e) => reject(e.target.error)
  })
}

export async function saveRoomPhotos(storeName, room, photos) {
  const db = await openDB()
  const tx = db.transaction(storeName, 'readwrite')
  tx.objectStore(storeName).put({ key: room, photos: photos.map(p => ({ name: p.name, blob: p.file })) })
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve
    tx.onerror = (e) => reject(e.target.error)
  })
}

export async function loadRoomPhotos(storeName, room) {
  const db = await openDB()
  const tx = db.transaction(storeName, 'readonly')
  return new Promise((resolve, reject) => {
    const req = tx.objectStore(storeName).get(room)
    req.onsuccess = (e) => {
      const record = e.target.result
      if (!record) return resolve([])
      resolve(record.photos.map(({ name, blob }) => ({
        name,
        url: URL.createObjectURL(blob),
        file: new File([blob], name, { type: blob.type }),
      })))
    }
    req.onerror = (e) => reject(e.target.error)
  })
}
