'use client'

// React Imports
import { useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import { Grid, Card, Box, CircularProgress, Button } from '@mui/material'

// Third-party Imports
import InfiniteScroll from 'react-infinite-scroll-component'

// Util Imports
import axiosApiCall from '@utils/axiosApiCall'
import { getLocalizedUrl } from '@/utils/i18n'
import { API_ROUTER } from '@/utils/apiRoutes'

// View Imports
import Statistics from '@/views/dashboard/user-management/Statistics'
import UserCard from './UserCard'
import { toastError, actionConfirmWithLoaderAlert, successAlert } from '@/utils/globalFunctions'

/**
 * Page
 */
const UserManagement = props => {
  // Props
  const { dictionary = null } = props
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const router = useRouter()

  // HOOKS
  const { lang: locale } = useParams()

  /**
   * Axios Test: Start
   */
  // List All User
  const getAllUsers = (currentPage, perPage) => {
    setLoading(true)

    axiosApiCall
      .get(API_ROUTER.USER_MANAGEMENT, {
        params: {
          page: currentPage,
          limit: perPage
        }
      })
      .then(response => {
        const responseBody = response?.data
        const usersData = responseBody?.response?.users || []
        const totalPages = responseBody?.meta?.totalPage || 0

        if (usersData.length === 0 || currentPage >= totalPages) {
          setHasMore(false)
        }

        setAllUsers(prevUsers => {
          const existingUsers = new Map(prevUsers.map(user => [user._id, user]))

          const newUsers = usersData.filter(user => !existingUsers.has(user._id))

          return [...prevUsers, ...newUsers]
        })
        // setAllUsers(prevUsers => [...prevUsers, ...new Map([...usersData].map(item => [item._id, item])).values()])/
        setLoading(false)
      })
      .catch(error => {
        toastError(error?.response?.message)
        setLoading(false)
      })
  }

  const handleResize = () => {
    const width = window.innerWidth
    const height = window.innerHeight

    if (width >= 1200) {
      setItemsPerPage(Math.floor(height / 300))
    } else if (width >= 600) {
      setItemsPerPage(Math.floor(height / 300))
    } else {
      setItemsPerPage(Math.floor(height / 300))
    }
  }

  // Suspend User
  const handleSuspendUser = userId => {
    actionConfirmWithLoaderAlert(
      {
        /**
         * swal custom data for suspending user
         */
        deleteUrl: `${API_ROUTER.USER_MANAGEMENT}/${userId}/status`,
        requestMethodType: 'PUT',
        title: `${dictionary?.sweet_alert?.user_suspend?.title}`,
        text: `${dictionary?.sweet_alert?.user_suspend?.text}`,
        customClass: {
          confirmButton: `btn bg-warning`
        },
        requestInputData: {
          status: 'suspended'
        }
      },
      {
        confirmButtonText: `${dictionary?.sweet_alert?.user_suspend?.confirm_button}`,
        cancelButtonText: `${dictionary?.sweet_alert?.user_suspend?.cancel_button}`
      },
      (callbackStatus, result) => {
        /**
         * Callback after action confirmation
         */
        if (callbackStatus) {
          successAlert({
            title: `${dictionary?.sweet_alert?.user_suspend?.success}`,
            confirmButtonText: `${dictionary?.sweet_alert?.user_suspend?.ok}`
          })
        }
      }
    )
  }

  // Delete User
  const handleDeleteUser = userId => {
    actionConfirmWithLoaderAlert(
      {
        /**
         * swal custom data for deleting user
         */
        deleteUrl: `${API_ROUTER.USER_MANAGEMENT}/${userId}`,
        requestMethodType: 'DELETE',
        title: `${dictionary?.sweet_alert?.user_delete?.title}`,
        text: `${dictionary?.sweet_alert?.user_delete?.text}`,
        customClass: {
          confirmButton: `btn bg-error`
        }
      },
      {
        confirmButtonText: `${dictionary?.sweet_alert?.user_delete?.confirm_button}`,
        cancelButtonText: `${dictionary?.sweet_alert?.user_delete?.cancel_button}`
      },
      (callbackStatus, result) => {
        /**
         * Callback after action confirmation
         */
        if (callbackStatus) {
          successAlert({
            title: `${dictionary?.sweet_alert?.user_delete?.success}`,
            confirmButtonText: `${dictionary?.sweet_alert?.user_delete?.ok}`
          })
        }
      }
    )
  }

  /** Axios Test: End */

  /**
   * Page Life Cycle: Start
   */
  useEffect(() => {
    getAllUsers(page, itemsPerPage)
    getLocalizedUrl('/user-management', locale)
    // handleResize();
    // window.addEventListener('resize', handleResize)

    return () => {
      // window.removeEventListener('resize', handleResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  /** Page Life Cycle: End */

  return (
    <div>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Statistics dictionary={dictionary} />
        </Grid>

        <Grid item xs={12}>
          <Button variant='contained' onClick={() => router.push(`/en/user-management/user-create`)}>
            Create User
          </Button>
        </Grid>

        <Grid item xs={12}>
          {loading && page === 1 ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px'
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <InfiniteScroll
              dataLength={allUsers.length}
              next={() => {
                setPage(prevPage => {
                  const nextPage = prevPage + 1

                  getAllUsers(nextPage, itemsPerPage)

                  return nextPage
                })
              }}
              hasMore={hasMore}
              loader={
                loading ? (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100px'
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : null
              }
              endMessage={
                <Box sx={{ textAlign: 'center', padding: 2 }}>
                  <b>No more users to load</b>
                </Box>
              }
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 4
                }}
              >
                {allUsers?.map(item => (
                  <Card
                    key={item._id}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: 2,
                      borderRadius: 2,
                      height: '100%'
                    }}
                  >
                    <UserCard
                      user={item}
                      dictionary={dictionary}
                      handleSuspendUser={handleSuspendUser}
                      handleDeleteUser={handleDeleteUser}
                    />
                  </Card>
                ))}
              </Box>
            </InfiniteScroll>
          )}
        </Grid>
      </Grid>
    </div>
  )
}

export default UserManagement
