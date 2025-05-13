'use client'

// React Imports
import { useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

// Third-party Imports

// MUI Imports
import { Box, Button, Card, CardContent, CardHeader, CircularProgress, Grid } from '@mui/material'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { getLocalizedUrl } from '@/utils/i18n'

const KidListing = ({ dictionary }) => {
  // Hooks
  const { lang: locale } = useParams()
  const router = useRouter()

  // states
  const [kidData, setKidData] = useState([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  useEffect(() => {
    axiosApiCall
      .get(`/v1/kids`)
      .then(response => {
        setKidData(response?.data?.response?.userData)
        setIsDataLoaded(true)
      })
      .catch(error => {
        console.error('Error fetching roles:', error)
        setIsDataLoaded(true)
      })
  }, [])

  const handleAddKid = () => {
    router.push(getLocalizedUrl('/kid-profile-management/kid-create', locale))
  }

  const handleUpdateKid = id => {
    router.push(getLocalizedUrl(`/kid-profile-management/kid-update/${id}`, locale))
  }

  return (
    <>
      {isDataLoaded ? (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
          <Card style={{ marginTop: '16px' }}>
            <CardHeader title={dictionary?.page?.parent_kid_management?.add_kids_details} />
            <CardContent>
              <Grid container spacing={2}>
                {kidData?.map(kid => (
                  <Grid item xs={6} key={kid._id}>
                    <img src={kid?.imageUrl} alt={kid.first_name + ' ' + kid.last_name} width={22} />
                    {kid.first_name + ' ' + kid.last_name}
                    <div>{dictionary?.page?.common?.school + ' :' + (kid?.schoolName ? kid?.schoolName : '-')}</div>
                    <div>{dictionary?.form?.label?.gender + ' :' + (kid?.schoolName ? kid?.gender : '-')}</div>
                    <div>{dictionary?.form?.label?.age + ' :' + (kid?.schoolName ? kid?.age : '-')}</div>
                    <div>{dictionary?.form?.label?.weight + ' :' + (kid?.schoolName ? kid?.weight : '-')}</div>
                    <div>{dictionary?.form?.label?.class + ' :' + (kid?.schoolName ? kid?.class : '-')}</div>
                    <div>{dictionary?.form?.label?.height + ' :' + (kid?.schoolName ? kid?.height : '-')}</div>
                    <div>{dictionary?.form?.label?.grade + ' :' + (kid?.schoolName ? kid?.grade : '-')}</div>
                    <div
                      onClick={() => {
                        handleUpdateKid(kid._id)
                      }}
                    >
                      Edit
                    </div>
                  </Grid>
                ))}
                {kidData.length == 0 && (
                  <Grid item xs={6}>
                    {dictionary?.datatable?.common?.no_data_available}
                  </Grid>
                )}
              </Grid>
              <Button
                variant='contained'
                sx={{ m: 1 }}
                type='button'
                onClick={() => {
                  handleAddKid()
                }}
              >
                {'+ ' + dictionary?.page?.parent_kid_management?.add_another_kid}
              </Button>
            </CardContent>
          </Card>
        </Box>
      ) : (
        <CircularProgress />
      )}
    </>
  )
}

export default KidListing
