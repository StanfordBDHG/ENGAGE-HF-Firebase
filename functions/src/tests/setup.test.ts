import { expect } from 'chai'

describe('setup', () => {
  it('should always be using UTC timezone', () => {
    expect(new Date().getTimezoneOffset()).to.equal(0)
  })
})
