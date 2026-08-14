//
// This source file is part of the ENGAGE-HF Firebase open-source project
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
    await func();
    fail("Expected an error to be thrown");
  } catch (error) {
    check(error);
  }
}
