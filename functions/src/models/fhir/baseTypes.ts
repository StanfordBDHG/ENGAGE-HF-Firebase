
interface FHIRCodeableConcept extends FHIRElement {
    coding: FHIRCoding[]
    text?: string
}

interface FHIRCoding extends FHIRElement {
    system?: string
    version?: string
    code?: string
    display?: string
    userSelected?: boolean
}

interface FHIRElement {
    id?: string
    extension?: FHIRExtension[]
}

interface FHIRExtension {
    url: string
    valueString?: string
    valueQuantity?: FHIRSimpleQuantity
}

interface FHIRPeriod {
    start?: Date
    end?: Date
}

interface FHIRRatio {
    numerator?: FHIRSimpleQuantity
    denominator?: FHIRSimpleQuantity
}

interface FHIRReference<T> {
    reference?: string
    type?: string
    identifier?: string
    display?: string
}

interface FHIRSimpleQuantity {
    system?: string
    code?: string
    value?: number
    unit?: string
}
