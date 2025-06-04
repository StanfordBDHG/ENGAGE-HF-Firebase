//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { UserMessageType, UserType } from '@stanfordbdhg/engagehf-models'
import { createKccqQuestionnaireResponse } from './createKccqQuestionnaireResponse.js'
import { _defaultSeed } from '../../functions/defaultSeed.js'
import { onUserQuestionnaireResponseWritten } from '../../functions/onUserDocumentWritten.js'
import { _updateStaticData } from '../../functions/updateStaticData.js'
import { describeWithEmulators } from '../../tests/functions/testEnvironment.js'

describeWithEmulators('KccqQuestionnaireResponseService', (env) => {
  it('should be able to extract the kccq response from an Apple device', async () => {
    const userId = await env.createUser({
      type: UserType.patient,
      organization: 'stanford',
    })

    const questionnaireResponse = createKccqQuestionnaireResponse({
      questionnaire:
        'http://spezi.health/fhir/questionnaire/9528ccc2-d1be-4c4c-9c3c-19f78e51ec19',
      questionnaireResponse: 'questionnaireResponse',
      date: new Date(),
      answer1a: 1,
      answer1b: 2,
      answer1c: 4,
      answer2: 2,
      answer3: 1,
      answer4: 2,
      answer5: 3,
      answer6: 4,
      answer7: 2,
      answer8a: 1,
      answer8b: 2,
      answer8c: 1,
      answer9: 3,
    })

    const ref = env.collections.userQuestionnaireResponses(userId).doc()
    await env.setWithTrigger(onUserQuestionnaireResponseWritten, {
      ref,
      data: questionnaireResponse,
      params: {
        userId,
        questionnaireResponseId: ref.id,
      },
    })

    const symptomScores = await env.collections.userSymptomScores(userId).get()
    expect(symptomScores.size).toBe(1)
    const symptomScore = symptomScores.docs[0].data()
    expect(symptomScore).toBeDefined()
    expect(symptomScore.overallScore).toBeCloseTo(28.6458, 4)
    expect(symptomScore.socialLimitsScore).toBeCloseTo(8.33333, 4)
    expect(symptomScore.physicalLimitsScore).toBeCloseTo(33.33333, 4)
    expect(symptomScore.qualityOfLifeScore).toBeCloseTo(50, 4)
    expect(symptomScore.symptomFrequencyScore).toBeCloseTo(22.91666, 4)
    expect(symptomScore.dizzinessScore).toBe(3)
  })

  it('should notify the study coordinator about a lower score', async () => {
    const clinicianId = await env.createUser({
      type: UserType.clinician,
      organization: 'stanford',
    })

    const userId = await env.createUser({
      type: UserType.patient,
      organization: 'stanford',
      clinician: clinicianId,
      displayName: 'Test User',
    })

    const questionnaireResponse0 = createKccqQuestionnaireResponse({
      questionnaire:
        'http://spezi.health/fhir/questionnaire/9528ccc2-d1be-4c4c-9c3c-19f78e51ec19',
      questionnaireResponse: 'questionnaireResponse',
      date: new Date(),
      answer1a: 5,
      answer1b: 4,
      answer1c: 4,
      answer2: 3,
      answer3: 4,
      answer4: 4,
      answer5: 3,
      answer6: 4,
      answer7: 3,
      answer8a: 4,
      answer8b: 2,
      answer8c: 3,
      answer9: 3,
    })

    const ref0 = env.collections.userQuestionnaireResponses(userId).doc()
    await env.setWithTrigger(onUserQuestionnaireResponseWritten, {
      ref: ref0,
      data: questionnaireResponse0,
      params: {
        userId,
        questionnaireResponseId: ref0.id,
      },
    })

    const questionnaireResponse1 = createKccqQuestionnaireResponse({
      questionnaire:
        'http://spezi.health/fhir/questionnaire/9528ccc2-d1be-4c4c-9c3c-19f78e51ec19',
      questionnaireResponse: 'questionnaireResponse',
      date: new Date(),
      answer1a: 1,
      answer1b: 2,
      answer1c: 4,
      answer2: 2,
      answer3: 1,
      answer4: 2,
      answer5: 3,
      answer6: 4,
      answer7: 2,
      answer8a: 1,
      answer8b: 2,
      answer8c: 1,
      answer9: 3,
    })

    const ref1 = env.collections.userQuestionnaireResponses(userId).doc()
    await env.setWithTrigger(onUserQuestionnaireResponseWritten, {
      ref: ref1,
      data: questionnaireResponse1,
      params: {
        userId,
        questionnaireResponseId: ref1.id,
      },
    })

    const symptomScores = await env.collections.userSymptomScores(userId).get()
    expect(symptomScores.size).toBe(2)

    const clinicianMessages = await env.collections
      .userMessages(clinicianId)
      .get()
    expect(clinicianMessages.size).toBe(2)

    const medicationUptitrationMessage = clinicianMessages.docs
      .find((doc) => doc.data().type === UserMessageType.medicationUptitration)
      ?.data()
    expect(medicationUptitrationMessage).toBeDefined()
    expect(
      medicationUptitrationMessage?.description
        ?.localize()
        .startsWith('Test User'),
    ).toBe(true)

    const kccqDeclineMessage = clinicianMessages.docs
      .find((doc) => doc.data().type === UserMessageType.kccqDecline)
      ?.data()
    expect(kccqDeclineMessage).toBeDefined()
    expect(kccqDeclineMessage?.reference).toBe(ref1.id)
    expect(
      kccqDeclineMessage?.description?.localize().startsWith('Test User'),
    ).toBe(true)
  })
})
