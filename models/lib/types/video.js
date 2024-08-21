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
export var videoConverter = new Lazy(function () {
    return new SchemaConverter({
        schema: z
            .object({
            title: localizedTextConverter.schema,
            youtubeId: localizedTextConverter.schema,
            orderIndex: z.number(),
            description: z.string(),
        })
            .transform(function (content) { return new Video(content); }),
        encode: function (object) { return ({
            title: localizedTextConverter.encode(object.title),
            youtubeId: localizedTextConverter.encode(object.youtubeId),
            orderIndex: object.orderIndex,
            description: object.description,
        }); },
    });
});
var Video = /** @class */ (function () {
    // Constructor
    function Video(input) {
        this.title = input.title;
        this.youtubeId = input.youtubeId;
        this.orderIndex = input.orderIndex;
        this.description = input.description;
    }
    return Video;
}());
export { Video };
