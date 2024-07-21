//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import admin from 'firebase-admin'
import { onCall } from 'firebase-functions/v2/https'
import { type Organization } from '../models/organization'
import { type Patient, type User } from '../models/user'

export const seedEmulatorFunction = onCall(async () => {
  const auth = admin.auth()
  const firestore = admin.firestore()

  const exampleAdmin = await auth.createUser({
    email: 'example@example.com',
    password: 'example',
  })
  await firestore.doc(`/admins/${exampleAdmin.uid}`).set({})

  const createOrg = async (organization: Organization) => {
    // Owner
    const owner = await auth.createUser({
      email: `${organization.id}.owner@example.com`,
      password: 'example',
    })
    await firestore.doc(`/users/${owner.uid}`).set({
      invitationCode: 'some',
      dateOfEnrollment: new Date(),
      organization: organization.id,
    } satisfies User)

    // Organization
    await firestore
      .doc(`/organizations/${organization.id}`)
      .set({ ...organization, owners: [owner.uid] } satisfies Organization)

    // Clinician
    const clinician = await auth.createUser({
      email: `${organization.id}.clinician@example.com`,
      password: 'example',
    })
    await firestore.doc(`/clinicians/${clinician.uid}`).set({})
    await firestore.doc(`/users/${clinician.uid}`).set({
      invitationCode: 'some',
      dateOfEnrollment: new Date(),
      organization: organization.id,
    } satisfies User)

    const patientUsersPromises = new Array(10)
      .fill(undefined)
      .map(async (_, i) =>
        auth.createUser({
          email: `${organization.id}.patient.${i}@example.com`,
          password: 'example',
        }),
      )
    const patientUsers = await Promise.all(patientUsersPromises)
    await Promise.all([
      ...patientUsers.map((patient) =>
        firestore.doc(`/patients/${patient.uid}`).set({
          dateOfBirth: new Date(),
          clinician: clinician.uid,
        } satisfies Patient),
      ),
      ...patientUsers.map((patient) =>
        firestore.doc(`/users/${patient.uid}`).set({
          invitationCode: 'some',
          dateOfEnrollment: new Date(),
          organization: organization.id,
        } satisfies User),
      ),
    ])
  }

  await createOrg({
    id: 'one',
    name: 'Lorem',
    contactName: 'Example Contact',
    phoneNumber: '123123123',
    emailAddress: 'example@example.com',
    owners: [],
  })
  await createOrg({
    id: 'two',
    name: 'Ipsum',
    contactName: 'Example Contact',
    phoneNumber: '123123123',
    emailAddress: 'example@example.com',
    owners: [],
  })

  return 'Success'
})
