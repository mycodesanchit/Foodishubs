'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import EditIcon from '@mui/icons-material/Edit'
import { Avatar, Card, CardContent, Divider, List, ListItem, ListItemText, Typography } from '@mui/material'

/**
 * Page
 */
const Details = ({ dictionary, userData, setProfileUploadedFile }) => {
  const [preview, setPreview] = useState(userData?.profileImage)

  const selectedGender = userData?.gender
    ? dictionary?.form?.dropdown.genders.find(gender => gender.id === userData?.gender).name
    : '-'

  const handleImageChange = event => {
    const file = event.target.files[0]

    if (file) {
      setProfileUploadedFile(file)

      const reader = new FileReader()

      reader.onloadend = () => {
        setPreview(reader.result)
      }

      reader.readAsDataURL(file)
    } else {
      toastError('Please select a valid file.')
    }
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
          {dictionary?.page?.common?.kids}
        </List>

        <Typography variant='h6' gutterBottom>
          {dictionary?.page?.common?.details}
        </Typography>
        <Divider></Divider>
        <List>
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.parent_name + ' :'}
              secondary={
                (userData?.first_name ? userData?.first_name : '-') +
                ' ' +
                (userData?.last_name ? userData?.last_name : '')
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={dictionary?.page?.common?.school + ' :'}
              secondary={userData?.schoolName ? userData.schoolName : '-'}
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
              primary={dictionary?.page?.common?.contact + ' :'}
              secondary={userData?.phoneNo ? userData?.phoneNo : '-'}
            />
          </ListItem>{' '}
          <ListItem>
            <ListItemText primary={dictionary?.form?.label?.gender + ' :'} secondary={selectedGender} />
          </ListItem>{' '}
        </List>
      </CardContent>
    </Card>
  )
}

export default Details
