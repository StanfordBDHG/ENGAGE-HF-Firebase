import { QuantityUnit } from '../codes/quantityUnit.js';
export interface Observation {
    date: Date;
    value: number;
    unit: QuantityUnit;
}
