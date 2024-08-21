//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
var Lazy = /** @class */ (function () {
    function Lazy(factory) {
        this._factory = factory;
    }
    Object.defineProperty(Lazy.prototype, "value", {
        get: function () {
            var _a;
            if (this._value === undefined) {
                this._value = (_a = this._factory) === null || _a === void 0 ? void 0 : _a.call(this);
                this._factory = undefined;
            }
            return this._value; // eslint-disable-line @typescript-eslint/no-non-null-assertion
        },
        set: function (value) {
            this._value = value;
            this._factory = undefined;
        },
        enumerable: false,
        configurable: true
    });
    return Lazy;
}());
export { Lazy };
