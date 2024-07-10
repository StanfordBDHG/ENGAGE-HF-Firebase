import admin from 'firebase-admin'
import { type Auth } from 'firebase-admin/auth'
import { type AuthData } from 'firebase-functions/v2/tasks'
import { FirestoreService } from './database/firestoreService.js'

enum UserRoleKey {
  admin = 'admin',
  owner = 'owner',
  clinician = 'clinician',
  patient = 'patient',
}

interface UserClaims {
  roles?: string[]
}

export class ClaimsService {
  // Properties

  private auth: Auth

  // Constructor

  constructor(auth: Auth = admin.auth()) {
    this.auth = auth
  }

  // Methods - Checks

  ensureAdmin(authData: AuthData | undefined) {
    const roles = this.getRolesForUser(authData)
    if (roles.includes(UserRoleKey.admin)) return
    throw new Error('User is not an admin')
  }

  ensureOwner(authData: AuthData | undefined, organizationId: string) {
    const roles = this.getRolesForUser(authData)
    if (roles.includes(UserRoleKey.admin)) return
    if (roles.includes(this.ownerRole(organizationId))) return
    throw new Error('User is not an owner')
  }

  ensureClinician(authData: AuthData | undefined, organizationId: string) {
    const roles = this.getRolesForUser(authData)
    if (roles.includes(UserRoleKey.admin)) return
    if (roles.includes(this.ownerRole(organizationId))) return
    if (roles.includes(this.clinicianRole(organizationId))) return
    throw new Error('User is not a clinician')
  }

  ensurePatient(authData: AuthData | undefined, organizationId: string) {
    const roles = this.getRolesForUser(authData)
    if (roles.includes(UserRoleKey.admin)) return
    if (roles.includes(this.ownerRole(organizationId))) return
    if (roles.includes(this.clinicianRole(organizationId))) return
    if (roles.includes(this.patientRole(organizationId))) return
    throw new Error('User is not a patient')
  }

  ensureAuthenticated(authData: AuthData | undefined) {
    this.getRolesForUser(authData)
  }

  // Methods - Update Claims

  async updateClaims(userId: string) {
    const firestoreService = new FirestoreService()
    const roles: string[] = []

    const organizations = await firestoreService.getOrganizations()
    for (const organization of organizations) {
      const content = organization.content
      if (content?.owners.includes(userId) ?? false) {
        roles.push(this.ownerRole(organization.id))
      }
    }

    const clinician = await firestoreService.getClinician(userId)
    if (clinician.content?.organization) {
      roles.push(this.clinicianRole(clinician.content.organization))
    }

    const user = await firestoreService.getUser(userId)
    if (user.content?.organization) {
      roles.push(this.patientRole(user.content.organization))
    }

    await this.setRolesForUser(roles, userId)
  }

  // Methods - Roles

  private ownerRole(organizationId: string) {
    return `${UserRoleKey.owner}:${organizationId}`
  }

  private clinicianRole(organizationId: string) {
    return `${UserRoleKey.clinician}:${organizationId}`
  }

  private patientRole(organizationId: string) {
    return `${UserRoleKey.patient}:${organizationId}`
  }

  // Methods - Access Roles

  private getRolesForUser(authData: AuthData | undefined) {
    const roles = authData?.token.roles // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    if (!roles || !Array.isArray(roles)) throw new Error('User has no roles')
    return roles as string[]
  }

  private async setRolesForUser(roles: string[], userId: string) {
    const claims: UserClaims = { roles }
    await this.auth.setCustomUserClaims(userId, claims)
  }
}
