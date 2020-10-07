import { decode } from 'jsonwebtoken'

import { JwtPayload } from './JwtPayload'

/**
 * Parse a authorization and return a user id
 * @param authorization authorization Header to parse
 * @returns a user id from the authorization
 */
export function parseUserId(authorization: string): string {
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}
