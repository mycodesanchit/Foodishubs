import React from 'react'

import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

function MenuBar({ tabValue, onOpenPage, isEdit }) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='static' color='default'>
        <Toolbar>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            Menu Management
          </Typography>
          {!isEdit && (
            <>
              {tabValue === 0 && (
                <Button variant='contained' color='success' onClick={() => onOpenPage(0)}>
                  Add Category
                </Button>
              )}
              {tabValue === 1 && (
                <Button variant='contained' color='primary' onClick={() => onOpenPage(1)} sx={{ mx: 1 }}>
                  Add Dish
                </Button>
              )}
              {tabValue === 2 && (
                <Button variant='contained' color='secondary' onClick={() => onOpenPage(2)}>
                  Add Modifier
                </Button>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default MenuBar
