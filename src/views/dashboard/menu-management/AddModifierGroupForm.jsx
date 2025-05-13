import React, { useEffect, useRef, useState } from 'react'

import { useForm, Controller, useFieldArray } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

import * as yup from 'yup'

import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput
} from '@mui/material'

import { isCancel } from 'axios'

import OpenDialogOnElementClick from '@/components/layout/OpenDialogOnElementClick'

import AddDishDialog from './add-dish-model'

import { API_ROUTER } from '@/utils/apiRoutes'

import { apiResponseErrorHandling, toastError, toastSuccess } from '@/utils/globalFunctions'

import axiosApiCall from '@/utils/axiosApiCall'

// Validation schema

const schema = yup.object().shape({
  requireSelection: yup.boolean().default(false),
  required_rule: yup.string().nullable(),
  quantity: yup.number().nullable(),
  requireHowManySelection: yup.boolean().default(false),
  max_selection: yup.number().nullable()
})

export default function ModifyGroupForm() {
  const buttonProps = {
    variant: 'contained',
    color: 'primary',
    children: 'Add New Dish'
  }

  const dialogProps = {
    data: null
  }

  const [dishCreateData, setDishCreateData] = useState([])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      dishes: [],
      requireSelection: false,
      required_rule: '',
      quantity: '',
      requireHowManySelection: false,
      max_selection: ''
    }
  })

  const [dishes, setDishes] = useState([])

  const [selectedDishIds, setSelectedDishIds] = useState([])

  const [loading, setLoading] = useState(false)

  const abortController = useRef(null)

  const requireSelection = watch('requireSelection')
  const requireHowManySelection = watch('requireHowManySelection')

  useEffect(() => {
    if (requireSelection) {
      control.register('quantity')
    } else {
      control.unregister('quantity')
    }
  }, [requireSelection, control])

  useEffect(() => {
    if (requireHowManySelection) {
      control.register('max_selection')
    } else {
      control.unregister('max_selection')
    }
  }, [requireHowManySelection, control])

  useEffect(() => {
    fetchDishes()

    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [dishCreateData])

  const fetchDishes = async () => {
    if (abortController.current) {
      abortController.current.abort()
    }

    abortController.current = new AbortController()

    try {
      setLoading(true)

      const response = await axiosApiCall.get(API_ROUTER.GET_FOOD_DISH, {
        signal: abortController.current.signal
      })

      const dishesData = response?.data || []

      setDishes(dishesData?.response?.dishes)

      setSelectedDishIds([dishCreateData?.response?._id || null])
    } catch (error) {
      if (error.name !== 'AbortError') {
        toastError(error?.response?.data?.message || 'Failed to fetch dishes')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = event => {
    setSelectedDishIds(event.target.value)
  }

  const onSubmit = async data => {
    const transformedData = {
      name: data.name.toString(),
      dishIds: selectedDishIds,
      requireCustomerToSelectDish: data.requireSelection,
      required_rule: data.required_rule.toLowerCase(),
      quantity: data.quantity,
      what_the_maximum_amount_of_item_customer_can_select: data.requireHowManySelection,
      max_selection: data.max_selection
    }

    try {
      setIsSubmitting(true)
      const response = await axiosApiCall.post(API_ROUTER.ADD_MODIFIER_DISH, transformedData, {})

      const responseBody = response?.data

      toastSuccess(responseBody?.message)

      handleBackToTabs(tabValue)
    } catch (error) {
      if (!isCancel(error)) {
        const errorMessage = apiResponseErrorHandling(error)

        toastError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        maxWidth: 900,
        margin: 'auto',
        padding: 3,
        backgroundColor: '#fff',
        borderRadius: 2,
        boxShadow: 2
      }}
    >
      <Typography variant='h6' fontWeight='bold' mb={3}>
        Add New Modify Group
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name='name'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Name'
                  variant='outlined'
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id='dish-select-label'>Select Dishes</InputLabel>
              <Select
                labelId='dish-select-label'
                multiple
                value={selectedDishIds.filter(id => dishes.some(d => d._id === id))} // Filter invalid IDs
                onChange={handleChange}
                input={<OutlinedInput label='Select Dishes' />}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected
                      .map(id => dishes.find(d => d._id === id)) // Find the dish by ID
                      .filter(dish => dish && dish.name && dish.name.trim() !== '') // Filter out invalid dishes
                      .map(dish => (
                        <Chip key={dish._id} label={dish.name} />
                      ))}
                  </Box>
                )}
              >
                {Array.isArray(dishes) && dishes.length > 0 ? (
                  dishes
                    .filter(dish => dish.name && dish.name.trim() !== '')
                    .map(dish => (
                      <MenuItem key={dish._id} value={dish._id}>
                        {dish.name}
                      </MenuItem>
                    ))
                ) : (
                  <MenuItem disabled>No dishes available</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <OpenDialogOnElementClick
              element={Button}
              elementProps={buttonProps}
              dialog={AddDishDialog}
              dialogProps={dialogProps}
              setDishCreateData={setDishCreateData}
            />
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom>
                Rules
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='requireSelection'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label='Require customers to select a dish?'
                  />
                )}
              />
            </Grid>

            {requireSelection && (
              <>
                <Grid item xs={6}>
                  <Controller
                    name='required_rule'
                    control={control}
                    render={({ field }) => (
                      <Select {...field} fullWidth error={!!errors.required_rule}>
                        <MenuItem value='exactly'>Exactly</MenuItem>
                        <MenuItem value='atleast'>At least</MenuItem>
                        <MenuItem value='maximum'>Maxi Mum</MenuItem>
                      </Select>
                    )}
                  />
                  {errors.required_rule && <Typography color='error'>{errors.required_rule.message}</Typography>}
                </Grid>
                <Grid item xs={6}>
                  <Controller
                    name='quantity'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type='text'
                        label='Quantity'
                        variant='outlined'
                        fullWidth
                        error={!!errors.quantity}
                        helperText={errors.quantity?.message}
                      />
                    )}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Controller
                name='requireHowManySelection'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label='What is the maximum number of dishes customers can select?'
                  />
                )}
              />
            </Grid>

            {requireHowManySelection && (
              <Grid item xs={6}>
                <Controller
                  name='max_selection'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type='text'
                      label='Max Selection'
                      variant='outlined'
                      fullWidth
                      error={!!errors.max_selection}
                      helperText={errors.max_selection?.message}
                    />
                  )}
                />
              </Grid>
            )}
          </Grid>

          {/* Ingredients Section */}
          {/* <Grid item xs={12}>
            <Typography variant='subtitle1' mb={1}>
              Ingredients
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ingredient</TableCell>
                    <TableCell>Unit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getValues('ingredients').map((ingredient, index) => (
                    <TableRow key={index}>
                      <TableCell>{ingredient.name}</TableCell>
                      <TableCell>{ingredient.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid> */}
        </Grid>

        {/* Action Buttons */}
        <Box mt={3} display='flex' justifyContent='flex-end' gap={2}>
          <Button type='submit' variant='contained' color='success'>
            Save
          </Button>
          <Button variant='contained' color='error' onClick={() => console.log('Delete action')}>
            Delete
          </Button>
        </Box>
      </form>
    </Box>
  )
}
