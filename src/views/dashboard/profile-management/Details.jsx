'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import EditIcon from '@mui/icons-material/Edit'
import { Avatar, Card, CardContent, Divider, List, ListItem, ListItemText, Typography } from '@mui/material'

// Third-party Imports
import { useDispatch } from 'react-redux'

import { setProfile } from '@/redux-store/slices/profile'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { toastError, toastSuccess } from '@/utils/globalFunctions'

/**
 * Page
 */
const Details = ({ dictionary, userData }) => {
  const dispatch = useDispatch()

  // states
  const [preview, setPreview] = useState(userData?.profileImage)
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)

  const handleImageChange = event => {
    const file = event.target.files[0]

    if (file) {
      onSubmitFileUpload(file)
      const reader = new FileReader()

      reader.onloadend = () => {
        setPreview(reader.result)
      }

      reader.readAsDataURL(file)
    } else {
      toastError('Please select a valid file.')
    }
  }

  const onSubmitFileUpload = async file => {
    const apiFormData = new FormData()

    apiFormData.append('file', file)

    setIsFormSubmitLoading(true)
    axiosApiCall
      .post(`/v1/vendor/upload-profile-image`, apiFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        const responseBody = response?.data

        toastSuccess(responseBody?.message)
        dispatch(setProfile(responseBody.response.userData))
        setIsFormSubmitLoading(false)
      })
      .catch(error => {
        console.log('error', error)
        toastError('Something went wrong, please try again!')
      })
  }

  return (
    <Card style={{ marginTop: '16px' }}>
      <CardContent>
        <List>
          <ListItem>
            <Avatar
              sx={{
                textAlign: 'center',
                bgcolor: 'transparent',
                width: 64,
                height: 64,
                mx: 'auto',
                borderRadius: 2
              }}
            >
              <label htmlFor='imageUpload' style={{ cursor: 'pointer' }}>
                <Avatar alt={userData.first_name + ' ' + userData.last_name || ''} src={preview || ''} />
                <EditIcon />
              </label>
              <input
                accept='image/*'
                style={{ display: 'none' }}
                id='imageUpload'
                type='file'
                onChange={handleImageChange}
              />
            </Avatar>
          </ListItem>
          <ListItem>
            <ListItemText
              style={{ textAlign: 'center' }}
              primary={
                (userData?.first_name ? userData?.first_name : '-') +
                ' ' +
                (userData?.last_name ? userData?.last_name : '')
              }
            />
          </ListItem>
        </List>

        <Typography variant='h6' gutterBottom>
          {dictionary?.page?.common?.details}
        </Typography>
        <Divider></Divider>
        <List>
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.vendor_name + ' :'}
              secondary={
                (userData?.first_name ? userData?.first_name : '-') +
                ' ' +
                (userData?.last_name ? userData?.last_name : '')
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.country + ' :'}
              secondary={userData?.location?.country ? userData?.location?.country : '-'}
            />
          </ListItem>{' '}
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.email_address + ' :'}
              secondary={userData?.email ? userData.email : '-'}
            />
          </ListItem>{' '}
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.phone_number + ' :'}
              secondary={userData?.phoneNo ? userData?.phoneNo : '-'}
            />
          </ListItem>{' '}
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.restaurant_name + ' :'}
              secondary={userData?.companyName ? userData?.companyName : '-'}
            />
          </ListItem>{' '}
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.business_description + ' :'}
              secondary={userData?.description ? userData?.description : '-'}
            />
          </ListItem>{' '}
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.no_of_venue + ' :'}
              secondary={userData?.numberOfVenue ? userData?.numberOfVenue : 0}
            />
          </ListItem>
          {userData?.venues?.map(venue => (
            <ListItem key={venue._id}>
              <ListItemText
                primary={dictionary?.form?.label?.venue + ' ' + dictionary?.form?.label?.address + ' :' + venue.address}
                secondary={Object.entries(venue.openingTimes).map(([day, times]) => (
                  <span key={day}>{`${day} : ${times.openingTime} - ${times.closingTime}`}</span>
                ))}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}

export default Details
