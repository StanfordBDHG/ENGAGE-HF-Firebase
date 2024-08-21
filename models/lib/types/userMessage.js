//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
import { z } from 'zod';
import { LocalizedText, localizedTextConverter } from './localizedText.js';
import { Lazy } from '../helpers/lazy.js';
import { advanceDateByDays } from '../helpers/date+extras.js';
import { dateConverter } from '../helpers/dateConverter.js';
import { optionalish } from '../helpers/optionalish.js';
import { SchemaConverter } from '../helpers/schemaConverter.js';
export var UserMessageType;
(function (UserMessageType) {
    UserMessageType["medicationChange"] = "MedicationChange";
    UserMessageType["weightGain"] = "WeightGain";
    UserMessageType["medicationUptitration"] = "MedicationUptitration";
    UserMessageType["welcome"] = "Welcome";
    UserMessageType["vitals"] = "Vitals";
    UserMessageType["symptomQuestionnaire"] = "SymptomQuestionnaire";
    UserMessageType["preAppointment"] = "PreAppointment";
})(UserMessageType || (UserMessageType = {}));
export var userMessageConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z
            .object({
            creationDate: dateConverter.schema,
            dueDate: optionalish(dateConverter.schema),
            completionDate: optionalish(dateConverter.schema),
            type: z.nativeEnum(UserMessageType),
            title: z.lazy(function () { return localizedTextConverter.schema; }),
            description: optionalish(z.lazy(function () { return localizedTextConverter.schema; })),
            action: optionalish(z.string()),
            isDismissible: z.boolean(),
            reference: optionalish(z.string()),
        })
            .transform(function (content) { return new UserMessage(content); }),
        encode: function (object) {
            var _a, _b;
            return ({
                creationDate: dateConverter.encode(object.creationDate),
                dueDate: object.dueDate ? dateConverter.encode(object.dueDate) : null,
                completionDate: object.completionDate ?
                    dateConverter.encode(object.completionDate)
                    : null,
                type: object.type,
                title: localizedTextConverter.encode(object.title),
                description: object.description ?
                    localizedTextConverter.encode(object.description)
                    : null,
                action: (_a = object.action) !== null && _a !== void 0 ? _a : null,
                isDismissible: object.isDismissible,
                reference: (_b = object.reference) !== null && _b !== void 0 ? _b : null,
            });
        },
    });
});
var UserMessage = /** @class */ (function () {
    // Constructor
    function UserMessage(input) {
        this.creationDate = input.creationDate;
        this.dueDate = input.dueDate;
        this.completionDate = input.completionDate;
        this.type = input.type;
        this.title = input.title;
        this.description = input.description;
        this.action = input.action;
        this.isDismissible = input.isDismissible;
        this.reference = input.reference;
    }
    // Static Functions
    UserMessage.createMedicationChange = function (input) {
        var _a;
        return new UserMessage({
            creationDate: (_a = input.creationDate) !== null && _a !== void 0 ? _a : new Date(),
            title: new LocalizedText({
                en: 'Medication Change',
            }),
            description: new LocalizedText({
                en: "Your dose of ".concat(input.medicationName, " was changed. You can review medication information on the Education Page."),
            }),
            action: input.videoReference,
            type: UserMessageType.medicationChange,
            isDismissible: true,
            reference: input.reference,
        });
    };
    UserMessage.createMedicationUptitration = function (input) {
        var _a;
        if (input === void 0) { input = {}; }
        return new UserMessage({
            creationDate: (_a = input.creationDate) !== null && _a !== void 0 ? _a : new Date(),
            title: new LocalizedText({
                en: 'Eligible Medication Change',
            }),
            description: new LocalizedText({
                en: 'You may be eligible for med changes that may help your heart. Your care team will be sent this information. You can review med information on the Education Page.',
            }),
            action: 'medications',
            type: UserMessageType.medicationUptitration,
            isDismissible: true,
        });
    };
    UserMessage.createPreAppointment = function (input) {
        var _a;
        if (input === void 0) { input = {}; }
        return new UserMessage({
            creationDate: (_a = input.creationDate) !== null && _a !== void 0 ? _a : new Date(),
            title: new LocalizedText({
                en: 'Appointment Reminder',
            }),
            description: new LocalizedText({
                en: 'Your appointment is coming up. Review your Health Summary before your visit.',
            }),
            action: 'healthSummary',
            type: UserMessageType.preAppointment,
            isDismissible: false,
            reference: input.reference,
        });
    };
    UserMessage.createSymptomQuestionnaire = function (input) {
        var _a;
        return new UserMessage({
            creationDate: (_a = input.creationDate) !== null && _a !== void 0 ? _a : new Date(),
            title: new LocalizedText({
                en: 'Symptom Questionnaire',
            }),
            description: new LocalizedText({
                en: 'Complete your Symptom Survey for your care team.',
            }),
            action: input.questionnaireReference,
            type: UserMessageType.symptomQuestionnaire,
            isDismissible: false,
        });
    };
    UserMessage.createVitals = function (input) {
        var _a;
        if (input === void 0) { input = {}; }
        var creationDate = (_a = input.creationDate) !== null && _a !== void 0 ? _a : new Date();
        return new UserMessage({
            creationDate: creationDate,
            dueDate: advanceDateByDays(creationDate, 1),
            title: new LocalizedText({
                en: 'Vitals',
            }),
            description: new LocalizedText({
                en: 'Check your blood pressure and weight daily.',
            }),
            action: 'observations',
            type: UserMessageType.vitals,
            isDismissible: false,
        });
    };
    UserMessage.createWeightGain = function (input) {
        var _a;
        if (input === void 0) { input = {}; }
        return new UserMessage({
            creationDate: (_a = input.creationDate) !== null && _a !== void 0 ? _a : new Date(),
            title: new LocalizedText({
                en: 'Weight increase since last week',
            }),
            description: new LocalizedText({
                en: 'Your weight increased over 3 lbs. Your care team will be informed. Please follow any instructions about diuretic changes after weight increase on the Medication page.',
            }),
            action: 'medications',
            type: UserMessageType.weightGain,
            isDismissible: true,
        });
    };
    UserMessage.createWelcome = function (input) {
        var _a;
        return new UserMessage({
            creationDate: (_a = input.creationDate) !== null && _a !== void 0 ? _a : new Date(),
            title: new LocalizedText({
                en: 'Welcome',
            }),
            description: new LocalizedText({
                en: 'Watch Welcome Video on the Education Page.',
            }),
            action: input.videoReference,
            type: UserMessageType.welcome,
            isDismissible: true,
        });
    };
    return UserMessage;
}());
export { UserMessage };
