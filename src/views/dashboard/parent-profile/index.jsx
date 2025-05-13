'use client'

// React Imports
import * as React from 'react'
import { useEffect, useState } from 'react'

// Third-party Imports
import { useSelector } from 'react-redux'

// MUI Imports
import { Box, Button, CircularProgress, Grid, Typography } from '@mui/material'
import Modal from '@mui/material/Modal'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'

// View Imports
import Details from './Details'
import EditDetails from './EditDetails'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

const ParentProfile = ({ dictionary }) => {
  // Hooks
  const { user = null } = useSelector(state => state?.profileReducer)

  // states
  const [userData, setUserData] = useState([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [profileUploadedFile, setProfileUploadedFile] = useState('')

  const [openIsApproveModel, setOpenIsApproveModel] = React.useState(false)
  const handleCloseApproveModel = () => setOpenIsApproveModel(false)

  useEffect(() => {
    if (user?._id) {
      axiosApiCall
        .get(`/v1/parent-dashboard/parent-details`)
        .then(response => {
          setUserData(response?.data?.response)

          if (!response?.data?.response?.isApproved) {
            setOpenIsApproveModel(true)
          }

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
              <Details dictionary={dictionary} userData={userData} setProfileUploadedFile={setProfileUploadedFile} />
            </Grid>
            <Grid item xs={8}>
              <EditDetails
                dictionary={dictionary}
                userData={userData}
                setUserData={setUserData}
                profileUploadedFile={profileUploadedFile}
              />
            </Grid>
          </Grid>
          <Modal
            open={openIsApproveModel}
            onClose={handleCloseApproveModel}
            aria-labelledby='modal-modal-title'
            aria-describedby='modal-modal-description'
          >
            <Box sx={style}>
              <Typography id='modal-modal-title' variant='h6' component='h2'>
                Reject Request
              </Typography>
              <Typography id='modal-modal-description' sx={{ mt: 2 }}>
                Please verify your profile details agin!
              </Typography>
              <Button onClick={handleCloseApproveModel}>Close</Button>
            </Box>
          </Modal>
        </Box>
      ) : (
        <CircularProgress />
      )}
    </>
  )
}

export default ParentProfile
