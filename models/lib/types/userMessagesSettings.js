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
export var userMessagesSettingsConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z
            .object({
            dailyRemindersAreActive: optionalish(z.boolean()),
            textNotificationsAreActive: optionalish(z.boolean()),
            medicationRemindersAreActive: optionalish(z.boolean()),
        })
            .transform(function (values) { return new UserMessagesSettings(values); }),
        encode: function (object) {
            var _a, _b, _c;
            return ({
                dailyRemindersAreActive: (_a = object.dailyRemindersAreActive) !== null && _a !== void 0 ? _a : null,
                textNotificationsAreActive: (_b = object.textNotificationsAreActive) !== null && _b !== void 0 ? _b : null,
                medicationRemindersAreActive: (_c = object.medicationRemindersAreActive) !== null && _c !== void 0 ? _c : null,
            });
        },
    });
});
var UserMessagesSettings = /** @class */ (function () {
    // Constructor
    function UserMessagesSettings(input) {
        this.dailyRemindersAreActive = input.dailyRemindersAreActive;
        this.textNotificationsAreActive = input.textNotificationsAreActive;
        this.medicationRemindersAreActive = input.medicationRemindersAreActive;
    }
    return UserMessagesSettings;
}());
export { UserMessagesSettings };
