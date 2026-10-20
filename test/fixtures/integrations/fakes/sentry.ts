import { useState } from '#app'

/** Keeps the last captured error in the page so the test can read it. */
export function captureException(error: Error): void {
  useState('sentry-captured', () => '').value = error.message
}
