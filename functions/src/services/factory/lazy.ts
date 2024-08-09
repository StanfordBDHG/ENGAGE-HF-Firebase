//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

export class Lazy<T> {
  private factory: (() => T) | null
  private value: T | null = null

  constructor(factory: () => T) {
    this.factory = factory
  }

  get(): T {
    if (this.value === null) {
      this.value = this.factory?.() ?? null
      this.factory = null
    }
    return this.value! // eslint-disable-line @typescript-eslint/no-non-null-assertion
  }

  set(value: T): void {
    this.value = value
    this.factory = null
  }
}
