'use client'

import { useEffect } from 'react'

// Mui Imports
import { Avatar, Dialog, DialogContent, DialogTitle, Typography, Chip, CircularProgress, Box } from '@mui/material'

// Component Imports
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

const ProfileViewDialog = ({ open, setOpen, staffDetails }) => {
  //   console.log('jijijijqqq', staffDetails)

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={() => setOpen(false)}
      maxWidth='sm'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>

      {staffDetails ? (
        <>
          <DialogTitle>
            <Box display='flex' flexDirection='column' alignItems='center' gap={1}>
              <Avatar
                src={staffDetails?.avatar || ''}
                alt={`${staffDetails?.first_name} ${staffDetails?.last_name}`}
                // sx={{
                //   width: 80,
                //   height: 80,
                //   border: '3px solid #4caf50',
                //   marginBottom: 1
                // }}
              />
              <Typography variant='h6' fontWeight='bold'>
                {`${staffDetails.first_name} ${staffDetails.last_name}`}
              </Typography>
              <Chip
                size='small'
                label={staffDetails.role}
                sx={{
                  backgroundColor: '#e8f5e9',
                  color: '#4caf50',
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant='h6' fontWeight='bold' mb={2}>
              Details
            </Typography>
            <Typography variant='body2' mb={1}>
              <strong>Staff Name:</strong> {`${staffDetails.first_name} ${staffDetails.last_name}`}
            </Typography>
            <Typography variant='body2' mb={1}>
              <strong>Email:</strong> {staffDetails.email}
            </Typography>
            <Typography variant='body2' mb={1}>
              <strong>Role:</strong> {staffDetails.role}
            </Typography>
            <Typography variant='body2' mb={1}>
              <strong>Phone Number:</strong> {staffDetails.phoneNo}
            </Typography>
            <Typography variant='body2'>
              <strong>Address:</strong> {staffDetails.location?.city || 'N/A'}
            </Typography>
          </DialogContent>
        </>
      ) : (
        <Box display='flex' justifyContent='center' alignItems='center' height='200px'>
          <CircularProgress />
        </Box>
      )}
    </Dialog>
  )
}

export default ProfileViewDialog
