'use client'
// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import { Card, CardContent, Grid, Typography } from '@mui/material'

// Core Component Imports
import CustomAvatar from '@/@core/components/mui/Avatar'

// Util Imports
import { numberFormat } from '@utils/globalFilters'
import axiosApiCall from '@utils/axiosApiCall'
import { getLocalizedUrl } from '@/utils/i18n'
import { API_ROUTER } from '@/utils/apiRoutes'
// View Imports
import { toastError } from '@/utils/globalFunctions'

/**
 * Page
 */
const Statistics = props => {
  // Props
  const { dictionary = null } = props

  // HOOKS
  const { lang: locale } = useParams() // Locale from the URL

  const [vednerMinimumThresholdsVerificationCount, setVednerMinimumThresholdsVerificationCount] = useState(0)

  const getTotalSuspendedAccountNumber = async () => {
    try {
      const response = await axiosApiCall.get(API_ROUTER.SUPER_ADMIN_VENDOR_MANAGEMENT_THRESHOLD)

      setVednerMinimumThresholdsVerificationCount(response?.data?.response?.thresholdRequestCount || 0)
    } catch (error) {
      toastError(error?.response?.message || 'An error occurred while fetching data.')
    }
  }

  useEffect(() => {
    getTotalSuspendedAccountNumber()
  }, [])
  // Page Life Cycle: End

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <Card>
          <CardContent className='flex flex-col gap-1'>
            <div className='flex items-center gap-4'>
              <CustomAvatar color={'primary'} skin='light' variant='rounded'>
                <i className='tabler-clipboard-check text-xl' />
              </CustomAvatar>
              <Typography variant='h5'>{dictionary?.page?.order_management?.last_moment_cancellation}</Typography>
            </div>
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-4'>
                <Typography color='text.primary' className='font-bold text-3xl'>
                  {numberFormat(0)}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={4}>
        <Card>
          <CardContent className='flex flex-col gap-1'>
            <div className='flex items-center gap-4'>
              <CustomAvatar color={'primary'} skin='light' variant='rounded'>
                <i className='tabler-clipboard-check text-xl' />
              </CustomAvatar>
              <Typography variant='h5'>
                {dictionary?.page?.order_management?.vendor_minimum_thresholds_verfication_requests}
              </Typography>
            </div>
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-2'>
                <Typography color='text.primary' className='font-bold text-3xl'>
                  {numberFormat(vednerMinimumThresholdsVerificationCount)}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={4}>
        <Card>
          <CardContent className='flex flex-col gap-1'>
            <div className='flex items-center gap-4'>
              <CustomAvatar color={'primary'} skin='light' variant='rounded'>
                <i className='tabler-clipboard-check text-xl' />
              </CustomAvatar>
              <Typography variant='h5'> {dictionary?.page?.order_management?.monitor_deliverd_order}</Typography>
            </div>
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-2'>
                <Typography color='text.primary' className='font-bold text-3xl'>
                  {numberFormat(0)}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Statistics
