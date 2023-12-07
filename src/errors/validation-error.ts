export class ValidationError extends Error {
  public field: string;

  constructor(message: string, field: string) {
    super(message);
    Object.setPrototypeOf(this, ValidationError.prototype);
    this.field = field;
  }
}
