//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  Invitation,
  UserAuth,
  UserMessageType,
  UserRegistration,
  UserType,
} from '@stanfordbdhg/engagehf-models'
import { checkInvitationCode } from './checkInvitationCode.js'
import { describeWithEmulators } from '../tests/functions/testEnvironment.js'
import { expect } from 'chai'

describeWithEmulators(
  'function: createInvitation',
  { triggersEnabled: true },
  async (env) => {
    it('should allow a user to create an invitation', async () => {
      const user = await env.auth.createUser({})

      const invitation = new Invitation({
        auth: new UserAuth({
          email: 'engagehf-test@stanford.edu',
        }),
        code: 'TESTCODE',
        user: new UserRegistration({
          type: UserType.patient,
          organization: 'stanford',
          receivesAppointmentReminders: true,
          receivesMedicationUpdates: true,
          receivesQuestionnaireReminders: true,
          receivesRecommendationUpdates: true,
          receivesVitalsReminders: true,
          receivesWeightAlerts: true,
        }),
      })
      await env.collections.invitations.doc().set(invitation)

      await env.call(
        checkInvitationCode,
        { invitationCode: 'TESTCODE' },
        {
          uid: user.uid,
          token: {},
        },
      )

      const invitationDoc = await env.collections.invitations
        .where('code', '==', 'TESTCODE')
        .get()
      expect(invitationDoc.docs.at(0)?.data().userId).to.equal(user.uid)

      const userMessages = await env.collections.userMessages(user.uid).get()
      expect(userMessages.docs.length).to.equal(1)
      expect(userMessages.docs.at(0)?.data().type).to.equal(
        UserMessageType.welcome,
      )
    })
  },
)
