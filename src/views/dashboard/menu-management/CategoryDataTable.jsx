'use client'
// React Imports
import { useEffect, useState, useMemo, useRef } from 'react'

// NEXT Imports
import { useParams } from 'next/navigation'

// Thirdparty Import
import classnames from 'classnames'

// Table Imports
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender
} from '@tanstack/react-table'

// MUI Imports
import {
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  TextField,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  LinearProgress,
  TablePagination,
  IconButton
} from '@mui/material'

import EditIcon from '@mui/icons-material/Edit'

// Arrow SVG
import ChevronRight from '@menu/svg/ChevronRight'

// Util Imports
import { API_ROUTER } from '@/utils/apiRoutes'
import { useTranslation } from '@/utils/getDictionaryClient'
import { toastError, actionConfirmWithLoaderAlert, successAlert } from '@/utils/globalFunctions'
import axiosApiCall from '@utils/axiosApiCall'

const CategoryDataTable = props => {
  const { dictionary = null, getId } = props
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)

  const [page, setPage] = useState(1)
  const [data, setData] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [isDataTableServerLoading, setIsDataTableServerLoading] = useState(false)

  // useRef for aborting request
  const abortController = useRef(null)

  // Fetch Data
  const getAllSuspendedUsers = async () => {
    // Abort the previous request if it's still pending
    if (abortController.current) {
      abortController.current.abort()
    }

    // Create a new AbortController for the new request
    abortController.current = new AbortController()

    const orderBy = sorting.reduce((acc, { id, desc }) => {
      acc[id] = desc ? 'desc' : 'asc'

      return acc
    }, {})

    const orderByString = JSON.stringify(orderBy)

    setIsDataTableServerLoading(true)

    try {
      const response = await axiosApiCall.get(API_ROUTER.GET_FOOD_CATEGORY, {
        params: {
          page,
          limit: itemsPerPage,
          searchQuery: globalFilter,
          orderBy: orderByString
        },
        signal: abortController.current.signal
      })

      const vendorMinimumThresholds = response?.data?.response?.categories || []

      const meta = response?.data?.meta || {}

      setData(vendorMinimumThresholds)
      setTotalCount(meta.totalFiltered || 0)
      setTotalPages(meta.totalPage || 1)

      // if last page have 1 only user then this...
      if (vendorMinimumThresholds.length === 0 && page > 1) {
        setPage(prevPage => prevPage - 1)
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Handle errors only if it's not an abort error
        toastError(error?.response?.data?.message)
      }
    }

    setIsDataTableServerLoading(false)
  }

  // Activate User Call
  const handleActivateUser = userId => {
    actionConfirmWithLoaderAlert(
      {
        /**
         * swal custom data for activating user
         */
        deleteUrl: `${API_ROUTER.USER_MANAGEMENT}/${userId}/status`,
        requestMethodType: 'PUT',
        title: `${dictionary?.sweet_alert?.user_activate?.title}`,
        text: `${dictionary?.sweet_alert?.user_activate?.text}`,
        customClass: {
          confirmButton: `btn bg-warning`
        },
        requestInputData: {
          status: 'active'
        }
      },
      {
        confirmButtonText: `${dictionary?.sweet_alert?.user_activate?.confirm_button}`,
        cancelButtonText: `${dictionary?.sweet_alert?.user_activate?.cancel_button}`
      },
      (callbackStatus, result) => {
        /**
         * Callback after action confirmation
         */
        if (callbackStatus) {
          getAllSuspendedUsers()
          successAlert({
            title: `${dictionary?.sweet_alert?.user_activate?.success}`,
            confirmButtonText: `${dictionary?.sweet_alert?.user_activate?.ok}`
          })
        }

        getAllSuspendedUsers()
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
          getAllSuspendedUsers()
          successAlert({
            title: `${dictionary?.sweet_alert?.user_delete?.success}`,
            confirmButtonText: `${dictionary?.sweet_alert?.user_delete?.ok}`
          })
        }
      }
    )
  }

  const columnHelper = createColumnHelper()

  const columns = useMemo(
    () => [
      columnHelper.accessor('serialNumber', {
        header: 'S.No',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('name', {
        header: 'Category Name'
      }),
      columnHelper.accessor('imageUrl', {
        header: 'Image',
        cell: info => (
          <img
            src={info.getValue()}
            alt='Category'
            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
          />
        )
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created At',
        cell: info => new Date(info.getValue()).toLocaleDateString()
      }),
      columnHelper.accessor('Actions', {
        header: 'Actions',
        cell: ({ row }) => (
          <IconButton
            color='secondary'
            title='Edit Category'
            onClick={() => {
              const categoryId = row.original.id

              getId(categoryId)
            }}
          >
            <EditIcon />
          </IconButton>
        )
      })
    ],
    [handleActivateUser]
  )

  const dataWithSerialNumber = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        serialNumber: (page - 1) * itemsPerPage + index + 1
      })),
    [data, page, itemsPerPage]
  )

  const table = useReactTable({
    data: dataWithSerialNumber,
    columns,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: itemsPerPage
      },
      columnFilters,
      globalFilter,
      sorting
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true
  })

  const handlePageChange = (_, newPage) => {
    setPage(newPage)
    table.setPageIndex(newPage - 1)
  }

  useEffect(() => {
    getAllSuspendedUsers()

    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [page, itemsPerPage, globalFilter, sorting])

  return (
    <Card>
      <CardHeader
        title={dictionary?.datatable?.menu_management_table?.table_title}
        action={
          <TextField
            label={dictionary?.datatable?.common?.search_placeholder}
            variant='outlined'
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            fullWidth
            sx={{ maxWidth: 300 }}
          />
        }
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell key={header.id} onClick={header.column.getToggleSortingHandler()}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' ? (
                      <ChevronRight fontSize='1.25rem' className='-rotate-90' />
                    ) : header.column.getIsSorted() === 'desc' ? (
                      <ChevronRight fontSize='1.25rem' className='rotate-90' />
                    ) : null}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {isDataTableServerLoading && (
              <tr>
                <td colSpan={columns?.length}>
                  <LinearProgress color='primary' sx={{ height: '2px' }} />
                </td>
              </tr>
            )}
          </TableHead>
          <TableBody>
            {globalFilter.length > 0 && table.getFilteredRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={table.getVisibleFlatColumns().length} align='center'>
                  {t('datatable.common.no_matching_data_found')}
                </TableCell>
              </TableRow>
            ) : table.getFilteredRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={table.getVisibleFlatColumns().length} align='center'>
                  {t('datatable.common.no_data_available')}
                </TableCell>
              </TableRow>
            ) : (
              table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => (
                  <TableRow key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component={() => (
          <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
            <Typography color='text.disabled'>
              {t('datatable.common.footer_showing_entries', {
                startIndex: totalCount > 0 ? (page - 1) * itemsPerPage + 1 : 0,
                endIndex: totalCount > 0 ? Math.min(page * itemsPerPage, totalCount) : 0,
                totalFiltered: totalCount || 0
              })}
            </Typography>
            <FormControl variant='outlined' size='small'>
              <div className='flex items-center gap-2 is-full sm:is-auto'>
                <Typography className='hidden sm:block'>{dictionary?.datatable?.common?.show}</Typography>
                <Select value={itemsPerPage} onChange={e => setItemsPerPage(e.target.value)}>
                  <MenuItem value={5}>05</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={15}>15</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                </Select>
              </div>
            </FormControl>
            <Pagination
              showFirstButton
              showLastButton
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              shape='rounded'
              color='primary'
              variant='tonal'
            />
            {/* </Stack> */}
          </div>
        )}
      />
    </Card>
  )
}

export default CategoryDataTable
