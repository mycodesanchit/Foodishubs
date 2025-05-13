// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// Meta data
export const metadata = {
  title: 'Dashboard'
}

// Page
const DashboardPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return <h1>{dictionary['navigation']?.dashboard}</h1>
}

export default DashboardPage
