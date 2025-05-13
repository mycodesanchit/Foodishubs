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
  const { dictionary = null, verificationRequestCount } = props

  // HOOKS
  const { lang: locale } = useParams()

  // const getTotalSuspendedAccountNumber = async () => {
  //   await axiosApiCall
  //     .get(API_ROUTER.USER_MANAGEMENT_STATISTICS)
  //     .then(response => {
  //       setSuspendedAccountNumber(response?.data?.response?.suspended_accounts)
  //     })
  //     .catch(error => {
  //       toastError(error?.response?.message)
  //     })
  // }

  //  Page Life Cycle: Start
  // useEffect(() => {
  //   getTotalSuspendedAccountNumber()
  // }, [])
  //  Page Life Cycle: End

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} sm={6} md={6}>
        {/* <Link href={`/${locale}/user-management/suspended-users`}> */}
        <Card>
          <Link href={`/${locale}/vendor-management/document-verification-requests`}>
            <CardContent className='flex flex-col gap-1'>
              <div className='flex items-center gap-4'>
                <CustomAvatar color={'primary'} skin='light' variant='rounded'>
                  <i className='tabler-clipboard-check text-xl' />
                </CustomAvatar>
                <Typography variant='h4'>
                  {dictionary?.page?.vendor_management?.vendor_document_verification_requests}
                </Typography>
              </div>
              <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <Typography color='text.primary' className='font-bold text-3xl'>
                    {numberFormat(verificationRequestCount)}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
        {/* </Link> */}
      </Grid>
      <Grid item xs={12} sm={6} md={6}>
        {/* <Link href={`/${locale}/user-management/suspended-users`}> */}
        <Card>
          <Link href={`/${locale}/vendor-management/vendor-review`}>
            <CardContent className='flex flex-col gap-1'>
              <div className='flex items-center gap-4'>
                <CustomAvatar color={'primary'} skin='light' variant='rounded'>
                  <i className='tabler-clipboard-check text-xl' />
                </CustomAvatar>
                <Typography variant='h4'>{dictionary?.page?.vendor_management?.vendor_review}</Typography>
              </div>
              <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <Typography color='text.primary' className='font-bold text-3xl'>
                    {numberFormat(0)}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Statistics
