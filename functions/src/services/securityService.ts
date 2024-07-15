//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import admin from 'firebase-admin'
import { FieldValue, type Firestore } from 'firebase-admin/firestore'
import { https } from 'firebase-functions/v2'
import { type AuthData } from 'firebase-functions/v2/tasks'
import { type Clinician } from '../models/clinician.js'
import { type Organization } from '../models/organization.js'

export class SecurityService {
  // Properties

  private firestore: Firestore

  // Constructor

  constructor(firestore: Firestore = admin.firestore()) {
    this.firestore = firestore
  }

  // Methods - Change Roles

  async grantAdmin(authData: AuthData | undefined, userId: string) {
    const isAdmin = await this.isAdmin(authData)
    if (!isAdmin)
      throw new https.HttpsError('permission-denied', 'User is not an admin.')
    await this.firestore.doc(`admins/${userId}`).set({})
  }

  async revokeAdmin(authData: AuthData | undefined, userId: string) {
    const isAdmin = await this.isAdmin(authData)
    if (!isAdmin)
      throw new https.HttpsError('permission-denied', 'User is not an admin.')
    await this.firestore.doc(`admins/${userId}`).delete()
  }

  async grantOwner(
    authData: AuthData | undefined,
    userId: string,
    organizationId: string,
  ) {
    const isOwner = await this.isOwner(authData, organizationId)
    if (!isOwner) {
      const isAdmin = await this.isAdmin(authData)
      if (!isAdmin) {
        throw new https.HttpsError(
          'permission-denied',
          'User is not an owner of organization.',
        )
      }
    }
    await this.firestore.doc(`organizations/${organizationId}`).update({
      owners: FieldValue.arrayUnion(userId),
    })
  }

  async revokeOwner(
    authData: AuthData | undefined,
    userId: string,
    organizationId: string,
  ) {
    const isOwner = await this.isOwner(authData, organizationId)
    if (!isOwner) {
      const isAdmin = await this.isAdmin(authData)
      if (!isAdmin) {
        throw new https.HttpsError(
          'permission-denied',
          'User is not an owner of organization.',
        )
      }
    }
    await this.firestore.doc(`organizations/${organizationId}`).update({
      owners: FieldValue.arrayRemove(userId),
    })
  }

  // Methods - Ensure Roles

  async ensureAdmin(authData: AuthData | undefined) {
    if (!authData)
      throw new https.HttpsError(
        'unauthenticated',
        'User is not properly authenticated.',
      )
    if (!(await this.isAdmin(authData)))
      throw new https.HttpsError('permission-denied', 'User is not an admin.')
  }

  async ensureOwner(authData: AuthData | undefined, organizationId: string) {
    if (!authData)
      throw new https.HttpsError(
        'unauthenticated',
        'User is not properly authenticated.',
      )
    if (await this.isOwner(authData, organizationId)) return
    if (await this.isAdmin(authData)) return
    throw new https.HttpsError(
      'permission-denied',
      'User is not an owner of organization.',
    )
  }

  async ensureClinician(
    authData: AuthData | undefined,
    organizationId: string,
  ) {
    if (!authData)
      throw new https.HttpsError(
        'unauthenticated',
        'User is not properly authenticated.',
      )
    if (await this.isClinician(authData, organizationId)) return
    if (await this.isOwner(authData, organizationId)) return
    if (await this.isAdmin(authData)) return
    throw new https.HttpsError(
      'permission-denied',
      'User is not a clinician of organization.',
    )
  }

  ensureUser(authData: AuthData | undefined, userId: string) {
    if (!authData)
      throw new https.HttpsError(
        'unauthenticated',
        'User is not properly authenticated.',
      )
    if (this.isUser(authData, userId)) return
    throw new https.HttpsError(
      'permission-denied',
      'User is not the specified user.',
    )
  }

  // Methods - Check Roles

  async isAdmin(authData: AuthData | undefined): Promise<boolean> {
    if (!authData?.uid) return false
    const admin = await this.firestore.doc(`admins/${authData.uid}`).get()
    return admin.exists
  }

  async isOwner(
    authData: AuthData | undefined,
    organizationId: string,
  ): Promise<boolean> {
    if (!authData?.uid) return false
    const organization = await this.firestore
      .doc(`organizations/${organizationId}`)
      .get()
    if (!organization.exists) return false
    const content = organization.data() as Organization | undefined
    return content?.owners.includes(authData.uid) ?? false
  }

  async isClinician(
    authData: AuthData | undefined,
    organizationId: string,
  ): Promise<boolean> {
    if (!authData?.uid) return false
    const clinician = await this.firestore
      .doc(`clinicians/${authData.uid}`)
      .get()
    const content = clinician.data() as Clinician | undefined
    return content?.organization === organizationId
  }

  isUser(authData: AuthData | undefined, userId: string): boolean {
    return authData?.uid === userId
  }
}
