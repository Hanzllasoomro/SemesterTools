// Minimal ambient type to quiet "file-saver" missing types in this project
declare module 'file-saver' {
  export function saveAs(blob: Blob, filename?: string): void;
}
