'use client'

import React, { useState } from 'react'

import dynamic from 'next/dynamic'

import { Box, Tabs, Tab } from '@mui/material'

import ModifierGroupDataTable from './ModifierGroupDataTable'

const CategoryDataTable = dynamic(() => import('./CategoryDataTable'), {
  ssr: false
})

const DishDataTable = dynamic(() => import('./DishDataTable'), {
  ssr: false
})

function TabBar({ tabValue, onTabChange, dictionary, getId }) {
  const getCategory = id => {
    getId(id, 0)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={tabValue}
        onChange={onTabChange}
        textColor='secondary'
        indicatorColor='secondary'
        aria-label='menu management tabs'
      >
        <Tab label='Add Category' />
        <Tab label='Add Dish' />
        <Tab label='Modifier Group' />
      </Tabs>

      <Box sx={{ p: 2 }}>
        {tabValue === 0 && <CategoryDataTable dictionary={dictionary} getId={getCategory} />}
        {tabValue === 1 && (
          <div>
            <DishDataTable />
          </div>
        )}
        {tabValue === 2 && (
          <div>
            <ModifierGroupDataTable />
          </div>
        )}
      </Box>
    </Box>
  )
}

export default TabBar
