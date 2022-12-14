export interface experimentMap {
  experimentName: string;
  weight: number;
}

export interface scheduleType {
  scheduleOnce: string;
  recurringSchedule: string;
}

export interface scheduleInput {
  hour_interval: number;
  day: number;
  weekday: string;
  time: Date;
  date: Date;
}

export interface customWorkflow {
  experiment_name: string;
  hubName?: string;
  repoUrl?: string;
  repoBranch?: string;
  description: string;
  experimentYAML?: string;
  yaml?: string;
  index?: number;
}

export interface WorkflowData {
  chaosEngineChanged: boolean;
  namespace: string;
  workflowID?: string;
  clusterID: string;
  clusterName: string;
  cronSyntax: string;
  scheduleType: scheduleType;
  scheduleInput: scheduleInput;
}

export interface WorkflowManifest {
  engineYAML: string;
  manifest: string;
  isCustomWorkflow: boolean;
  isUploaded: boolean;
}

export interface LitmusCoreVersion {
  version: string;
}

export enum WorkflowActions {
  SET_WORKFLOW_DETAILS = 'SET_WORKFLOW_DETAILS',
  SET_CUSTOM_WORKFLOW = 'SET_CUSTOM_WORKFLOW',
  SET_WORKFLOW_MANIFEST = 'SET_WORKFLOW_MANIFEST',
  SET_WORKFLOW_HELPER_IMAGE_VERSION = 'SET_WORKFLOW_HELPER_IMAGE_VERSION',
}

interface WorkflowActionType<T, P> {
  type: T;
  payload: P;
}

export type WorkflowAction =
  | WorkflowActionType<
      typeof WorkflowActions.SET_WORKFLOW_DETAILS,
      WorkflowData
    >
  | WorkflowActionType<typeof WorkflowActions.SET_CUSTOM_WORKFLOW, WorkflowData>
  | WorkflowActionType<
      typeof WorkflowActions.SET_WORKFLOW_MANIFEST,
      WorkflowManifest
    >
  | WorkflowActionType<
      typeof WorkflowActions.SET_WORKFLOW_HELPER_IMAGE_VERSION,
      LitmusCoreVersion
    >;
