// React Imports
import React, { useState } from 'react'

import { useForm, Controller, useFieldArray } from 'react-hook-form'

import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'

// MUI Imports
import Grid from '@mui/material/Grid'

import Dialog from '@mui/material/Dialog'

import Button from '@mui/material/Button'

import DialogTitle from '@mui/material/DialogTitle'

import DialogContent from '@mui/material/DialogContent'

import DialogActions from '@mui/material/DialogActions'

import Typography from '@mui/material/Typography'

import Table from '@mui/material/Table'

import TableBody from '@mui/material/TableBody'

import TableCell from '@mui/material/TableCell'

import TableContainer from '@mui/material/TableContainer'

import TableHead from '@mui/material/TableHead'

import TableRow from '@mui/material/TableRow'

import IconButton from '@mui/material/IconButton'

import DeleteIcon from '@mui/icons-material/Delete'

import TextField from '@mui/material/TextField'

import axiosApiCall from '@/utils/axiosApiCall'

import { API_ROUTER } from '@/utils/apiRoutes'

import { toastError, toastSuccess } from '@/utils/globalFunctions'

// Validation Schema
const schema = yup.object().shape({
  name: yup.string().required('Dish name is required'),
  description: yup.string().required('Dish description is required'),
  pricing: yup.number().required('Pricing is required').positive('Must be positive'),
  tax_pricing: yup.number().required('Tax pricing is required').positive('Must be positive'),
  ingredients: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required('Ingredient name is required'),
        quantity: yup.string().required('Quantity is required'),
        unit: yup.string().required('Unit is required')
      })
    )
    .min(1, 'At least one ingredient is required')
})

const AddDishDialog = ({ open, setOpen, data, setDishCreateData }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),

    defaultValues: {
      name: data?.name || '',
      description: data?.description || '',
      pricing: data?.pricing || 0,
      tax_pricing: data?.tax_pricing || 0,
      ingredients: data?.ingredients || [{ name: '', quantity: '', unit: '' }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients'
  })

  const handleClose = () => {
    setOpen(false)

    reset(data)
  }

  const onSubmit = async formData => {
    try {
      // Perform API call with axios
      const response = await axiosApiCall.post(API_ROUTER.ADD_FOOD_DISH, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const responseBody = response?.data

      setDishCreateData(responseBody)

      if (responseBody.status === true) {
        handleClose()

        toastSuccess(responseBody?.message)
      }
    } catch (error) {
      toastError(error?.response?.data?.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      maxWidth='md'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogTitle>Create New Modifier Dish</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name='name'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Dish Name'
                    variant='outlined'
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Dish Description'
                    variant='outlined'
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name='pricing'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Pricing'
                    type='number'
                    variant='outlined'
                    fullWidth
                    error={!!errors.pricing}
                    helperText={errors.pricing?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name='tax_pricing'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Tax Pricing'
                    type='number'
                    variant='outlined'
                    fullWidth
                    error={!!errors.tax_pricing}
                    helperText={errors.tax_pricing?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant='subtitle1' mb={1}>
                Ingredients
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fields.map((ingredient, index) => (
                      <TableRow key={ingredient.id}>
                        <TableCell>
                          <Controller
                            name={`ingredients.${index}.name`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                variant='outlined'
                                fullWidth
                                error={!!errors.ingredients?.[index]?.name}
                                helperText={errors.ingredients?.[index]?.name?.message}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`ingredients.${index}.quantity`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                variant='outlined'
                                fullWidth
                                error={!!errors.ingredients?.[index]?.quantity}
                                helperText={errors.ingredients?.[index]?.quantity?.message}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`ingredients.${index}.unit`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                variant='outlined'
                                fullWidth
                                error={!!errors.ingredients?.[index]?.unit}
                                helperText={errors.ingredients?.[index]?.unit?.message}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton color='error' onClick={() => remove(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button
                variant='contained'
                color='primary'
                onClick={() => append({ name: '', quantity: '', unit: '' })}
                sx={{ mt: 2 }}
              >
                Add Ingredient
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' type='submit'>
            Submit
          </Button>
          <Button variant='outlined' onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddDishDialog
