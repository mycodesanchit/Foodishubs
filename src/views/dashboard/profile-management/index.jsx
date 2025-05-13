'use client'

// React Imports
import { useEffect, useState } from 'react'

// Third-party Imports
import { useSelector } from 'react-redux'

// MUI Imports
import { Box, CircularProgress, Grid } from '@mui/material'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'

// View Imports
import Details from './Details'
import EditDetails from './EditDetails'
import MinimumThreshold from './MinimumThreshold'
import UploadDocument from './UploadDocument'

const ProfileManagement = ({ dictionary }) => {
  // Hooks
  const { user = null } = useSelector(state => state?.profileReducer)

  // states
  const [userData, setUserData] = useState([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  useEffect(() => {
    if (user?._id) {
      axiosApiCall
        .get(`/v1/vendor/details`)
        .then(response => {
          setUserData(response?.data?.response?.userData)
          setIsDataLoaded(true)
        })
        .catch(error => {
          console.error('Error fetching roles:', error)
          setIsDataLoaded(true)
        })
    }
  }, [user])

  return (
    <>
      {isDataLoaded ? (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Details dictionary={dictionary} userData={userData} />
            </Grid>
            <Grid item xs={8}>
              <EditDetails dictionary={dictionary} userData={userData} setUserData={setUserData} />
            </Grid>
          </Grid>
          <MinimumThreshold dictionary={dictionary} userData={userData} />
          <UploadDocument dictionary={dictionary} userData={userData} />
          {/*<PaymentMethod dictionary={dictionary} userData={userData} />*/}
        </Box>
      ) : (
        <CircularProgress />
      )}
    </>
  )
}

export default ProfileManagement
