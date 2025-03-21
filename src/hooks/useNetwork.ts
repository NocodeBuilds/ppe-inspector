
import { create } from 'zustand';

export interface NetworkState {
  isOnline: boolean;
  wasOffline: boolean;
  setOnline: (status: boolean) => void;
  setWasOffline: (status: boolean) => void;
  resetWasOffline: () => void;
}

export const useNetwork = create<NetworkState>((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  wasOffline: false,
  setOnline: (status: boolean) => set({ isOnline: status }),
  setWasOffline: (status: boolean) => set({ wasOffline: status }),
  resetWasOffline: () => set({ wasOffline: false }),
}));

export default useNetwork;
