declare global {
  interface HttpResponse {
    success: boolean
    message: string
    data: any
  }
}

export {};

