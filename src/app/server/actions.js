/**
 * ! The server actions below are used to fetch the static data from the fake-db. If you're using an ORM
 * ! (Object-Relational Mapping) or a database, you can swap the code below with your own database queries.
 */
'use server'

// Next Imports
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Page
 */
export const getLangFromUrl = async () => {
  const referer = headers()?.get('referer') // Get the referer header
  const pathname = new URL(referer)?.pathname // Extract pathname
  const segments = pathname?.split('/')?.filter(Boolean) // Split and remove empty segments

  // console.log(`Pathname: ${pathname}`)

  return segments?.[0] || 'en'
}

export async function navigate(fnInput = {}) {
  redirect(fnInput?.url)
}
