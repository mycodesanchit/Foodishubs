'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { isCancel } from 'axios'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import * as yup from 'yup'

// MUI Imports
import { Button, Card, CardHeader, CircularProgress, Grid, MenuItem, Typography } from '@mui/material'

// Component Imports
import CustomTextField from '@/@core/components/mui/TextField'
import GoogleAddressAutoComplete from '@/components/nourishubs/GoogleAddressAutoComplete'

import { setProfile } from '@/redux-store/slices/profile'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'

/**
 * Page
 */
const EditDetails = ({ dictionary, userData, setUserData, profileUploadedFile }) => {
  const router = useRouter()
  const dispatch = useDispatch()

  // states
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)
  const [selectedGender, setSelectedGender] = useState('')
  const genders = dictionary?.form?.dropdown.genders

  /**
   * Form Validation Schema
   */
  const formValidationSchema = yup.object({
    first_name: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.first_name),
    last_name: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.last_name),
    schoolName: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.school_name),
    email: yup
      .string()
      .required()
      .email(dictionary?.form?.validation?.email_address)
      .label(dictionary?.form?.label?.email),
    gender: yup.string(),
    phoneNo: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.phoneNo),
    google_address: yup
      .object()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.address)
  })

  const formDefaultValues = {
    first_name: '',
    last_name: '',
    email: '',
    phoneNo: '',
    google_address: null,
    schoolName: null,
    gender: null
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    setError
  } = useForm({
    resolver: yupResolver(formValidationSchema),
    defaultValues: {}
  })

  useEffect(() => {
    if (userData?._id) {
      setValue('first_name', userData?.first_name ? userData?.first_name : '')
      setValue('last_name', userData?.last_name ? userData?.last_name : '')
      setValue('email', userData?.email ? userData?.email : '')
      setValue('phoneNo', userData?.phoneNo ? userData?.phoneNo : '')
      setValue('google_address', { ...userData?.location, description: userData?.location?.address })
      setValue('gender', userData?.gender ? userData?.gender : '')
      setValue('schoolName', userData?.schoolName ? userData?.schoolName : '')
      setSelectedGender(userData?.gender ? userData?.gender : '')
    }
  }, [userData])

  const onSubmit = async data => {
    const locationData = Object.fromEntries(
      Object.entries(data?.google_address).filter(([key]) =>
        ['country', 'city', 'state', 'district', 'latitude', 'longitude', 'address'].includes(key)
      )
    )

    if (profileUploadedFile) {
      data.profileImage = profileUploadedFile
    }

    data.gender = selectedGender
    locationData.latitude = parseFloat(locationData.latitude)
    locationData.longitude = parseFloat(locationData.longitude)

    const apiFormData = {
      ...data,
      ...locationData,
      google_address: undefined
    }

    setIsFormSubmitLoading(true)
    axiosApiCall
      .patch(`/v1/parent-dashboard`, apiFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        const responseBody = response?.data

        setUserData(responseBody.response.userData)
        dispatch(setProfile(responseBody.response.userData))
        toastSuccess(responseBody?.message)
        setIsFormSubmitLoading(false)
      })
      .catch(error => {
        console.log('error', error)

        if (!isCancel(error)) {
          setIsFormSubmitLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          if (isVariableAnObject(apiResponseErrorHandlingData)) {
            setFormFieldsErrors(apiResponseErrorHandlingData, setError)
          } else {
            toastError(apiResponseErrorHandlingData)
          }
        }
      })
  }

  const handleGenderChange = event => {
    setValue('gender', event?.target?.value)
    setSelectedGender(event?.target?.value)
  }

  return (
    <Card style={{ marginTop: '16px' }}>
      <CardHeader title={dictionary?.page?.common?.add_your_details} />
      <form noValidate action={() => {}} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid item xs={6}>
            <Controller
              name='first_name'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary?.form?.label?.first_name}
                  placeholder={dictionary?.form?.placeholder?.first_name}
                  {...(errors.first_name && { error: true, helperText: errors.first_name.message })}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name='last_name'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary?.form?.label?.last_name}
                  placeholder={dictionary?.form?.placeholder?.last_name}
                  {...(errors.last_name && { error: true, helperText: errors.last_name.message })}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name='schoolName'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary?.form?.label?.school_name}
                  placeholder={dictionary?.form?.placeholder?.school_name}
                  {...(errors.schoolName && { error: true, helperText: errors.schoolName.message })}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name='email'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  type='email'
                  label={dictionary?.form?.label?.email_address}
                  placeholder={dictionary?.form?.placeholder?.email_address}
                  {...(errors.email && { error: true, helperText: errors.email.message })}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name='phoneNo'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary?.form?.label?.contact_no}
                  placeholder={dictionary?.form?.placeholder?.contact_no}
                  {...(errors.phoneNo && { error: true, helperText: errors.phoneNo.message })}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              name='gender'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  select
                  fullWidth
                  value={selectedGender}
                  label={dictionary?.form?.label?.gender}
                  error={Boolean(errors.gender)}
                  helperText={errors?.gender?.message || ''}
                  SelectProps={{
                    displayEmpty: true,
                    onChange: handleGenderChange
                  }}
                >
                  <MenuItem disabled value=''>
                    <Typography color='text.disabled'>{dictionary?.form?.placeholder?.gender}</Typography>
                  </MenuItem>
                  {genders?.map(item => (
                    <MenuItem value={item?.id} key={item?.id}>
                      {item?.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name='google_address'
              control={control}
              render={({ field }) => (
                <GoogleAddressAutoComplete
                  {...field}
                  fullWidth
                  onChange={(_, data) => {
                    field.onChange(data?.details_for_api)
                  }}
                  renderInput={params => (
                    <CustomTextField
                      label={dictionary?.form?.label?.address}
                      placeholder={dictionary?.form?.placeholder?.address}
                      className='autocompate-block-input-inner'
                      {...params}
                      {...(errors.google_address && {
                        error: true,
                        helperText: errors.google_address.message
                      })}
                    />
                  )}
                />
              )}
            />
          </Grid>
        </Grid>

        <Grid container sx={{ p: 5 }} spacing={20} direction='column' alignItems='center' justifyContent='center'>
          <Grid item xs={12}>
            <Button disabled={isFormSubmitLoading} variant='contained' sx={{ m: 1 }} type='submit'>
              {dictionary?.form?.button?.submit}
              {isFormSubmitLoading && <CircularProgress className='ml-2' size={20} sx={{ color: 'white' }} />}
            </Button>
            <Button
              variant='tonal'
              color='secondary'
              type='reset'
              onClick={() => {
                router.push('/dashboard')
              }}
              sx={{ m: 1 }}
            >
              {dictionary?.form?.button?.cancel}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Card>
  )
}

export default EditDetails
