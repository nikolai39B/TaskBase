import { EditBehavior, Property } from './metadataTypes';

// TODO:
//   wire the displays into the UI 

// Define the list of priority values (snake_case for file properties) and their display labels
export const PRIORITY_VALUES = ['critical', 'high', 'medium', 'low'] as const;
export type Priority = typeof PRIORITY_VALUES[number];
export const PRIORITY_DISPLAY: Record<Priority, string> = {
  critical: 'Critical',
  high:     'High',
  medium:   'Medium',
  low:      'Low',
};

// Define the list of status values (snake_case for file properties) and their display labels
export const STATUS_VALUES = ['not_started', 'in_progress', 'complete', 'dropped'] as const;
export type Status = typeof STATUS_VALUES[number];
export const STATUS_DISPLAY: Record<Status, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  complete:    'Complete',
  dropped:     'Dropped',
};

// Define which statuses denote the task as "resolved"
export const RESOLVED_STATUSES = ['complete', 'dropped'] as const;
export type ResolvedStatus = typeof RESOLVED_STATUSES[number];

// Define the task properties
//
// Todo:
//   1. Different kinds of tasks should have different properties by default
//   2. Users should be able to:
//        - Remove properties for a task type
//        - Add properties to a task type
//        - Define their own properties and add them to task types
//
export const TASK_PROPERTIES = {
  priority: { name: 'priority', display: 'Priority', editBehavior: EditBehavior.Manual   } satisfies Property,
  status:   { name: 'status',   display: 'Status',   editBehavior: EditBehavior.Manual   } satisfies Property,
  due_date: { name: 'due_date', display: 'Due Date', editBehavior: EditBehavior.Manual   } satisfies Property,
  resolved: { name: 'resolved', display: 'Resolved', editBehavior: EditBehavior.AutoOnly } satisfies Property,
} as const;
