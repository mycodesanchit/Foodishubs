'use client'

// Next Imports
import { useRouter, useParams } from 'next/navigation'

// Mui Imports
import { Button, Grid } from '@mui/material'

// Component Imports
import StaffListingComponent from './StaffListingComponent'

const StaffManagemntComponent = ({ dictionary }) => {
  const router = useRouter()

  // HOOKS
  const { lang: locale } = useParams()

  return (
    <>
      <Grid item xs={12}>
        <Button variant='contained' onClick={() => router.push(`/staff-management/add-staff`)}>
          Add Staff
        </Button>
      </Grid>
      <StaffListingComponent dictionary={dictionary} />
    </>
  )
}

export default StaffManagemntComponent
