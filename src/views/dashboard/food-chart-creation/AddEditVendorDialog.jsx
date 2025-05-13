// React Imports
import { useState, useEffect, forwardRef, useCallback, useRef } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormHelperText,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField
} from '@mui/material'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useInView } from 'react-intersection-observer'
import { isCancel } from 'axios'
import InfiniteScroll from 'react-infinite-scroll-component'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// Core Component Imports
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@/@core/components/mui/Avatar'

// Component Imports
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { apiResponseErrorHandling, toastError } from '@/utils/globalFunctions'
import { useTranslation } from '@/utils/getDictionaryClient'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Slice Imports
import { addEvent, deleteEvent, updateEvent, selectedEvent, filterEvents } from '@/redux-store/slices/calendar'

// Vars
const capitalize = string => string && string[0].toUpperCase() + string.slice(1)

// Vars
const defaultState = {
  // url: '',
  title: '',
  // guests: [],
  // allDay: true,
  // description: '',
  // endDate: new Date(),
  // calendar: 'Business',
  // startDate: new Date()
  startDate: null
}

const AddEventSidebar = props => {
  // Props
  const {
    calendarStore,
    dispatch,
    addEventSidebarOpen,
    handleAddEventSidebarToggle,
    selectedCalendarEvent,
    location,
    onEventSubmitHandler
  } = props

  // States
  const [values, setValues] = useState(defaultState)

  // Refs
  const PickersComponent = forwardRef(({ ...props }, ref) => {
    return (
      <CustomTextField
        inputRef={ref}
        fullWidth
        {...props}
        label={props.label || ''}
        className='is-full'
        error={props.error}
      />
    )
  })

  // Hooks
  const isBelowSmScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)

  /**
   * Page form: Start
   */
  const formValidationSchema = yup.object({
    title: yup.string().required(t('form.validation.required')),
    vendorId: yup.string().required(t('form.validation.required'))
  })

  const defaultValues = { id: '', title: '', vendorId: '', start: null, extendedProps: {} }

  const {
    control,
    setValue,
    reset,
    clearErrors,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({ resolver: yupResolver(formValidationSchema), defaultValues: defaultValues })

  const vendorId = watch('vendorId')

  useEffect(() => {
    console.log('vendorId: ', vendorId)
    const selectedVendor = vendors?.find(item => item['_id'] === vendorId)

    console.log('selectedVendor: ', selectedVendor)

    if (selectedVendor) {
      setValue('title', selectedVendor?.first_name + ' ' + selectedVendor?.last_name)
    } else {
      setValue('title', 'Add Vendor')
    }
  }, [vendorId])

  const onSubmit = data => {
    console.log('in onSubmit: data: ', data)

    const modifiedEvent = {
      id: data?.id,
      title: data.title,
      start: data.start,
      extendedProps: {
        ...data?.extendedProps,
        vendorId: data?.vendorId
      }
    }

    console.log('modifiedEvent: ', modifiedEvent)

    if (typeof onEventSubmitHandler === 'function') {
      onEventSubmitHandler(modifiedEvent)
    }

    handleSidebarClose()

    return

    if (
      calendarStore.selectedEvent === null ||
      (calendarStore.selectedEvent !== null && !calendarStore.selectedEvent.title.length)
    ) {
      dispatch(addEvent(modifiedEvent))
    } else {
      dispatch(updateEvent({ ...modifiedEvent, id: calendarStore.selectedEvent.id }))
    }

    dispatch(filterEvents())
    handleSidebarClose()
  }

  /** Page form: End */

  // const resetToStoredValues = useCallback(() => {
  //   if (calendarStore.selectedEvent !== null) {
  //     const event = calendarStore.selectedEvent

  //     setValue('title', event.title || '')
  //     setValues({
  //       url: event.url || '',
  //       title: event.title || '',
  //       allDay: event.allDay,
  //       guests: event.extendedProps.guests || [],
  //       description: event.extendedProps.description || '',
  //       calendar: event.extendedProps.calendar || 'Business',
  //       endDate: event.end !== null ? event.end : event.start,
  //       startDate: event.start !== null ? event.start : new Date()
  //     })
  //   }
  // }, [setValue, calendarStore.selectedEvent])

  // const resetToEmptyValues = useCallback(() => {
  //   setValue('title', '')
  //   setValues(defaultState)
  // }, [setValue])

  const handleSidebarClose = () => {
    setValues(defaultState)
    clearErrors()
    dispatch(selectedEvent(null))
    handleAddEventSidebarToggle()
  }

  const handleDeleteButtonClick = () => {
    if (calendarStore.selectedEvent) {
      dispatch(deleteEvent(calendarStore.selectedEvent.id))
      dispatch(filterEvents())
    }

    // calendarApi.getEventById(calendarStore.selectedEvent.id).remove()
    handleSidebarClose()
  }

  const handleStartDate = date => {
    if (date && date > values.endDate) {
      setValues({ ...values, startDate: new Date(date), endDate: new Date(date) })
    }
  }

  const RenderSidebarFooter = () => {
    if (
      calendarStore.selectedEvent === null ||
      (calendarStore.selectedEvent && !calendarStore.selectedEvent.title.length)
    ) {
      return (
        <div className='flex gap-4'>
          <Button type='submit' variant='contained'>
            Add
          </Button>
          <Button variant='outlined' color='secondary' onClick={resetToEmptyValues}>
            Reset
          </Button>
        </div>
      )
    } else {
      return (
        <div className='flex gap-4'>
          <Button type='submit' variant='contained'>
            Update
          </Button>
          <Button variant='outlined' color='secondary' onClick={resetToStoredValues}>
            Reset
          </Button>
        </div>
      )
    }
  }

  const ScrollWrapper = isBelowSmScreen ? 'div' : PerfectScrollbar

  // useEffect(() => {
  //   if (calendarStore.selectedEvent !== null) {
  //     resetToStoredValues()
  //   } else {
  //     resetToEmptyValues()
  //   }
  // }, [addEventSidebarOpen, resetToStoredValues, resetToEmptyValues, calendarStore.selectedEvent])

  /**
   * Fetch near by Vendors: Start
   */
  const { ref: vendorListRef, inView: vendorListInView, entry: vendorListEntry } = useInView({ threshold: 0 })
  const [isGetNearByVendorsListLoading, setIsGetNearByVendorsListLoading] = useState(false)
  const getNearByVendorsListController = useRef()
  const [vendors, setVendors] = useState([])

  const [vendorsListApiInput, setVendorsListApiInput] = useState({
    page: 1,
    limit: 10,
    hasMore: true,
    searchQuery: '',
    lat: location?.latitude || '',
    lng: location?.longitude || ''
  })

  const getNearByVendorsList = () => {
    // console.log('in fetchNearByVendorsList')

    if (isGetNearByVendorsListLoading) {
      return
    }

    setIsGetNearByVendorsListLoading(true)

    if (getNearByVendorsListController.current) {
      getNearByVendorsListController.current?.abort()
    }

    getNearByVendorsListController.current = new AbortController()

    if (vendorsListApiInput?.page === 1) {
      setVendors([])
    }

    axiosApiCall
      .get(`/v1/school-admin-food-chart/nearby-vendors`, {
        signal: getNearByVendorsListController?.current?.signal,
        params: {
          ...vendorsListApiInput,
          hasMore: undefined
        }
      })
      .then(response => {
        setIsGetNearByVendorsListLoading(false)

        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        // console.log('responseBodyData: ', responseBodyData)

        const vendorsData = responseBodyData?.vendors

        if (vendorsData?.length > 0) {
          setVendorsListApiInput(prevPagination => ({
            ...prevPagination,
            page: prevPagination?.page + 1
          }))
          setVendors(prevData => [...prevData, ...vendorsData])
        } else {
          setVendorsListApiInput(prevPagination => ({
            ...prevPagination,
            hasMore: false
          }))
        }
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsGetNearByVendorsListLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }

  useEffect(() => {
    if (vendorListInView && vendorsListApiInput?.hasMore) {
      // console.log('API call by library')

      getNearByVendorsList()
    }
  }, [vendorListInView])

  useEffect(() => {
    if (vendorListInView && vendorsListApiInput?.hasMore) {
      // console.log('manually call API again')
      getNearByVendorsList()
    }
  }, [vendors])
  /** Fetch near by Vendors: End */

  // useEffect(() => {
  //   if (addEventSidebarOpen) {
  //     console.log('Dialog Open')
  //     // console.log('selectedCalendarEvent: ', selectedCalendarEvent)
  //   } else {
  //     console.log('Dialog Close')
  //   }
  // }, [addEventSidebarOpen])
  useEffect(() => {
    console.log('selectedCalendarEvent: ', selectedCalendarEvent)
    // console.log('selectedCalendarEvent?.title: ', selectedCalendarEvent?.title)

    reset({
      id: selectedCalendarEvent?.id,
      title: selectedCalendarEvent?.title,
      vendorId: selectedCalendarEvent?.extendedProps?.vendorId || '',
      start: selectedCalendarEvent?.startStr,
      extendedProps: selectedCalendarEvent?.extendedProps || {}
    })
  }, [selectedCalendarEvent])

  return (
    <Dialog
      open={addEventSidebarOpen}
      onClose={handleSidebarClose}
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {/* {calendarStore.selectedEvent && calendarStore.selectedEvent.title.length ? 'Update Event' : 'Add Event'} */}
        Vendor Near by
        {calendarStore.selectedEvent && calendarStore.selectedEvent.title.length > 0 && (
          <Typography component='span'>
            <IconButton size='small' onClick={handleDeleteButtonClick}>
              <i className='tabler-trash text-2xl text-textPrimary' />
            </IconButton>
          </Typography>
        )}
      </DialogTitle>

      <DialogContent className='pbs-0 sm:pli-16'>
        <DialogCloseButton onClick={handleSidebarClose} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>

        <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' className='flex flex-col gap-6'>
          <Grid container spacing={6}>
            <Grid item xs={12} className='hidden'>
              <Controller
                name='title'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    InputProps={{
                      readOnly: true
                    }}
                    readOnly
                    fullWidth
                    label='Title'
                    {...(errors?.title && { error: true, helperText: errors?.title?.message })}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl error={Boolean(errors?.vendorId)} className='w-full'>
                <Controller
                  name='vendorId'
                  className='role-radio-block w-full'
                  control={control}
                  render={({ field }) => (
                    <RadioGroup className='role-radio-block w-full' row {...field} name='radio-buttons-group'>
                      <div
                        className='
                        p-2 w-full h-60 
                        overflow-y-auto border rounded-lg 
                        scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200
                      '
                      >
                        {vendors?.map((vendor, index) => (
                          <FormControlLabel
                            key={index}
                            labelPlacement='start'
                            value={vendor?._id}
                            control={<Radio name='vendorId' />}
                            // label={`${vendor?.first_name} ${vendor?.last_name}`}
                            className='w-full justify-between ml-2'
                            // label={<div>{`${vendor?.first_name} ${vendor?.last_name}`}</div>}
                            label={
                              <div className='flex w-full items-center gap-3'>
                                <CustomAvatar src={vendor?.avatar} size={34} />
                                <div className='flex flex-col'>
                                  <Typography className='font-medium' color='text.primary'>
                                    {`${vendor?.first_name} ${vendor?.last_name}`}
                                  </Typography>
                                </div>
                              </div>
                            }
                          />
                        ))}

                        {isGetNearByVendorsListLoading && (
                          <div className='text-center w-full'>
                            <CircularProgress />
                          </div>
                        )}
                        {!isGetNearByVendorsListLoading && vendors?.length === 0 && (
                          <div className='text-center w-full'>No records found</div>
                        )}
                        {/* {!vendorsListApiInput?.hasMore && <p style={{ textAlign: 'center' }}>You have seen it all!</p>} */}
                        {vendorsListApiInput?.hasMore && <div ref={vendorListRef} style={{ height: '2px' }} />}
                      </div>
                    </RadioGroup>
                  )}
                />
                {errors.vendorId && <FormHelperText error>{errors?.vendorId?.message}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* <Grid item xs={12}>
              <Controller
                name='start'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <AppReactDatepicker
                    selected={value}
                    readOnly={false}
                    dateFormat={'yyyy-MM-dd'}
                    onChange={onChange}
                    customInput={<CustomTextField InputProps={{ readOnly: false }} label='Start Date' fullWidth />}
                  />
                )}
              />
            </Grid> */}

            <Grid item xs={12}>
              <div className='flex items-center'>
                {/* <RenderSidebarFooter /> */}
                <Button type='submit' variant='contained'>
                  Submit
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddEventSidebar
