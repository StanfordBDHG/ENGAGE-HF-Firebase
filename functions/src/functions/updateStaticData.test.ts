//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  CachingStrategy,
  LocalizedText,
  StaticDataComponent,
} from '@stanfordbdhg/engagehf-models'
import { expect } from 'chai'
import { it } from 'mocha'
import { _updateStaticData } from './updateStaticData.js'
import { describeWithEmulators } from '../tests/functions/testEnvironment.js'
import fs from 'fs'

describeWithEmulators('function: updateStaticData', (env) => {
  it('updates static data successfully', async () => {
    await _updateStaticData(env.factory, {
      only: Object.values(StaticDataComponent),
      cachingStrategy: CachingStrategy.expectCache,
    })

    const medicationClasses = await env.collections.medicationClasses.get()
    expect(medicationClasses.docs).to.have.length(7)
    const medicationClassesJson = JSON.parse(
      fs.readFileSync('data/medicationClasses.json', 'utf8'),
    )
    for (const medicationClass of medicationClasses.docs) {
      expect(simplify(medicationClass.data())).to.deep.equal(
        medicationClassesJson[medicationClass.id],
      )
    }
    const medications = await env.collections.medications.get()
    expect(medications.docs).to.have.length(35)

    const videoSections = await env.collections.videoSections.get()
    expect(videoSections.docs).to.have.length(4)

    const organizations = await env.collections.organizations.get()
    expect(organizations.docs).to.have.length(4)
    const organizationsJson = JSON.parse(
      fs.readFileSync('data/organizations.json', 'utf8'),
    )
    for (const organization of organizations.docs) {
      expect(simplify(organization.data())).to.deep.equal(
        organizationsJson[organization.id],
      )
    }

    const questionnaires = await env.collections.questionnaires.get()
    expect(questionnaires.docs).to.have.length(1)
    const questionnairesJson = JSON.parse(
      fs.readFileSync('data/questionnaires.json', 'utf8'),
    )
    for (const questionnaire of questionnaires.docs) {
      expect(simplify(questionnaire.data())).to.deep.equal(
        questionnairesJson[questionnaire.id],
      )
    }
  })
})

function simplify(data: unknown): unknown {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (value instanceof LocalizedText) {
        return value.content
      }
      return value
    }),
  )
}
