import { serwist } from "@serwist/next/config"

/**
 * Service worker build, run by the Serwist CLI after `next build`.
 *
 * This is Serwist's "configurator mode". The plugin form (`withSerwistInit`)
 * hooks the webpack config, and Next 16 builds with Turbopack, so it never
 * runs — which is exactly how the previous next-pwa setup broke silently and
 * left a months-old `public/sw.js` in the repo. Building the worker from a
 * separate CLI step is bundler-agnostic and cannot fail quietly: if it does
 * not run, there is no sw.js at all.
 */
export default serwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  globDirectory: ".next",
  // Precache the prerendered routes so the app opens offline.
  precachePrerendered: true,
})
