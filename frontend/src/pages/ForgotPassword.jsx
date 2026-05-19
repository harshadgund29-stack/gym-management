/**
 * ForgotPassword.jsx — redirect alias kept for backward compatibility.
 * The real implementation lives in ForgotPasswordPage.jsx.
 * App.jsx routes /forgot-password → ForgotPasswordPage, so this file
 * is no longer used as a route. Exporting ForgotPasswordPage directly
 * prevents any stale import from breaking the build.
 */
export { default } from './ForgotPasswordPage';
