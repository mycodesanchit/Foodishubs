'use client'

import React, { useState } from 'react'

import { useForm, Controller } from 'react-hook-form'

import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'

import { Box, TextField, Button, Typography, Grid, Paper } from '@mui/material'

import { isCancel } from 'axios'

import axiosApiCall from '@/utils/axiosApiCall'

import { toastError, apiResponseErrorHandling, toastSuccess } from '@/utils/globalFunctions'

import { API_ROUTER } from '@/utils/apiRoutes'

const schema = yup.object().shape({
  categoryName: yup
    .string()
    .required('Category Name is required')
    .max(50, 'Category Name must be less than 50 characters'),
  file: yup
    .mixed()
    .required('Category Image is required')
    .test('fileType', 'Invalid file type. Only images are allowed.', value => {
      return value && value.type.startsWith('image/')
    })
    .test('fileSize', 'File size must be less than 2MB.', value => {
      return value && value.size <= 2 * 1024 * 1024
    })
})

function AddCategoryForm({ onDelete, handleBackToTabs, tabValue, editId }) {
  console.log('EditIdAddForm', editId)
  const [imageURL, setImageURL] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      categoryName: '',
      file: null
    }
  })

  const handleImageChange = event => {
    const file = event.target.files[0]

    if (file) {
      setValue('file', file, { shouldValidate: true })
      setImageURL(URL.createObjectURL(file))
    } else {
      toastError('Please select a valid file.')
    }
  }

  const addCategory = async data => {
    setIsSubmitting(true)

    const formData = new FormData()

    formData.append('name', data.categoryName)
    formData.append('file', data.file)

    try {
      const response = await axiosApiCall.post(API_ROUTER.ADD_FOOD_CATEGORY, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const responseBody = response?.data

      toastSuccess(responseBody?.message)
      handleBackToTabs(tabValue)
      setIsSubmitting(false)
    } catch (error) {
      setIsSubmitting(false)

      if (!isCancel(error)) {
        const errorMessage = apiResponseErrorHandling(error)

        toastError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmit = data => {
    console.log('Form Data Before Submission:', data)

    if (!data.file || !(data.file instanceof File)) {
      toastError('Please select a valid file.')

      return
    }

    addCategory(data)
  }

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 3,
        borderRadius: 2,
        backgroundColor: '#ffffff'
      }}
    >
      <Typography variant='h6' fontWeight='bold' mb={3}>
        Add Category
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3} alignItems='center'>
          <Grid item xs={12} md={6}>
            <Typography mb={1} variant='body1' color='textSecondary'>
              Category Name
            </Typography>
            <Controller
              name='categoryName'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder='Enter Category Name'
                  variant='outlined'
                  size='small'
                  error={!!errors.categoryName}
                  helperText={errors.categoryName?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography mb={1} variant='body1' color='textSecondary'>
              Category Image
            </Typography>
            <Box display='flex' alignItems='center' gap={2}>
              <label htmlFor='image-upload'>
                <input
                  accept='image/*'
                  style={{ display: 'none' }}
                  id='image-upload'
                  type='file'
                  onChange={handleImageChange}
                />
                <Button variant='outlined' component='span'>
                  Upload Image
                </Button>
              </label>
              {imageURL && (
                <img
                  src={imageURL}
                  alt='Uploaded'
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                />
              )}
              {errors.file && (
                <Typography variant='caption' color='error'>
                  {errors.file.message}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        <Box mt={3} display='flex' justifyContent='flex-end' gap={2}>
          <Button type='submit' variant='contained' color='success' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
          <Button variant='contained' color='success' sx={{ backgroundColor: '#8BC34A' }} onClick={onDelete}>
            Delete
          </Button>
        </Box>
      </form>
    </Paper>
  )
}

export default AddCategoryForm
