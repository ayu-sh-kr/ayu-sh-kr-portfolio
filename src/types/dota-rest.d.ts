declare module "@ayu-sh-kr/dota-rest" {
  interface ResponseHandler {
    (response: Response): void;
  }

  interface ResponseConverter<T> {
    (data: unknown): T;
  }

  interface RestResponse<T> {
    converter(converter: ResponseConverter<T>): RestResponse<T>;
    handler(handler: ResponseHandler): RestResponse<T>;
    toEntity(): Promise<{status: number; data: T}>;
  }

  interface RestRequest<T> {
    uri(uri: string): RestRequest<T>;
    body(item: unknown): RestRequest<T>;
    retrieve(): RestResponse<T>;
  }

  interface RestClientBuilder {
    baseUrl(url: string): RestClientBuilder;
    handler(handler: ResponseHandler): RestClientBuilder;
    build(): RestClient;
  }

  export class RestClient {
    static builder(): RestClientBuilder;
    post<T>(): RestRequest<T>;
  }

  const dotaRest: {RestClient: typeof RestClient};
  export default dotaRest;
}

interface Window {
  portfolioRestClient: import("@ayu-sh-kr/dota-rest").RestClient;
}
