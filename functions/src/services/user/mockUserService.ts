import { type UserService } from './userService.js'
import { type Invitation } from '../../models/invitation.js'
import { type Organization } from '../../models/organization.js'
import { type Clinician, type Patient, type User } from '../../models/user.js'
import { type DatabaseDocument } from '../database/databaseService.js'

/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */

export class MockUserService implements UserService {
  // Methods - Invitations

  async getInvitation(
    invitationId: string,
  ): Promise<DatabaseDocument<Invitation>> {
    return {
      id: invitationId,
      content: {
        userId: 'test',
      },
    }
  }

  async getInvitationByUserId(
    userId: string,
  ): Promise<DatabaseDocument<Invitation> | undefined> {
    return {
      id: '123',
      content: {
        userId: userId,
      },
    }
  }

  async setInvitationUserId(
    invitationId: string,
    userId: string,
  ): Promise<void> {
    return
  }

  async enrollUser(invitationId: string, userId: string): Promise<void> {
    return
  }

  // Methods - Organizations

  async getOrganizations(): Promise<Array<DatabaseDocument<Organization>>> {
    return []
  }

  async getOrganization(
    organizationId: string,
  ): Promise<DatabaseDocument<Organization | undefined>> {
    return {
      id: organizationId,
      content: {
        id: 'stanford',
        name: 'Stanford University',
        contactName: 'Alex Sandhu, MD',
        phoneNumber: '+1 (650) 493-5000',
        emailAddress: 'dothfteam@stanford.edu',
        ssoProviderId: 'oidc.stanford',
        owners: [],
      },
    }
  }

  // Methods - User

  async getClinician(userId: string): Promise<DatabaseDocument<Clinician>> {
    return {
      id: userId,
      content: {},
    }
  }

  async getPatient(userId: string): Promise<DatabaseDocument<Patient>> {
    return {
      id: userId,
      content: {
        dateOfBirth: new Date('1970-01-02'),
        clinician: 'mockClinician',
      },
    }
  }

  async getUser(userId: string): Promise<DatabaseDocument<User>> {
    return {
      id: userId,
      content: {
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

  // Methods - Messages

  async dismissMessage(
    userId: string,
    messageId: string,
    didPerformAction: boolean,
  ): Promise<void> {
    return
  }
}
