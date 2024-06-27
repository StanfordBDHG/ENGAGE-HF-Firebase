
export class FhirService {

    extractObservationValues(
        observations: FHIRObservation[],
        options: {
            code: string,
            system: CodingSystem,
            unit: ObservationUnit,
            component?: {
                code: string,
                system: CodingSystem,
            }
        }
    ): Observation[] {
        const result: Observation[] = []
        for (const observation of observations) {
            if (!observation.code.coding.find(coding => coding.code === options.code && coding.system === options.system)) continue
            const date = observation.effectiveDateTime 
                    ?? observation.effectiveInstant
                    ?? observation.effectivePeriod?.start
                    ?? observation.effectivePeriod?.end
            if (!date) continue

            if (options.component) {
                for (const component of observation.component) {
                    if (!component.code.coding.find(coding => coding.code === options.component?.code && coding.system === options.component?.system)) 
                        continue
                    const value = component.valueQuantity?.value
                    if (!value || component.valueQuantity?.unit !== options.unit) continue
                    result.push({ date: date, value: value })
                }
            } else {
                const value = observation.valueQuantity?.value
                if (!value || observation.valueQuantity?.unit !== options.unit) continue
                result.push({ date: date, value: value })
            }
        }
        return result
    }

}