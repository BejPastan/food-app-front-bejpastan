export interface ValidationMessage<T> {
    message:string;
    key:T;
}

export interface SuccessResponse {
    success:boolean
}

//#region error handling
//Temporary model for handling wrong design on backend
export interface ErrorResponse {
    message:string;
}

export function isErrorResponse(error: unknown): error is ErrorResponse {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as Record<string, unknown>).message === 'string'
    );
}
//#endregion