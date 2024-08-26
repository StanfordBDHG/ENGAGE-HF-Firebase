//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { User, UserType } from '@stanfordbdhg/engagehf-models'
import { expect } from 'chai'
import { it } from 'mocha'
import { getUsersInformation } from './getUsersInformation.js'
import { describeWithEmulators } from '../tests/functions/testEnvironment.js'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

describeWithEmulators('function: getUsersInformation', (env) => {
  it('should return users information', async () => {
    const adminAuth = await env.auth.createUser({})
    const ownerAuth = await env.auth.createUser({})
    const clinicianAuth = await env.auth.createUser({})
    const patientAuth = await env.auth.createUser({})

    const admin = new User({
      type: UserType.admin,
      invitationCode: 'ADMIN001',
      dateOfEnrollment: new Date(),
      receivesAppointmentReminders: true,
      receivesMedicationUpdates: false,
      receivesQuestionnaireReminders: true,
      receivesRecommendationUpdates: false,
      receivesVitalsReminders: true,
      receivesWeightAlerts: false,
    })
    await env.collections.users.doc(adminAuth.uid).set(admin)

    const owner = new User({
      ...admin,
      type: UserType.owner,
      organization: 'stanford',
      invitationCode: 'OWNER001',
    })
    await env.collections.users.doc(ownerAuth.uid).set(owner)

    const clinician = new User({
      ...admin,
      type: UserType.clinician,
      organization: 'jhu',
      invitationCode: 'CLINIC01',
    })
    await env.collections.users.doc(clinicianAuth.uid).set(clinician)

    const patient = new User({
      ...admin,
      type: UserType.patient,
      organization: 'stanford',
      invitationCode: 'PATIENT01',
    })
    await env.collections.users.doc(patientAuth.uid).set(patient)

    const adminResult = await env.call(
      getUsersInformation,
      {
        userIds: [
          adminAuth.uid,
          ownerAuth.uid,
          clinicianAuth.uid,
          patientAuth.uid,
        ],
        includeUserData: true,
      },
      { uid: adminAuth.uid, token: { type: UserType.admin } },
    )
    expect(Object.keys(adminResult)).to.have.length(4)
    expect(adminResult[adminAuth.uid], 'admin: admin object').to.exist
    expect((adminResult[adminAuth.uid] as any).data, 'admin: admin data').to
      .exist
    expect((adminResult[adminAuth.uid] as any).error, 'admin: admin error').to
      .be.undefined
    expect(adminResult[ownerAuth.uid], 'admin: owner object').to.exist
    expect((adminResult[ownerAuth.uid] as any).data, 'admin: owner data').to
      .exist
    expect((adminResult[ownerAuth.uid] as any).error, 'admin: owner error').to
      .be.undefined
    expect(adminResult[clinicianAuth.uid], 'admin: clinician object').to.exist
    expect(
      (adminResult[clinicianAuth.uid] as any).data,
      'admin: clinician data',
    ).to.exist
    expect(
      (adminResult[clinicianAuth.uid] as any).error,
      'admin: clinician error',
    ).to.be.undefined
    expect(adminResult[patientAuth.uid], 'admin: patient object').to.exist
    expect((adminResult[patientAuth.uid] as any).data, 'admin: patient data').to
      .exist
    expect((adminResult[patientAuth.uid] as any).error, 'admin: patient error')
      .to.be.undefined

    const ownerResult = await env.call(
      getUsersInformation,
      {
        userIds: [
          adminAuth.uid,
          ownerAuth.uid,
          clinicianAuth.uid,
          patientAuth.uid,
        ],
        includeUserData: true,
      },
      {
        uid: ownerAuth.uid,
        token: { type: UserType.owner, organization: 'stanford' },
      },
    )
    expect(Object.keys(ownerResult)).to.have.length(4)
    expect(ownerResult[adminAuth.uid], 'owner: admin object').to.exist
    expect((ownerResult[adminAuth.uid] as any).data, 'owner: admin data').to.be
      .undefined
    expect((ownerResult[adminAuth.uid] as any).error, 'owner: admin error').to
      .exist
    expect(ownerResult[ownerAuth.uid], 'owner: owner object').to.exist
    expect((ownerResult[ownerAuth.uid] as any).data, 'owner: owner data').to
      .exist
    expect((ownerResult[ownerAuth.uid] as any).error, 'owner: owner error').to
      .be.undefined
    expect(ownerResult[clinicianAuth.uid], 'owner: clinician object').to.exist
    expect(
      (ownerResult[clinicianAuth.uid] as any).data,
      'owner: clinician data',
    ).to.be.undefined
    expect(
      (ownerResult[clinicianAuth.uid] as any).error,
      'owner: clinician error',
    ).to.exist
    expect(ownerResult[patientAuth.uid], 'owner: patient object').to.exist
    expect((ownerResult[patientAuth.uid] as any).data, 'owner: patient data').to
      .exist
    expect((ownerResult[patientAuth.uid] as any).error, 'owner: patient error')
      .to.be.undefined

    const clinicianResult = await env.call(
      getUsersInformation,
      {
        userIds: [
          adminAuth.uid,
          ownerAuth.uid,
          clinicianAuth.uid,
          patientAuth.uid,
        ],
        includeUserData: true,
      },
      {
        uid: clinicianAuth.uid,
        token: { type: UserType.clinician, organization: 'jhu' },
      },
    )
    expect(Object.keys(clinicianResult)).to.have.length(4)
    expect(clinicianResult[adminAuth.uid], 'clinician: admin object').to.exist
    expect(
      (clinicianResult[adminAuth.uid] as any).data,
      'clinician: admin data',
    ).to.be.undefined
    expect(
      (clinicianResult[adminAuth.uid] as any).error,
      'clinician: admin error',
    ).to.exist
    expect(clinicianResult[ownerAuth.uid], 'clinician: owner object').to.exist
    expect(
      (clinicianResult[ownerAuth.uid] as any).data,
      'clinician: owner data',
    ).to.be.undefined
    expect(
      (clinicianResult[ownerAuth.uid] as any).error,
      'clinician: owner error',
    ).to.exist
    expect(clinicianResult[clinicianAuth.uid], 'clinician: clinician object').to
      .exist
    expect(
      (clinicianResult[clinicianAuth.uid] as any).data,
      'clinician: clinician data',
    ).to.exist
    expect(
      (clinicianResult[clinicianAuth.uid] as any).error,
      'clinician: clinician error',
    ).to.be.undefined
    expect(clinicianResult[patientAuth.uid], 'clinician: patient object').to
      .exist
    expect(
      (clinicianResult[patientAuth.uid] as any).data,
      'clinician: patient data',
    ).to.be.undefined
    expect(
      (clinicianResult[patientAuth.uid] as any).error,
      'clinician: patient error',
    ).to.exist

    const patientResult = await env.call(
      getUsersInformation,
      {
        userIds: [
          adminAuth.uid,
          ownerAuth.uid,
          clinicianAuth.uid,
          patientAuth.uid,
        ],
        includeUserData: true,
      },
      {
        uid: patientAuth.uid,
        token: { type: UserType.patient, organization: 'stanford' },
      },
    )
    expect(Object.keys(patientResult)).to.have.length(4)
    expect(patientResult[adminAuth.uid], 'patient: admin object').to.exist
    expect((patientResult[adminAuth.uid] as any).data, 'patient: admin data').to
      .be.undefined
    expect((patientResult[adminAuth.uid] as any).error, 'patient: admin error')
      .to.exist
    expect(patientResult[ownerAuth.uid], 'patient: owner object').to.exist
    expect((patientResult[ownerAuth.uid] as any).data, 'patient: owner data').to
      .be.undefined
    expect((patientResult[ownerAuth.uid] as any).error, 'patient: owner error')
      .to.exist
    expect(patientResult[clinicianAuth.uid], 'patient: clinician object').to
      .exist
    expect(
      (patientResult[clinicianAuth.uid] as any).data,
      'patient: clinician data',
    ).to.be.undefined
    expect(
      (patientResult[clinicianAuth.uid] as any).error,
      'patient: clinician error',
    ).to.exist
    expect(patientResult[patientAuth.uid], 'patient: patient object').to.exist
    expect(
      (patientResult[patientAuth.uid] as any).data,
      'patient: patient data',
    ).to.exist
    expect(
      (patientResult[patientAuth.uid] as any).error,
      'patient: patient error',
    ).to.be.undefined
  })
})
