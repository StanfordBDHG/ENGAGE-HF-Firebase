//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  Invitation,
  Organization,
  User,
  type UserAuth,
  UserRegistration,
  UserType,
} from '@stanfordbdhg/engagehf-models'
import { type UserService } from './userService.js'
import { type Document } from '../database/databaseService.js'

/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */

export class MockUserService implements UserService {
  // Methods - Auth

  async getAuth(userId: string): Promise<UserAuth> {
    switch (userId) {
      case 'mockClinician':
        return {
          displayName: 'Dr. XXX',
        }
      case 'mockUser':
        return {
          displayName: 'John Doe',
        }
      default:
        return {
          displayName: 'Unknown',
        }
    }
  }

  async updateAuth(userId: string, user: UserAuth): Promise<void> {
    return
  }

  async updateClaims(userId: string): Promise<void> {
    return
  }

  // Methods - Invitations

  async createInvitation(content: Invitation): Promise<{ id: string }> {
    return { id: 'OpEbLvZgsKwqVNnD8FzN' }
  }

  async getInvitationByCode(
    invitationCode: string,
  ): Promise<Document<Invitation>> {
    return {
      id: '1',
      path: 'invitations/1',
      content: new Invitation({
        user: new UserRegistration({
          type: UserType.patient,
          dateOfBirth: new Date('1970-01-02'),
          clinician: 'mockPatient',
          receivesAppointmentReminders: true,
          receivesMedicationUpdates: true,
          receivesQuestionnaireReminders: true,
          receivesRecommendationUpdates: true,
          receivesVitalsReminders: true,
          receivesWeightAlerts: true,
          organization: 'stanford',
          timeZone: 'America/Los_Angeles',
        }),
        code: invitationCode,
      }),
    }
  }

  async enrollUser(
    invitation: Document<Invitation>,
    userId: string,
  ): Promise<void> {
    return
  }

  // Methods - Organizations

  async getOrganizationBySsoProviderId(
    providerId: string,
  ): Promise<Document<Organization> | undefined> {
    return undefined
  }

  async getOrganizations(): Promise<Array<Document<Organization>>> {
    return []
  }

  async getOrganization(
    organizationId: string,
  ): Promise<Document<Organization> | undefined> {
    return {
      id: organizationId,
      path: 'organizations/' + organizationId,
      content: new Organization({
        name: 'Stanford University',
        contactName: 'Alex Sandhu, MD',
        phoneNumber: '+1 (650) 493-5000',
        emailAddress: 'dothfteam@stanford.edu',
        ssoProviderId: 'oidc.stanford',
      }),
    }
  }

  async deleteInvitation(invitation: Document<Invitation>): Promise<void> {
    return
  }

  // Methods - User

  async getAllPatients(): Promise<Array<Document<User>>> {
    return []
  }

  async getUser(userId: string): Promise<Document<User>> {
    return {
      id: userId,
      path: 'users/' + userId,
      content: new User({
        type: UserType.clinician,
        dateOfBirth: new Date('1970-01-02'),
        clinician: 'mockClinician',
        receivesAppointmentReminders: true,
        receivesMedicationUpdates: true,
        receivesQuestionnaireReminders: true,
        receivesRecommendationUpdates: true,
        receivesVitalsReminders: true,
        receivesWeightAlerts: true,
        organization: 'stanford',
        dateOfEnrollment: new Date('2024-04-02'),
        invitationCode: '123',
        timeZone: 'America/Los_Angeles',
      }),
    }
  }

  async deleteUser(userId: string): Promise<void> {
    return
  }

  async deleteExpiredAccounts(): Promise<void> {
    return
  }
}
