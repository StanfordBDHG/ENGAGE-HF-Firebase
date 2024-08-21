//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
export var FHIRExtensionUrl;
(function (FHIRExtensionUrl) {
    FHIRExtensionUrl["medicationClass"] = "http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass";
    FHIRExtensionUrl["minimumDailyDose"] = "http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose";
    FHIRExtensionUrl["targetDailyDose"] = "http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose";
    FHIRExtensionUrl["totalDailyDose"] = "http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/MedicationRequest/extension/totalDailyDose";
})(FHIRExtensionUrl || (FHIRExtensionUrl = {}));
export var CodingSystem;
(function (CodingSystem) {
    CodingSystem["loinc"] = "http://loinc.org";
    CodingSystem["rxNorm"] = "http://www.nlm.nih.gov/research/umls/rxnorm";
    CodingSystem["snomedCt"] = "http://snomed.info/sct";
})(CodingSystem || (CodingSystem = {}));
export var LoincCode;
(function (LoincCode) {
    LoincCode["bloodPressure"] = "85354-9";
    LoincCode["systolicBloodPressure"] = "8480-6";
    LoincCode["diastolicBloodPressure"] = "8462-4";
    LoincCode["bodyWeight"] = "29463-7";
    LoincCode["heartRate"] = "8867-4";
    LoincCode["creatinine"] = "2160-0";
    LoincCode["estimatedGlomerularFiltrationRate"] = "98979-8";
    LoincCode["potassium"] = "6298-4";
})(LoincCode || (LoincCode = {}));
