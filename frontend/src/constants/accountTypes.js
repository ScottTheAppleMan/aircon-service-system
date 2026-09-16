// The only three values user3.topUser.accountType accepts. The database
// enforces this with CHK_user_accountType, so the spelling must match exactly.
export const ACCOUNT_TYPES = Object.freeze({
  CUSTOMER: 'Customer',
  ADMIN: 'Admin',
  TECHNICIAN: 'Technician',
})

// Where each role lands after logging in. The technician path matches the
// route already built on the billie-frontend branch.
export const ROLE_HOME_PATH = Object.freeze({
  [ACCOUNT_TYPES.CUSTOMER]: '/customer',
  [ACCOUNT_TYPES.ADMIN]: '/admin',
  [ACCOUNT_TYPES.TECHNICIAN]: '/technician/dashboard',
})

export function homePathFor(accountType) {
  return ROLE_HOME_PATH[accountType] || '/login'
}
