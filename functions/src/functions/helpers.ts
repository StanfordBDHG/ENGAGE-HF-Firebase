import { type Response } from 'firebase-functions'
import { https } from 'firebase-functions/v2'
import {
  type CallableFunction,
  type CallableOptions,
  type CallableRequest,
  onCall,
  onRequest,
  type Request,
} from 'firebase-functions/v2/https'
import { z } from 'zod'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */

export function validatedOnCall<T = any, Return = any | Promise<any>>(
  schema: z.ZodType<T>,
  handler: (request: CallableRequest<T>) => Return,
): CallableFunction<
  T,
  Return extends Promise<unknown> ? Return : Promise<Return>
> {
  return onCall((request) => {
    try {
      schema.parse(request.data)
      return handler(request)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new https.HttpsError(
          'invalid-argument',
          'Invalid request data',
          error.errors,
        )
      }
      throw error
    }
  })
}

export function validatedOnCallWithOptions<
  T = any,
  Return = any | Promise<any>,
>(
  schema: z.ZodType<T>,
  options: CallableOptions,
  handler: (request: CallableRequest<T>) => Return,
): CallableFunction<
  T,
  Return extends Promise<unknown> ? Return : Promise<Return>
> {
  return onCall(options, (request) => {
    try {
      schema.parse(request.data)
      return handler(request)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new https.HttpsError(
          'invalid-argument',
          'Invalid request data',
          error.errors,
        )
      }
      throw error
    }
  })
}

export function validatedOnRequest<T>(
  schema: z.ZodType<T>,
  handler: (
    request: Request,
    data: T,
    response: Response,
  ) => void | Promise<void>,
): https.HttpsFunction {
  return onRequest(async (request, response) => {
    try {
      const data = schema.parse(request.body)
      await handler(request, data, response)
      return
    } catch (error) {
      if (error instanceof z.ZodError) {
        response.status(400).send({
          code: 'invalid-argument',
          message: 'Invalid request data',
          details: error.errors,
        })
        return
      }
      throw error
    }
  })
}

export function validatedOnRequestWithOptions<T>(
  schema: z.ZodType<T>,
  options: https.HttpsOptions,
  handler: (
    request: Request,
    data: T,
    response: Response,
  ) => void | Promise<void>,
): https.HttpsFunction {
  return onRequest(options, async (request, response) => {
    try {
      const data = schema.parse(request.body)
      await handler(request, data, response)
      return
    } catch (error) {
      if (error instanceof z.ZodError) {
        response.status(400).send({
          code: 'invalid-argument',
          message: 'Invalid request data',
          details: error.errors,
        })
        return
      }
      throw error
    }
  })
}
