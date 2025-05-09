//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import {
  UserDevice,
  userDeviceConverter,
  UserDevicePlatform,
} from '@stanfordbdhg/engagehf-models'
import { describeWithEmulators } from '../../tests/functions/testEnvironment.js'

describeWithEmulators('DatabaseHistoryService', (env) => {
  const device = new UserDevice({
    notificationToken: 'token',
    platform: UserDevicePlatform.iOS,
  })

  it('should record a change', async () => {
    const service = env.factory.history()
    const change = env.createChange(
      'users/123/devices/1',
      undefined,
      userDeviceConverter.value.encode(device),
    )
    await service.recordChange(change)

    const historyItems = await env.collections.history.get()
    expect(historyItems.docs).toHaveLength(1)

    const historyItem = historyItems.docs[0].data()
    expect(historyItem.data).toStrictEqual(
      userDeviceConverter.value.encode(device),
    )
  })
})
