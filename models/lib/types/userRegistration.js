//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { z } from 'zod';
import { userMessagesSettingsConverter, } from './userMessagesSettings.js';
import { UserType } from './userType.js';
import { Lazy } from '../helpers/lazy.js';
import { dateConverter } from '../helpers/dateConverter.js';
import { optionalish } from '../helpers/optionalish.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export var userRegistrationInputConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z.object({
            type: z.nativeEnum(UserType),
            organization: optionalish(z.string()),
            dateOfBirth: optionalish(dateConverter.schema),
            clinician: optionalish(z.string()),
            messagesSettings: optionalish(z.lazy(function () { return userMessagesSettingsConverter.value.schema; })),
            language: optionalish(z.string()),
            timeZone: optionalish(z.string()),
        }),
        encode: function (object) {
            var _a, _b, _c, _d;
            return ({
                type: object.type,
                organization: (_a = object.organization) !== null && _a !== void 0 ? _a : null,
                dateOfBirth: object.dateOfBirth ? dateConverter.encode(object.dateOfBirth) : null,
                clinician: (_b = object.clinician) !== null && _b !== void 0 ? _b : null,
                messagesSettings: object.messagesSettings ?
                    userMessagesSettingsConverter.value.encode(object.messagesSettings)
                    : null,
                language: (_c = object.language) !== null && _c !== void 0 ? _c : null,
                timeZone: (_d = object.timeZone) !== null && _d !== void 0 ? _d : null,
            });
        },
    });
});
export var userRegistrationConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: userRegistrationInputConverter.value.schema.transform(function (values) { return new UserRegistration(values); }),
        encode: function (object) { return userRegistrationInputConverter.value.encode(object); },
    });
});
var UserRegistration = /** @class */ (function () {
    // Constructor
    function UserRegistration(input) {
        this.type = input.type;
        this.organization = input.organization;
        this.dateOfBirth = input.dateOfBirth;
        this.clinician = input.clinician;
        this.messagesSettings = input.messagesSettings;
        this.language = input.language;
        this.timeZone = input.timeZone;
    }
    return UserRegistration;
}());
export { UserRegistration };
