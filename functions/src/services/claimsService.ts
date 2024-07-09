import { type Auth } from 'firebase-admin/auth'
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

class ClaimsService {
  // Properties

  private auth: Auth

  // Constructor

  constructor(auth: Auth) {
    this.auth = auth
  }

  // Methods - Checks

  async ensureOwner(userId: string, organizationId: string) {
    const roles = await this.getRolesForUser(userId)
    if (roles.includes(UserRoleKey.admin)) return
    if (roles.includes(this.ownerRole(organizationId))) return
    throw new Error('User is not an owner')
  }

  async ensureClinician(userId: string, organizationId: string) {
    const roles = await this.getRolesForUser(userId)
    if (roles.includes(UserRoleKey.admin)) return
    if (roles.includes(this.ownerRole(organizationId))) return
    if (roles.includes(this.clinicianRole(organizationId))) return
    throw new Error('User is not a clinician')
  }

  async ensurePatient(userId: string, organizationId: string) {
    const roles = await this.getRolesForUser(userId)
    if (roles.includes(UserRoleKey.admin)) return
    if (roles.includes(this.ownerRole(organizationId))) return
    if (roles.includes(this.clinicianRole(organizationId))) return
    if (roles.includes(this.patientRole(organizationId))) return
    throw new Error('User is not a patient')
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

  private async getRolesForUser(userId: string) {
    const user = await this.auth.getUser(userId)
    const claims = (user.customClaims ?? {}) as UserClaims
    return claims.roles ?? []
  }

  private async setRolesForUser(roles: string[], userId: string) {
    const claims: UserClaims = { roles }
    await this.auth.setCustomUserClaims(userId, claims)
  }
}
