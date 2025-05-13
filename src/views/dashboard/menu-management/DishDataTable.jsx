import React, { useEffect, useState, useRef } from 'react'

import { Card, CardMedia, CardContent, Typography, Grid, Box } from '@mui/material'

import axiosApiCall from '@/utils/axiosApiCall'

import { API_ROUTER } from '@/utils/apiRoutes'

import { toastError } from '@/utils/globalFunctions'

export default function DishGrid() {
  const [dishes, setDishes] = useState([])

  const abortController = useRef(null)

  useEffect(() => {
    fetchDishes()

    // Cleanup function to cancel pending requests
    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [])

  const fetchDishes = async () => {
    if (abortController.current) {
      abortController.current.abort()
    }

    abortController.current = new AbortController()

    try {
      const response = await axiosApiCall.get(API_ROUTER.GET_FOOD_DISH, {
        signal: abortController.current.signal
      })

      const dishesData = response?.data?.response?.dishes || []

      setDishes(dishesData)
    } catch (error) {
      if (error.name !== 'AbortError') {
        toastError(error?.response?.data?.message || 'Failed to fetch dishes')
      }
    }
  }

  return (
    <Box sx={{ flexGrow: 1, padding: 3, backgroundColor: '#f5f5f5' }}>
      <Grid container spacing={2}>
        {dishes.map(dish => (
          <Grid item xs={12} sm={6} md={4} key={dish._id}>
            <Card sx={{ display: 'flex', padding: 1, boxShadow: 2 }}>
              <CardMedia
                component='img'
                sx={{ width: 120, height: 120, borderRadius: 2 }}
                image={dish.image || 'https://via.placeholder.com/120'} // Fallback image
                alt={dish.name}
              />
              <CardContent sx={{ flex: 1 }}>
                <Typography variant='h6' fontWeight='bold'>
                  {dish.name || 'Dish Name'}
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  <strong>Description:</strong> {dish.description || 'N/A'}
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  <strong>Categories:</strong> {dish.categoryIds.map(category => category.name).join(', ') || 'N/A'}
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  <strong>Ingredients:</strong>{' '}
                  {dish.ingredients.map(ingredient => ingredient.name).join(', ') || 'N/A'}
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  <strong>Price:</strong> ${dish.pricing || 'N/A'}
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  <strong>Availability:</strong> {dish.is_available ? 'Available' : 'Unavailable'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
