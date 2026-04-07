interface Window {
  programmaticBases: {
    registerSource(source: {
      name: string;
      components?: Record<string, string>;
      templates?: Record<string, string>;
    }, options?: { append?: boolean }): void;
  };
}
