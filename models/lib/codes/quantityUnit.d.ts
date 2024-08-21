import { FHIRQuantity } from '../fhir/baseTypes/fhirQuantity.js';
export declare class QuantityUnit {
    static readonly mg: QuantityUnit;
    static readonly lbs: QuantityUnit;
    static readonly kg: QuantityUnit;
    static readonly bpm: QuantityUnit;
    static readonly mmHg: QuantityUnit;
    static readonly mg_dL: QuantityUnit;
    static readonly mEq_L: QuantityUnit;
    static readonly mL_min_173m2: QuantityUnit;
    static readonly tablet: QuantityUnit;
    static readonly allValues: QuantityUnit[];
    readonly unit: string;
    readonly code: string;
    readonly system: string;
    constructor(code: string, unit: string, system?: string);
    isUsedIn(other: FHIRQuantity): boolean;
    equals(other: QuantityUnit): boolean;
    convert(value: number, target: QuantityUnit): number | undefined;
    fhirQuantity(value: number): FHIRQuantity;
    valueOf(quantity: FHIRQuantity | undefined): number | undefined;
}
