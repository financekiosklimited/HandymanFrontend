System.register(["vitest", "../time"], function (exports_1, context_1) {
    "use strict";
    var vitest_1, time_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (vitest_1_1) {
                vitest_1 = vitest_1_1;
            },
            function (time_1_1) {
                time_1 = time_1_1;
            }
        ],
        execute: function () {
            vitest_1.describe('getTimeRemaining - Edge Cases', () => {
                vitest_1.it('should handle exact millisecond boundary', () => {
                    const future = new Date(Date.now() + 1);
                    const result = time_1.getTimeRemaining(future);
                    vitest_1.expect(result.isExpired).toBe(false);
                    vitest_1.expect(result.totalMinutes).toBe(0);
                });
                vitest_1.it('should handle negative time (past dates)', () => {
                    const past = new Date(Date.now() - 1000);
                    const result = time_1.getTimeRemaining(past);
                    vitest_1.expect(result.isExpired).toBe(true);
                    vitest_1.expect(result.days).toBe(0);
                    vitest_1.expect(result.hours).toBe(0);
                    vitest_1.expect(result.minutes).toBe(0);
                });
                vitest_1.it('should handle exactly 24 hours', () => {
                    const future = new Date(Date.now() + 86400000);
                    const result = time_1.getTimeRemaining(future);
                    vitest_1.expect(result.days).toBe(1);
                    vitest_1.expect(result.hours).toBe(0);
                    vitest_1.expect(result.isExpired).toBe(false);
                });
                vitest_1.it('should handle just under 24 hours', () => {
                    const future = new Date(Date.now() + 86399000);
                    const result = time_1.getTimeRemaining(future);
                    vitest_1.expect(result.days).toBe(0);
                    vitest_1.expect(result.hours).toBe(23);
                });
                vitest_1.it('should handle just over 24 hours', () => {
                    const future = new Date(Date.now() + 86401000);
                    const result = time_1.getTimeRemaining(future);
                    vitest_1.expect(result.days).toBe(1);
                });
                vitest_1.it('should handle far future dates', () => {
                    const farFuture = new Date(Date.now() + 31536000000); // 1 year
                    const result = time_1.getTimeRemaining(farFuture);
                    // Due to timing, might be exactly 365 days
                    vitest_1.expect(result.days).toBeGreaterThanOrEqual(365);
                    vitest_1.expect(result.isExpired).toBe(false);
                });
                vitest_1.it('should handle very recent dates', () => {
                    const recent = new Date(Date.now() + 1000); // 1 second
                    const result = time_1.getTimeRemaining(recent);
                    vitest_1.expect(result.isExpired).toBe(false);
                    vitest_1.expect(result.minutes).toBe(0);
                });
                vitest_1.it('should handle zero input (same time)', () => {
                    const now = new Date();
                    const result = time_1.getTimeRemaining(now);
                    vitest_1.expect(result.isExpired).toBe(true);
                    vitest_1.expect(result.totalMinutes).toBe(0);
                });
                vitest_1.it('should handle Date object input', () => {
                    const future = new Date(Date.now() + 3600000);
                    const result = time_1.getTimeRemaining(future);
                    vitest_1.expect(result.hours).toBe(1);
                });
                vitest_1.it('should handle string date input (ISO)', () => {
                    const future = new Date(Date.now() + 7200000).toISOString();
                    const result = time_1.getTimeRemaining(future);
                    // Due to timing, might be slightly less than 2 hours
                    vitest_1.expect(result.hours).toBeGreaterThanOrEqual(1);
                    vitest_1.expect(result.hours).toBeLessThanOrEqual(2);
                });
                vitest_1.it('should calculate totalMinutes correctly', () => {
                    const future = new Date(Date.now() + 90060000); // 1 day + 1 hour + 1 minute
                    const result = time_1.getTimeRemaining(future);
                    vitest_1.expect(result.totalMinutes).toBe(1501); // 1440 + 60 + 1
                });
            });
            vitest_1.describe('formatTimeRemaining - Edge Cases', () => {
                vitest_1.it('should format zero time', () => {
                    const now = new Date();
                    const result = time_1.formatTimeRemaining(now);
                    vitest_1.expect(result).toBe('Expired');
                });
                vitest_1.it('should format less than a minute', () => {
                    const future = new Date(Date.now() + 30000);
                    const result = time_1.formatTimeRemaining(future);
                    vitest_1.expect(result).toMatch(/\d+m/);
                });
                vitest_1.it('should format exactly 1 hour', () => {
                    const future = new Date(Date.now() + 3600000);
                    const result = time_1.formatTimeRemaining(future);
                    vitest_1.expect(result).toMatch(/1h/);
                });
                vitest_1.it('should format exactly 1 day', () => {
                    const future = new Date(Date.now() + 86400000);
                    const result = time_1.formatTimeRemaining(future);
                    vitest_1.expect(result).toMatch(/1d/);
                });
                vitest_1.it('should format days and hours', () => {
                    const future = new Date(Date.now() + 90000000); // 1d 1h
                    const result = time_1.formatTimeRemaining(future);
                    vitest_1.expect(result).toMatch(/1d/);
                    vitest_1.expect(result).toMatch(/1h/);
                });
                vitest_1.it('should format hours and minutes', () => {
                    const future = new Date(Date.now() + 3660000); // 1h 1m
                    const result = time_1.formatTimeRemaining(future);
                    vitest_1.expect(result).toMatch(/1h/);
                    vitest_1.expect(result).toMatch(/\d+m/);
                });
                vitest_1.it('should handle past dates', () => {
                    const past = new Date(Date.now() - 1000);
                    const result = time_1.formatTimeRemaining(past);
                    vitest_1.expect(result).toBe('Expired');
                });
            });
            vitest_1.describe('getTimeUrgency - Boundary Testing', () => {
                vitest_1.it('should return expired for past dates', () => {
                    const past = new Date(Date.now() - 1);
                    vitest_1.expect(time_1.getTimeUrgency(past)).toBe('expired');
                });
                vitest_1.it('should return urgent for 1 minute', () => {
                    const urgent = new Date(Date.now() + 60000);
                    vitest_1.expect(time_1.getTimeUrgency(urgent)).toBe('urgent');
                });
                vitest_1.it('should return urgent for 1 hour 59 minutes', () => {
                    const urgent = new Date(Date.now() + 7140000);
                    vitest_1.expect(time_1.getTimeUrgency(urgent)).toBe('urgent');
                });
                vitest_1.it('should return warning at exactly 2 hours boundary', () => {
                    // Implementation uses < 120 minutes for urgent, so exactly 120 is warning
                    const warning = new Date(Date.now() + 7200000);
                    vitest_1.expect(time_1.getTimeUrgency(warning)).toBe('warning');
                });
                vitest_1.it('should return warning for just over 2 hours', () => {
                    const warning = new Date(Date.now() + 7200001);
                    vitest_1.expect(time_1.getTimeUrgency(warning)).toBe('warning');
                });
                vitest_1.it('should return warning for 12 hours', () => {
                    const warning = new Date(Date.now() + 43200000);
                    vitest_1.expect(time_1.getTimeUrgency(warning)).toBe('warning');
                });
                vitest_1.it('should return warning for 23 hours 59 minutes', () => {
                    const warning = new Date(Date.now() + 86340000);
                    vitest_1.expect(time_1.getTimeUrgency(warning)).toBe('warning');
                });
                vitest_1.it('should return normal for exactly 24 hours', () => {
                    // Implementation uses < 1440 minutes for warning, so exactly 1440 is normal
                    const normal = new Date(Date.now() + 86400000);
                    vitest_1.expect(time_1.getTimeUrgency(normal)).toBe('normal');
                });
                vitest_1.it('should return normal for over 24 hours', () => {
                    const normal = new Date(Date.now() + 90000000);
                    vitest_1.expect(time_1.getTimeUrgency(normal)).toBe('normal');
                });
                vitest_1.it('should return normal for weeks ahead', () => {
                    const normal = new Date(Date.now() + 604800000);
                    vitest_1.expect(time_1.getTimeUrgency(normal)).toBe('normal');
                });
            });
            vitest_1.describe('formatOfferDate - Time Formatting', () => {
                vitest_1.it('should return Just now for 0 seconds', () => {
                    const now = new Date();
                    vitest_1.expect(time_1.formatOfferDate(now)).toBe('Just now');
                });
                vitest_1.it('should return Just now for 30 seconds', () => {
                    const recent = new Date(Date.now() - 30000);
                    vitest_1.expect(time_1.formatOfferDate(recent)).toBe('Just now');
                });
                vitest_1.it('should return Just now for 59 seconds', () => {
                    const recent = new Date(Date.now() - 59000);
                    vitest_1.expect(time_1.formatOfferDate(recent)).toBe('Just now');
                });
                vitest_1.it('should return minutes for 1 minute ago', () => {
                    const ago = new Date(Date.now() - 60000);
                    vitest_1.expect(time_1.formatOfferDate(ago)).toMatch(/1m/);
                });
                vitest_1.it('should return minutes for 59 minutes ago', () => {
                    const ago = new Date(Date.now() - 3540000);
                    vitest_1.expect(time_1.formatOfferDate(ago)).toMatch(/59m/);
                });
                vitest_1.it('should return hours for 1 hour ago', () => {
                    const ago = new Date(Date.now() - 3600000);
                    vitest_1.expect(time_1.formatOfferDate(ago)).toMatch(/1h/);
                });
                vitest_1.it('should return hours for 23 hours ago', () => {
                    const ago = new Date(Date.now() - 82800000);
                    vitest_1.expect(time_1.formatOfferDate(ago)).toMatch(/23h/);
                });
                vitest_1.it('should return Yesterday for 24 hours ago', () => {
                    const yesterday = new Date(Date.now() - 86400000);
                    vitest_1.expect(time_1.formatOfferDate(yesterday)).toBe('Yesterday');
                });
                vitest_1.it('should return Yesterday for 47 hours ago', () => {
                    const yesterday = new Date(Date.now() - 169200000);
                    vitest_1.expect(time_1.formatOfferDate(yesterday)).toBe('Yesterday');
                });
                vitest_1.it('should return date for 2 days ago', () => {
                    const ago = new Date(Date.now() - 172800000);
                    const result = time_1.formatOfferDate(ago);
                    vitest_1.expect(result).not.toBe('Just now');
                    vitest_1.expect(result).not.toBe('Yesterday');
                    vitest_1.expect(result.length).toBeGreaterThan(0);
                });
                vitest_1.it('should return date for 1 week ago', () => {
                    const ago = new Date(Date.now() - 604800000);
                    const result = time_1.formatOfferDate(ago);
                    vitest_1.expect(result.length).toBeGreaterThan(0);
                });
                vitest_1.it('should include year for dates from different year', () => {
                    const lastYear = new Date();
                    lastYear.setFullYear(lastYear.getFullYear() - 1);
                    const result = time_1.formatOfferDate(lastYear);
                    // Should contain a 4-digit year
                    vitest_1.expect(result).toMatch(/\d{4}/);
                });
            });
            vitest_1.describe('formatPreferredStartDate - Date Formatting', () => {
                vitest_1.it('should return Today for now', () => {
                    const today = new Date();
                    vitest_1.expect(time_1.formatPreferredStartDate(today)).toBe('Today');
                });
                vitest_1.it('should return Today for end of today', () => {
                    const endOfToday = new Date();
                    endOfToday.setHours(23, 59, 59, 999);
                    vitest_1.expect(time_1.formatPreferredStartDate(endOfToday)).toBe('Today');
                });
                vitest_1.it('should return Tomorrow for tomorrow', () => {
                    const tomorrow = new Date(Date.now() + 86400000);
                    vitest_1.expect(time_1.formatPreferredStartDate(tomorrow)).toBe('Tomorrow');
                });
                vitest_1.it('should return Tomorrow for just over 24 hours', () => {
                    const tomorrow = new Date(Date.now() + 90000000);
                    vitest_1.expect(time_1.formatPreferredStartDate(tomorrow)).toBe('Tomorrow');
                });
                vitest_1.it('should return weekday for this week', () => {
                    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const future = new Date(Date.now() + 172800000); // 2 days
                    const result = time_1.formatPreferredStartDate(future);
                    vitest_1.expect(dayNames).toContain(result);
                });
                vitest_1.it('should return formatted date for next week', () => {
                    const nextWeek = new Date(Date.now() + 604800000);
                    const result = time_1.formatPreferredStartDate(nextWeek);
                    vitest_1.expect(result).not.toBe('Today');
                    vitest_1.expect(result).not.toBe('Tomorrow');
                    vitest_1.expect(result.length).toBeGreaterThan(5);
                });
                vitest_1.it('should return formatted date for next month', () => {
                    const nextMonth = new Date(Date.now() + 2592000000);
                    const result = time_1.formatPreferredStartDate(nextMonth);
                    vitest_1.expect(result.length).toBeGreaterThan(5);
                });
                vitest_1.it('should return formatted date for next year', () => {
                    const nextYear = new Date(Date.now() + 31536000000);
                    const result = time_1.formatPreferredStartDate(nextYear);
                    vitest_1.expect(result.length).toBeGreaterThan(5);
                    vitest_1.expect(result).toMatch(/\d{4}/); // Should contain year
                });
            });
            vitest_1.describe('Time Utilities - Invalid Input Handling', () => {
                vitest_1.it('should handle invalid date strings by producing NaN dates', () => {
                    const invalid = 'not-a-date';
                    const result = time_1.getTimeRemaining(invalid);
                    // Invalid dates result in NaN diff, which is NOT <= 0, so isExpired is false
                    // This is the actual implementation behavior
                    vitest_1.expect(result.days).toBeNaN();
                    vitest_1.expect(result.isExpired).toBe(false);
                });
                vitest_1.it('should handle empty string by producing NaN dates', () => {
                    const empty = '';
                    const result = time_1.getTimeRemaining(empty);
                    // Empty string creates invalid date (NaN)
                    vitest_1.expect(result.days).toBeNaN();
                    vitest_1.expect(result.isExpired).toBe(false);
                });
                vitest_1.it('should handle null as epoch start (1970)', () => {
                    // null becomes 0 timestamp (1970), which is in the past
                    const result = time_1.getTimeRemaining(null);
                    vitest_1.expect(result.isExpired).toBe(true);
                });
                vitest_1.it('should handle undefined by producing NaN dates', () => {
                    // undefined creates invalid date
                    const result = time_1.getTimeRemaining(undefined);
                    // NaN diff means isExpired is false (NaN <= 0 is false)
                    vitest_1.expect(result.days).toBeNaN();
                    vitest_1.expect(result.isExpired).toBe(false);
                });
                vitest_1.it('should handle very large future dates', () => {
                    const farFuture = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000); // 100 years
                    const result = time_1.getTimeRemaining(farFuture);
                    vitest_1.expect(result.isExpired).toBe(false);
                    // Use >= to account for timing precision
                    vitest_1.expect(result.days).toBeGreaterThanOrEqual(36500);
                });
            });
            vitest_1.describe('Time Utilities - Consistency', () => {
                vitest_1.it('getTimeRemaining should return consistent structure', () => {
                    const future = new Date(Date.now() + 3600000);
                    const result = time_1.getTimeRemaining(future);
                    vitest_1.expect(result).toHaveProperty('days');
                    vitest_1.expect(result).toHaveProperty('hours');
                    vitest_1.expect(result).toHaveProperty('minutes');
                    vitest_1.expect(result).toHaveProperty('totalMinutes');
                    vitest_1.expect(result).toHaveProperty('isExpired');
                });
                vitest_1.it('formatTimeRemaining should be consistent with getTimeRemaining', () => {
                    const future = new Date(Date.now() + 3600000);
                    const remaining = time_1.getTimeRemaining(future);
                    const formatted = time_1.formatTimeRemaining(future);
                    if (remaining.isExpired) {
                        vitest_1.expect(formatted).toBe('Expired');
                    }
                    else if (remaining.days > 0) {
                        vitest_1.expect(formatted).toContain(`${remaining.days}d`);
                    }
                    else if (remaining.hours > 0) {
                        vitest_1.expect(formatted).toContain(`${remaining.hours}h`);
                    }
                    else {
                        vitest_1.expect(formatted).toContain(`${remaining.minutes}m`);
                    }
                });
                vitest_1.it('getTimeUrgency should be consistent with getTimeRemaining', () => {
                    const testCases = [
                        { time: Date.now() - 1000, expected: 'expired' },
                        { time: Date.now() + 60000, expected: 'urgent' },
                        { time: Date.now() + 43200000, expected: 'warning' },
                        { time: Date.now() + 172800000, expected: 'normal' },
                    ];
                    testCases.forEach(({ time, expected }) => {
                        const date = new Date(time);
                        vitest_1.expect(time_1.getTimeUrgency(date)).toBe(expected);
                    });
                });
            });
        }
    };
});
