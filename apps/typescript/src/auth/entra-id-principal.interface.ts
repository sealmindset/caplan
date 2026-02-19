export interface EntraIdClaim {
  readonly typ: string
  readonly val: string
}

export interface EntraIdPrincipal {
  readonly auth_typ: string
  readonly claims: readonly EntraIdClaim[]
  readonly name_typ: string
  readonly role_typ: string
}

export interface AppUser {
  readonly objectId: string
  readonly name: string
  readonly email: string
  readonly roles: readonly string[]
}
