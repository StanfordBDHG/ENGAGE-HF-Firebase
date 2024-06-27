
interface FHIRMedication extends FHIRElement {
    code?: FHIRCodeableConcept
    ingredient?: FHIRMedicationIngredient[]
}

interface FHIRMedicationIngredient {
    strength?: FHIRRatio
    itemReference?: FHIRReference<FHIRMedication>
}