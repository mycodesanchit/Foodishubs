'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { Button, Card, CardContent, Chip, Grid, Typography, useMediaQuery } from '@mui/material'

// Third-party Imports
import { subDays, addDays, format } from 'date-fns'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import ReactDOM from 'react-dom'

// Util Imports
import { isCancel } from 'axios'

import { useTranslation } from '@/utils/getDictionaryClient'

// Core Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Component Imports
import Calendar from './Calendar'
import AddEditVendorDialog from './AddEditVendorDialog'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import AppFullCalendar from '@/libs/styles/AppFullCalendar'
import axiosApiCall from '@/utils/axiosApiCall'
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  toastSuccess
} from '@/utils/globalFunctions'

// CalendarColors Object
const calendarsColor = {
  Personal: 'error',
  Business: 'primary',
  Family: 'warning',
  Holiday: 'success',
  ETC: 'info'
}

/**
 * Page
 */
const FoodChartCreation = props => {
  // Props

  // Hooks
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const { user = null } = useSelector(state => state?.profileReducer)

  // States
  const [minDate, setMinDate] = useState(new Date())
  // const [maxDate, setMaxDate] = useState(new Date())
  const [maxDate, setMaxDate] = useState(addDays(new Date(), 5))
  const [isChartUpdated, setIsChartUpdated] = useState(false)

  // States
  const [calendarApi, setCalendarApi] = useState(null)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [addEventSidebarOpen, setAddEventSidebarOpen] = useState(false)
  const [calendarEvents, setCalendarEvents] = useState([])
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState(null)

  // Hooks
  const dispatch = useDispatch()
  const calendarStore = useSelector(state => state.calendarReducer)
  const mdAbove = useMediaQuery(theme => theme.breakpoints.up('md'))
  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)

  const handleAddEventSidebarToggle = props => {
    // console.log('props: ', props)
    setSelectedCalendarEvent(props?.clickedEvent || null)

    setAddEventSidebarOpen(!addEventSidebarOpen)
  }

  useEffect(() => {
    if (minDate && maxDate && maxDate < minDate) {
      setMaxDate(minDate)
    }
  }, [minDate])

  useEffect(() => {
    if (minDate && maxDate) {
      const startDate = format(minDate, 'yyyy-MM-dd')
      const endDate = format(maxDate, 'yyyy-MM-dd')

      // console.log('startDate: ', startDate)
      // console.log('endDate: ', endDate)

      const eventsData = []

      const datesBetween = getDatesBetween(startDate, endDate)

      // console.log('datesBetween: ', datesBetween)

      datesBetween?.forEach(element => {
        // console.log('element: ', element)
        eventsData?.push({ title: 'Add Vendor', start: element, classNames: 'red-event' })
      })

      // console.log('eventsData: ', eventsData)

      setCalendarEvents(eventsData)
    }
  }, [minDate, maxDate])

  // useEffect(() => {
  //   console.log('calendarStore.events: ', calendarStore?.events)
  // }, [calendarStore?.events])

  const onEventSubmitHandler = (fnInput = null) => {
    console.log('in onEventSubmitHandler: fnInput:', fnInput)

    setCalendarEvents(prevItems =>
      prevItems.map(item => (item?.start === fnInput?.start ? { ...item, ...fnInput } : item))
    )
    setIsChartUpdated(true)
  }

  const onCalendarEventSubmitHandler = () => {
    console.log('in onCalendarEventSubmitHandler')
    console.log('calendarEvents: ', calendarEvents)

    const calendarEventsFiltered = calendarEvents?.filter(element => {
      return element?.extendedProps?.vendorId ? true : false
    })

    console.log('calendarEventsFiltered: ', calendarEventsFiltered)

    const calendarEventsForAPI = calendarEventsFiltered?.map(element => ({
      vendorId: element?.extendedProps?.vendorId, // Capitalize name
      date: element?.start,
      isRecurring: false
    }))

    console.log('calendarEventsForAPI: ', calendarEventsForAPI)

    const apiFormData = {
      vendors: calendarEventsForAPI
    }

    axiosApiCall
      .post(`/v1/school-admin-food-chart`, apiFormData)
      .then(response => {
        const responseBody = response?.data
        const responseBodyData = responseBody?.response

        toastSuccess(responseBody?.message)
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsFormSubmitLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          toastError(apiResponseErrorHandlingData)
        }
      })
  }

  const getChartDataFromRange = () => {
    console.log('in getChartDataFromRange')
  }

  /**
   * General functions: Start
   */
  const getDatesBetween = (startDate, endDate) => {
    let dates = []
    let currentDate = moment(startDate)

    while (currentDate.isSameOrBefore(endDate)) {
      dates.push(currentDate.format('YYYY-MM-DD'))
      currentDate.add(1, 'day')
    }

    return dates
  }
  /** General functions: End */

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <div>
                <Typography variant='h4'>{t('navigation.food_chart_creation')}</Typography>
              </div>
              <div>
                <Grid container spacing={6}>
                  <Grid item lg={4}>
                    <AppReactDatepicker
                      id='min-date'
                      selected={minDate}
                      minDate={new Date()}
                      onChange={date => setMinDate(date)}
                      customInput={<CustomTextField label='Min Date' fullWidth />}
                    />
                  </Grid>
                  <Grid item lg={4}>
                    <AppReactDatepicker
                      id='max-date'
                      selected={maxDate}
                      minDate={minDate}
                      onChange={date => setMaxDate(date)}
                      customInput={<CustomTextField label='Max Date' fullWidth />}
                    />
                    {/* {JSON.stringify({
                      start: minDate ? `${format(minDate, 'yyyy-MM-dd')} 00:00:00` : null,
                      end: maxDate ? `${format(maxDate, 'yyyy-MM-dd')} 23:59:59` : null
                    })} */}
                  </Grid>
                  {isChartUpdated && (
                    <Grid item lg={4}>
                      <Button variant='contained' type='button' disabled={false} onClick={onCalendarEventSubmitHandler}>
                        Confirm
                        {/* {isFormSubmitLoading && <CircularProgress className='ml-1' size={20} sx={{ color: 'white' }} />} */}
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {minDate && maxDate && user && (
            <Card className='overflow-visible'>
              <AppFullCalendar className='app-calendar'>
                <div className='p-6 pbe-0 flex-grow overflow-visible bg-backgroundPaper rounded'>
                  <Calendar
                    dispatch={dispatch}
                    calendarApi={calendarApi}
                    calendarStore={calendarStore}
                    setCalendarApi={setCalendarApi}
                    calendarsColor={calendarsColor}
                    handleLeftSidebarToggle={handleLeftSidebarToggle}
                    handleAddEventSidebarToggle={handleAddEventSidebarToggle}
                    calendarOptions={{
                      validRange: {
                        start: minDate ? `${format(minDate, 'yyyy-MM-dd')} 00:00:00` : null,
                        end: maxDate ? `${format(maxDate, 'yyyy-MM-dd')} 23:59:59` : null
                      },
                      showNonCurrentDates: false,
                      // eventContent: renderEventContent
                      headerToolbar: {
                        start: 'prev, next, title',
                        end: 'customSubmitButton'
                      }
                      // customButtons: {
                      //   customSubmitButton: {
                      //     text: 'OK', // Empty text since we’ll replace it with an MUI button
                      //     click: handleCustomButtonClick // Leave empty; we override with React rendering
                      //   }
                      // },
                      // eventContent: arg => {
                      //   if (arg.el && arg.el.querySelector('.fc-customSubmitButton-button')) {
                      //     console.log('in if button')

                      //     const buttonContainer = arg.el.querySelector('.fc-customSubmitButton-button')

                      //     if (buttonContainer.children.length === 0) {
                      //       const buttonElement = renderMuiButton()

                      //       buttonContainer.appendChild(buttonElement)
                      //     }
                      //   }
                      // }
                      // viewDidMount: info => {
                      //   const header = info.view.calendar.el.querySelector('.fc-customSubmitContainer-button')

                      //   if (header) {
                      //     // Replace the <button> element with a <div>
                      //     const parent = header.parentNode
                      //     const div = document.createElement('div')

                      //     div.className = 'fc-customSubmitContainer'
                      //     parent.replaceChild(div, header)

                      //     // Render the MUI button into the new <div>
                      //     renderMuiButton(div)
                      //   }
                      // }
                    }}
                    calendarEvents={calendarEvents}
                  />
                </div>

                <AddEditVendorDialog
                  dispatch={dispatch}
                  calendarApi={calendarApi}
                  calendarStore={calendarStore}
                  addEventSidebarOpen={addEventSidebarOpen}
                  handleAddEventSidebarToggle={handleAddEventSidebarToggle}
                  selectedCalendarEvent={selectedCalendarEvent}
                  location={user?.location || null}
                  onEventSubmitHandler={onEventSubmitHandler}
                />
              </AppFullCalendar>
            </Card>
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default FoodChartCreation
