System.register([], function (exports_1, context_1) {
    "use strict";
    var jobStatusColors, applicationStatusColors, getJobStatusColor, getApplicationStatusColor, directOfferStatusColors, getDirectOfferStatusColor, timeUrgencyColors, getTimeUrgencyColor;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            exports_1("jobStatusColors", jobStatusColors = {
                draft: { bg: '$backgroundMuted', text: '$colorMuted' },
                open: { bg: '$successBackground', text: '$success' },
                assigned: { bg: '$infoBackground', text: '$info' },
                in_progress: { bg: '$warningBackground', text: '$warning' },
                pending_completion: { bg: '$warningBackground', text: '$warning' },
                completed: { bg: '$successBackground', text: '$success' },
                cancelled: { bg: '$errorBackground', text: '$error' },
            });
            exports_1("applicationStatusColors", applicationStatusColors = {
                pending: {
                    bg: '$warningBackground',
                    text: '$warning',
                    label: 'Pending Review',
                },
                approved: {
                    bg: '$successBackground',
                    text: '$success',
                    label: 'Approved',
                },
                rejected: {
                    bg: '$errorBackground',
                    text: '$error',
                    label: 'Rejected',
                },
                withdrawn: {
                    bg: '$backgroundMuted',
                    text: '$colorMuted',
                    label: 'Withdrawn',
                },
            });
            // Helper function to get job status color
            exports_1("getJobStatusColor", getJobStatusColor = (status) => {
                return jobStatusColors[status] || jobStatusColors.draft;
            });
            // Helper function to get application status color
            exports_1("getApplicationStatusColor", getApplicationStatusColor = (status) => {
                return applicationStatusColors[status] || applicationStatusColors.pending;
            });
            exports_1("directOfferStatusColors", directOfferStatusColors = {
                pending: {
                    bg: '$warningBackground',
                    text: '$warning',
                    label: 'Pending',
                },
                accepted: {
                    bg: '$successBackground',
                    text: '$success',
                    label: 'Accepted',
                },
                rejected: {
                    bg: '$errorBackground',
                    text: '$error',
                    label: 'Rejected',
                },
                expired: {
                    bg: '$backgroundMuted',
                    text: '$colorMuted',
                    label: 'Expired',
                },
                cancelled: {
                    bg: '$backgroundMuted',
                    text: '$colorMuted',
                    label: 'Cancelled',
                },
                converted: {
                    bg: '$infoBackground',
                    text: '$info',
                    label: 'Converted to Job',
                },
            });
            // Helper function to get direct offer status color
            exports_1("getDirectOfferStatusColor", getDirectOfferStatusColor = (status) => {
                return directOfferStatusColors[status] || directOfferStatusColors.pending;
            });
            exports_1("timeUrgencyColors", timeUrgencyColors = {
                expired: {
                    bg: '$backgroundMuted',
                    text: '$colorMuted',
                },
                urgent: {
                    bg: '$errorBackground',
                    text: '$error',
                },
                warning: {
                    bg: '$warningBackground',
                    text: '$warning',
                },
                normal: {
                    bg: '$successBackground',
                    text: '$success',
                },
            });
            // Helper function to get time urgency color
            exports_1("getTimeUrgencyColor", getTimeUrgencyColor = (urgency) => {
                return timeUrgencyColors[urgency] || timeUrgencyColors.normal;
            });
        }
    };
});
