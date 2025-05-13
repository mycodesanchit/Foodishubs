'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Next Imports
import { useRouter, useParams } from 'next/navigation'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { isCancel } from 'axios'

// Component Imports

// MUI Imports
import {
  Button,
  Card,
  CardContent,
  Grid,
  Box,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormLabel,
  FormHelperText,
  CircularProgress,
  Typography
} from '@mui/material'
import CardHeader from '@mui/material/CardHeader'

import GoogleAddressAutoComplete from '@/components/nourishubs/GoogleAddressAutoComplete'

import CustomTextField from '@core/components/mui/TextField'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { getLocalizedUrl } from '@/utils/i18n'
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'
import { API_ROUTER } from '@/utils/apiRoutes'

const AddStaffFormComponent = ({ dictionary }) => {
  const router = useRouter()
  const { lang: locale } = useParams()

  // states
  const [isGetRoleListLoading, setIsGetRoleListLoading] = useState(false)
  const getRoleListController = useRef()
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)
  // const [userData, setUserData] = useState()
  const [roles, setRoles] = useState([])

  // Get Roles
  const fetchRoleList = () => {
    setIsGetRoleListLoading(true)

    if (getRoleListController.current) {
      getRoleListController.current?.abort()
    }

    getRoleListController.current = new AbortController()

    axiosApiCall
      .get('/v1/role', {
        signal: getRoleListController?.current?.signal
      })
      .then(response => {
        setIsGetRoleListLoading(false)

        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        setRoles(responseBodyData?.roles)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsGetRoleListLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }

  // Form Schema
  const schema = yup.object().shape({
    first_name: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.first_name),
    last_name: yup.string().required(dictionary?.validation?.required),
    email: yup.string().email(dictionary?.form?.validation?.email_address).required(dictionary?.validation?.required),
    phoneNo: yup.string().required(dictionary?.validation?.required),
    role: yup.string().required(dictionary?.validation?.required),
    // google_address: yup.object().shape({
    //   country: yup.string().required('Country is required'),
    //   city: yup.string().required('City is required'),
    //   state: yup.string().required('State is required'),
    //   district: yup.string().required('District is required'),
    //   address: yup.string().required(dictionary?.validation?.required),
    //   latitude: yup.number().required('Latitude is required'),
    //   longitude: yup.number().required('Longitude is required')
    // })
    google_address: yup.object().required(dictionary?.form?.validation?.required)
  })

  const {
    control,
    handleSubmit,
    // watch,
    setError,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phoneNo: '',
      role: '',
      google_address: null
    }
  })


  const onSubmit = data => {
    const locationData = Object.fromEntries(
      Object.entries(data.google_address || {}).filter(([key]) =>
        ['country', 'state', 'city', 'district', 'latitude', 'longitude', 'address'].includes(key)
      )
    )

    const apiFormData = {
      ...data,
      ...locationData,
      google_address: undefined
    }

    setIsFormSubmitLoading(true)

    axiosApiCall({
      method: 'post',
      url: API_ROUTER.STAFF_MANAGEMENT,
      data: apiFormData
    })
      .then(response => {
        toastSuccess(response?.data?.message)
        reset()
        setIsFormSubmitLoading(false)
        router.push('/staff-management')
      })
      .catch(error => {
        setIsFormSubmitLoading(false)
        const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

        if (isVariableAnObject(apiResponseErrorHandlingData)) {
          setFormFieldsErrors(apiResponseErrorHandlingData, setError)
        } else {
          toastError(apiResponseErrorHandlingData)
        }
      })
  }

  /** Set user selected permission data: End */

  /**
   * Google address auto complete: Start
   */
  // const google_address = watch('google_address')

  // useEffect(() => {
  //   console.log('google_address: ', google_address)
  // }, [google_address])
  /** Google address auto complete: End */

  useEffect(() => {
    fetchRoleList()
  }, [])

  return (
    <Card>
      <CardHeader title='Add Staff' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, minHeight: '25px' }}>
            <Button variant='contained' color='primary' type='submit' disabled={isFormSubmitLoading}>
              {dictionary?.form?.button?.add}
              {isFormSubmitLoading && <CircularProgress className='ml-1' size={20} sx={{ color: 'white' }} />}
            </Button>
            <Button variant='contained' color='success' onClick={() => router.back()} disabled={isFormSubmitLoading}>
              {dictionary?.form?.button?.cancel}
            </Button>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Controller
                name='first_name'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary?.form?.label?.first_name}
                    placeholder={dictionary?.form?.placeholder?.first_name}
                    // error={!!errors.first_name}
                    // helperText={errors.name?.message}
                    {...(errors.first_name && { error: true, helperText: errors.first_name.message })}
                  />
                )}
              />
              {/* {errors.first_name && <FormHelperText error>{errors?.first_name?.message}</FormHelperText>} */}
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='last_name'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary?.form?.label?.last_name}
                    placeholder={dictionary?.form?.placeholder?.last_name}
                    error={!!errors.last_name}
                    helperText={errors.last_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='role'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label={dictionary?.form?.label?.role}
                    placeholder={dictionary?.form?.placeholder?.role}
                    error={!!errors.role}
                    value={field.value}
                    helperText={errors.role?.message}
                    onChange={event => field.onChange(event.target.value)}
                  >
                    {isGetRoleListLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                      </MenuItem>
                    ) : roles.length > 0 ? (
                      roles.map(role => (
                        <MenuItem key={role._id} value={role._id}>
                          {role.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No roles available</MenuItem>
                    )}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='email'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary?.form?.label?.email_address}
                    placeholder={dictionary?.form?.placeholder?.email_address}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='phoneNo'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary?.form?.label?.phone_number}
                    placeholder={dictionary?.form?.placeholder?.phone_number}
                    error={!!errors.phoneNo}
                    helperText={errors.phoneNo?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
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
                        {...params}
                        {...(errors?.google_address && { error: true, helperText: errors?.google_address?.message })}
                        label={dictionary?.form?.label?.address}
                        placeholder={dictionary?.form?.placeholder?.address}
                        error={!!errors.google_address}
                        helperText={errors.google_address?.message}
                      />
                    )}
                    noOptionsText={dictionary?.common?.no_locations}
                  />
                )}
              />
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AddStaffFormComponent
