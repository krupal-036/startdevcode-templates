// src/utils/handlers/responseHandler.ts
export interface ApiResponse<T = any> {
    code: number;
    data: T | null;
}

export class ResponseHandler<T = any> implements ApiResponse<T> {
    public code: number;
    public data: T | null;

    constructor(code: number, data: T | null = null) {
        this.code = code;
        this.data = data;
    }

    static send<R>(code: number, data: R | null = null): ResponseHandler<R> {
        return new ResponseHandler<R>(code, data);
    }
}
