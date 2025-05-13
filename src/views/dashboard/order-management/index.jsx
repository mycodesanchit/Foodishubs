import { Stack } from '@mui/material'

import Statistics from './Statistics'

import OrderDataTable from './OrderDataTable'

const OrderManagement = props => {
  const { dictionary = null } = props

  return (
    <Stack spacing={5}>
      <Statistics dictionary={dictionary} />
      <OrderDataTable dictionary={dictionary} />
    </Stack>
  )
}

export default OrderManagement
