
/**
 * IndexedDB utilities for offline data storage
 * Provides a simple API for storing and retrieving data
 */

// Database configuration
const DB_NAME = 'ppe-inspector-db';
const DB_VERSION = 1;
const STORES = {
  inspections: 'inspections',
  equipment: 'equipment',
  offlineActions: 'offlineActions',
  files: 'files'
};

/**
 * Initialize the IndexedDB database
 * Creates object stores if they don't exist
 */
export const initDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject(new Error('Could not open IndexedDB'));
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log('IndexedDB initialized successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.inspections)) {
        db.createObjectStore(STORES.inspections, { keyPath: 'id' });
        console.log('Created inspections store');
      }
      
      if (!db.objectStoreNames.contains(STORES.equipment)) {
        db.createObjectStore(STORES.equipment, { keyPath: 'id' });
        console.log('Created equipment store');
      }
      
      if (!db.objectStoreNames.contains(STORES.offlineActions)) {
        const actionStore = db.createObjectStore(STORES.offlineActions, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        actionStore.createIndex('type', 'type', { unique: false });
        actionStore.createIndex('status', 'status', { unique: false });
        console.log('Created offline actions store');
      }
      
      if (!db.objectStoreNames.contains(STORES.files)) {
        const fileStore = db.createObjectStore(STORES.files, { keyPath: 'id' });
        fileStore.createIndex('type', 'type', { unique: false });
        console.log('Created files store');
      }
    };
  });
};

/**
 * Save data to IndexedDB
 * @param storeName Name of the object store
 * @param data Data to save
 */
export const saveToIndexedDB = async <T>(
  storeName: string, 
  data: T
): Promise<T> => {
  try {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.put(data);
      
      request.onsuccess = () => {
        console.log(`Data saved to ${storeName}`);
        resolve(data);
      };
      
      request.onerror = (event) => {
        console.error(`Error saving to ${storeName}:`, event);
        reject(new Error(`Failed to save data to ${storeName}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in saveToIndexedDB:', error);
    throw error;
  }
};

/**
 * Get data from IndexedDB
 * @param storeName Name of the object store
 * @param id ID of the item to retrieve
 */
export const getFromIndexedDB = async <T>(
  storeName: string,
  id: string | number
): Promise<T | null> => {
  try {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = (event) => {
        console.error(`Error retrieving from ${storeName}:`, event);
        reject(new Error(`Failed to get data from ${storeName}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in getFromIndexedDB:', error);
    throw error;
  }
};

/**
 * Get all data from an IndexedDB store
 * @param storeName Name of the object store
 */
export const getAllFromIndexedDB = async <T>(
  storeName: string
): Promise<T[]> => {
  try {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = (event) => {
        console.error(`Error retrieving all from ${storeName}:`, event);
        reject(new Error(`Failed to get all data from ${storeName}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in getAllFromIndexedDB:', error);
    throw error;
  }
};

/**
 * Delete data from IndexedDB
 * @param storeName Name of the object store
 * @param id ID of the item to delete
 */
export const deleteFromIndexedDB = async (
  storeName: string,
  id: string | number
): Promise<void> => {
  try {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.delete(id);
      
      request.onsuccess = () => {
        console.log(`Item ${id} deleted from ${storeName}`);
        resolve();
      };
      
      request.onerror = (event) => {
        console.error(`Error deleting from ${storeName}:`, event);
        reject(new Error(`Failed to delete data from ${storeName}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in deleteFromIndexedDB:', error);
    throw error;
  }
};

/**
 * Queue an action to be performed when online
 * @param action Action details including type, data, and any metadata
 */
export const queueOfflineAction = async (action: {
  type: string;
  data: any;
  metadata?: any;
  status?: 'pending' | 'processing' | 'complete' | 'failed';
}): Promise<void> => {
  try {
    await saveToIndexedDB(STORES.offlineActions, {
      ...action,
      createdAt: new Date().toISOString(),
      status: action.status || 'pending'
    });
    
    console.log('Offline action queued:', action.type);
    
    // Register for background sync if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      
      if ('sync' in registration) {
        try {
          // @ts-ignore - TypeScript doesn't recognize sync property
          await registration.sync.register('sync-offline-actions');
          console.log('Background sync registered for offline actions');
        } catch (syncError) {
          console.error('Failed to register sync:', syncError);
        }
      }
    }
  } catch (error) {
    console.error('Error queueing offline action:', error);
    throw error;
  }
};

/**
 * Get all pending offline actions
 */
export const getPendingOfflineActions = async (): Promise<any[]> => {
  try {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.offlineActions, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index('status');
      
      const request = index.getAll('pending');
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = (event) => {
        console.error('Error retrieving pending actions:', event);
        reject(new Error('Failed to get pending offline actions'));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error in getPendingOfflineActions:', error);
    return [];
  }
};

/**
 * Clear all completed offline actions
 */
export const clearCompletedOfflineActions = async (): Promise<void> => {
  try {
    const db = await initDatabase();
    
    const transaction = db.transaction(STORES.offlineActions, 'readwrite');
    const store = transaction.objectStore(STORES.offlineActions);
    const index = store.index('status');
    
    const request = index.openCursor('complete');
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    
    transaction.oncomplete = () => {
      db.close();
      console.log('Completed offline actions cleared');
    };
    
    transaction.onerror = (event) => {
      console.error('Error clearing completed actions:', event);
      db.close();
    };
  } catch (error) {
    console.error('Error in clearCompletedOfflineActions:', error);
  }
};

// Fix IndexDB object store reference
let storeName = STORES.offlineActions;

/**
 * Save a blob/file to IndexedDB for offline access
 * @param id Unique identifier for the file
 * @param blob The file data as a Blob
 * @param metadata Additional file metadata
 */
export const saveFileToIndexedDB = async (
  id: string,
  blob: Blob,
  metadata: {
    type: string;
    name: string;
    contentType: string;
    createdAt?: string;
  }
): Promise<void> => {
  try {
    await saveToIndexedDB(STORES.files, {
      id,
      blob,
      ...metadata,
      createdAt: metadata.createdAt || new Date().toISOString()
    });
    
    console.log(`File ${metadata.name} saved to IndexedDB`);
  } catch (error) {
    console.error('Error saving file to IndexedDB:', error);
    throw error;
  }
};
