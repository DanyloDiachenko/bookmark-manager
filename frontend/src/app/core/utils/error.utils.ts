import { HttpErrorResponse } from '@angular/common/http';

export interface ValidationProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
  message?: string;
  [key: string]: unknown;
}

export const getErrorMessage = (error: unknown, fallback?: string): string => {
  if (!error) {
    return fallback ?? 'An unexpected error occurred';
  }

  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Unable to connect to the server. Please check your network connection.';
    }

    if (error.error) {
      const errData = error.error;

      if (typeof errData === 'string' && errData.trim().length > 0) {
        return errData.trim();
      }

      if (typeof errData === 'object' && errData !== null) {
        const body = errData as ValidationProblemDetails;

        if (body.errors && typeof body.errors === 'object') {
          const messages: string[] = [];
          for (const key of Object.keys(body.errors)) {
            const fieldErrors = body.errors[key];
            if (Array.isArray(fieldErrors)) {
              for (const msg of fieldErrors) {
                if (typeof msg === 'string' && msg.trim().length > 0) {
                  messages.push(msg.trim());
                }
              }
            }
          }
          if (messages.length > 0) {
            return messages.join('. ');
          }
        }

        if (typeof body.message === 'string' && body.message.trim().length > 0) {
          return body.message.trim();
        }

        if (typeof body.detail === 'string' && body.detail.trim().length > 0) {
          return body.detail.trim();
        }

        if (
          typeof body.title === 'string' &&
          body.title.trim().length > 0 &&
          body.title !== 'One or more validation errors occurred.'
        ) {
          return body.title.trim();
        }
      }
    }

    if (fallback) {
      return fallback;
    }

    switch (error.status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please sign in again.';
      case 403:
        return 'You do not have permission to access this resource.';
      case 404:
        return 'Requested resource was not found.';
      case 409:
        return 'A conflict occurred with the current state of the resource.';
      case 422:
        return 'Validation failed. Please verify your data.';
      case 500:
        return 'Internal server error. Please try again later.';
      default:
        return error.statusText || 'An unexpected server error occurred';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback ?? 'An unexpected error occurred';
};

export const getValidationErrors = (error: unknown): Record<string, string[]> | null => {
  if (error instanceof HttpErrorResponse && error.error && typeof error.error === 'object') {
    const errors = (error.error as ValidationProblemDetails).errors;
    if (errors && typeof errors === 'object') {
      return errors;
    }
  }
  return null;
};
