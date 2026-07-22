//
// This source file is part of the Stanford ENGAGE-HF project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

describe("setup", () => {
  it("should always be using UTC timezone", () => {
    expect(new Date().getTimezoneOffset()).toBe(0);
  });
});
