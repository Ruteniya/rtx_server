export type JwtUser = {
  id: string
  role: string
  groupId?: string
}

export type AuthJwtPayload = {
  sub: JwtUser
}
