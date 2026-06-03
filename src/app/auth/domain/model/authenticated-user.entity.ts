/**
 * Authenticated user returned by the IAM backend on sign-in.
 */
export interface AuthenticatedUser {
  id: number;
  email: string;
  token: string;
}
