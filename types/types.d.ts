// types.d.ts
export {};

declare module "obsidian" {
  interface Workspace {
    //-- EVENTS
    trigger(name: "task-base:loaded"): void;
    trigger(name: "task-base:loadFailed", error: Error): void;
    trigger(name: "task-base:unloaded"): void;
  }

  interface App {
    plugins: {
      plugins: Record<string, unknown>;
    };
  }
}