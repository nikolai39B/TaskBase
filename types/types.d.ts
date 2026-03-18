// types.d.ts
//import { ProgrammaticBasesAPI } from '../src/api';

//declare global {
//  interface Window {
//    //programmaticBases?: ProgrammaticBasesAPI;
//  }
//}

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