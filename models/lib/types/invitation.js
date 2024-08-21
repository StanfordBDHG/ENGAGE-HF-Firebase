//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { z } from 'zod';
import { userAuthConverter } from './userAuth.js';
import { userRegistrationConverter, } from './userRegistration.js';
import { Lazy } from '../helpers/lazy.js';
import { optionalish } from '../helpers/optionalish.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export var invitationConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z
            .object({
            userId: optionalish(z.string()),
            code: z.string(),
            auth: optionalish(z.lazy(function () { return userAuthConverter.value.schema; })),
            user: z.lazy(function () { return userRegistrationConverter.value.schema; }),
        })
            .transform(function (values) { return new Invitation(values); }),
        encode: function (object) {
            var _a;
            return ({
                userId: (_a = object.userId) !== null && _a !== void 0 ? _a : null,
                code: object.code,
                auth: object.auth ? userAuthConverter.value.encode(object.auth) : null,
                user: userRegistrationConverter.value.encode(object.user),
            });
        },
    });
});
var Invitation = /** @class */ (function () {
    // Constructor
    function Invitation(input) {
        this.userId = input.userId;
        this.code = input.code;
        this.auth = input.auth;
        this.user = input.user;
    }
    return Invitation;
}());
export { Invitation };
