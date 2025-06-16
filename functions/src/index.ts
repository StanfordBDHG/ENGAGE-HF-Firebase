//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import admin from 'firebase-admin'

admin.initializeApp()

export {
  beforeUserCreatedFunction as beforeUserCreated,
  beforeUserSignedInFunction as beforeUserSignedIn,
} from './functions/blocking.js'
export * from './functions/createInvitation.js'
export * from './functions/customSeed.js'
export * from './functions/defaultSeed.js'
export * from './functions/deleteUser.js'
export * from './functions/disableUser.js'
export * from './functions/dismissMessage.js'
export * from './functions/dismissMessages.js'
export * from './functions/enableUser.js'
export * from './functions/enrollUser.js'
export * from './functions/exportHealthSummary.js'
export * from './functions/getUsersInformation.js'
export * from './functions/onHistoryWritten.js'
export * from './functions/onSchedule.js'
export * from './functions/onUserAllergyIntoleranceWritten.js'
export * from './functions/onUserAppointmentWritten.js'
export * from './functions/onUserBloodPressureObservationWritten.js'
export * from './functions/onUserBodyWeightObservationWritten.js'
export * from './functions/onUserCreatinineObservationWritten.js'
export * from './functions/onUserDryWeightObservationWritten.js'
export * from './functions/onUserEgfrObservationWritten.js'
export * from './functions/onUserHeartRateObservationWritten.js'
export * from './functions/onUserMedicationRequestWritten.js'
export * from './functions/onUserPotassiumObservationWritten.js'
export * from './functions/onUserQuestionnaireResponseWritten.js'
export * from './functions/onUserWritten.js'
export * from './functions/phoneNumber.js'
export * from './functions/registerDevice.js'
export * from './functions/shareHealthSummary.js'
export * from './functions/unregisterDevice.js'
export * from './functions/updateStaticData.js'
export * from './functions/updateUserInformation.js'
