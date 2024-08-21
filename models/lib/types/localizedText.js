//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { z } from 'zod';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export var localizedTextConverter = new SchemaConverter({
    schema: z
        .string()
        .or(z.record(z.string(), z.string()))
        .transform(function (content) { return new LocalizedText(content); }),
    encode: function (object) { return object.content; },
});
var LocalizedText = /** @class */ (function () {
    // Constructor
    function LocalizedText(input) {
        this.content = input;
    }
    // Methods
    LocalizedText.prototype.localize = function () {
        var _a;
        var languages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            languages[_i] = arguments[_i];
        }
        if (typeof this.content === 'string')
            return this.content;
        for (var _b = 0, _c = __spreadArray(__spreadArray([], languages, true), ['en-US'], false); _b < _c.length; _b++) {
            var language = _c[_b];
            var exactMatch = this.content[language];
            if (exactMatch)
                return exactMatch;
            var languagePrefix = language.split(/-|_/).at(0);
            if (languagePrefix) {
                var prefixMatch = this.content[languagePrefix];
                if (prefixMatch)
                    return prefixMatch;
            }
        }
        return (_a = Object.values(this.content).at(0)) !== null && _a !== void 0 ? _a : '';
    };
    return LocalizedText;
}());
export { LocalizedText };
