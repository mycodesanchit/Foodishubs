// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// View Imports
import MealSelection from '@/views/dashboard/meal-selection'

// Meta data
export const metadata = {
  title: 'Meal Selection'
}

// Page
const MealSelectionPage = async ({ params }) => {
  const { id } = params

  // Vars
  const dictionary = await getDictionary(params?.lang)

  return <MealSelection dictionary={dictionary} id={id} />
}

export default MealSelectionPage
