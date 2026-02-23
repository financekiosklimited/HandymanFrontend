// Direct Job Offer types
System.register([], function (exports_1, context_1) {
    "use strict";
    var QUICK_REJECTION_REASONS, OFFER_EXPIRY_OPTIONS, DEFAULT_OFFER_EXPIRY_DAYS;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {// Direct Job Offer types
            // ========== Quick Rejection Reasons ==========
            exports_1("QUICK_REJECTION_REASONS", QUICK_REJECTION_REASONS = [
                { id: 'busy', label: 'Too busy', value: "I'm fully booked at the moment." },
                { id: 'far', label: 'Too far away', value: 'The location is too far from my service area.' },
                {
                    id: 'budget',
                    label: 'Low budget',
                    value: 'The budget is below my minimum rate for this type of work.',
                },
                { id: 'skill', label: 'Not my skill', value: 'This job requires skills outside my expertise.' },
            ]);
            // ========== Offer Expiry Options ==========
            exports_1("OFFER_EXPIRY_OPTIONS", OFFER_EXPIRY_OPTIONS = [
                { value: 1, label: '1 day' },
                { value: 3, label: '3 days' },
                { value: 7, label: '7 days' },
                { value: 14, label: '14 days' },
                { value: 30, label: '30 days' },
            ]);
            exports_1("DEFAULT_OFFER_EXPIRY_DAYS", DEFAULT_OFFER_EXPIRY_DAYS = 7);
        }
    };
});
