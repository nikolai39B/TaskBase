import { EditBehavior, Property } from './metadataTypes';

// Define the list of priority values
export const PRIORITY_VALUES = ['critical', 'high', 'medium', 'low'] as const;
export type Priority = typeof PRIORITY_VALUES[number];

// Define the list of status values
export const STATUS_VALUES = ['not_started', 'in_progress', 'complete', 'dropped'] as const;
export type Status = typeof STATUS_VALUES[number];

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
