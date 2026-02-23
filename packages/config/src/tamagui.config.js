System.register(["@tamagui/config/v4", "tamagui", "./fonts", "./animations", "./tokens"], function (exports_1, context_1) {
    "use strict";
    var v4_1, tamagui_1, fonts_1, animations_1, tokens_1, lightTheme, darkTheme, config;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (v4_1_1) {
                v4_1 = v4_1_1;
            },
            function (tamagui_1_1) {
                tamagui_1 = tamagui_1_1;
            },
            function (fonts_1_1) {
                fonts_1 = fonts_1_1;
            },
            function (animations_1_1) {
                animations_1 = animations_1_1;
            },
            function (tokens_1_1) {
                tokens_1 = tokens_1_1;
            }
        ],
        execute: function () {
            // Light theme definition
            lightTheme = {
                // === STANDARD TAMAGUI KEYS ===
                // Background variants
                background: tokens_1.colors.background,
                backgroundHover: tokens_1.colors.backgroundSubtle,
                backgroundPress: tokens_1.colors.backgroundSubtle,
                backgroundFocus: tokens_1.colors.backgroundSubtle,
                backgroundStrong: tokens_1.colors.backgroundStrong,
                backgroundMuted: tokens_1.colors.backgroundMuted,
                backgroundTransparent: 'rgba(255,255,255,0.7)',
                // Text variants
                color: tokens_1.colors.text,
                colorHover: tokens_1.colors.text,
                colorPress: tokens_1.colors.textSubtle,
                colorFocus: tokens_1.colors.textSubtle,
                colorMuted: tokens_1.colors.textMuted,
                colorSubtle: tokens_1.colors.textSubtle,
                colorTransparent: 'rgba(0,0,0,0.5)',
                // Border variants
                borderColor: tokens_1.colors.border,
                borderColorHover: tokens_1.colors.borderSubtle,
                borderColorFocus: tokens_1.colors.primary,
                borderColorPress: tokens_1.colors.borderSubtle,
                // Other standard
                placeholderColor: tokens_1.colors.textMuted,
                shadowColor: 'rgba(0,0,0,0.1)',
                outlineColor: tokens_1.colors.primary,
                // === SEMANTIC CUSTOM KEYS ===
                primary: tokens_1.colors.primary,
                primaryBackground: 'rgba(12,154,92,0.1)',
                success: tokens_1.colors.success,
                successBackground: '#D1FAE5',
                warning: tokens_1.colors.warning,
                warningBackground: '#FEF3C7',
                error: tokens_1.colors.error,
                errorBackground: '#FEE2E2',
                info: tokens_1.colors.info,
                infoBackground: '#DBEAFE',
                accent: tokens_1.colors.accent,
                accentBackground: 'rgba(255,184,0,0.1)',
            };
            // Dark theme definition
            darkTheme = {
                // === STANDARD TAMAGUI KEYS ===
                background: '#1A1A1A',
                backgroundHover: '#2A2A2A',
                backgroundPress: '#333333',
                backgroundFocus: '#333333',
                backgroundStrong: '#0A0A0A',
                backgroundMuted: '#242424',
                backgroundTransparent: 'rgba(0,0,0,0.7)',
                color: '#FFFFFF',
                colorHover: '#F0F0F0',
                colorPress: '#E0E0E0',
                colorFocus: '#E0E0E0',
                colorMuted: '#8E8E93',
                colorSubtle: '#A0A0A0',
                colorTransparent: 'rgba(255,255,255,0.5)',
                borderColor: '#3A3A3A',
                borderColorHover: '#4A4A4A',
                borderColorFocus: tokens_1.colors.primary,
                borderColorPress: '#4A4A4A',
                placeholderColor: '#6E6E73',
                shadowColor: 'rgba(0,0,0,0.3)',
                outlineColor: tokens_1.colors.primary,
                // === SEMANTIC CUSTOM KEYS ===
                primary: tokens_1.colors.primary,
                primaryBackground: 'rgba(12,154,92,0.15)',
                success: tokens_1.colors.success,
                successBackground: 'rgba(52,199,89,0.15)',
                warning: tokens_1.colors.warning,
                warningBackground: 'rgba(255,149,0,0.15)',
                error: tokens_1.colors.error,
                errorBackground: 'rgba(255,59,48,0.15)',
                info: tokens_1.colors.info,
                infoBackground: 'rgba(0,122,255,0.15)',
                accent: tokens_1.colors.accent,
                accentBackground: 'rgba(255,184,0,0.15)',
            };
            exports_1("config", config = tamagui_1.createTamagui({
                ...v4_1.defaultConfig,
                animations: animations_1.animations,
                fonts: {
                    body: fonts_1.bodyFont,
                    heading: fonts_1.headingFont,
                },
                tokens: {
                    ...v4_1.defaultConfig.tokens,
                    // Override spacing
                    space: {
                        ...v4_1.defaultConfig.tokens.space,
                        xs: tokens_1.spacing.xs,
                        sm: tokens_1.spacing.sm,
                        md: tokens_1.spacing.md,
                        lg: tokens_1.spacing.lg,
                        xl: tokens_1.spacing.xl,
                        '2xl': tokens_1.spacing['2xl'],
                        '3xl': tokens_1.spacing['3xl'],
                        '4xl': tokens_1.spacing['4xl'],
                    },
                    // Override radius
                    radius: {
                        ...v4_1.defaultConfig.tokens.radius,
                        sm: tokens_1.borderRadius.sm,
                        md: tokens_1.borderRadius.md,
                        lg: tokens_1.borderRadius.lg,
                        xl: tokens_1.borderRadius.xl,
                        '2xl': tokens_1.borderRadius['2xl'],
                        full: tokens_1.borderRadius.full,
                    },
                    // Add custom colors to tokens
                    color: {
                        ...v4_1.defaultConfig.tokens.color,
                        ...tokens_1.colors,
                        // Add background-specific colors that are used as tokens
                        primaryBackground: 'rgba(12,154,92,0.1)',
                        successBackground: '#D1FAE5',
                        warningBackground: '#FEF3C7',
                        errorBackground: '#FEE2E2',
                        infoBackground: '#DBEAFE',
                    },
                },
                themes: {
                    ...v4_1.defaultConfig.themes,
                    light: {
                        ...v4_1.defaultConfig.themes.light,
                        ...lightTheme,
                    },
                    dark: {
                        ...v4_1.defaultConfig.themes.dark,
                        ...darkTheme,
                    },
                },
                settings: {
                    ...v4_1.defaultConfig.settings,
                    onlyAllowShorthands: false,
                    allowedStyleValues: 'somewhat-strict-web',
                },
            }));
        }
    };
});
