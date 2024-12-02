export class PathAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PathAuthError';
  }
}
