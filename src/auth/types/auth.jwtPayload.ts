export type AuthJwtPayload = {
  sub: {
    id: string
    role: string
    groupId?: string
  }
}
