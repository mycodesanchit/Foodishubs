'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Next Imports
import { useRouter, useParams } from 'next/navigation'

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

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { isCancel } from 'axios'

// Core Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Component Imports
import GoogleAddressAutoComplete from '@/components/nourishubs/GoogleAddressAutoComplete'

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

/**
 * Page
 */
const CreateUser = props => {
  // Props
  const { mode, dictionary, id } = props

  // Hooks
  const router = useRouter()
  const { lang: locale } = useParams()

  // states
  const [userData, setUserData] = useState()

  /**
   * Page form: Start
   */
  const formValidationSchema = yup.object({
    first_name: yup
      .string()
      .required(dictionary?.form?.validation?.required)
      .label(dictionary?.form?.label?.first_name),
    last_name: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.last_name),
    role: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.role),
    email: yup
      .string()
      .required()
      .email(dictionary?.form?.validation?.email_address)
      .label(dictionary?.form?.label?.email),
    phoneNo: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.phoneNo),
    // address: yup.string().required(dictionary?.form?.validation?.required).label(dictionary?.form?.label?.address),
    google_address: yup.object().required(dictionary?.form?.validation?.required),
    // permissions: yup.array().of(
    //   yup.object().shape({
    //     permission: yup.string().required(),
    //     subPermissions: yup.array().of(yup.string()).required()
    //   })
    // )
    // permissions: yup.array().of(
    //   yup.object().shape({
    //     permission: yup.string(),
    //     subPermissions: yup.array().of(yup.string())
    //     // .required()
    //     // .min(1, 'At least one SubPermission is required when a Permission is selected')
    //   })
    // )
    permissions: yup.array().of(
      yup.object().shape({
        permission: yup.string(),
        subPermissions: yup.array().of(yup.string())
      })
    )
  })

  // const formDefaultValues = {
  //   first_name: 'M',
  //   last_name: 'K',
  //   role: '',
  //   email: 'mk+1@gmail.com',
  //   phoneNo: '+919904250770',
  //   address: 'rajkot',
  //   permissions: []
  //   // permissions: [
  //   //   { permission: '1', subPermissions: [] },
  //   //   { permission: '2', subPermissions: [] }
  //   // ]
  // }

  const formDefaultValues = {
    first_name: '',
    last_name: '',
    role: '',
    email: '',
    phoneNo: '',
    // address: '',
    google_address: null,
    permissions: []
  }

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(formValidationSchema),
    defaultValues: formDefaultValues
  })

  const pageFormRef = useRef(null)
  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState(false)
  const watchPermissions = watch('permissions')

  const onSubmit = values => {
    const locationData = Object.fromEntries(
      Object.entries(values?.google_address).filter(([key]) =>
        ['country', 'state', 'city', 'district', 'latitude', 'longitude', 'address'].includes(key)
      )
    )

    const apiFormData = {
      ...values,
      permissions: values?.permissions?.filter(item => item?.permission && Object.keys(item).length > 0),
      ...locationData,
      google_address: undefined
    }

    // console.log('onSubmit: values: ', values)
    // console.log('apiFormData: ', apiFormData)

    // return

    setIsFormSubmitLoading(true)
    let axiosApiCallUrl = '/v1/user-management/create-user'

    if (id) {
      axiosApiCallUrl = `/v1/user-management/${id}`
    }

    axiosApiCall({
      method: id ? 'patch' : 'post',
      url: axiosApiCallUrl,
      data: apiFormData
    })
      .then(response => {
        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        toastSuccess(responseBody?.message)
        reset(formDefaultValues)
        router.push(getLocalizedUrl('/user-management', locale))
      })
      .catch(error => {
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
  /** Page form: End */

  /**
   * Fetch role: Start
   */
  const [isGetRoleListLoading, setIsGetRoleListLoading] = useState(false)
  const getRoleListController = useRef()
  const [roles, setRoles] = useState([])

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
  /** Fetch role: End */

  /**
   * Fetch role permissions: Start
   */
  const [isGetRolePermissionListLoading, setIsGetRolePermissionListLoading] = useState(false)
  const getRolePermissionListController = useRef()
  const [permissions, setPermissions] = useState([])

  const fetchRolePermissionList = (id = null) => {
    if (!id) {
      return
    }

    setIsGetRolePermissionListLoading(true)

    if (getRolePermissionListController.current) {
      getRolePermissionListController.current?.abort()
    }

    getRolePermissionListController.current = new AbortController()

    setPermissions([])
    axiosApiCall
      .get(`/v1/role/role-permissions/${id}`, {
        signal: getRolePermissionListController?.current?.signal
      })
      .then(response => {
        setIsGetRolePermissionListLoading(false)

        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        setPermissions(responseBodyData?.permissions)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsGetRolePermissionListLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }
  /** Fetch role permissions: End */

  /**
   * Role change handler: Start
   */
  const role = watch('role')

  const handleRoleChange = event => {
    setValue('role', event?.target?.value)
  }

  useEffect(() => {
    setValue('permissions', [])
    fetchRolePermissionList(role)
  }, [role])
  /** Role change handler: End */

  /**
   * Fetch user data: Start
   */
  const [isFetchUserDataLoading, setIsFetchUserDataLoading] = useState(false)
  const fetchUserDataController = useRef()

  const fetchUserData = (id = null) => {
    if (!id) {
      return
    }

    setIsFetchUserDataLoading(true)

    if (fetchUserDataController.current) {
      fetchUserDataController.current?.abort()
    }

    fetchUserDataController.current = new AbortController()

    axiosApiCall
      .get(`/v1/user-management/${id}`, {
        signal: fetchUserDataController?.current?.signal
      })
      .then(response => {
        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        const userDataObj = responseBodyData?.userData

        setUserData(userDataObj)
        // console.log('userDataObj: ', userDataObj)
        setIsFetchUserDataLoading(false)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsFetchUserDataLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }
  /** Fetch user data: End */

  /**
   * Set user data: Start
   */
  const isFormDataSet = useRef(false)

  useEffect(() => {
    if (id && !isFormDataSet.current && userData && roles?.length > 0) {
      isFormDataSet.current = true

      reset({
        first_name: userData?.first_name || '',
        last_name: userData?.last_name || '',
        role: userData?.role?._id || '',
        email: userData?.email || '',
        phoneNo: userData?.phoneNo || '',
        // address: userData?.address || '',
        google_address: { ...userData?.location, description: userData?.location?.address }
      })
    }
  }, [userData, roles])
  /** Set user data: End */

  /**
   * Set user selected permission data: Start
   */
  const isFormUserPermissionDataSet = useRef(false)

  useEffect(() => {
    if (id && !isFormUserPermissionDataSet?.current && userData && roles?.length > 0 && permissions?.length > 0) {
      isFormUserPermissionDataSet.current = true

      permissions.forEach((permission, permissionIndex) => {
        userData.permissions.forEach((userPermission, userPermissionIndex) => {
          if (permission?._id === userPermission?.permission._id) {
            setValue(`permissions.${permissionIndex}.permission`, userPermission?.permission._id)
            setValue(
              `permissions.${permissionIndex}.subPermissions`,
              userPermission.subPermissions.map(subPermission => subPermission?._id) || []
            )
          }
        })
      })
    }
  }, [userData, roles, permissions])
  /** Set user selected permission data: End */

  /**
   * Google address auto complete: Start
   */
  // const google_address = watch('google_address')

  // useEffect(() => {
  //   console.log('google_address: ', google_address)
  // }, [google_address])
  /** Google address auto complete: End */

  /**
   * Page Life Cycle: Start
   */
  useEffect(() => {
    fetchRoleList()
    fetchUserData(id)

    return () => {
      try {
        if (getRoleListController?.current) {
          getRoleListController?.current?.abort()
        }
      } catch (error) {}

      try {
        if (getRolePermissionListController?.current) {
          getRolePermissionListController?.current?.abort()
        }
      } catch (error) {}

      try {
        if (fetchUserDataController?.current) {
          fetchUserDataController?.current?.abort()
        }
      } catch (error) {}
    }
  }, [])
  /** Page Life Cycle: End */

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid item xs={12} className='flex gap-4'>
            <div className='w-full flex justify-between'>
              <div>
                <CardHeader
                  className='p-0'
                  title={
                    <div>
                      {id
                        ? dictionary?.page?.user_management?.update_user?.update_user
                        : dictionary?.page?.user_management?.create_user?.create_user}
                      {(isFetchUserDataLoading || isGetRoleListLoading) && (
                        <CircularProgress className='ml-1' size={20} sx={{ color: 'primary' }} />
                      )}
                    </div>
                  }
                />
              </div>

              <div>
                <Button
                  variant='contained'
                  type='submit'
                  disabled={
                    isFetchUserDataLoading ||
                    isFormSubmitLoading ||
                    isGetRoleListLoading ||
                    isGetRolePermissionListLoading
                  }
                >
                  {id ? dictionary?.form?.button?.update : dictionary?.form?.button?.create}
                  {isFormSubmitLoading && <CircularProgress className='ml-1' size={20} sx={{ color: 'white' }} />}
                </Button>
                <Button
                  variant='contained'
                  color='secondary'
                  type='reset'
                  onClick={() => {
                    router.push(`/${locale}/user-management`)
                  }}
                  disabled={isFormSubmitLoading}
                  className='ml-2 '
                  sx={{ backgroundColor: `var(--nh-primary-light-color)` }}
                >
                  {dictionary?.form?.button?.cancel}
                </Button>
              </div>
            </div>
          </Grid>

          <Grid container spacing={6}>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
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
                name='role'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label={dictionary?.form?.label?.role}
                    error={Boolean(errors.role)}
                    helperText={errors?.role?.message || ''}
                    SelectProps={{
                      displayEmpty: true,
                      onChange: handleRoleChange
                    }}
                  >
                    <MenuItem disabled value=''>
                      <Typography color='text.disabled'>{dictionary?.form?.placeholder?.role}</Typography>
                    </MenuItem>
                    {roles?.map(item => (
                      <MenuItem value={item?._id} key={item?._id}>
                        {item?.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
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
            {/* <Grid item xs={12}>
                <Controller
                  name='address'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label={dictionary?.form?.label?.address}
                      placeholder={dictionary?.form?.placeholder?.address}
                      {...(errors.address && { error: true, helperText: errors.address.message })}
                    />
                  )}
                />
              </Grid> */}

            <Grid item xs={12}>
              <Controller
                name='google_address'
                control={control}
                render={({ field }) => (
                  <GoogleAddressAutoComplete
                    {...field}
                    fullWidth
                    onChange={(_, data) => {
                      // console.log('_', _)
                      // console.log('GoogleAddressAutoComplete: data', data)

                      // field.onChange(data)
                      field.onChange(data?.details_for_api)
                    }}
                    renderInput={params => (
                      <CustomTextField
                        label={dictionary?.form?.label?.address}
                        placeholder={dictionary?.form?.placeholder?.address}
                        {...params}
                        {...(errors?.google_address && { error: true, helperText: errors?.google_address?.message })}
                        // {...(errors?.address && { error: true, helperText: errors?.address?.message })}
                        // {...(errors?.country && { error: true, helperText: errors?.country?.message })}
                        // {...(errors?.state && { error: true, helperText: errors?.state?.message })}
                        // {...(errors?.city && { error: true, helperText: errors?.city?.message })}
                        // {...(errors?.district && { error: true, helperText: errors?.district?.message })}
                        // {...(errors?.latitude && { error: true, helperText: errors?.latitude?.message })}
                        // {...(errors?.longitude && { error: true, helperText: errors?.longitude?.message })}
                      />
                    )}
                    noOptionsText={dictionary?.common?.no_locations}
                  />
                )}
              />
              {/* <GoogleAddressAutoComplete /> */}
              {/* {errors.google_address && <FormHelperText error>{errors?.google_address?.message}</FormHelperText>} */}
              {errors.address && <FormHelperText error>{errors?.address?.message}</FormHelperText>}
              {errors.country && <FormHelperText error>{errors?.country?.message}</FormHelperText>}
              {errors.state && <FormHelperText error>{errors?.state?.message}</FormHelperText>}
              {errors.city && <FormHelperText error>{errors?.city?.message}</FormHelperText>}
              {errors.district && <FormHelperText error>{errors?.district?.message}</FormHelperText>}
              {errors.latitude && <FormHelperText error>{errors?.latitude?.message}</FormHelperText>}
              {errors.longitude && <FormHelperText error>{errors?.longitude?.message}</FormHelperText>}
            </Grid>

            <Grid item xs={12}>
              <FormLabel>{dictionary?.form?.label?.permission}</FormLabel>
              {isGetRolePermissionListLoading && (
                <Grid container spacing={6}>
                  <Grid item xs={12} className='text-center'>
                    <CircularProgress size={20} sx={{ color: 'primary' }} />
                  </Grid>
                </Grid>
              )}

              {!isGetRolePermissionListLoading && !role && (
                <Grid container spacing={6}>
                  <Grid item xs={12}>
                    <Typography color='text.disabled'>{dictionary?.form?.placeholder?.role}</Typography>
                  </Grid>
                </Grid>
              )}

              {!isGetRolePermissionListLoading && role && permissions?.length === 0 && (
                <Grid container spacing={6}>
                  <Grid item xs={12}>
                    <Typography color='text.disabled'>
                      <i>N/A</i>
                    </Typography>
                  </Grid>
                </Grid>
              )}

              <Grid container spacing={6}>
                {permissions.map((permission, index) => (
                  <Grid key={permission._id} item xs={12} md={4}>
                    <div key={permission._id} className='p-4 border rounded mb-4'>
                      <div>
                        <Controller
                          control={control}
                          name={`permissions.${index}.permission`}
                          render={({ field }) => (
                            <div>
                              {/* {JSON.stringify(field)}
                                {permission._id} */}

                              <FormControlLabel
                                control={
                                  <Checkbox
                                    {...field}
                                    value={permission?._id}
                                    onChange={e => {
                                      const isChecked = e?.target?.checked

                                      field?.onChange(isChecked ? permission?._id : '')

                                      if (!isChecked) {
                                        // Uncheck all sub-permissions when the main permission is unchecked
                                        setValue(`permissions.${index}.subPermissions`, [])
                                      }
                                    }}
                                    checked={field?.value === permission?._id}
                                  />
                                }
                                label={permission?.name}
                              />
                            </div>
                          )}
                        />
                      </div>

                      {/* Sub-permissions */}
                      <div className='ml-6'>
                        <Controller
                          control={control}
                          name={`permissions.${index}.subPermissions`}
                          render={({ field }) => (
                            <div>
                              {permission?.subPermissions?.map(subPermission => (
                                <FormControlLabel
                                  key={subPermission?._id}
                                  control={
                                    <Checkbox
                                      {...field}
                                      value={subPermission?._id}
                                      onChange={e => {
                                        const value = e?.target?.value

                                        if (e?.target?.checked) {
                                          field?.onChange([...(field?.value || []), value]) // Ensure field.value is always an array
                                        } else {
                                          field?.onChange((field?.value || [])?.filter(v => v !== value))
                                        }
                                      }}
                                      checked={(field?.value || [])?.includes(subPermission?._id)} // Safely check includes
                                      disabled={!watchPermissions?.[index]?.permission}
                                    />
                                  }
                                  label={subPermission?.name}
                                  className='w-full'
                                />
                              ))}
                            </div>
                          )}
                        />
                        {errors.permissions?.[index]?.subPermissions && (
                          <FormHelperText error>{errors?.permissions?.[index]?.subPermissions?.message}</FormHelperText>
                        )}
                      </div>
                    </div>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* <Grid item xs={12}>
                {JSON.stringify(errors)}
              </Grid> */}
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default CreateUser
