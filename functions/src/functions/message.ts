import { https } from 'firebase-functions'
import { type CallableRequest, onCall } from 'firebase-functions/v2/https'
import { FirestoreService } from '../services/database/firestoreService'

export interface DidTapMessageInput {
  messageId?: string
  didPerformAction?: boolean
}

export const didTapMessageFunction = onCall(
  async (request: CallableRequest<DidTapMessageInput>) => {
    if (!request.auth?.uid)
      throw new https.HttpsError(
        'unauthenticated',
        'User is not properly authenticated.',
      )

    const userId = request.auth.uid
    const { messageId, didPerformAction } = request.data
    if (!messageId)
      throw new https.HttpsError('invalid-argument', 'Message ID is required')

    try {
      const service = new FirestoreService()
      await service.didTapMessage(userId, messageId, didPerformAction ?? false)
    } catch (error) {
      console.error(error)
      throw new https.HttpsError('internal', 'Internal server error.')
    }
  },
)
