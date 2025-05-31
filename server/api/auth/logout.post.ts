export default defineEventHandler(async (event) => {
  // Clear the auth cookie
  setCookie(event, 'auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0 // Expire immediately
  })
  
  return {
    message: 'Logged out successfully'
  }
})