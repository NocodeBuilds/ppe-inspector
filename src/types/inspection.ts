
export interface CheckpointStatus {
  id: string;
  description: string;
  passed: boolean | null;
  notes?: string;
  photoUrl?: string | null;
}

export interface InspectionResult {
  id?: string;
  inspectionId?: string;
  checkpointId: string;
  checkpointDescription: string;
  passed: boolean | null; // Allow null for N/A option
  notes?: string;
  photoUrl?: string;
}

export interface InspectionSubmitData {
  ppeId: string;
  inspectorName: string;
  notes?: string;
  results: InspectionResult[];
  signatureData?: string;
  passFail: boolean | null; // Overall pass/fail status
}
