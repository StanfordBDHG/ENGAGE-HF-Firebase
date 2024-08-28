//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  CachingStrategy,
  StaticDataComponent,
} from '@stanfordbdhg/engagehf-models'
import { expect } from 'chai'
import { it } from 'mocha'
import { _updateStaticData } from './updateStaticData.js'
import { describeWithEmulators } from '../tests/functions/testEnvironment.js'

describeWithEmulators('function: updateStaticData', (env) => {
  it('updates static data successfully', async () => {
    await _updateStaticData(env.factory, {
      only: Object.values(StaticDataComponent),
      cachingStrategy: CachingStrategy.expectCache,
    })

    const medicationClasses = await env.collections.medicationClasses.get()
    expect(medicationClasses.docs).to.have.length(7)

    const medications = await env.collections.medications.get()
    expect(medications.docs).to.have.length(35)

    const videoSections = await env.collections.videoSections.get()
    expect(videoSections.docs).to.have.length(4)

    const organizations = await env.collections.organizations.get()
    expect(organizations.docs).to.have.length(4)

    const questionnaires = await env.collections.questionnaires.get()
    expect(questionnaires.docs).to.have.length(1)
  })
})
