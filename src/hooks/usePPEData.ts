
import { usePPEQueries } from './usePPEQueries';
import { usePPEMutations } from './usePPEMutations';

/**
 * Combined hook for PPE data management
 * Provides a unified interface to both queries and mutations
 */
export function usePPEData() {
  const {
    ppeItems,
    isLoadingPPE,
    ppeError,
    refetchPPE,
    getPPEBySerialNumber,
    getPPEById,
  } = usePPEQueries();

  const {
    updatePPEStatus,
    createPPE,
    uploadPPEImage,
    isUploading
  } = usePPEMutations(refetchPPE);

  return {
    // Queries
    ppeItems,
    isLoadingPPE,
    ppeError,
    refetchPPE,
    getPPEBySerialNumber,
    getPPEById,
    // Mutations
    updatePPEStatus,
    createPPE,
    uploadPPEImage,
    isUploading
  };
}
