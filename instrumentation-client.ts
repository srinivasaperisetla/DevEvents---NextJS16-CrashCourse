import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: '2025-05-24',
  capture_pageview: 'history_change',
})

export function onRouterTransitionStart(url: string) {
  posthog.capture('$pageview', { $current_url: url })
}
