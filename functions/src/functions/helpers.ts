//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

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
import { type TypeOf, z, type ZodType } from 'zod'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */

export function validatedOnCall<
  Schema extends ZodType<any, any, any>,
  Return = any | Promise<any>,
>(
  schema: Schema,
  handler: (request: CallableRequest<z.output<Schema>>) => Return,
): CallableFunction<
  z.output<Schema>,
  Return extends Promise<unknown> ? Return : Promise<Return>
> {
  return onCall((request) => {
    try {
      request.data = schema.parse(request.data) as TypeOf<Schema>
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
  Schema extends ZodType<any, any, any>,
  Return = any | Promise<any>,
>(
  schema: Schema,
  options: CallableOptions,
  handler: (request: CallableRequest<z.output<Schema>>) => Return,
): CallableFunction<
  z.output<Schema>,
  Return extends Promise<unknown> ? Return : Promise<Return>
> {
  return onCall(options, (request) => {
    try {
      request.data = schema.parse(request.data) as z.output<Schema>
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

export function validatedOnRequest<Schema extends ZodType<any, any, any>>(
  schema: Schema,
  handler: (
    request: Request,
    data: z.output<Schema>,
    response: Response,
  ) => void | Promise<void>,
): https.HttpsFunction {
  return onRequest(async (request, response) => {
    try {
      const data = schema.parse(request.body) as z.output<Schema>
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

export function validatedOnRequestWithOptions<
  Schema extends ZodType<any, any, any>,
>(
  schema: Schema,
  options: https.HttpsOptions,
  handler: (
    request: Request,
    data: z.output<Schema>,
    response: Response,
  ) => void | Promise<void>,
): https.HttpsFunction {
  return onRequest(options, async (request, response) => {
    try {
      const data = schema.parse(request.body) as z.output<Schema>
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
