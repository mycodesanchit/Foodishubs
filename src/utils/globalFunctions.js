// Third-party Imports
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

// Redux Imports
import { store } from '@/redux-store'
import { setProfile, resetProfile } from '@/redux-store/slices/profile'

// Util Imports
import axiosApiCall from '@utils/axiosApiCall'
import { DEFAULT_ERROR_MESSAGE } from '@/utils/constants'

// Config Imports
import primaryColorConfig from '@configs/primaryColorConfig'

// Const
const staticPrimaryColor = primaryColorConfig?.[0]?.main

/**
 * Page
 */
export const apiResponseErrorHandling = error => {
  let errorResponse = ''

  if (error) {
    if (error?.response) {
      if (error?.response?.status === 401) {
        return null
      }

      if (error?.response?.data?.errors) {
        errorResponse = error?.response?.data?.errors
      } else {
        errorResponse = error?.response?.data?.message || error?.message
      }
    } else if (error?.errors) {
      errorResponse = error?.errors
    } else if (error.request) {
      errorResponse = DEFAULT_ERROR_MESSAGE
    } else {
      errorResponse = error?.message
    }
  } else {
    errorResponse = DEFAULT_ERROR_MESSAGE
  }

  return errorResponse
}

export const isVariableAnObject = variable => {
  if (variable && typeof variable === 'object' && !Array.isArray(variable)) {
    return true
  }

  return false
}

export const isVariableAnArray = variable => {
  if (variable && typeof variable === 'object' && Array.isArray(variable)) {
    return true
  }

  return false
}

export const errorObjectToNewLineConverter = errors => {
  let errorString = ''

  if (errors) {
    for (let key in errors) {
      if (errors?.hasOwnProperty(key)) {
        let element = errors?.[key]

        if (element) {
          if (typeof element === 'string') {
            errorString === '' ? `${element}` : `${errorString}\n${element}`
          } else if (isVariableAnArray(element)) {
            for (let i = 0; i < element?.length; i++) {
              errorString = errorString === '' ? `${element?.[i]}` : `${errorString}\n${element?.[i]}`
            }
          }
        }
      }
    }
  }

  return errorString
}

export const toastError = (description = '', toastOptions = {}) => {
  if (description) {
    if (isVariableAnObject(description)) {
      description = errorObjectToNewLineConverter(description)
    }

    toast?.error(description, toastOptions)
  }
}

export const toastSuccess = (description = '', toastOptions = {}) => {
  if (description) {
    toast?.success(description, toastOptions)
  }
}

export const setFormFieldsErrors = (errors, setErrorFun) => {
  Object?.entries(errors)?.forEach(([field, message]) => {
    setErrorFun(field, { type: 'server', message })
  })
}

export const fetchLoggedInUserProfile = async () => {
  return await axiosApiCall
    .get('/v1/users/profile')
    .then(response => {
      const responseBody = response.data
      const responseBodyData = responseBody?.response

      return responseBodyData || null
    })
    .catch(error => {
      return null
    })
}

export const fetchUserProfileAndUpdateStoreValue = async () => {
  const profileData = await fetchLoggedInUserProfile()
  const user = profileData?.user || null

  if (user) {
    try {
      if (!user?.name) {
        user.name = user?.first_name + ' ' + user.last_name
      }

      store?.dispatch(setProfile(user))
    } catch (error) {
      console.log('error: ', error)
    }
  }

  return profileData
}

export const showSweetAlert = ({
  title = 'Are you sure?',
  text = "You won't be able to revert this!",
  icon = 'warning',
  confirmButtonText = 'Yes, do it!',
  cancelButtonText = 'No, cancel!',
  reverseButtons = true,
  onConfirm = () => { },
  onCancel = () => { }
}) => {
  Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons
  }).then(result => {
    if (result.isConfirmed) {
      onConfirm(result)
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      onCancel(result)
    }
  })
}

export const successAlert = (customData = {}, options = {}, callback = null) => {
  Swal?.fire({
    title: `${customData?.title || ''} `,
    text: `${customData?.textMessage || ''}`,
    icon: 'success',
    iconColor: staticPrimaryColor,
    showCancelButton: false,
    confirmButtonText: customData?.confirmButtonText || 'Close',
    customClass: {
      confirmButton: 'btn bg-primary',
      container: 'nh-swal2-container',
      ...customData?.customClass
    },
    buttonsStyling: true,
    heightAuto: false,
    allowOutsideClick: () => !Swal?.isLoading(),
    allowEscapeKey: () => !Swal?.isLoading(),
    showCloseButton: () => !Swal?.isLoading(),
    ...options
  }).then(result => {
    let actionStatus = false

    if (result?.isConfirmed === true) {
      actionStatus = true
    } else if (result?.isDismissed === true) {
      actionStatus = false
    } else {
      actionStatus = false
    }

    if (callback && typeof callback === 'function') {
      callback(actionStatus)
    }
  })
}

export const actionConfirmWithLoaderAlert = (customData = {}, options = {}, callback = null) => {
  Swal?.fire({
    title: customData?.title || (customData?.title === null ? '' : 'Are you sure?'),
    text:
      customData?.text ||
      (customData?.text === null
        ? ''
        : `You want to ${(customData && customData?.action) || 'delete'} ${(customData && customData?.moduleName) || 'this'}?`),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: `Yes, ${(customData && customData?.action) || 'delete'} it!`,
    customClass: {
      confirmButton: 'btn bg-primary',
      cancelButton: 'btn btn-outline-primary ml-1',
      container: 'nh-swal2-container',
      ...customData?.customClass
    },
    buttonsStyling: true,
    showLoaderOnConfirm: true,
    heightAuto: false,
    preConfirm: () => {
      return axiosApiCall({
        method: customData?.requestMethodType || 'post',
        url: `${customData?.deleteUrl}`,
        data: (customData && customData?.requestInputData) || {}
      })
        .then(response => {
          const responseBody = response?.data

          if (customData?.isShowSuccessToast === true) {
            toastSuccess(responseBody?.message)
          }

          return response
        })
        .catch(error => {
          let errorMessage = ''
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          if (!isVariableAnObject(apiResponseErrorHandlingData)) {
            errorMessage = apiResponseErrorHandlingData
          } else {
            errorMessage = error?.message || DEFAULT_ERROR_MESSAGE
          }

          Swal?.showValidationMessage(`<span class="text-danger">Request failed: ${errorMessage}</span>`)
        })
    },
    allowOutsideClick: () => !Swal?.isLoading(),
    allowEscapeKey: () => !Swal?.isLoading(),
    ...options
  }).then(result => {
    let actionStatus = false

    if (result?.isConfirmed === true) {
      actionStatus = true
    } else if (result?.isDismissed === true) {
      actionStatus = false
    } else {
      actionStatus = false
    }

    if (callback && typeof callback === 'function') {
      callback(actionStatus, result)
    }
  })
}

const fileDefaultExport = {
  apiResponseErrorHandling,
  isVariableAnObject,
  isVariableAnArray,
  errorObjectToNewLineConverter,
  toastError,
  toastSuccess,
  setFormFieldsErrors,
  fetchLoggedInUserProfile,
  fetchUserProfileAndUpdateStoreValue
}

export default fileDefaultExport
