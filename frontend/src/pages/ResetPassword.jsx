/**
 * ResetPassword.jsx — redirect alias kept for backward compatibility.
 * The real implementation lives in ResetPasswordPage.jsx.
 * App.jsx routes /reset-password → ResetPasswordPage, so this file
 * is no longer used as a route. Exporting ResetPasswordPage directly
 * prevents any stale import from breaking the build.
 */
export { default } from './ResetPasswordPage';
