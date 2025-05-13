import React, { useEffect, useState } from 'react'

import { useForm, Controller } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

import * as yup from 'yup'

import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  Select,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Chip
} from '@mui/material'

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'

import { isCancel } from 'axios'

import { API_ROUTER } from '@/utils/apiRoutes'

import axiosApiCall from '@/utils/axiosApiCall'

import { toastError, apiResponseErrorHandling, toastSuccess } from '@/utils/globalFunctions'

// Validation schema
const schema = yup.object({
  dishName: yup.string().required('Dish Name is required'),
  dishDescription: yup.string().required('Dish Description is required'),
  // category: yup.array().of(yup.string()).min(1, 'Select at least one category'),
  modifier: yup.string().required('Modifier is required'),
  price: yup.number().typeError('Price must be a number').required('Price is required'),
  ingredients: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required('Ingredient Name is required'),
        quantity: yup.string().required('Quantity is required'),
        unit: yup.string().required('Unit is required')
      })
    )
    .min(1, 'At least one ingredient is required')
})

function AddDishForm({ onSave, onDelete, handleBackToTabs, tabValue }) {
  const [imageURL, setImageURL] = useState('')
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoriesList, setCategoriesList] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])

  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      dishName: '',
      dishDescription: '',
      category: '',
      modifier: '',
      price: '',
      ingredients
    },
    resolver: yupResolver(schema)
  })

  useEffect(() => {
    const abortController = new AbortController()

    const getAllCategories = async () => {
      try {
        const response = await axiosApiCall.get(API_ROUTER.GET_FOOD_CATEGORY, {
          signal: abortController.signal
        })

        const fetchedCategories = response?.data?.response?.categories || []

        setCategoriesList(fetchedCategories)
      } catch (error) {
        if (error.name !== 'AbortError') {
          toastError(error?.response?.data?.message || 'Failed to fetch categories')
        }
      }
    }

    getAllCategories()

    return () => {
      abortController.abort()
    }
  }, [])

  const handleChange = event => {
    setSelectedCategories(event.target.value)
  }

  const handleRemoveCategory = categoryToRemove => {
    setSelectedCategories(prev => prev.filter(category => category !== categoryToRemove))
  }

  const handleImageChange = event => {
    const file = event.target.files[0]

    if (file) {
      setValue('file', file, { shouldValidate: true })

      setImageURL(URL.createObjectURL(file))
    } else {
      toastError('Please select a valid file.')
    }
  }

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...ingredients]

    updatedIngredients[index][field] = value
    setIngredients(updatedIngredients)
    setValue('ingredients', updatedIngredients)
  }

  const addIngredientRow = () => {
    const newIngredients = [...ingredients, { name: '', quantity: '', unit: '' }]

    setIngredients(newIngredients)

    setValue('ingredients', newIngredients)
  }

  const onSubmit = async data => {
    const formData = new FormData()

    formData.append('name', data.dishName)

    formData.append('description', data.dishDescription)

    formData.append('file', data.file)

    selectedCategories.forEach((id, index) => {
      formData.append(`categoryIds[${index}]`, id)
    })

    formData.append('is_modifier_dish', 1)
    formData.append('pricing', data.price)

    data.ingredients.forEach((ingredient, index) => {
      Object.keys(ingredient).forEach(key => {
        formData.append(`ingredients[${index}][${key}]`, ingredient[key])
      })
    })

    try {
      setIsSubmitting(true)

      const response = await axiosApiCall.post(API_ROUTER.ADD_FOOD_DISH, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const responseBody = response?.data

      toastSuccess(responseBody?.message)

      handleBackToTabs(tabValue)

      if (onSave) onSave()
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
    <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
      <Typography variant='h6' fontWeight='bold' mb={3}>
        Add New Dish
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography mb={1}>Dish Name</Typography>
            <TextField
              fullWidth
              placeholder='Enter Dish Name'
              variant='outlined'
              size='small'
              {...register('dishName')}
              error={!!errors.dishName}
              helperText={errors.dishName?.message}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography mb={1}>Dish Description</Typography>
            <TextField
              fullWidth
              placeholder='Type Here....'
              multiline
              rows={3}
              variant='outlined'
              size='small'
              {...register('dishDescription')}
              error={!!errors.dishDescription}
              helperText={errors.dishDescription?.message}
            />
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant='h6' mb={2}>
                Select Categories
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Categories</InputLabel>
                <Select
                  multiple
                  value={selectedCategories}
                  onChange={handleChange}
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(value => (
                        <Chip
                          key={value}
                          label={categoriesList.find(category => category.id === value)?.name || value}
                          onDelete={() => handleRemoveCategory(value)}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {categoriesList.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography mb={1}>Select Modifier</Typography>
            <Controller
              name='modifier'
              control={control}
              render={({ field }) => (
                <Select {...field} fullWidth displayEmpty variant='outlined' size='small' error={!!errors.modifier}>
                  <MenuItem value='' disabled>
                    Select modifier
                  </MenuItem>
                  <MenuItem value='Modifier 1'>Modifier 1</MenuItem>
                  <MenuItem value='Modifier 2'>Modifier 2</MenuItem>
                </Select>
              )}
            />
            <Typography color='error' variant='caption'>
              {errors.modifier?.message}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography mb={1}>Pricing</Typography>
            <TextField
              fullWidth
              placeholder='Enter Price'
              variant='outlined'
              size='small'
              {...register('price')}
              error={!!errors.price}
              helperText={errors.price?.message}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography mb={1}>Dish Image</Typography>
            <Box display='flex' alignItems='center' gap={2}>
              <label htmlFor='image-upload'>
                <input
                  accept='image/*'
                  style={{ display: 'none' }}
                  id='image-upload'
                  type='file'
                  onChange={handleImageChange}
                />
                <Button variant='outlined' component='span' fullWidth>
                  +
                </Button>
              </label>
              {imageURL && (
                <img
                  src={imageURL}
                  alt='Uploaded'
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography mb={1}>Add Ingredient</Typography>
            {ingredients.map((ingredient, index) => (
              <Grid container spacing={2} key={index} mb={1}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder='Ingredient Name'
                    size='small'
                    value={ingredient.name}
                    onChange={e => handleIngredientChange(index, 'name', e.target.value)}
                    error={!!errors.ingredients?.[index]?.name}
                    helperText={errors.ingredients?.[index]?.name?.message}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder='Quantity'
                    size='small'
                    value={ingredient.quantity}
                    onChange={e => handleIngredientChange(index, 'quantity', e.target.value)}
                    error={!!errors.ingredients?.[index]?.quantity}
                    helperText={errors.ingredients?.[index]?.quantity?.message}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder='Unit'
                    size='small'
                    value={ingredient.unit}
                    onChange={e => handleIngredientChange(index, 'unit', e.target.value)}
                    error={!!errors.ingredients?.[index]?.unit}
                    helperText={errors.ingredients?.[index]?.unit?.message}
                  />
                </Grid>
              </Grid>
            ))}
            <IconButton onClick={addIngredientRow} color='primary'>
              <AddCircleOutlineIcon />
            </IconButton>
          </Grid>
        </Grid>

        <Box mt={3} display='flex' justifyContent='flex-end' gap={2}>
          <Button type='submit' variant='contained' color='success'>
            Save
          </Button>
          <Button variant='contained' color='success' sx={{ backgroundColor: '#8BC34A' }} onClick={onDelete}>
            Delete
          </Button>
        </Box>
      </form>
    </Paper>
  )
}

export default AddDishForm
