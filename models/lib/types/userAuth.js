//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { z } from 'zod';
import { Lazy } from '../helpers/lazy.js';
import { optionalish } from '../helpers/optionalish.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export var userAuthConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z
            .object({
            email: optionalish(z.string()),
            displayName: optionalish(z.string()),
            phoneNumber: optionalish(z.string()),
            photoURL: optionalish(z.string()),
        })
            .transform(function (values) { return new UserAuth(values); }),
        encode: function (object) {
            var _a, _b, _c, _d;
            return ({
                email: (_a = object.email) !== null && _a !== void 0 ? _a : null,
                displayName: (_b = object.displayName) !== null && _b !== void 0 ? _b : null,
                phoneNumber: (_c = object.phoneNumber) !== null && _c !== void 0 ? _c : null,
                photoURL: (_d = object.photoURL) !== null && _d !== void 0 ? _d : null,
            });
        },
    });
});
var UserAuth = /** @class */ (function () {
    // Constructor
    function UserAuth(input) {
        this.email = input.email;
        this.displayName = input.displayName;
        this.phoneNumber = input.phoneNumber;
        this.photoURL = input.photoURL;
    }
    return UserAuth;
}());
export { UserAuth };
