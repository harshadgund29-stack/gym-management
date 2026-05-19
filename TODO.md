# TODO — Forgot Password OTP Verification & Reset Password (Frontend)

## Frontend
- [ ] Fix `frontend/src/services/authService.js` endpoints to call:
  - [x] `/api/users/forgot-password`
  - [ ] `/api/users/verify-otp`
  - [ ] `/api/users/reset-password`
- [ ] Add `frontend/src/pages/VerifyOtpPage.jsx` (email + OTP → verify → navigate to reset page)
- [ ] Refactor `frontend/src/pages/ResetPasswordPage.jsx`:
  - [ ] Use `email` query param (no reset-link token)
  - [ ] On submit call `POST /api/users/reset-password` with `{ email, newPassword }`
  - [ ] Success message: “Password reset successful. Please log in with your new password.”
  - [ ] Error message: “Password reset failed.”
- [ ] Update `frontend/src/pages/ForgotPasswordPage.jsx`:
  - [ ] When OTP is sent, add navigation to OTP verification page carrying email
- [ ] Register route in `frontend/src/App.jsx`:
  - [ ] `/verify-otp` → `VerifyOtpPage`

## Verification
- [ ] Run frontend build/start to ensure no runtime/import errors
- [ ] Manual e2e: forgot-password → verify-otp → reset-password → login

