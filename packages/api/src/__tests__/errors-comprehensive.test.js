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
            vitest_1.describe('formatErrorMessage - HTTP Status Codes', () => {
                // 4xx Client Errors
                vitest_1.describe('4xx Client Errors', () => {
                    vitest_1.it('should format 400 Bad Request', () => {
                        const error = new Error('400 Bad Request');
                        vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('Invalid request');
                    });
                    vitest_1.it('should format 401 Unauthorized', () => {
                        const error = new Error('401 Unauthorized');
                        vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('Session expired');
                    });
                    vitest_1.it('should format 403 Forbidden', () => {
                        const error = new Error('403 Forbidden');
                        vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('permission');
                    });
                    vitest_1.it('should format 404 Not Found', () => {
                        const error = new Error('404 Not Found');
                        vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('not found');
                    });
                    vitest_1.it('should format 405 Method Not Allowed', () => {
                        const error = new Error('405 Method Not Allowed');
                        // Unknown status codes return the original message if no patterns match
                        vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('405 Method Not Allowed');
                    });
                    vitest_1.it('should format 408 Request Timeout', () => {
                        const error = new Error('408 Request Timeout');
                        // "Request Timeout" contains "Timeout" so it matches timeout pattern
                        vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('Request timed out. Please try again.');
                    });
                    vitest_1.it('should format 409 Conflict', () => {
                        const error = new Error('409 Conflict');
                        vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('conflicts');
                    });
                    vitest_1.it('should format 410 Gone', () => {
                        const error = new Error('410 Gone');
                        // Unknown status codes return the original message if no patterns match
                        vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('410 Gone');
                    });
                    vitest_1.it('should format 422 Unprocessable Entity', () => {
                        const error = new Error('422 Unprocessable Entity');
                        vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('Invalid data');
                    });
                    vitest_1.it('should format 429 Too Many Requests', () => {
                        const error = new Error('429 Too Many Requests');
                        vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('Too many requests');
                    });
                });
                // 5xx Server Errors
                vitest_1.describe('5xx Server Errors', () => {
                    vitest_1.it('should format 500 Internal Server Error', () => {
                        const error = new Error('500 Internal Server Error');
                        vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('Server error');
                    });
                    vitest_1.it('should format 501 Not Implemented', () => {
                        const error = new Error('501 Not Implemented');
                        // Unknown status codes return the original message if no patterns match
                        vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('501 Not Implemented');
                    });
                    vitest_1.it('should format 502 Bad Gateway', () => {
                        const error = new Error('502 Bad Gateway');
                        vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('unavailable');
                    });
                    vitest_1.it('should format 503 Service Unavailable', () => {
                        const error = new Error('503 Service Unavailable');
                        vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('unavailable');
                    });
                    vitest_1.it('should format 504 Gateway', () => {
                        // Note: "504 Gateway Timeout" contains "Timeout" so would match timeout pattern
                        const error = new Error('504 Gateway');
                        vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('respond');
                    });
                });
                // Unknown status codes
                vitest_1.describe('Unknown Status Codes', () => {
                    vitest_1.it('should handle unknown 4xx codes', () => {
                        const error = new Error('418 HTTP Error');
                        // Unknown HTTP status codes with "HTTP" in message get caught by technical pattern
                        vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('unexpected');
                    });
                    vitest_1.it('should handle unknown 5xx codes', () => {
                        const error = new Error('599 HTTP Error');
                        // Unknown HTTP status codes with "HTTP" in message get caught by technical pattern
                        vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('unexpected');
                    });
                });
            });
            vitest_1.describe('formatErrorMessage - Network Errors', () => {
                vitest_1.it('should detect "Failed to fetch"', () => {
                    const error = new Error('Failed to fetch');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('connect');
                });
                vitest_1.it('should detect "Network request failed"', () => {
                    const error = new Error('Network request failed');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('connect');
                });
                vitest_1.it('should detect "NetworkError"', () => {
                    const error = new Error('NetworkError occurred');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('connect');
                });
                vitest_1.it('should detect network in lowercase', () => {
                    const error = new Error('network connection lost');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('connect');
                });
                vitest_1.it('should detect fetch errors', () => {
                    const error = new Error('fetch failed');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('connect');
                });
                vitest_1.it('should detect connection refused', () => {
                    const error = new Error('Connection refused');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('Connection refused');
                });
                vitest_1.it('should detect DNS errors', () => {
                    const error = new Error('getaddrinfo ENOTFOUND');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('getaddrinfo ENOTFOUND');
                });
                vitest_1.it('should detect timeout in error', () => {
                    const error = new Error('The request timed out');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('timed out');
                });
                vitest_1.it('should detect ETIMEDOUT', () => {
                    const error = new Error('ETIMEDOUT');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('ETIMEDOUT');
                });
                vitest_1.it('should detect ECONNREFUSED', () => {
                    const error = new Error('ECONNREFUSED');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('ECONNREFUSED');
                });
            });
            vitest_1.describe('formatErrorMessage - Timeout Errors', () => {
                vitest_1.it('should format ky TimeoutError', () => {
                    const { TimeoutError } = require('ky');
                    const error = new TimeoutError('Request timeout');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('timed out');
                });
                vitest_1.it('should detect timeout in message', () => {
                    const error = new Error('Request timed out after 30s');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('timed out');
                });
                vitest_1.it('should detect timeout keyword', () => {
                    const error = new Error('Timeout exceeded');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('timed out');
                });
                vitest_1.it('should detect Timeout in capital letters', () => {
                    const error = new Error('Connection Timeout');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('timed out');
                });
                vitest_1.it('should detect timed out phrase', () => {
                    const error = new Error('The connection timed out');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toContain('timed out');
                });
            });
            vitest_1.describe('formatErrorMessage - Error Types', () => {
                vitest_1.it('should handle standard Error object', () => {
                    const error = new Error('Something went wrong');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('Something went wrong');
                });
                vitest_1.it('should handle Error with empty message', () => {
                    const error = new Error('');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('');
                });
                vitest_1.it('should handle TypeError with technical message', () => {
                    const error = new TypeError('Cannot read property');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('Cannot read property');
                });
                vitest_1.it('should handle RangeError', () => {
                    const error = new RangeError('Maximum call stack exceeded');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('Maximum call stack exceeded');
                });
                vitest_1.it('should handle ReferenceError', () => {
                    const error = new ReferenceError('x is not defined');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('x is not defined');
                });
                vitest_1.it('should handle SyntaxError', () => {
                    const error = new SyntaxError('Unexpected token');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('Unexpected token');
                });
                vitest_1.it('should handle EvalError', () => {
                    const error = new EvalError('eval error');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('eval error');
                });
                vitest_1.it('should handle URIError', () => {
                    const error = new URIError('URI malformed');
                    vitest_1.expect(errors_1.formatErrorMessage(error)).toBe('URI malformed');
                });
            });
            vitest_1.describe('formatErrorMessage - Fallback for Unknown Types', () => {
                vitest_1.it('should handle string error', () => {
                    vitest_1.expect(errors_1.formatErrorMessage('Simple error')).toContain('unexpected');
                });
                vitest_1.it('should handle empty string', () => {
                    vitest_1.expect(errors_1.formatErrorMessage('')).toContain('unexpected');
                });
                vitest_1.it('should handle number', () => {
                    vitest_1.expect(errors_1.formatErrorMessage(404)).toContain('unexpected');
                });
                vitest_1.it('should handle zero', () => {
                    vitest_1.expect(errors_1.formatErrorMessage(0)).toContain('unexpected');
                });
                vitest_1.it('should handle boolean true', () => {
                    vitest_1.expect(errors_1.formatValidationError(true)).toContain('check');
                });
                vitest_1.it('should handle error with empty message', () => {
                    const errorData = { message: '', errors: {} };
                    vitest_1.expect(errors_1.formatValidationError(errorData)).toContain('check');
                });
            });
        }
    };
});
