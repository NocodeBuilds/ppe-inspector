
export interface CheckpointStatus {
  id: string;
  description: string;
  passed: boolean | null;
  notes?: string;
  photoUrl?: string | null;
  photoReferenceUrl?: string | null; // Reference photo for comparison
}

export interface InspectionResult {
  id?: string;
  inspectionId?: string;
  checkpointId: string;
  checkpointDescription: string;
  passed: boolean | null; // Allow null for N/A option
  notes?: string;
  photoUrl?: string;
  voiceNoteUrl?: string; // New field for voice notes
  photoReferenceUrl?: string; // Reference photo for comparison
}

export interface InspectionTemplate {
  id: string;
  name: string;
  ppeType: string;
  checkpoints: InspectionCheckpoint[];
  isDefault: boolean;
  createdBy?: string;
  createdAt?: string;
}

export interface InspectionCheckpoint {
  id: string;
  description: string;
  ppeType: string;
  required: boolean;
  category?: string; // Grouping checkpoints by category
  referencePhotoUrl?: string; // Standard reference photo
  guidanceNotes?: string; // Instructions for inspectors
  order: number; // For ordering checkpoints
}

export interface InspectionSubmitData {
  ppeId: string;
  inspectorName: string;
  templateId?: string; // Reference to the template used
  notes?: string;
  results: InspectionResult[];
  signatureData?: string;
  passFail: boolean | null; // Overall pass/fail status
  audioNotes?: string; // Overall audio notes for the inspection
}
