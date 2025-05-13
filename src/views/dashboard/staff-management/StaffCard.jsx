// React Imports
import React, { useEffect, useState } from 'react'

// Mui Imports
import { Card, CardContent, Typography, IconButton, Avatar, Box, Button } from '@mui/material'

import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'
import ProfileViewDialog from './ProfileViewDialogBox'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import { actionConfirmWithLoaderAlert, successAlert, toastError } from '@/utils/globalFunctions'

const StaffCard = ({ name, role, email, userId, dictionary, getAllStaffMembers }) => {
  const [staffDetails, setStaffDetails] = useState(null)
  // const [dialogOpen, setDialogOpen] = useState(false)

  // console.log('jhjhjhj', userId)

  const fetchStaffDetails = async () => {
    try {
      const response = await axiosApiCall.get(API_ROUTER.STAFF_MANAGEMENT, { params: { userId } })
      const staffDetails = response.data?.response?.staffMembers[0]

      setStaffDetails(staffDetails)
      // setDialogOpen(true)
    } catch (error) {
      toastError('Error fetching staff details:', error)
    }
  }

  const handleDeleteClick = async () => {
    // await axiosApiCall.post(`${API_ROUTER.STAFF_MANAGEMENT}/${userId}`).then(response=>{

    // }).catch((error)=>{
    //   toastError("failed to delete staff member",error)
    // })
    actionConfirmWithLoaderAlert(
      {
        /**
         * swal custom data for activating user
         */
        deleteUrl: `${API_ROUTER.STAFF_MANAGEMENT}/${userId}`,
        requestMethodType: 'DELETE',
        title: `${dictionary?.sweet_alert?.user_delete?.title}`,
        text: `${dictionary?.sweet_alert?.user_delete?.text}`,
        customClass: {
          confirmButton: `btn bg-warning`
        },
        requestInputData: {
          status: 'active'
        }
      },
      {
        confirmButtonText: `${dictionary?.sweet_alert?.user_delete?.confirm_button}`,
        cancelButtonText: `${dictionary?.sweet_alert?.user_delete?.cancel_button}`
      },
      (callbackStatus, result) => {
        /**
         * Callback after action confirmation
         */
        if (callbackStatus) {
          getAllStaffMembers()
          successAlert({
            title: `${dictionary?.sweet_alert?.user_delete?.success}`,
            confirmButtonText: `${dictionary?.sweet_alert?.user_activate?.ok}`
          })
        }

        // getAllSuspendedUsers()
      }
    )
  }

  const buttonProps = {
    variant: 'text',
    children: 'view icon',
    onClick: fetchStaffDetails
  }

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        borderRadius: '8px'
      }}
    >
      {/* Avatar */}
      <Avatar
        // src='https://via.placeholder.com/50'
        alt='Staff Avatar'
        sx={{ width: 50, height: 50, marginRight: 2 }}
      />

      {/* Card Content */}
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant='h6' component='div' sx={{ fontWeight: 'bold' }}>
          {name}
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          Role:{role}
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          Email:{email}
        </Typography>
      </Box>

      {/* action btns */}
      <Box>
        {/* <Button>view icon</Button> */}
        <OpenDialogOnElementClick
          element={Button}
          elementProps={buttonProps}
          dialog={ProfileViewDialog}
          dialogProps={{ staffDetails }}
        />
        <Button onClick={() => handleDeleteClick()}>delete icon</Button>
      </Box>
    </Card>
  )
}

export default StaffCard
