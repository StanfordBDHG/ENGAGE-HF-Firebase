//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import admin from 'firebase-admin'
import { type AuthData } from 'firebase-functions/v2/tasks'
import { type ServiceFactory } from './serviceFactory.js'
import { DefaultContraindicationService } from '../contraindication/defaultContraindicationService.js'
import { Credential } from '../credential/credential.js'
import { CacheDatabaseService } from '../database/cacheDatabaseService.js'
import { type DatabaseService } from '../database/databaseService.js'
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
import { DatabaseUserService } from '../user/databaseUserService.js'
import { type UserService } from '../user/userService.js'

export class DefaultServiceFactory implements ServiceFactory {
  // Properties

  private readonly _auth = admin.auth()
  private readonly _firestore = admin.firestore()
  private readonly _storage = admin.storage()
  private readonly _userService: UserService

  private readonly _databaseService: DatabaseService
  private readonly _uncachedDatabaseService: DatabaseService

  // Constructor

  constructor() {
    this._uncachedDatabaseService = new FirestoreService(this._firestore)
    this._userService = new DatabaseUserService(
      this._auth,
      this._uncachedDatabaseService,
    )
    this._databaseService = new CacheDatabaseService(
      this._uncachedDatabaseService,
    )
  }

  // Methods - User

  credential(authData: AuthData | undefined): Credential {
    return new Credential(authData)
  }

  user(): UserService {
    return this._userService
  }

  // Methods - Data

  medication(): MedicationService {
    return new DatabaseMedicationService(
      this._databaseService,
      new FhirService(),
    )
  }

  debugData(): DebugDataService {
    return new DebugDataService(
      this._auth,
      this._databaseService,
      this._storage,
    )
  }

  staticData(): StaticDataService {
    return new StaticDataService(this._databaseService, new RxNormService())
  }

  // Methods - Patient

  healthSummary(): HealthSummaryService {
    return new DefaultHealthSummaryService(
      new FhirService(),
      this.patient(),
      this._userService,
    )
  }

  patient(): PatientService {
    return new DatabasePatientService(this._databaseService)
  }

  recommendation(): RecommendationService {
    const fhirService = new FhirService()
    return new RecommendationService(
      new DefaultContraindicationService(fhirService),
      fhirService,
      this.medication(),
    )
  }
}
