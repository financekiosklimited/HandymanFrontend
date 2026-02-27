System.register(["app/features/guest/home/screen"], function (exports_1, context_1) {
    'use client';
    "use strict";
    var screen_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (screen_1_1) {
                screen_1 = screen_1_1;
            }
        ],
        execute: function () {
            exports_1("default", screen_1.GuestHomeScreen);
        }
    };
});
