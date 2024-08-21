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
export var videoSectionConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z
            .object({
            title: localizedTextConverter.schema,
            description: localizedTextConverter.schema,
            orderIndex: z.number(),
        })
            .transform(function (values) { return new VideoSection(values); }),
        encode: function (object) { return ({
            title: localizedTextConverter.encode(object.title),
            description: localizedTextConverter.encode(object.description),
            orderIndex: object.orderIndex,
        }); },
    });
});
var VideoSection = /** @class */ (function () {
    // Constructor
    function VideoSection(input) {
        this.title = input.title;
        this.description = input.description;
        this.orderIndex = input.orderIndex;
    }
    return VideoSection;
}());
export { VideoSection };
