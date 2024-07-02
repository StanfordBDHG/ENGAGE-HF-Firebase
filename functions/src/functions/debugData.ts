import { onRequest } from 'firebase-functions/v2/https'

export const buildDebugDataFunction = onRequest((_, res) => {
  res.write('Success', 'utf8')
  res.end()
})
