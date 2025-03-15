
/**
 * Utility functions for IndexedDB operations
 * Handles offline data storage, queuing, and synchronization
 */

const DB_NAME = 'ppe_inspector_db';
const DB_VERSION = 1;
const OFFLINE_ACTIONS_STORE = 'offline_actions';
const TEMP_IMAGES_STORE = 'temp_images';

export interface OfflineAction {
  id?: string;
  type: string;
  data: any;
  timestamp?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: any;
  retryCount?: number;
  lastError?: string | null;
}

/**
 * Initialize the IndexedDB database
 */
export const initIndexedDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('Failed to open IndexedDB');
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(OFFLINE_ACTIONS_STORE)) {
        const offlineActionsStore = db.createObjectStore(OFFLINE_ACTIONS_STORE, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        offlineActionsStore.createIndex('status', 'status', { unique: false });
        offlineActionsStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(TEMP_IMAGES_STORE)) {
        const imagesStore = db.createObjectStore(TEMP_IMAGES_STORE, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        imagesStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

/**
 * Queue an offline action for later synchronization
 */
export const queueOfflineAction = async (action: OfflineAction): Promise<string> => {
  try {
    const db = await initIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(OFFLINE_ACTIONS_STORE, 'readwrite');
      const store = transaction.objectStore(OFFLINE_ACTIONS_STORE);
      
      // Add timestamp and default retry count
      const actionToStore = {
        ...action,
        timestamp: Date.now(),
        retryCount: 0
      };
      
      const request = store.add(actionToStore);
      
      request.onsuccess = (event) => {
        const id = (event.target as IDBRequest).result as string;
        resolve(id);
      };
      
      request.onerror = (event) => {
        console.error('Error queueing offline action:', event);
        reject('Failed to queue offline action');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('IndexedDB queue action error:', error);
    throw error;
  }
};

/**
 * Get all pending offline actions
 */
export const getPendingOfflineActions = async (): Promise<OfflineAction[]> => {
  try {
    const db = await initIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(OFFLINE_ACTIONS_STORE, 'readonly');
      const store = transaction.objectStore(OFFLINE_ACTIONS_STORE);
      const index = store.index('status');
      
      const request = index.getAll('pending');
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        console.error('Error getting pending actions:', event);
        reject('Failed to get pending actions');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('IndexedDB get pending actions error:', error);
    return [];
  }
};

/**
 * Get a specific offline action by ID
 */
export const getOfflineAction = async (id: string): Promise<OfflineAction | null> => {
  try {
    const db = await initIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(OFFLINE_ACTIONS_STORE, 'readonly');
      const store = transaction.objectStore(OFFLINE_ACTIONS_STORE);
      
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = (event) => {
        console.error('Error getting offline action:', event);
        reject('Failed to get offline action');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('IndexedDB get offline action error:', error);
    return null;
  }
};

/**
 * Update an offline action
 */
export const updateOfflineAction = async (id: string, updates: Partial<OfflineAction>): Promise<void> => {
  try {
    const db = await initIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(OFFLINE_ACTIONS_STORE, 'readwrite');
      const store = transaction.objectStore(OFFLINE_ACTIONS_STORE);
      
      // First get the current data
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        if (!getRequest.result) {
          reject(`Offline action with id ${id} not found`);
          return;
        }
        
        // Merge with updates
        const updatedAction = {
          ...getRequest.result,
          ...updates
        };
        
        const updateRequest = store.put(updatedAction);
        
        updateRequest.onsuccess = () => {
          resolve();
        };
        
        updateRequest.onerror = (event) => {
          console.error('Error updating offline action:', event);
          reject('Failed to update offline action');
        };
      };
      
      getRequest.onerror = (event) => {
        console.error('Error getting offline action for update:', event);
        reject('Failed to get offline action for update');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('IndexedDB update offline action error:', error);
  }
};

/**
 * Clear completed offline actions
 */
export const clearCompletedOfflineActions = async (): Promise<void> => {
  try {
    const db = await initIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(OFFLINE_ACTIONS_STORE, 'readwrite');
      const store = transaction.objectStore(OFFLINE_ACTIONS_STORE);
      const index = store.index('status');
      
      const request = index.openCursor('completed');
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      
      request.onerror = (event) => {
        console.error('Error clearing completed actions:', event);
        reject('Failed to clear completed actions');
      };
      
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
    });
  } catch (error) {
    console.error('IndexedDB clear completed actions error:', error);
  }
};

/**
 * Store a temporary image for offline use
 */
export const storeTemporaryImage = async (imageData: string): Promise<string> => {
  try {
    const db = await initIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(TEMP_IMAGES_STORE, 'readwrite');
      const store = transaction.objectStore(TEMP_IMAGES_STORE);
      
      const request = store.add({
        data: imageData,
        timestamp: Date.now()
      });
      
      request.onsuccess = (event) => {
        const id = (event.target as IDBRequest).result as string;
        resolve(id);
      };
      
      request.onerror = (event) => {
        console.error('Error storing temporary image:', event);
        reject('Failed to store image');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('IndexedDB store image error:', error);
    throw error;
  }
};

/**
 * Clear old temporary images (older than 7 days)
 */
export const clearOldTemporaryImages = async (): Promise<void> => {
  try {
    const db = await initIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(TEMP_IMAGES_STORE, 'readwrite');
      const store = transaction.objectStore(TEMP_IMAGES_STORE);
      const index = store.index('timestamp');
      
      // Calculate timestamp for 7 days ago
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      const request = index.openCursor(IDBKeyRange.upperBound(sevenDaysAgo));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      
      request.onerror = (event) => {
        console.error('Error clearing old images:', event);
        reject('Failed to clear old images');
      };
      
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
    });
  } catch (error) {
    console.error('IndexedDB clear old images error:', error);
  }
};

/**
 * Initialize database and cleanup old data
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    await initIndexedDB();
    
    // Run cleanup operations
    await clearOldTemporaryImages();
    await clearCompletedOfflineActions();
    
    console.log('IndexedDB initialized successfully');
  } catch (error) {
    console.error('IndexedDB initialization error:', error);
  }
};
