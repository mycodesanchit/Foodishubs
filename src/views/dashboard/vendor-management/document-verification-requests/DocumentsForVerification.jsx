'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  TextField
} from '@mui/material'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'

// Thirdparty Imports
import { isCancel } from 'axios'

// Utils Imports
import axiosApiCall from '@/utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError,
  actionConfirmWithLoaderAlert,
  successAlert
} from '@/utils/globalFunctions'
// import { toastError, } from '@/utils/globalFunctions'

const DocumentsForVerification = props => {
  const { dictionary = null, id } = props

  const router = useRouter()

  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [reasonText, setReasonText] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // get document api call
  const getVendorsSubmittedDocuments = async () => {
    setIsLoading(true)
    await axiosApiCall
      .get(API_ROUTER.DOCUMENT_VERIFICATION_REQUESTS, {
        params: { vendorId: id }
      })
      .then(response => {
        setDocuments(response?.data?.response?.documentsVerificationRequests || [])
      })
      .catch(error => {
        if (!isCancel(error)) {
          setIsLoading(false)
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          if (isVariableAnObject(apiResponseErrorHandlingData)) {
            setFormFieldsErrors(apiResponseErrorHandlingData, setError)
          } else {
            toastError(apiResponseErrorHandlingData)
          }
        }
      })
      .finally(() => setIsLoading(false))
  }

  // Handle Approved Api Call
  const handleApproveVendor = () => {
    setIsLoading(true)
    actionConfirmWithLoaderAlert(
      {
        /**
         * swal custom data for approving vendor
         */
        deleteUrl: API_ROUTER.VENDOR_APPROVE_REJECT(id),
        requestMethodType: 'PATCH',
        title: `${dictionary?.sweet_alert?.vendor_approve?.title}`,
        text: `${dictionary?.sweet_alert?.vendor_approve?.text}`,
        customClass: {
          confirmButton: `btn bg-success`
        },
        requestInputData: {
          vendorId: id,
          approved: true
        }
      },
      {
        confirmButtonText: `${dictionary?.sweet_alert?.vendor_approve?.confirm_button}`,
        cancelButtonText: `${dictionary?.sweet_alert?.vendor_approve?.cancel_button}`
      },
      (callbackStatus, result) => {
        /**
         * Callback after action confirmation
         */
        if (callbackStatus) {
          successAlert({
            title: `${dictionary?.sweet_alert?.vendor_approve?.success}`,
            confirmButtonText: `${dictionary?.sweet_alert?.vendor_approve?.ok}`
          })
          setIsLoading(false)
          router.push('/vendor-management/document-verification-requests')
        }
      }
    )
  }

  // handle Approve/Reject api call
  const handleRejectVendor = async () => {
    setIsLoading(true)

    const requestBody = { vendorId: id, approved: false, reason: reasonText }

    await axiosApiCall
      .patch(API_ROUTER.VENDOR_APPROVE_REJECT(id), requestBody)
      .then(response => {
        router.push('/vendor-management/document-verification-requests')
      })
      .catch(error => {
        if (!isCancel(error)) {
          const apiResponseErrorHandlingData = apiResponseErrorHandling(error)

          if (isVariableAnObject(apiResponseErrorHandlingData)) {
            setFormFieldsErrors(apiResponseErrorHandlingData, setError)
          } else {
            toastError(apiResponseErrorHandlingData)
          }
        }
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    getVendorsSubmittedDocuments()
  }, [])

  return (
    <Card p={3}>
      <Typography variant='h6' mb={2}>
        {dictionary?.page?.vendor_management?.document_verification_requests?.document_list}
      </Typography>
      <Box display='flex' justifyContent='flex-end' gap={1} mb={2}>
        <Button variant='contained' color='primary' onClick={handleApproveVendor}>
          {dictionary?.common?.approve}
        </Button>
        <Button variant='contained' onClick={() => setIsDialogOpen(true)} style={{ backgroundColor: '#8bc34a' }}>
          {dictionary?.common?.reject}
        </Button>
      </Box>
      <Grid container spacing={2}>
        {documents.map((doc, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card variant='outlined' sx={{ textAlign: 'center', p: 2 }}>
              <PictureAsPdfIcon color='error' sx={{ fontSize: 48, mb: 1 }} />
              <CardContent>
                <Typography variant='body1'>{doc.name || `Document ${index + 1}`}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/*---DIALOG BOX---  */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>{dictionary?.page?.vendor_management?.vendor_reject_title}</DialogTitle>
        <DialogContent>
          <Typography variant='body1' mb={2}>
            {dictionary?.page?.vendor_management?.vendor_reject_text}
          </Typography>
          <TextField
            label={dictionary?.form?.placeholder?.reason}
            multiline
            rows={4}
            fullWidth
            variant='outlined'
            value={reasonText}
            onChange={e => setReasonText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} color='secondary'>
            {dictionary?.form?.button?.cancel}
          </Button>
          <Button
            onClick={handleRejectVendor}
            variant='contained'
            color='primary'
            disabled={!reasonText.trim() || isLoading}
          >
            {dictionary?.common?.reject}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default DocumentsForVerification
