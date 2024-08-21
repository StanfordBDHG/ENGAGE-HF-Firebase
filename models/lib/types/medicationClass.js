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
import { SchemaConverter } from '../helpers/schemaConverter.js';
export var medicationClassConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z
            .object({
            name: localizedTextConverter.schema,
            videoPath: z.string(),
        })
            .transform(function (content) { return new MedicationClass(content); }),
        encode: function (object) { return ({
            name: localizedTextConverter.encode(object.name),
            videoPath: object.videoPath,
        }); },
    });
});
var MedicationClass = /** @class */ (function () {
    // Constructor
    function MedicationClass(input) {
        this.name = input.name;
        this.videoPath = input.videoPath;
    }
    return MedicationClass;
}());
export { MedicationClass };
