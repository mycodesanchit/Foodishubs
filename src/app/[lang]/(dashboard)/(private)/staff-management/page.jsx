// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import StaffManagemntComponent from '@/views/dashboard/staff-management'

// Meta data
export const metadata = {
  title: 'Staff Management'
}

// Page
const StaffManagementPage = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params?.lang)

  //   return <VendorManagement dictionary={dictionary} />
  return <StaffManagemntComponent dictionary={dictionary} />
}

export default StaffManagementPage


