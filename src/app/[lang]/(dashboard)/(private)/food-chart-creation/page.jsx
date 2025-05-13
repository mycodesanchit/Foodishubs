import Image from 'next/image'

// View Imports
import FoodChartCreation from '@/views/dashboard/food-chart-creation/index'

// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// Meta data
export const metadata = {
  title: 'Food Chart Creation'
}

// Page
const FoodChartCreationPage = async ({ params }) => {
  const dictionary = await getDictionary(params?.lang)

  return (
    <div>
      <FoodChartCreation />
    </div>
  )
}

export default FoodChartCreationPage
