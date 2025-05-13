'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

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

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'

//redux
/**
 * Page
 */

const Form = ({ dictionary, kidData, setKidData, profileUploadedFile }) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const pageFormRef = useRef(null)

  // states
  const [addressLatitude, setAddressLatitude] = useState('22.3038945')
  const [addressLongitude, setAddressLongitude] = useState('70.80215989999999')
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
    age: yup.number().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.age),
    class: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.class),
    weight: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.weight),
    height: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.height),
    gender: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.gender),
    allergiesOrDietaryDescription: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.allergies_dietary_description),
    google_address: yup
      .object()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.address)
  })

  const formDefaultValues = {
    first_name: '',
    last_name: '',
    schoolName: '',
    age: '',
    class: '',
    weight: '',
    height: '',
    google_address: null,
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
    fetchSchoolList()
  }, [])

  useEffect(() => {
    if (kidData?._id) {
      setValue('first_name', kidData?.first_name ? kidData?.first_name : '')
      setValue('last_name', kidData?.last_name ? kidData?.last_name : '')
      setValue('schoolName', kidData?.schoolName ? kidData?.schoolName : '')
      setValue('age', kidData?.age ? kidData?.age : '')
      setValue('class', kidData?.class ? kidData?.class : '')
      setValue('weight', kidData?.weight ? kidData?.weight : '')
      setValue('height', kidData?.height ? kidData?.height : '')
      setValue('google_address', { ...kidData?.location, description: kidData?.location?.address })
      setValue('gender', kidData?.gender ? kidData?.gender : '')
      setValue(
        'allergiesOrDietaryDescription',
        kidData?.allergiesOrDietaryDescription ? kidData?.allergiesOrDietaryDescription : ''
      )
      setSelectedGender(kidData?.gender ? kidData?.gender : '')
    }
  }, [kidData])

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
    data.age = parseInt(data.age)
    locationData.latitude = parseFloat(locationData.latitude)
    locationData.longitude = parseFloat(locationData.longitude)

    const apiFormData = {
      ...data,
      ...locationData,
      google_address: undefined
    }

    setIsFormSubmitLoading(true)

    let axiosApiCallUrl = '/v1/kids/create'

    if (kidData?._id) {
      axiosApiCallUrl = `/v1/kids/update/${kidData?._id}`
    }

    axiosApiCall({
      method: kidData?._id ? 'patch' : 'post',
      url: axiosApiCallUrl,
      data: apiFormData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        const responseBody = response?.data

        setKidData(responseBody.response.userData)
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

  /**
   * Fetch school: Start
   */
  const [isGetSchoolListLoading, setIsGetSchoolListLoading] = useState(false)
  const getSchoolListController = useRef()
  const [schools, setSchools] = useState([])

  const fetchSchoolList = () => {
    setIsGetSchoolListLoading(true)

    if (getSchoolListController.current) {
      getSchoolListController.current?.abort()
    }

    getSchoolListController.current = new AbortController()

    axiosApiCall
      .get(`/v1/kids/schools?lat=${addressLatitude}&lng=${addressLongitude}`, {
        signal: getSchoolListController?.current?.signal
      })
      .then(response => {
        setIsGetSchoolListLoading(false)

        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        const filteredSchool = responseBodyData?.schools.filter(school => school.schoolName == 'undefined')

        setSchools(responseBodyData?.schools)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsGetSchoolListLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }
  /** Fetch school: End */

  const handleGenderChange = event => {
    setValue('gender', event?.target?.value)
    setSelectedGender(event?.target?.value)
  }

  return (
    <Card style={{ marginTop: '16px' }}>
      <CardHeader title={dictionary?.page?.parent_kid_management?.add_kids_details} />
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
          <Grid item xs={4}>
            <Controller
              name='class'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary?.form?.label?.class}
                  placeholder={dictionary?.form?.placeholder?.class}
                  {...(errors.class && { error: true, helperText: errors.class.message })}
                />
              )}
            />
          </Grid>
          <Grid item xs={4}>
            <Controller
              name='grade'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary?.form?.label?.grade}
                  placeholder={dictionary?.form?.placeholder?.grade}
                  {...(errors.grade && { error: true, helperText: errors.grade.message })}
                />
              )}
            />
          </Grid>
          <Grid item xs={4}>
            <Controller
              name='age'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary?.form?.label?.age}
                  placeholder={dictionary?.form?.placeholder?.age}
                  {...(errors.age && { error: true, helperText: errors.age.message })}
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
          <Grid item xs={3}>
            <Controller
              name='weight'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary?.form?.label?.weight}
                  placeholder={dictionary?.form?.placeholder?.weight}
                  {...(errors.weight && { error: true, helperText: errors.weight.message })}
                />
              )}
            />
          </Grid>
          <Grid item xs={3}>
            <Controller
              name='height'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary?.form?.label?.height}
                  placeholder={dictionary?.form?.placeholder?.height}
                  {...(errors.height && { error: true, helperText: errors.height.message })}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name='allergiesOrDietaryDescription'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary?.form?.label?.allergies_dietary_description}
                  placeholder={dictionary?.form?.placeholder?.allergies_dietary_description}
                  {...(errors.allergies_dietary_description && {
                    error: true,
                    helperText: errors.allergiesOrDietaryDescription.message
                  })}
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
                      {...params}
                      label={dictionary?.form?.label?.address}
                      placeholder={dictionary?.form?.placeholder?.address}
                      className='autocompate-block-input-inner'
                      error={!!errors.google_address?.address}
                      helperText={errors.google_address?.address?.message}
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

export default Form
