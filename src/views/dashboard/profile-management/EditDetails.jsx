'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { isCancel } from 'axios'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import * as yup from 'yup'

// MUI Imports
import { Button, Card, CardHeader, Chip, CircularProgress, Divider, Grid, Typography } from '@mui/material'

// Component Imports
import CustomTextField from '@/@core/components/mui/TextField'
import GoogleAddressAutoComplete from '@/components/nourishubs/GoogleAddressAutoComplete'

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
const EditDetails = ({ dictionary, userData, setUserData }) => {
  const router = useRouter()

  // states
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)

  /**
   * Form Validation Schema
   */
  const formValidationSchema = yup.object({
    first_name: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.first_name),
    last_name: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.last_name),
    email: yup
      .string()
      .required()
      .email(dictionary?.form?.validation?.email_address)
      .label(dictionary?.form?.label?.email),
    phoneNo: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.phoneNo),
    companyName: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.companyName),
    description: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.description),
    google_address: yup
      .object()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.address),
    venues: yup.array().of(
      yup.object().shape({
        google_address: yup
          .object()
          .required(dictionary?.form?.validation?.required)
          .label(dictionary?.form?.label?.address),
        monday: yup.object().shape({
          open_time: yup.string().nullable(),
          close_time: yup
            .string()
            .test('close_time-required', dictionary?.form?.validation?.required, function (value) {
              const { open_time } = this.parent

              if (open_time && !value) {
                return false // Fail validation if open_time exists and close_time is empty
              }

              return true // Pass validation
            })
            .test('close_time-lessthan', dictionary?.form?.validation?.end_time_lessthan, function (value) {
              const { open_time } = this.parent

              if (open_time > value) {
                return false
              }

              return true
            })
        })
      })
    )
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    setError
  } = useForm({
    resolver: yupResolver(formValidationSchema),
    defaultValues: {
      venues: []
    }
  })

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormProvider)
    name: 'venues' // unique name for your Field Array
  })

  useEffect(() => {
    append({ name: 'venues' })
  }, [])

  useEffect(() => {
    if (userData?._id) {
      setValue('first_name', userData?.first_name ? userData?.first_name : '')
      setValue('last_name', userData?.last_name ? userData?.last_name : '')
      setValue('companyName', userData?.companyName ? userData?.companyName : '')
      setValue('email', userData?.email ? userData?.email : '')
      setValue('phoneNo', userData?.phoneNo ? userData?.phoneNo : '')
      setValue('description', userData?.description ? userData?.description : '')
      setValue('google_address', { ...userData?.location, description: userData?.location?.address })
    }

    if (userData.venues) {
      remove()
      let indexVenue = 0

      Object.values(userData.venues).map(function (venue) {
        append({ name: 'venues' })
        setValue('venues.' + indexVenue + '.google_address', {
          ...venue?.location,
          description: venue?.location?.address
        })

        venue.openingTimes &&
          Object.keys(venue.openingTimes).map(function (day) {
            let timesObj = venue.openingTimes[day]

            setValue('venues.' + indexVenue + '.' + day + '.open_time', convertTime12to24(timesObj.openingTime))
            setValue('venues.' + indexVenue + '.' + day + '.close_time', convertTime12to24(timesObj.closingTime))
          })
        indexVenue++
      })
    }
  }, [userData])

  const onSubmit = async data => {
    let formattedVenue = []

    data.venues.map(function (vendor, i) {
      let dayTimeObj = {}

      Object.keys(dictionary?.day_names?.full_names).map(function (day_name, day_name_index) {
        if (vendor[day_name]['open_time']) {
          dayTimeObj[day_name] = {
            openingTime: convertTime24to12(vendor[day_name]['open_time']),
            closingTime: convertTime24to12(vendor[day_name]['close_time'])
          }
        }
      })

      const locationData = Object.fromEntries(
        Object.entries(vendor?.google_address).filter(([key]) =>
          ['country', 'state', 'city', 'district', 'latitude', 'longitude', 'address', 'coordinates'].includes(key)
        )
      )

      locationData.coordinates = [locationData.longitude, locationData.latitude]

      formattedVenue.push({
        location: locationData,
        openingTimes: dayTimeObj
      })
    })

    const locationData = Object.fromEntries(
      Object.entries(data?.google_address).filter(([key]) =>
        ['country', 'state', 'city', 'district', 'latitude', 'longitude', 'address'].includes(key)
      )
    )

    locationData.latitude = parseFloat(locationData.latitude)
    locationData.longitude = parseFloat(locationData.longitude)

    delete data.no_of_venue
    data.venues = formattedVenue

    const apiFormData = {
      ...data,
      ...locationData,
      google_address: undefined
    }

    setIsFormSubmitLoading(true)

    axiosApiCall
      .patch(`/v1/vendor/${userData._id}`, apiFormData)
      .then(response => {
        const responseBody = response?.data

        setUserData(responseBody.response.userData)

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

  const convertTime24to12 = timeString => {
    const [hourString, minute] = timeString.split(':')
    const hour = +hourString % 24
    let formattedHour = hour % 12 || 12

    return (formattedHour < 10 ? '0' + formattedHour : formattedHour) + ':' + minute + (hour < 12 ? ' AM' : ' PM')
  }

  const convertTime12to24 = timeString => {
    const [time, modifier] = timeString.split(' ')
    let [hours, minutes] = time.split(':')

    if (hours === '12') {
      hours = '00'
    }

    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12
    }

    return `${hours}:${minutes}`
  }

  const handleAddVenue = () => {
    setValue('no_of_venue', fields.length + 1)
    append({ name: 'vendor_data' })
  }

  const handleRemoveVenue = index => {
    setValue('no_of_venue', fields.length - 1)
    remove(index)
  }

  return (
    <Card style={{ marginTop: '16px' }}>
      <CardHeader title={dictionary?.page?.common?.edit_information} />
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
              name='companyName'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary?.form?.label?.company_name}
                  placeholder={dictionary?.form?.placeholder?.company_name}
                  {...(errors.companyName && { error: true, helperText: errors.companyName.message })}
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
                  label={dictionary?.form?.label?.phone_number}
                  placeholder={dictionary?.form?.placeholder?.phone_number}
                  {...(errors.phoneNo && { error: true, helperText: errors.phoneNo.message })}
                />
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
          <Grid item xs={12}>
            <Controller
              name='description'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary?.form?.label?.business_description}
                  placeholder={dictionary?.form?.placeholder?.business_description}
                  {...(errors.description && { error: true, helperText: errors.description.message })}
                />
              )}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Divider></Divider>
          <Typography level='h1' sx={{ p: 2 }}>
            {dictionary?.page?.profile_management?.venue_details}
          </Typography>
          <Grid item xs={12}>
            <Controller
              name='no_of_venue'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  disabled
                  label={dictionary?.form?.label?.no_of_venue}
                  placeholder={dictionary?.form?.placeholder?.no_of_venue}
                  {...(errors.no_of_venue && { error: true, helperText: errors.no_of_venue.message })}
                />
              )}
            />
          </Grid>
        </Grid>

        {fields.map((field, index) => {
          return (
            <span key={field.id}>
              <Grid container spacing={2} sx={{ p: 2 }}>
                <Grid item xs={12}>
                  <Controller
                    name={`venues.${index}.google_address`}
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
                            label={
                              dictionary?.form?.label?.venue +
                              ' ' +
                              (index + 1) +
                              ' ' +
                              dictionary?.form?.label?.address
                            }
                            placeholder={dictionary?.form?.placeholder?.address}
                            className='autocompate-block-input-inner'
                            {...params}
                            {...(errors.venues?.[index]?.google_address && {
                              error: true,
                              helperText: errors.venues?.[index]?.google_address.message
                            })}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <div className='d-flex justify-content-between' sx={{ p: 2 }}>
                <h5>
                  {dictionary?.form?.label?.venue + ' -' + (index + 1) + ' ' + dictionary?.form?.label?.opening_hours}
                </h5>
                {index != 0 && <Chip label='x' variant='outlined' onClick={() => handleRemoveVenue(index)} />}
              </div>
              <Grid container spacing={2} sx={{ p: 2 }}>
                {dictionary?.day_names?.full_names &&
                  Object.keys(dictionary?.day_names?.full_names).map(day_name => (
                    <Grid item xs={2} key={'days-' + day_name}>
                      <Controller
                        name={`venues.${index}.${day_name}.open_time`}
                        control={control}
                        render={({ field }) => (
                          <CustomTextField
                            type='time'
                            {...field}
                            fullWidth
                            label={dictionary?.day_names?.full_names[day_name]}
                            placeholder={dictionary?.form?.placeholder?.open}
                            {...(errors.venues?.[index]?.[day_name]?.open_time && {
                              error: true,
                              helperText: errors.venues?.[index]?.[day_name]?.open_time.message
                            })}
                          />
                        )}
                      />
                      <Controller
                        name={`venues.${index}.${day_name}.close_time`}
                        control={control}
                        render={({ field }) => (
                          <CustomTextField
                            type='time'
                            {...field}
                            fullWidth
                            placeholder={dictionary?.form?.placeholder?.close}
                            {...(errors.venues?.[index]?.[day_name]?.close_time && {
                              error: true,
                              helperText: errors.venues?.[index]?.[day_name]?.close_time.message
                            })}
                          />
                        )}
                      />
                    </Grid>
                  ))}
              </Grid>
            </span>
          )
        })}

        <Grid container sx={{ p: 5 }} spacing={20} direction='column' alignItems='center' justifyContent='center'>
          <Grid item xs={12}>
            <Button
              variant='contained'
              sx={{ m: 1 }}
              type='button'
              color='primary'
              onClick={() => {
                handleAddVenue()
              }}
            >
              {dictionary?.form?.button?.add_venue}
            </Button>
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
