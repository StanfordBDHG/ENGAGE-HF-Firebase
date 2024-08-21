//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
var SchemaConverter = /** @class */ (function () {
    // Constructor
    function SchemaConverter(input) {
        this.schema = input.schema;
        this.encode = input.encode;
    }
    Object.defineProperty(SchemaConverter.prototype, "value", {
        get: function () {
            return this;
        },
        enumerable: false,
        configurable: true
    });
    // Methods - FirestoreDataConverter
    SchemaConverter.prototype.fromFirestore = function (snapshot) {
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
        return this.schema.parse(snapshot.data());
    };
    SchemaConverter.prototype.toFirestore = function (modelObject) {
        try {
            return this.encode(modelObject);
        }
        catch (error) {
            console.error("Failing to encode object of type ".concat(typeof modelObject, " due to ").concat(String(error)));
            throw error;
        }
    };
    return SchemaConverter;
}());
export { SchemaConverter };
