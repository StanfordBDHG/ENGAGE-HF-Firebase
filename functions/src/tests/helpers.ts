//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

export async function expectError<T>(
  func: () => T | Promise<T>,
  check: (error: unknown) => void,
): Promise<void> {
  try {
    await func()
    fail('Expected an error to be thrown')
  } catch (error) {
    check(error)
  }
}
