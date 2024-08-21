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
export var UserDevicePlatform;
(function (UserDevicePlatform) {
    UserDevicePlatform["Android"] = "Android";
    UserDevicePlatform["iOS"] = "iOS";
})(UserDevicePlatform || (UserDevicePlatform = {}));
export var userDeviceConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z
            .object({
            notificationToken: z.string(),
            platform: z.nativeEnum(UserDevicePlatform),
            osVersion: optionalish(z.string()),
            appVersion: optionalish(z.string()),
            appBuild: optionalish(z.string()),
            language: optionalish(z.string()),
            timeZone: optionalish(z.string()),
        })
            .transform(function (values) { return new UserDevice(values); }),
        encode: function (object) {
            var _a, _b, _c, _d, _e;
            return ({
                notificationToken: object.notificationToken,
                platform: object.platform,
                osVersion: (_a = object.osVersion) !== null && _a !== void 0 ? _a : null,
                appVersion: (_b = object.appVersion) !== null && _b !== void 0 ? _b : null,
                appBuild: (_c = object.appBuild) !== null && _c !== void 0 ? _c : null,
                language: (_d = object.language) !== null && _d !== void 0 ? _d : null,
                timeZone: (_e = object.timeZone) !== null && _e !== void 0 ? _e : null,
            });
        },
    });
});
var UserDevice = /** @class */ (function () {
    // Constructor
    function UserDevice(input) {
        this.notificationToken = input.notificationToken;
        this.platform = input.platform;
        this.osVersion = input.osVersion;
        this.appVersion = input.appVersion;
        this.appBuild = input.appBuild;
        this.language = input.language;
        this.timeZone = input.timeZone;
    }
    return UserDevice;
}());
export { UserDevice };
