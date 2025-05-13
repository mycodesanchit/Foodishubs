// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import KidProfileManagement from '@/views/dashboard/kid-profile-management'

// Meta data
export const metadata = {
  title: 'Kid Profile Management'
}

// Page
const KidProfileManagementPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <KidProfileManagement dictionary={dictionary} />
}

export default KidProfileManagementPage
