//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { z } from 'zod';
import { Lazy } from '../helpers/lazy.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export var organizationConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z
            .object({
            name: z.string(),
            contactName: z.string(),
            phoneNumber: z.string(),
            emailAddress: z.string(),
            ssoProviderId: z.string(),
        })
            .transform(function (values) { return new Organization(values); }),
        encode: function (object) { return ({
            name: object.name,
            contactName: object.contactName,
            phoneNumber: object.phoneNumber,
            emailAddress: object.emailAddress,
            ssoProviderId: object.ssoProviderId,
        }); },
    });
});
var Organization = /** @class */ (function () {
    // Constructor
    function Organization(input) {
        this.name = input.name;
        this.contactName = input.contactName;
        this.phoneNumber = input.phoneNumber;
        this.emailAddress = input.emailAddress;
        this.ssoProviderId = input.ssoProviderId;
    }
    return Organization;
}());
export { Organization };
