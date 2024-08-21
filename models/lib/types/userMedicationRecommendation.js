//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { z } from 'zod';
import { localizedTextConverter } from './localizedText.js';
import { Lazy } from '../helpers/lazy.js';
import { fhirReferenceConverter, } from '../fhir/baseTypes/fhirReference.js';
import { optionalish } from '../helpers/optionalish.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export var UserMedicationRecommendationType;
(function (UserMedicationRecommendationType) {
    UserMedicationRecommendationType["improvementAvailable"] = "improvementAvailable";
    UserMedicationRecommendationType["moreLabObservationsRequired"] = "moreLabObservationsRequired";
    UserMedicationRecommendationType["morePatientObservationsRequired"] = "morePatientObservationsRequired";
    UserMedicationRecommendationType["noActionRequired"] = "noActionRequired";
    UserMedicationRecommendationType["notStarted"] = "notStarted";
    UserMedicationRecommendationType["personalTargetDoseReached"] = "personalTargetDoseReached";
    UserMedicationRecommendationType["targetDoseReached"] = "targetDoseReached";
})(UserMedicationRecommendationType || (UserMedicationRecommendationType = {}));
export var userMedicationRecommendationDoseScheduleConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z.object({
            frequency: z.number(),
            quantity: z.number().array(),
        }),
        encode: function (object) { return ({
            frequency: object.frequency,
            quantity: object.quantity,
        }); },
    });
});
export var userMedicationRecommendationDosageInformationConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z.object({
            currentSchedule: z
                .lazy(function () {
                return userMedicationRecommendationDoseScheduleConverter.value.schema;
            })
                .array(),
            minimumSchedule: z
                .lazy(function () {
                return userMedicationRecommendationDoseScheduleConverter.value.schema;
            })
                .array(),
            targetSchedule: z
                .lazy(function () {
                return userMedicationRecommendationDoseScheduleConverter.value.schema;
            })
                .array(),
            unit: z.string(),
        }),
        encode: function (object) { return ({
            currentSchedule: object.currentSchedule.map(userMedicationRecommendationDoseScheduleConverter.value.encode),
            minimumSchedule: object.minimumSchedule.map(userMedicationRecommendationDoseScheduleConverter.value.encode),
            targetSchedule: object.targetSchedule.map(userMedicationRecommendationDoseScheduleConverter.value.encode),
            unit: object.unit,
        }); },
    });
});
export var userMedicationRecommendationDisplayInformationConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z.object({
            title: localizedTextConverter.schema,
            subtitle: localizedTextConverter.schema,
            description: localizedTextConverter.schema,
            type: z.nativeEnum(UserMedicationRecommendationType),
            videoPath: optionalish(z.string()),
            dosageInformation: z.lazy(function () {
                return userMedicationRecommendationDosageInformationConverter.value.schema;
            }),
        }),
        encode: function (object) {
            var _a;
            return ({
                title: localizedTextConverter.encode(object.title),
                subtitle: localizedTextConverter.encode(object.subtitle),
                description: localizedTextConverter.encode(object.description),
                type: object.type,
                videoPath: (_a = object.videoPath) !== null && _a !== void 0 ? _a : null,
                dosageInformation: userMedicationRecommendationDosageInformationConverter.value.encode(object.dosageInformation),
            });
        },
    });
});
export var userMedicationRecommendationConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z
            .object({
            currentMedication: z
                .lazy(function () { return fhirReferenceConverter.value.schema; })
                .array(),
            recommendedMedication: optionalish(z.lazy(function () { return fhirReferenceConverter.value.schema; })),
            displayInformation: z.lazy(function () {
                return userMedicationRecommendationDisplayInformationConverter.value
                    .schema;
            }),
        })
            .transform(function (values) { return new UserMedicationRecommendation(values); }),
        encode: function (object) { return ({
            currentMedication: object.currentMedication.map(fhirReferenceConverter.value.encode),
            recommendedMedication: object.recommendedMedication ?
                fhirReferenceConverter.value.encode(object.recommendedMedication)
                : null,
            displayInformation: userMedicationRecommendationDisplayInformationConverter.value.encode(object.displayInformation),
        }); },
    });
});
var UserMedicationRecommendation = /** @class */ (function () {
    // Constructor
    function UserMedicationRecommendation(input) {
        this.currentMedication = input.currentMedication;
        this.recommendedMedication = input.recommendedMedication;
        this.displayInformation = input.displayInformation;
    }
    return UserMedicationRecommendation;
}());
export { UserMedicationRecommendation };
