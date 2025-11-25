export class ErrorBase<T extends string> extends Error {
  public cause: any

  constructor(
    public name: T,
    public message: string,
    cause?: any
  ) {
    super();
    this.cause = cause
  }
}
