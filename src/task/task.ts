import { DatePropertyValue } from 'metadata/dateProperty';
import { Priority, Status, RESOLVED_STATUSES } from 'metadata/taskProperties';

export class Task {
  constructor(
    public priority: Priority,
    public status: Status,
    public due_date: DatePropertyValue | null,
  ) {}

  get resolved(): boolean {
    return (RESOLVED_STATUSES as readonly string[]).includes(this.status);
  }

  /** Write properties into a frontmatter object (passed in from processFrontMatter). */
  serialize(fm: Record<string, unknown>): void {
    fm['priority'] = this.priority;
    fm['status']   = this.status;
    fm['due_date'] = this.due_date?.serialize() ?? null;
    fm['resolved'] = this.resolved;
  }

  /** Deserialize from a frontmatter object (from cache.frontmatter). */
  static deserialize(fm: Record<string, unknown>): Task {
    return new Task(
      fm['priority'] as Priority,
      fm['status'] as Status,
      fm['due_date'] ? new DatePropertyValue(fm['due_date'] as string) : null,
    );
  }

  /** Default values for a newly created task. */
  static createDefault(): Task {
    return new Task('medium', 'not_started', null);
  }
}
