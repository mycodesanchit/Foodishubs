// React Imports
import React from 'react'

// MUI Imports
import { useParams, useRouter } from 'next/navigation'

// NEXT Imports
import Link from 'next/link'

import { CardContent, Typography, Grid, Avatar, Box, Button } from '@mui/material'

const UserCard = ({ user, dictionary, handleSuspendUser, handleDeleteUser }) => {
  // const router = useRouter()
  const { lang: locale } = useParams()

  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
          {user.first_name[0]}
          {user.last_name[0]}
        </Avatar>
      </Grid>
      <Grid item xs={9}>
        <CardContent>
          <Typography variant='h6' fontWeight={600} sx={{ mb: 0.5 }}>
            {`${user.first_name} ${user.last_name}`}
            {/* for testing purpose only */}
            {/* {`${user._id}`}  */}
          </Typography>
          <Box display='flex' justifyContent='space-between' mt={1}>
            <Typography variant='body2' color='textPrimary'>
              {dictionary?.page?.user_management?.users?.email}: {user.email}
            </Typography>
            {/* <Typography variant="body2" color="textPrimary">{user.status}</Typography> */}
          </Box>
          <Typography variant='body2' color='textSecondary' mt={1}>
            {user.isApproved
              ? dictionary?.page?.user_management?.users?.is_approved
              : dictionary?.page?.user_management?.users?.is_not_approved}
          </Typography>
          <Button onClick={() => handleSuspendUser(user._id)}>suspend</Button>
          <Button onClick={() => handleDeleteUser(user._id)}>delete</Button>
          <Link href={`/${locale}/user-management/user-update/${user._id}`}>
            <Button>edit</Button>
          </Link>
        </CardContent>
      </Grid>
    </Grid>
  )
}

export default UserCard
