/** Superadmin is exclusively a signed custom claim — never an email list. */
export function isSuperadminClaim(claims: Record<string, unknown> | null | undefined): boolean {
  if (!claims) return false;
  return claims.role === 'superadmin' || claims.superadmin === true;
}
