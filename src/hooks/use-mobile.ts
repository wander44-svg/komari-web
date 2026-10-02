import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // This is a client-only Vite app, so resolve the initial breakpoint during
  // the first render. Starting with `false` made mobile/PWA layouts render as
  // desktop for one frame, which caused the admin drawer to flash open and
  // the public page to jump when the media-query effect caught up.
  const [isMobile, setIsMobile] = React.useState<boolean>(() =>
    typeof window !== "undefined"
      ? window.innerWidth < MOBILE_BREAKPOINT
      : false,
  )

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
