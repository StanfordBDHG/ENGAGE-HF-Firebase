import { type BlockingFunction } from 'firebase-functions'
import { https, logger } from 'firebase-functions/v2'
import { type CallableRequest, onCall } from 'firebase-functions/v2/https'
import {
  type AuthBlockingEvent,
  beforeUserCreated,
} from 'firebase-functions/v2/identity'
import { FirestoreService } from '../services/database/firestoreService.js'

export interface InvitationCodeInput {
  invitationCode: string
}

export const checkInvitationCodeFunction = onCall(
  async (request: CallableRequest<InvitationCodeInput>) => {
    if (!request.auth?.uid) {
      throw new https.HttpsError(
        'unauthenticated',
        'User is not properly authenticated.',
      )
    }

    const userId = request.auth.uid
    const { invitationCode } = request.data

    const service = new FirestoreService()
    logger.debug(
      `User (${userId}) -> ENGAGE-HF, InvitationCode ${invitationCode}`,
    )

    try {
      await service.enrollUser(invitationCode, userId)

      logger.debug(
        `User (${userId}) successfully enrolled in study (ENGAGE-HF) with invitation code: ${invitationCode}`,
      )

      return {}
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error processing request: ${error.message}`)
        if ('code' in error) {
          throw new https.HttpsError('internal', 'Internal server error.')
        }
      } else {
        logger.error(`Unknown error: ${String(error)}`)
      }
      throw error
    }
  },
)

export const beforeUserCreatedFunction: BlockingFunction = beforeUserCreated(
  async (event: AuthBlockingEvent) => {
    const service = new FirestoreService()
    const userId = event.data.uid

    try {
      // Check Firestore to confirm whether an invitation code has been associated with a user.
      const invitation = await service.getInvitationUsedBy(userId)

      if (!invitation) {
        throw new https.HttpsError(
          'not-found',
          `No valid invitation code found for user ${userId}.`,
        )
      }

      const user = await service.getUser(userId)

      // Check if the user document contains the correct invitation code.
      if (user.content?.invitationCode !== invitation.id) {
        throw new https.HttpsError(
          'failed-precondition',
          'User document does not exist or contains incorrect invitation code.',
        )
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error processing request: ${error.message}`)
        if ('code' in error) {
          throw new https.HttpsError('internal', 'Internal server error.')
        }
      } else {
        logger.error(`Unknown error: ${String(error)}`)
      }
      throw error
    }
  },
)
