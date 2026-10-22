import type { McpOAuthContent } from './schema'
import { defaultLocale, type Locale } from './ui'

const content: Record<Locale, McpOAuthContent> = {
  'en-US': {
    seoTitle: 'Authorize an AI app | MapsGrab',
    title: 'Connect an AI app to your account',
    intro: 'An app is asking to access your MapsGrab account. Allow it only if you started this connection yourself.',
    loading: 'Loading the connection request...',
    hostLabel: 'App address',
    selfDeclared: 'Name the app gives itself: {name}',
    loopbackTitle: 'Local app',
    loopbackText: 'This app runs on a computer, so its address cannot show who made it. Allow it only if you just started this connection from an app you trust.',
    loopbackHost: 'This computer',
    accountLabel: 'Signed in as',
    switchAccount: 'Switch account',
    permissionsTitle: 'If you allow it, this app can',
    permissions: [
      'Search for businesses and read their reviews and public photos on Google Maps.',
      'Use your API plan’s monthly request allowance.'
    ],
    revokeNote: 'You can disconnect it anytime under Connected apps in API management.',
    approve: 'Allow',
    deny: 'Deny and return to {host}',
    denyLoopback: 'Deny and return to the app',
    redirecting: 'Returning to the app...',
    invalidTitle: 'This connection request is invalid or has expired',
    invalidText: 'Go back to your AI app and start connecting again.',
    errorTitle: 'This connection request cannot be completed',
    errorReasons: {
      rate_limited: 'Too many connection attempts came from your network. Wait a few minutes before trying again.',
      invalid_client: 'The app is not registered, or its registration is incomplete.',
      invalid_redirect_uri: 'The return address sent by the app does not match the one it registered.',
      unsupported_response_type: 'The app asked for an authorization type that is not supported.',
      invalid_pkce: 'The app did not send the required security check (PKCE with S256).',
      invalid_resource: 'The app did not ask for access to the MapsGrab MCP server, or asked for a different server.',
      server_error: 'MapsGrab could not save this request right now. Please try again shortly.'
    },
    errorHint: 'Start the connection again from your AI app. If the problem continues, contact the app’s developer.',
    signInTitle: 'Sign in to continue',
    signInText: 'Sign in to the MapsGrab account you want to connect. This request will wait for you.',
    signIn: 'Sign in',
    loadFailed: 'Could not load the connection request. Check your network and try again.',
    decideFailed: 'Could not complete this action. Check your network and try again.',
    retry: 'Try again'
  }
}

export function getMcpOAuthContent(locale: Locale): McpOAuthContent {
  return content[locale] ?? content[defaultLocale]
}
