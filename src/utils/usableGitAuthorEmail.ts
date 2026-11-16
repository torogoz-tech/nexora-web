export function usableGitAuthorEmail(email: string | null) {
 return email !== null && /^[^\s@<>]+@[^\s@<>]+$/.test(email.trim())
}
