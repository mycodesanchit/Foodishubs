'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import { Card, CardContent, Typography, Chip, Divider, Button } from '@mui/material'

// Utils Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import { actionConfirmWithLoaderAlert, successAlert } from '@/utils/globalFunctions'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const VendorProfile = props => {
  const { dictionary = null, id } = props

  const [userData, setUserData] = useState()

  // Get vendor details api call
  const getSpecificVendoDetail = async id => {
    if (!id) return

    await axiosApiCall
      .get(API_ROUTER.VENDOR_BY_ID(id))
      .then(response => {
        // console.log('vendorDetails', response.data)
        setUserData(response?.data?.response)
      })
      .catch(error => {
        console.log('issue in vendor call')
        // toastError(error?.response?.message)
      })
  }

  // Suspend User
  const handleSuspendUser = userId => {
    actionConfirmWithLoaderAlert(
      {
        /**
         * swal custom data for suspending user
         */
        deleteUrl: `${API_ROUTER.USER_MANAGEMENT}/${userId}/status`,
        requestMethodType: 'PUT',
        title: `${dictionary?.sweet_alert?.user_suspend?.title}`,
        text: `${dictionary?.sweet_alert?.user_suspend?.text}`,
        customClass: {
          confirmButton: `btn bg-warning`
        },
        requestInputData: {
          status: 'suspended'
        }
      },
      {
        confirmButtonText: `${dictionary?.sweet_alert?.user_suspend?.confirm_button}`,
        cancelButtonText: `${dictionary?.sweet_alert?.user_suspend?.cancel_button}`
      },
      (callbackStatus, result) => {
        /**
         * Callback after action confirmation
         */
        if (callbackStatus) {
          successAlert({
            title: `${dictionary?.sweet_alert?.user_suspend?.success}`,
            confirmButtonText: `${dictionary?.sweet_alert?.user_suspend?.ok}`
          })
        }
      }
    )
  }

  useEffect(() => {
    getSpecificVendoDetail(id)
  }, [])

  return (
    <Card>
      <div>
        {dictionary?.page?.vendor_profile?.title}
        <Button variant='contained' onClick={() => handleSuspendUser(id)}>
          {dictionary?.page?.vendor_profile?.button_title}
        </Button>
      </div>
      <Divider className='mlb-4' />
      <CardContent className='flex justify-around gap-6'>
        <div className='flex flex-col gap-6'>
          <div className='flex items-center justify-center flex-col gap-4'>
            <div className='flex flex-col items-center gap-4'>
              <CustomAvatar alt='user-profile' src='/images/avatars/1.png' variant='rounded' size={120} />
            </div>
            <Chip label={userData?.role} color='secondary' size='small' variant='tonal' />
          </div>
        </div>
        <div>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                {dictionary?.page?.vendor_profile?.vendor_name}
              </Typography>
              <Typography>
                {userData?.first_name} {userData?.last_name}
              </Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                {dictionary?.page?.vendor_profile?.country}
              </Typography>
              <Typography>{userData?.location?.country}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                {dictionary?.page?.vendor_profile?.email_address}
              </Typography>
              <Typography color='text.primary'>{userData?.email}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                {dictionary?.page?.vendor_profile?.phone_number}
              </Typography>
              <Typography color='text.primary'>{userData?.phoneNo}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                {dictionary?.page?.vendor_profile?.restaurant_name}
              </Typography>
              <Typography color='text.primary'>{userData?.companyName}</Typography>
            </div>
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                {dictionary?.page?.vendor_profile?.business_description}
              </Typography>
              <Typography color='text.primary'>{userData?.description}</Typography>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default VendorProfile
