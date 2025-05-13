'use client'

// React Imports
import { useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import EditIcon from '@mui/icons-material/Edit'
import { Avatar, Button, Card, CardContent, Divider, List, ListItem, ListItemText, Typography } from '@mui/material'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

/**
 * Page
 */
const Details = ({ dictionary, kidData, setProfileUploadedFile }) => {
  // Hooks
  const { lang: locale } = useParams()
  const router = useRouter()

  const [preview, setPreview] = useState(kidData?.imageUrl)

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
                <Avatar alt={kidData?.first_name + ' ' + kidData?.last_name || ''} src={preview || ''} />
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
                (kidData?.first_name ? kidData?.first_name : '-') + ' ' + (kidData?.last_name ? kidData?.last_name : '')
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
              primary={dictionary?.form?.label?.kid_name + ' :'}
              secondary={
                (kidData?.first_name ? kidData?.first_name : '-') + ' ' + (kidData?.last_name ? kidData?.last_name : '')
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.country + ' :'}
              secondary={kidData?.country ? kidData.country : '-'}
            />
          </ListItem>{' '}
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.school_name + ' :'}
              secondary={kidData?.schoolName ? kidData.schoolName : '-'}
            />
          </ListItem>{' '}
          <ListItem>
            <ListItemText primary={dictionary?.form?.label?.age + ' :'} secondary={kidData?.age ? kidData.age : '-'} />
          </ListItem>{' '}
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.grade + ' :'}
              secondary={kidData?.grade ? kidData?.grade : '-'}
            />
          </ListItem>{' '}
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.class + ' :'}
              secondary={kidData?.class ? kidData?.class : '-'}
            />
          </ListItem>{' '}
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.gender + ' :'}
              secondary={kidData?.gender ? kidData?.gender : '-'}
            />
          </ListItem>{' '}
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.weight + ' :'}
              secondary={kidData?.weight ? kidData?.weight : '-'}
            />
          </ListItem>{' '}
          <ListItem>
            <ListItemText
              primary={dictionary?.form?.label?.height + ' :'}
              secondary={kidData?.height ? kidData?.height : '-'}
            />
          </ListItem>{' '}
        </List>
        <Button
          variant='contained'
          sx={{ m: 1 }}
          type='button'
          onClick={() => {
            router.push(getLocalizedUrl('/kid-profile-management/kid-create', locale))
          }}
        >
          {'+ ' + dictionary?.page?.parent_kid_management?.add_another_kid}
        </Button>
      </CardContent>
    </Card>
  )
}

export default Details
