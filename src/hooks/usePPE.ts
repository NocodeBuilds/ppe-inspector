
import { usePPEQueries } from './usePPEQueries';
import { usePPEMutations } from './usePPEMutations';

export const usePPE = () => {
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
    ppeItems,
    isLoadingPPE,
    ppeError,
    refetchPPE,
    updatePPEStatus,
    createPPE,
    uploadPPEImage,
    isUploading,
    getPPEBySerialNumber,
    getPPEById,
  };
};
