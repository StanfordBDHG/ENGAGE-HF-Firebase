export interface Result<T> {
  data?: T
  error?: {
    code: string
    message: string
  }
}
