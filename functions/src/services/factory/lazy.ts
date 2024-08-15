//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

export class Lazy<T> {
  private _factory: (() => T) | null
  private _value: T | null = null

  constructor(factory: () => T) {
    this._factory = factory
  }

  get value(): T {
    if (this._value === null) {
      this._value = this._factory?.() ?? null
      this._factory = null
    }
    return this._value! // eslint-disable-line @typescript-eslint/no-non-null-assertion
  }

  set value(value: T) {
    this._value = value
    this._factory = null
  }
}
