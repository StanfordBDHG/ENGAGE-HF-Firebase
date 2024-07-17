import { type UserRecord } from 'firebase-admin/auth'
import { type CallableRequest, onCall } from 'firebase-functions/v2/https'
import { type Result } from './types.js'
import { type Patient } from '../models/patient.js'

export interface GetAuthenticationsInput {
  userIds?: string[]
}

export type GetAuthenticationsOutput = Record<string, Result<UserRecord>>

export const getAuthenticationsFunction = onCall(
  async (request: CallableRequest<GetAuthenticationsInput>) => {},
)

export interface UpdateAuthenticationInput {
  userId?: string
  data?: UserRecord
}

export const updateAuthenticationFunction = onCall(
  async (request: CallableRequest<UpdateAuthenticationInput>) => {},
)

export interface DeleteUserInput {
  userId?: string
}

export const deleteUserFunction = onCall(
  async (request: CallableRequest<DeleteUserInput>) => {},
)

export interface CreateClinicianInvitationInput {}

export const createClinicianInvitationFunction = onCall(
  async (request: CallableRequest<CreateClinicianInvitationInput>) => {},
)

export interface CreatePatientInvitationInput {
  data?: Patient
}

export const createPatientInvitationFunction = onCall(
  async (request: CallableRequest<CreatePatientInvitationInput>) => {},
)

export interface MakeOwnerInput {
  userId?: string
  organizationId?: string
}

export const makeOwnerFunction = onCall(
  async (request: CallableRequest<MakeOwnerInput>) => {},
)

export interface RemoveOwnerInput {
  userId?: string
  organizationId?: string
}

export const removeOwnerFunction = onCall(
  async (request: CallableRequest<RemoveOwnerInput>) => {},
)

export interface MakeAdminInput {
  userId?: string
}

export const makeAdminFunction = onCall(
  async (request: CallableRequest<MakeAdminInput>) => {},
)

export const removeAdminFunction = onCall(
  async (request: CallableRequest<MakeAdminInput>) => {},
)
