//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { Lazy } from "@stanfordbdhg/engagehf-models";
import admin from "firebase-admin";
import { type AuthData } from "firebase-functions/v2/tasks";
import { type ServiceFactoryOptions } from "./getServiceFactory.js";
import { type ServiceFactory } from "./serviceFactory.js";
import { Env } from "../../env.js";
import { Flags } from "../../flags.js";
import { DefaultContraindicationService } from "../contraindication/defaultContraindicationService.js";
import { Credential } from "../credential/credential.js";
import { FirestoreService } from "../database/firestoreService.js";
import { DefaultHealthSummaryService } from "../healthSummary/databaseHealthSummaryService.js";
import { type HealthSummaryService } from "../healthSummary/healthSummaryService.js";
import { DatabaseHistoryService } from "../history/databaseHistoryService.js";
import { type HistoryService } from "../history/historyService.js";
import { DatabaseMedicationService } from "../medication/databaseMedicationService.js";
import { type MedicationService } from "../medication/medicationService.js";
import { DefaultMessageService } from "../message/defaultMessageService.js";
import { type MessageService } from "../message/messageService.js";
import { MockPhoneService } from "../message/phone/phoneService.mock.js";
import { TwilioPhoneService } from "../message/phone/twilioPhoneService.js";
import { DatabasePatientService } from "../patient/databasePatientService.js";
import { type PatientService } from "../patient/patientService.js";
import { DataUpdateQuestionnaireResponseService } from "../questionnaireResponse/dataUpdateQuestionnaireResponseService.js";
import { EgfrCalculator } from "../questionnaireResponse/egfr/egfrCalculator.js";
import { KccqQuestionnaireResponseService } from "../questionnaireResponse/kccqQuestionnaireResponseService.js";
import { MultiQuestionnaireResponseService } from "../questionnaireResponse/multiQuestionnaireResponseService.js";
import { type QuestionnaireResponseService } from "../questionnaireResponse/questionnaireResponseService.js";
import { RegistrationQuestionnaireResponseService } from "../questionnaireResponse/registrationQuestionnaireResponseService.js";
import { SymptomScoreCalculator } from "../questionnaireResponse/symptomScore/symptomScoreCalculator.js";
import { RecommendationService } from "../recommendation/recommendationService.js";
import { DebugDataService } from "../seeding/debugData/debugDataService.js";
import { RxNormService } from "../seeding/staticData/rxNorm/rxNormService.js";
import { StaticDataService } from "../seeding/staticData/staticDataService.js";
import { TriggerService } from "../trigger/triggerService.js";
import { DatabaseUserService } from "../user/databaseUserService.js";
import { type UserService } from "../user/userService.js";

export class DefaultServiceFactory implements ServiceFactory {
  // Properties - Options

  private readonly options: ServiceFactoryOptions;

  // Properties - Firebase

  private readonly auth = new Lazy(() => admin.auth());
  private readonly firestore = new Lazy(() => admin.firestore());
  private readonly messaging = new Lazy(() => admin.messaging());
  private readonly storage = new Lazy(() => admin.storage());

  // Properties - Database Layer

  private readonly databaseService = new Lazy(
    () => new FirestoreService(this.firestore.value),
  );

  // Properties - Services

  private readonly debugDataService = new Lazy(
    () =>
      new DebugDataService(
        this.auth.value,
        this.databaseService.value,
        this.storage.value,
      ),
  );

  private readonly egfrCalculator = new Lazy(() => new EgfrCalculator());

  private readonly healthSummaryService = new Lazy(
    () =>
      new DefaultHealthSummaryService(
        this.patientService.value,
        this.userService.value,
      ),
  );

  private readonly historyService = new Lazy(
    () => new DatabaseHistoryService(this.databaseService.value),
  );

  private readonly medicationService = new Lazy(
    () => new DatabaseMedicationService(this.databaseService.value),
  );

  private readonly messageService = new Lazy(
    () =>
      new DefaultMessageService(
        this.messaging.value,
        this.databaseService.value,
        this.phoneService.value,
        this.userService.value,
      ),
  );

  private readonly patientService = new Lazy(
    () => new DatabasePatientService(this.databaseService.value),
  );

  private readonly phoneService = new Lazy(() =>
    Flags.disableTwilio ?
      new MockPhoneService(this.databaseService.value)
    : new TwilioPhoneService({
        accountSid: Env.twilioAccountSid,
        apiKey: Env.twilioApiKey,
        apiSecret: Env.twilioApiSecret,
        phoneNumber: Env.twilioPhoneNumber,
        verifyServiceId: Env.twilioVerifiyServiceId,
      }),
  );

  private readonly questionnaireResponseService = new Lazy(
    () =>
      new MultiQuestionnaireResponseService([
        new KccqQuestionnaireResponseService({
          messageService: this.messageService.value,
          patientService: this.patientService.value,
          symptomScoreCalculator: this.symptomScoreCalculator.value,
          userService: this.userService.value,
        }),
        new DataUpdateQuestionnaireResponseService({
          egfrCalculator: this.egfrCalculator.value,
          messageService: this.messageService.value,
          patientService: this.patientService.value,
          userService: this.userService.value,
        }),
        new RegistrationQuestionnaireResponseService({
          egfrCalculator: this.egfrCalculator.value,
          messageService: this.messageService.value,
          patientService: this.patientService.value,
          userService: this.userService.value,
        }),
      ]),
  );

  private readonly recommendationService = new Lazy(
    () =>
      new RecommendationService(
        new DefaultContraindicationService(),
        this.medicationService.value,
      ),
  );

  private readonly staticDataService = new Lazy(
    () =>
      new StaticDataService(this.databaseService.value, new RxNormService()),
  );

  private readonly symptomScoreCalculator = new Lazy(
    () => new SymptomScoreCalculator(),
  );

  private readonly triggerService = new Lazy(() => new TriggerService(this));

  private readonly userService = new Lazy(
    () => new DatabaseUserService(this.auth.value, this.databaseService.value),
  );

  // Constructor

  constructor(options: ServiceFactoryOptions) {
    this.options = options;
  }

  // Methods - User

  credential(authData: AuthData | undefined): Credential {
    return new Credential(authData);
  }

  user(): UserService {
    return this.userService.value;
  }

  // Methods - Data

  medication(): MedicationService {
    return this.medicationService.value;
  }

  debugData(): DebugDataService {
    return this.debugDataService.value;
  }

  staticData(): StaticDataService {
    return this.staticDataService.value;
  }

  history(): HistoryService {
    return this.historyService.value;
  }

  // Methods - Patient

  healthSummary(): HealthSummaryService {
    return this.healthSummaryService.value;
  }

  patient(): PatientService {
    return this.patientService.value;
  }

  questionnaireResponse(): QuestionnaireResponseService {
    return this.questionnaireResponseService.value;
  }

  recommendation(): RecommendationService {
    return this.recommendationService.value;
  }

  // Methods - Trigger

  message(): MessageService {
    return this.messageService.value;
  }

  trigger(): TriggerService {
    return this.triggerService.value;
  }
}
