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
import { fhirCodeableConceptConverter } from './baseTypes/fhirCodeableConcept.js';
import { FHIRResource, fhirResourceConverter, } from './baseTypes/fhirElement.js';
import { fhirReferenceConverter } from './baseTypes/fhirReference.js';
import { Lazy } from '../helpers/lazy.js';
import { dateConverter } from '../helpers/dateConverter.js';
import { optionalish } from '../helpers/optionalish.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export var FHIRAppointmentStatus;
(function (FHIRAppointmentStatus) {
    FHIRAppointmentStatus["proposed"] = "proposed";
    FHIRAppointmentStatus["pending"] = "pending";
    FHIRAppointmentStatus["booked"] = "booked";
    FHIRAppointmentStatus["arrived"] = "arrived";
    FHIRAppointmentStatus["fulfilled"] = "fulfilled";
    FHIRAppointmentStatus["cancelled"] = "cancelled";
    FHIRAppointmentStatus["noshow"] = "noshow";
    FHIRAppointmentStatus["enterdInError"] = "entered-in-error";
    FHIRAppointmentStatus["checkedIn"] = "checked-in";
    FHIRAppointmentStatus["waitlist"] = "waitlist";
})(FHIRAppointmentStatus || (FHIRAppointmentStatus = {}));
export var fhirAppointmentParticipantConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z.object({
            actor: optionalish(z.lazy(function () { return fhirReferenceConverter.value.schema; })),
            type: optionalish(z.lazy(function () { return fhirCodeableConceptConverter.value.schema; })),
        }),
        encode: function (object) { return ({
            actor: object.actor ?
                fhirReferenceConverter.value.encode(object.actor)
                : null,
            type: object.type ?
                fhirCodeableConceptConverter.value.encode(object.type)
                : null,
        }); },
    });
});
export var fhirAppointmentConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: fhirResourceConverter.value.schema
            .extend({
            status: z.nativeEnum(FHIRAppointmentStatus),
            created: dateConverter.schema,
            start: dateConverter.schema,
            end: dateConverter.schema,
            comment: optionalish(z.string()),
            patientInstruction: optionalish(z.string()),
            participant: optionalish(z
                .lazy(function () { return fhirAppointmentParticipantConverter.value.schema; })
                .array()),
        })
            .transform(function (values) { return new FHIRAppointment(values); }),
        encode: function (object) {
            var _a, _b, _c, _d;
            return (__assign(__assign({}, fhirResourceConverter.value.encode(object)), { status: object.status, created: dateConverter.encode(object.created), start: dateConverter.encode(object.start), end: dateConverter.encode(object.end), comment: (_a = object.comment) !== null && _a !== void 0 ? _a : null, patientInstruction: (_b = object.patientInstruction) !== null && _b !== void 0 ? _b : null, participant: (_d = (_c = object.participant) === null || _c === void 0 ? void 0 : _c.map(fhirAppointmentParticipantConverter.value.encode)) !== null && _d !== void 0 ? _d : null }));
        },
    });
});
var FHIRAppointment = /** @class */ (function (_super) {
    __extends(FHIRAppointment, _super);
    // Constructor
    function FHIRAppointment(input) {
        var _this = _super.call(this, input) || this;
        // Properties
        _this.resourceType = 'Appointment';
        _this.status = input.status;
        _this.created = input.created;
        _this.start = input.start;
        _this.end = input.end;
        _this.comment = input.comment;
        _this.patientInstruction = input.patientInstruction;
        _this.participant = input.participant;
        return _this;
    }
    // Static Functions
    FHIRAppointment.create = function (input) {
        return new FHIRAppointment({
            status: input.status,
            created: input.created,
            start: input.start,
            end: new Date(input.start.getTime() + input.durationInMinutes * 60 * 1000),
            participant: [
                {
                    actor: {
                        reference: "users/".concat(input.userId),
                    },
                },
            ],
        });
    };
    return FHIRAppointment;
}(FHIRResource));
export { FHIRAppointment };
