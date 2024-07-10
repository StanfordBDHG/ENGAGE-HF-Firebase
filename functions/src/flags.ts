/* eslint-disable @typescript-eslint/no-namespace */

export namespace Flags {
  export const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true'
}
