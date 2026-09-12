// Dummy accounts used until the Azure SQL database is connected.
//
// Every response here copies the real controller in
// backend/src/controllers/authController.js exactly — same keys, same message
// strings, same status meanings — so deleting this file later changes nothing
// in the components that consume it.

import { ACCOUNT_TYPES } from '../constants/accountTypes'
import { ApiError } from './client'

const NETWORK_DELAY_MS = 400

// user_ID / customer_ID values imitate the IDENTITY(1,1) columns in
// sql_codes_Tables.txt. Passwords are plain text here only because there is no
// database yet; the real backend stores a bcrypt salt and hash.
const MOCK_USERS = [
  {
    user_ID: 1,
    username: 'customer',
    password: 'password123',
    accountType: ACCOUNT_TYPES.CUSTOMER,
    customer_name: 'Sarah Tan',
    customer_address: 'Blk 512 Ang Mo Kio Ave 8, #07-142, Singapore 560512',
  },
  {
    user_ID: 2,
    username: 'admin',
    password: 'password123',
    accountType: ACCOUNT_TYPES.ADMIN,
    admin_name: 'Meet Ashar',
  },
  {
    user_ID: 3,
    username: 'technician',
    password: 'password123',
    accountType: ACCOUNT_TYPES.TECHNICIAN,
    technician_name: 'Ahmad Razali',
  },
]

// Accounts registered during this browser session. Cleared on refresh, which
// matches having no database behind the screen yet.
const sessionUsers = []

let nextUserId = MOCK_USERS.length + 1
let nextCustomerId = 1

function delay() {
  return new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))
}

function findUser(username) {
  return [...MOCK_USERS, ...sessionUsers].find(
    (user) => user.username.toLowerCase() === username.trim().toLowerCase(),
  )
}

// Mirrors jwt.sign(...) closely enough to store and send, but it is not signed
// and carries no authority. Nothing may trust this value.
function fakeToken(user) {
  const claims = { user_ID: user.user_ID, accountType: user.accountType, mock: true }
  return `mock.${btoa(JSON.stringify(claims))}.unsigned`
}

export async function login({ username, password }) {
  await delay()

  if (!username || !password) {
    throw new ApiError('Username and password required.', 400)
  }

  const user = findUser(username)

  // One message for both cases, so the form cannot be used to discover which
  // usernames exist. The real controller does the same.
  if (!user || user.password !== password) {
    throw new ApiError('Invalid username or password.', 400)
  }

  return {
    success: true,
    message: 'Login successful!',
    token: fakeToken(user),
    user: {
      user_ID: user.user_ID,
      username: user.username,
      accountType: user.accountType,
    },
  }
}

export async function register({ username, password, customer_name, customer_address }) {
  await delay()

  if (!username || !password || !customer_name) {
    throw new ApiError('Please fill in all required fields.', 400)
  }

  // Stands in for CONSTRAINT UQ_user_username on user3.topUser.
  if (findUser(username)) {
    throw new ApiError('That username is already taken.', 400)
  }

  const user = {
    user_ID: nextUserId++,
    username: username.trim(),
    password,
    accountType: ACCOUNT_TYPES.CUSTOMER,
    customer_name,
    customer_address: customer_address || '',
  }
  sessionUsers.push(user)

  // register does not return a token — the real controller does not either, so
  // the user is sent to the login screen afterwards.
  return {
    success: true,
    message: 'Customer account registered successfully!',
    user_ID: user.user_ID,
    customer_ID: nextCustomerId++,
  }
}

export const MOCK_CREDENTIALS = MOCK_USERS.map(({ username, password, accountType }) => ({
  username,
  password,
  accountType,
}))
