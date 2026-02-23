System.register(["vitest", "../errors"], function (exports_1, context_1) {
    "use strict";
    var vitest_1, errors_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (vitest_1_1) {
                vitest_1 = vitest_1_1;
            },
            function (errors_1_1) {
                errors_1 = errors_1_1;
            }
        ],
        execute: function () {
            vitest_1.describe('formatErrorMessage', () => {
                vitest_1.it('should format TimeoutError', () => {
                    const { TimeoutError } = require('ky');
                    const error = new TimeoutError('Request timed out');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('Request timed out. Please try again.');
                });
                vitest_1.it('should format HTTP status 401 from message', () => {
                    const error = new Error('401 Unauthorized');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('Session expired. Please log in again.');
                });
                vitest_1.it('should format HTTP status 403 from message', () => {
                    const error = new Error('403 Forbidden');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe("You don't have permission to perform this action.");
                });
                vitest_1.it('should format HTTP status 404 from message', () => {
                    const error = new Error('404 Not Found');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('The requested resource was not found.');
                });
                vitest_1.it('should format HTTP status 429 from message', () => {
                    const error = new Error('429 Too Many Requests');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('Too many requests. Please wait a moment and try again.');
                });
                vitest_1.it('should format HTTP status 500 from message', () => {
                    const error = new Error('500 Internal Server Error');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('Server error. Please try again later.');
                });
                vitest_1.it('should format HTTP status 502 from message', () => {
                    const error = new Error('502 Bad Gateway');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('Server is temporarily unavailable. Please try again later.');
                });
                vitest_1.it('should format HTTP status 503 from message', () => {
                    const error = new Error('503 Service Unavailable');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('Service unavailable. Please try again later.');
                });
                vitest_1.it('should format HTTP status 504 from message', () => {
                    // Note: "504 Gateway Timeout" contains "Timeout" so it would match timeout pattern first
                    // Using just "504 Gateway" to test the status code matching
                    const error = new Error('504 Gateway');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('Server took too long to respond. Please try again.');
                });
                vitest_1.it('should detect network error from message', () => {
                    const error = new Error('Network error: failed to fetch');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('Unable to connect. Please check your internet connection.');
                });
                vitest_1.it('should detect timeout from message', () => {
                    const error = new Error('Request timeout');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('Request timed out. Please try again.');
                });
                vitest_1.it('should format Error object', () => {
                    const error = new Error('Something went wrong');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('Something went wrong');
                });
                vitest_1.it('should handle null', () => {
                    vitest_1.expect(errors_1.formatErrorMessage(null)).toBe('An unexpected error occurred. Please try again.');
                });
                vitest_1.it('should handle undefined', () => {
                    vitest_1.expect(errors_1.formatErrorMessage(undefined)).toBe('An unexpected error occurred. Please try again.');
                });
                vitest_1.it('should strip URLs from error messages', () => {
                    const error = new Error('Error at https://api.example.com/v1/users');
                    const result = errors_1.formatErrorMessage(error);
                    vitest_1.expect(result).not.toContain('https://');
                });
                vitest_1.it('should handle unknown error types', () => {
                    const error = { foo: 'bar' };
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('An unexpected error occurred. Please try again.');
                });
            });
            vitest_1.describe('formatValidationError', () => {
                vitest_1.it('should extract single field error', () => {
                    const errorData = {
                        errors: {
                            email: ['Email is required'],
                        },
                    };
                    vitest_1.expect(errors_1.formatValidationError(errorData)).toContain('Email');
                    vitest_1.expect(errors_1.formatValidationError(errorData)).toContain('required');
                });
                vitest_1.it('should map snake_case to readable format', () => {
                    const errorData = {
                        errors: {
                            first_name: ['First name is required'],
                        },
                    };
                    vitest_1.expect(errors_1.formatValidationError(errorData)).toContain('First name');
                });
                vitest_1.it('should use message if no errors object', () => {
                    const errorData = {
                        message: 'Something went wrong',
                    };
                    vitest_1.expect(errors_1.formatValidationError(errorData)).toBe('Something went wrong');
                });
                vitest_1.it('should return generic message if no message or errors', () => {
                    const errorData = {};
                    vitest_1.expect(errors_1.formatValidationError(errorData)).toContain('check your input');
                });
                vitest_1.it('should handle empty errors object', () => {
                    const errorData = {
                        errors: {},
                    };
                    vitest_1.expect(errors_1.formatValidationError(errorData)).toContain('check your input');
                });
            });
        }
    };
});
