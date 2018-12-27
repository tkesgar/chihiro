/* eslint-env jest */
const {errorToResponse, resultToResponse} = require('../lib/response')

describe('errorToResponse', () => {
  test('no id', () => {
    const error = {}
    expect(errorToResponse(error)).toBe(undefined)
  })

  test('empty object', () => {
    const error = {}
    expect(() => errorToResponse(error, 'foo')).toThrow()
  })

  test('no code', () => {
    const error = {
      message: 'An error has occured'
    }
    expect(() => errorToResponse(error, 'foo')).toThrow()
  })

  test('no message', () => {
    const error = {
      code: 100
    }
    expect(() => errorToResponse(error, 'foo')).toThrow()
  })

  test('with id', () => {
    const error = {
      code: 100,
      message: 'An error has occured'
    }

    expect(errorToResponse(error, 'foo')).toMatchSnapshot()
  })

  test('with data', () => {
    const error = {
      code: 100,
      message: 'An error has occured',
      data: {
        key: 'abc',
        value: 123
      }
    }

    expect(errorToResponse(error, 'foo')).toMatchSnapshot()
  })

  test('with falsy data', () => {
    const error = {
      code: 100,
      message: 'An error has occured',
      data: null
    }

    expect(errorToResponse(error, 'foo')).toMatchSnapshot()
  })
})

describe('resultToResponse', () => {
  test('no id', () => {
    const result = {
      key: 'abc',
      value: 123
    }

    expect(resultToResponse(result)).toBe(undefined)
  })

  test('with id', () => {
    const result = {
      key: 'abc',
      value: 123
    }

    expect(resultToResponse(result, 'foo')).toMatchSnapshot()
  })
})
