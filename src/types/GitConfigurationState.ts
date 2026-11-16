import type { GitProviderConfiguration } from './GitProviderConfiguration'
export type GitConfigurationState =
  | { status: 'ready'; configuration: GitProviderConfiguration }
  | { status: 'missing' | 'restricted'; configuration: null }
