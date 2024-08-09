//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import admin from 'firebase-admin'
import { type AuthData } from 'firebase-functions/v2/tasks'
import { type ServiceFactoryOptions } from './getServiceFactory.js'
import { Lazy } from './lazy.js'
import { type ServiceFactory } from './serviceFactory.js'
import { DefaultContraindicationService } from '../contraindication/defaultContraindicationService.js'
import { Credential } from '../credential/credential.js'
import { CacheDatabaseService } from '../database/cacheDatabaseService.js'
import { FirestoreService } from '../database/firestoreService.js'
import { FhirService } from '../fhir/fhirService.js'
import { DefaultHealthSummaryService } from '../healthSummary/databaseHealthSummaryService.js'
import { type HealthSummaryService } from '../healthSummary/healthSummaryService.js'
import { DatabaseMedicationService } from '../medication/databaseMedicationService.js'
import { type MedicationService } from '../medication/medicationService.js'
import { DatabasePatientService } from '../patient/databasePatientService.js'
import { type PatientService } from '../patient/patientService.js'
import { RecommendationService } from '../recommendation/recommendationService.js'
import { DebugDataService } from '../seeding/debugData/debugDataService.js'
import { RxNormService } from '../seeding/staticData/rxNormService.js'
import { StaticDataService } from '../seeding/staticData/staticDataService.js'
import { DefaultSymptomScoreCalculator } from '../symptomScore/defaultSymptomScoreCalculator.js'
import { type SymptomScoreCalculator } from '../symptomScore/symptomScoreCalculator.js'
import { TriggerService } from '../trigger/triggerService.js'
import { DatabaseUserService } from '../user/databaseUserService.js'
import { type UserService } from '../user/userService.js'

export class DefaultServiceFactory implements ServiceFactory {
  // Properties - Options

  private readonly options: ServiceFactoryOptions

  // Properties - Firebase

  private readonly auth = new Lazy(() => admin.auth())
  private readonly firestore = new Lazy(() => admin.firestore())
  private readonly storage = new Lazy(() => admin.storage())

  // Properties - Database Layer

  private readonly databaseService = new Lazy(() =>
    this.options.allowCaching ?
      new CacheDatabaseService(this.uncachedDatabaseService.get())
    : this.uncachedDatabaseService.get(),
  )
  private readonly uncachedDatabaseService = new Lazy(
    () => new FirestoreService(this.firestore.get()),
  )

  // Properties - Services

  private readonly debugDataService = new Lazy(
    () =>
      new DebugDataService(
        this.auth.get(),
        this.databaseService.get(),
        this.storage.get(),
      ),
  )

  private readonly fhirService = new Lazy(() => new FhirService())

  private readonly healthSummaryService = new Lazy(
    () =>
      new DefaultHealthSummaryService(
        this.fhirService.get(),
        this.patientService.get(),
        this.userService.get(),
      ),
  )

  private readonly medicationService = new Lazy(
    () =>
      new DatabaseMedicationService(
        this.databaseService.get(),
        this.fhirService.get(),
      ),
  )

  private readonly patientService = new Lazy(
    () => new DatabasePatientService(this.databaseService.get()),
  )

  private readonly recommendationService = new Lazy(() => {
    const fhirService = this.fhirService.get()
    return new RecommendationService(
      new DefaultContraindicationService(fhirService),
      fhirService,
      this.medicationService.get(),
    )
  })

  private readonly staticDataService = new Lazy(
    () =>
      new StaticDataService(this.databaseService.get(), new RxNormService()),
  )

  private readonly symptomScoreCalculator = new Lazy(
    () => new DefaultSymptomScoreCalculator(this.fhirService.get()),
  )

  private readonly triggerService = new Lazy(() => new TriggerService(this))

  private readonly userService = new Lazy(
    () =>
      new DatabaseUserService(
        this.auth.get(),
        this.uncachedDatabaseService.get(),
      ),
  )

  // Constructor

  constructor(options: ServiceFactoryOptions) {
    this.options = options
  }

  // Methods - User

  credential(authData: AuthData | undefined): Credential {
    return new Credential(authData)
  }

  user(): UserService {
    return this.userService.get()
  }

  // Methods - Data

  medication(): MedicationService {
    return this.medicationService.get()
  }

  debugData(): DebugDataService {
    return this.debugDataService.get()
  }

  staticData(): StaticDataService {
    return this.staticDataService.get()
  }

  // Methods - Patient

  healthSummary(): HealthSummaryService {
    return this.healthSummaryService.get()
  }

  patient(): PatientService {
    return this.patientService.get()
  }

  recommendation(): RecommendationService {
    return this.recommendationService.get()
  }

  symptomScore(): SymptomScoreCalculator {
    return this.symptomScoreCalculator.get()
  }

  // Methods - Trigger

  trigger(): TriggerService {
    return this.triggerService.get()
  }
}
