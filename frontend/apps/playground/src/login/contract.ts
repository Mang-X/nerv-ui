export type LoginSurface = 'console' | 'business-console' | 'pda' | 'screen'
export type LoginMode = 'login' | 'change-password'
export interface LoginDraft {
  loginName: string
  password: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
export interface LoginRequest extends LoginDraft {
  mode: LoginMode
}
// A void, false, malformed or missing callback result never confirms the action.
export type LoginReceipt = { accepted: boolean }
export type SubmitLogin = (request: Readonly<LoginRequest>) => unknown | Promise<unknown>
