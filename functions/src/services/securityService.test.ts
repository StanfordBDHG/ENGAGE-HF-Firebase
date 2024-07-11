import { expect } from 'chai'
import { type AuthData } from 'firebase-functions/v2/tasks'
import { describe } from 'mocha'
import { SecurityService } from './securityService.js'
import { setupMockFirestore } from '../tests/setup.js'

describe('SecurityService', () => {
  const mockFirestore = setupMockFirestore()
  const service = new SecurityService()

  function createAuthData(userId: string): AuthData {
    return { uid: userId } as AuthData
  }

  const adminAuth = createAuthData('mockAdmin')
  const ownerAuth = createAuthData('mockOwner')
  const clinicianAuth = createAuthData('mockClinician')
  const userAuth = createAuthData('mockUser')
  const organizationId = 'mockOrganization'

  beforeEach(() => {
    mockFirestore.collections = {
      admins: {
        mockAdmin: {},
      },
      clinicians: {
        mockClinician: {
          organization: 'mockOrganization',
        },
      },
      organizations: {
        mockOrganization: {
          owners: ['mockOwner'],
        },
      },
      users: {
        mockUser: {
          organization: 'mockOrganization',
        },
      },
    }
  })

  it('correctly understands whether a user is an admin', async () => {
    const isAdmin = await service.isAdmin(adminAuth)
    expect(isAdmin).to.be.true

    const isOwner = await service.isAdmin(ownerAuth)
    expect(isOwner).to.be.false

    const isClinician = await service.isAdmin(clinicianAuth)
    expect(isClinician).to.be.false

    const isUser = await service.isAdmin(userAuth)
    expect(isUser).to.be.false
  })

  it('correctly understands whether a user is an owner', async () => {
    const isAdmin = await service.isOwner(adminAuth, organizationId)
    expect(isAdmin).to.be.false

    const isOwner = await service.isOwner(ownerAuth, organizationId)
    expect(isOwner).to.be.true

    const isOwnerOtherOrg = await service.isOwner(
      ownerAuth,
      'otherOrganizationId',
    )
    expect(isOwnerOtherOrg).to.be.false

    const isClinician = await service.isOwner(clinicianAuth, organizationId)
    expect(isClinician).to.be.false

    const isClinicianOtherOrg = await service.isOwner(
      clinicianAuth,
      'otherOrganizationId',
    )
    expect(isClinicianOtherOrg).to.be.false

    const isUser = await service.isOwner(userAuth, organizationId)
    expect(isUser).to.be.false
  })

  it('correctly understands whether a user is a clinician', async () => {
    const isAdmin = await service.isClinician(adminAuth, organizationId)
    expect(isAdmin).to.be.false

    const isOwner = await service.isClinician(ownerAuth, organizationId)
    expect(isOwner).to.be.false

    const isOwnerOtherOrg = await service.isClinician(
      ownerAuth,
      'otherOrganizationId',
    )
    expect(isOwnerOtherOrg).to.be.false

    const isClinician = await service.isClinician(clinicianAuth, organizationId)
    expect(isClinician).to.be.true

    const isClinicianOtherOrg = await service.isClinician(
      clinicianAuth,
      'otherOrganizationId',
    )
    expect(isClinicianOtherOrg).to.be.false

    const isUser = await service.isClinician(userAuth, organizationId)
    expect(isUser).to.be.false
  })

  it('correctly understands whether a user is a clinician', () => {
    const isAdmin = service.isUser(adminAuth, userAuth.uid)
    expect(isAdmin).to.be.false

    const isOwner = service.isUser(ownerAuth, userAuth.uid)
    expect(isOwner).to.be.false

    const isClinician = service.isUser(clinicianAuth, userAuth.uid)
    expect(isClinician).to.be.false

    const isUser = service.isUser(userAuth, userAuth.uid)
    expect(isUser).to.be.true
  })
})
