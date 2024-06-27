import { FhirService } from "./fhirService.js"
import { FirebaseDocument, FirebaseService } from "./firebaseService.js"

export class HealthSummaryService {

    private fhirService: FhirService
    private firebaseService: FirebaseService

    constructor(fhirService: FhirService, firebaseService: FirebaseService) {
        this.fhirService = fhirService
        this.firebaseService = firebaseService
    }

    async fetchHealthSummaryData(userId: string): Promise<HealthSummaryData> {
        const [userRecord, user, nextAppointment, kccqScores, vitals] = await Promise.all([
            this.firebaseService.getUserRecord(userId),
            this.firebaseService.getUser(userId),
            this.firebaseService.getNextAppointment(userId),
            this.getKccqScores(userId),
            this.getVitals(userId),
        ])

        const clinician = user.content?.clinician ? await this.firebaseService.getUserRecord(user.content.clinician) : undefined

        return {
            name: userRecord.displayName ?? '---',
            dateOfBirth: user.content?.dateOfBirth,
            clinicianName: clinician?.displayName ?? '---',
            nextAppointment: nextAppointment?.content.start,
            medicationRequests: [],
            vitals: vitals,
            symptomScores: kccqScores,
        }
    }

    // Helpers

    private async getKccqScores(userId: string): Promise<KccqScore[]> {
        return await this.compactMap(this.firebaseService.getKccqScores(userId))
    }

    private async getVitals(userId: string): Promise<Vitals> {
        const bloodPressureObservations = await this.compactMap<FHIRObservation>(
            this.firebaseService.getBloodPressureObservations(userId)
        )
        const systolicBloodPressure = this.fhirService.extractObservationValues(bloodPressureObservations, {
            code: LoincCode.bloodPressure,
            system: CodingSystem.loinc,
            unit: ObservationUnit.mmHg,
            component: {
                code: LoincCode.systolicBloodPressure,
                system: CodingSystem.loinc,
            },
        })
        const diastolicBloodPressure = this.fhirService.extractObservationValues(bloodPressureObservations, {
            code: LoincCode.bloodPressure,
            system: CodingSystem.loinc,
            unit: ObservationUnit.mmHg,
            component: {
                code: LoincCode.diastolicBloodPressure,
                system: CodingSystem.loinc,
            },
        })
        const heartRateObservations = await this.compactMap<FHIRObservation>(
            this.firebaseService.getHeartRateObservations(userId)
        )
        const heartRate = this.fhirService.extractObservationValues(heartRateObservations, {
            code: LoincCode.heartRate,
            system: CodingSystem.loinc,
            unit: ObservationUnit.bpm,
        })
        const bodyWeightObservations = await this.compactMap<FHIRObservation>(
            this.firebaseService.getBodyWeightObservations(userId)
        )
        const bodyWeight = this.fhirService.extractObservationValues(bodyWeightObservations, {
            code: LoincCode.bodyWeight,
            system: CodingSystem.loinc,
            unit: ObservationUnit.kg,
        })
        return {
            systolicBloodPressure: systolicBloodPressure,
            diastolicBloodPressure: diastolicBloodPressure,
            heartRate: heartRate,
            bodyWeight: bodyWeight,
            dryWeight: bodyWeight.at(-1)?.value ?? 0,
        }
    }

    private async compactMap<T>(documents: Promise<FirebaseDocument<T>[]>): Promise<T[]> {
        return documents
        .then(documents => documents.flatMap(document => document.content ? [document.content] : []))
    }

}