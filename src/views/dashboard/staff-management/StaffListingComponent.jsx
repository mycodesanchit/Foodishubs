'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import { Box, Typography, Grid, Card, CardContent } from '@mui/material'

// Component Imports

import PaymentMethod from '../profile-management/PaymentMethod'

import StaffCard from './StaffCard'

import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import { toastError } from '@/utils/globalFunctions'

const StaffListingComponent = ({ dictionary }) => {
  const [allStaff, setAllStaff] = useState([])

  const getAllStaffMembers = async () => {
    await axiosApiCall
      .get(API_ROUTER.STAFF_MANAGEMENT)
      .then(response => {
        setAllStaff(response?.data?.response?.staffMembers || [])
      })
      .catch(error => {
        toastError(error?.message)
      })
  }

  useEffect(() => {
    getAllStaffMembers()
  }, [])

  return (
    <>
      <Box sx={{ paddingY: 4 }}>
        <Typography variant='h5'>Staff List</Typography>

        <Grid container spacing={2}>
          {allStaff?.map(staff => (
            <Grid item xs={12} md={6} lg={6} key={staff.id}>
              <StaffCard
                name={`${staff.first_name} ${staff.last_name}`}
                // description={staff.description || 'No description available'}
                role={staff?.role}
                email={staff?.email}
                userId={staff?._id}
                dictionary={dictionary}
                getAllStaffMembers={getAllStaffMembers}
                // avatar={staff.avatar || 'https://via.placeholder.com/50'}
                // onView={() => console.log(`Viewing ${staff.name}`)}
                // onDelete={() => console.log(`Deleting ${staff.name}`)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* <Card>
        <CardContent className='flex flex-col items-center text-center gap-4'>
          <i className='tabler-credit-card text-[34px] text-textPrimary' />
          <Typography variant='h5'>Add Payment Method</Typography>
          <Typography color='text.primary'>
            Elegant payment methods modal popup example, easy to use in any page.
          </Typography>
          <OpenDialogOnElementClick element={Button} elementProps={buttonProps} dialog={PaymentMethod} />
        </CardContent>
      </Card> */}
    </>
  )
}

export default StaffListingComponent
