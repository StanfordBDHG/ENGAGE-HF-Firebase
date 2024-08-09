//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { type UserService } from './userService.js'
import { type UserAuth, type Invitation } from '../../models/invitation.js'
import { type Organization } from '../../models/organization.js'
import { type User, UserType } from '../../models/user.js'
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

  async createInvitation(content: Invitation): Promise<void> {
    return
  }

  async getInvitationByCode(
    invitationCode: string,
  ): Promise<Document<Invitation>> {
    return {
      id: '1',
      path: 'invitations/1',
      content: {
        user: {
          type: UserType.patient,
        },
        code: invitationCode,
        userId: 'test',
      },
    }
  }

  async getInvitationByUserId(
    userId: string,
  ): Promise<Document<Invitation> | undefined> {
    return {
      id: '123',
      path: 'invitations/123',
      content: {
        user: {
          type: UserType.patient,
        },
        code: 'test',
        userId: userId,
      },
    }
  }

  async setInvitationUserId(
    invitationCode: string,
    userId: string,
  ): Promise<void> {
    return
  }

  async enrollUser(
    invitation: Document<Invitation>,
    userId: string,
  ): Promise<void> {
    return
  }

  // Methods - Organizations

  async getOrganizations(): Promise<Array<Document<Organization>>> {
    return []
  }

  async getOrganization(
    organizationId: string,
  ): Promise<Document<Organization> | undefined> {
    return {
      id: organizationId,
      path: 'organizations/' + organizationId,
      content: {
        id: 'stanford',
        name: 'Stanford University',
        contactName: 'Alex Sandhu, MD',
        phoneNumber: '+1 (650) 493-5000',
        emailAddress: 'dothfteam@stanford.edu',
        ssoProviderId: 'oidc.stanford',
      },
    }
  }

  // Methods - User

  async getAllPatients(): Promise<Array<Document<User>>> {
    return []
  }

  async getUser(userId: string): Promise<Document<User>> {
    return {
      id: userId,
      path: 'users/' + userId,
      content: {
        type: UserType.clinician,
        dateOfBirth: new Date('1970-01-02'),
        clinician: 'mockClinician',
        dateOfEnrollment: new Date('2024-04-02'),
        invitationCode: '123',
        messagesSettings: {
          dailyRemindersAreActive: true,
          textNotificationsAreActive: true,
          medicationRemindersAreActive: true,
        },
      },
    }
  }

  async deleteUser(userId: string): Promise<void> {
    return
  }
}
