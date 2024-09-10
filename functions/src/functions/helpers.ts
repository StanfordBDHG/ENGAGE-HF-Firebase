//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

import { logger, type Response } from 'firebase-functions'
import { https } from 'firebase-functions/v2'
import {
  type CallableFunction,
  type CallableOptions,
  type CallableRequest,
  onCall,
  onRequest,
  type Request,
} from 'firebase-functions/v2/https'
import { type TypeOf, z } from 'zod'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */

export function validatedOnCall<
  Schema extends z.Schema,
  Return = any | Promise<any>,
>(
  name: string,
  schema: Schema,
  handler: (request: CallableRequest<z.output<Schema>>) => Return,
): CallableFunction<
  z.input<Schema>,
  Return extends Promise<unknown> ? Return : Promise<Return>
> {
  return onCall((request) => {
    try {
      logger.debug(
        `onCall(${name}) from user '${request.auth?.uid}' with ${JSON.stringify(request.data)}`,
      )
      request.data = schema.parse(request.data) as TypeOf<Schema>
      return handler(request)
    } catch (error) {
      logger.debug(
        `onCall(${name}) from user '${request.auth?.uid}' failed with ${String(error)}.`,
      )
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
  Schema extends z.Schema,
  Return = any | Promise<any>,
>(
  name: string,
  schema: Schema,
  options: CallableOptions,
  handler: (request: CallableRequest<z.output<Schema>>) => Return,
): CallableFunction<
  z.output<Schema>,
  Return extends Promise<unknown> ? Return : Promise<Return>
> {
  return onCall(options, (request) => {
    try {
      logger.debug(
        `onCall(${name}) from user '${request.auth?.uid}' with ${JSON.stringify(request.data)}`,
      )
      request.data = schema.parse(request.data) as z.output<Schema>
      return handler(request)
    } catch (error) {
      logger.debug(
        `onCall(${name}) from user '${request.auth?.uid}' failed with ${String(error)}.`,
      )
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

export function validatedOnRequest<Schema extends z.Schema>(
  name: string,
  schema: Schema,
  handler: (
    request: Request,
    data: z.output<Schema>,
    response: Response,
  ) => void | Promise<void>,
): https.HttpsFunction {
  return onRequest(async (request, response) => {
    try {
      logger.debug(`onRequest(${name}) with ${JSON.stringify(request.body)}`)
      const data = schema.parse(request.body) as z.output<Schema>
      await handler(request, data, response)
      return
    } catch (error) {
      logger.debug(`onRequest(${name}) failed with ${String(error)}.`)
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

export function validatedOnRequestWithOptions<Schema extends z.Schema>(
  name: string,
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
      logger.debug(`onRequest(${name}) with ${JSON.stringify(request.body)}`)
      const data = schema.parse(request.body) as z.output<Schema>
      await handler(request, data, response)
      return
    } catch (error) {
      logger.debug(`onRequest(${name}) failed with ${String(error)}.`)
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
