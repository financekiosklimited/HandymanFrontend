System.register(["@tamagui/font-inter"], function (exports_1, context_1) {
    "use strict";
    var font_inter_1, headingFont, bodyFont;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (font_inter_1_1) {
                font_inter_1 = font_inter_1_1;
            }
        ],
        execute: function () {
            exports_1("headingFont", headingFont = font_inter_1.createInterFont({
                size: {
                    6: 15,
                },
                transform: {
                    6: 'uppercase',
                    7: 'none',
                },
                weight: {
                    6: '400',
                    7: '700',
                },
                color: {
                    6: '$colorFocus',
                    7: '$color',
                },
                letterSpacing: {
                    5: 2,
                    6: 1,
                    7: 0,
                    8: -1,
                    9: -2,
                    10: -3,
                    12: -4,
                    14: -5,
                    15: -6,
                },
                face: {
                    700: { normal: 'InterBold' },
                },
            }));
            exports_1("bodyFont", bodyFont = font_inter_1.createInterFont({
                face: {
                    700: { normal: 'InterBold' },
                },
            }, {
                sizeSize: (size) => Math.round(size * 1.1),
                sizeLineHeight: (size) => Math.round(size * 1.1 + (size > 20 ? 10 : 10)),
            }));
        }
    };
});
