// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import CreateUser from '@/views/dashboard/user-management/CreateUser'

// View Imports

// Meta data
export const metadata = {
  title: 'Menu Update'
}

// Page
const MenuManagementCreatePage = async ({ params, searchParams }) => {
  // const { id } = searchParams
  const { id } = params

  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <CreateUser dictionary={dictionary} id={id} />
}

export default MenuManagementCreatePage
