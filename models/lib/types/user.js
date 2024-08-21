//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { z } from 'zod';
import { userRegistrationConverter, userRegistrationInputConverter, UserRegistration, } from './userRegistration.js';
import { Lazy } from '../helpers/lazy.js';
import { dateConverter } from '../helpers/dateConverter.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export var userConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: userRegistrationInputConverter.value.schema
            .extend({
            dateOfEnrollment: dateConverter.schema,
            invitationCode: z.string(),
        })
            .transform(function (values) { return new User(values); }),
        encode: function (object) { return (__assign(__assign({}, userRegistrationConverter.value.encode(object)), { dateOfEnrollment: dateConverter.encode(object.dateOfEnrollment), invitationCode: object.invitationCode })); },
    });
});
var User = /** @class */ (function (_super) {
    __extends(User, _super);
    // Constructor
    function User(input) {
        var _this = _super.call(this, input) || this;
        _this.dateOfEnrollment = input.dateOfEnrollment;
        _this.invitationCode = input.invitationCode;
        return _this;
    }
    return User;
}(UserRegistration));
export { User };
