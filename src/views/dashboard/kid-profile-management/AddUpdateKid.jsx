'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import { Box, CircularProgress, Grid } from '@mui/material'

// View Imports
import Details from './Details'
import Form from './Form'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'

/**
 * Page
 */
const AddUpdateKid = props => {
  // Props
  const { mode, dictionary, id } = props

  // Hooks
  const router = useRouter()
  const { lang: locale } = useParams()

  // states
  const [kidData, setKidData] = useState()
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [profileUploadedFile, setProfileUploadedFile] = useState('')

  useEffect(() => {
    if (id) {
      axiosApiCall
        .get(`/v1/kids/${id}`)
        .then(response => {
          setKidData(response?.data?.response?.userData)
          setIsDataLoaded(true)
        })
        .catch(error => {
          console.error('Error fetching roles:', error)
          setIsDataLoaded(true)
        })
    }
  }, [id])

  return (
    <>
      {isDataLoaded ? (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Details dictionary={dictionary} kidData={kidData} setProfileUploadedFile={setProfileUploadedFile} />
            </Grid>
            <Grid item xs={8}>
              <Form
                dictionary={dictionary}
                kidData={kidData}
                setKidData={setKidData}
                profileUploadedFile={profileUploadedFile}
              />
            </Grid>
          </Grid>
        </Box>
      ) : (
        <CircularProgress />
      )}
    </>
  )
}

export default AddUpdateKid
