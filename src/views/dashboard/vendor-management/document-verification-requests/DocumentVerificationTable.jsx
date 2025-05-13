'use client'

// React Imports
import { useEffect, useState, useMemo, useRef } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// Thirdparty Imports
import { isCancel } from 'axios'

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
  TextField,
  Paper,
  TablePagination,
  Typography,
  Select,
  MenuItem,
  FormControl,
  LinearProgress,
  Chip,
  Button
} from '@mui/material'
import Pagination from '@mui/material/Pagination'

// React Table Imports
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender
} from '@tanstack/react-table'

// Utils Imports
import {
  apiResponseErrorHandling,
  isVariableAnObject,
  setFormFieldsErrors,
  toastError
  //   toastSuccess
} from '@/utils/globalFunctions'
import axiosApiCall from '@utils/axiosApiCall'
import { API_ROUTER } from '@/utils/apiRoutes'
import { useTranslation } from '@/utils/getDictionaryClient'

const DocumentVerificationTable = ({ dictionary }) => {
  const { lang: locale } = useParams()
  const { t } = useTranslation(locale)
  const router = useRouter()

  // States
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [globalFilter, setGlobalFilter] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [recordMetaData, setRecordMetaData] = useState(null)

  const abortController = useRef(null)

  const columnHelper = createColumnHelper()

  // Columns Definition
  const columns = useMemo(
    () => [
      columnHelper.accessor((row, index) => (page - 1) * itemsPerPage + index + 1, {
        id: 'serialNo',
        header: `${dictionary?.datatable?.column?.serial_number}`,
        cell: info => info.getValue()
      }),
      columnHelper.accessor(row => `${row.first_name} ${row.last_name}`, {
        id: 'vendorName',
        header: `${dictionary?.datatable?.column?.vendor_name}`,
        cell: info => info.getValue() || <span className='italic text-gray-500'>N/A</span>
      }),
      columnHelper.accessor('country', {
        header: `${dictionary?.datatable?.column?.country}`,
        cell: info => info.getValue() || <span className='italic text-gray-500'>N/A</span>
      }),
      columnHelper.accessor('id', {
        id: 'viewMenu',
        header: `${dictionary?.datatable?.column?.view_menu}`,
        cell: ({ row }) => (
          <Button onClick={() => router.push(`document-verification-requests/${row?.original?.vendorId}`)}>
            View icon
          </Button>
        )
      })
    ],
    [page, itemsPerPage]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: itemsPerPage
      },
      globalFilter
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true
  })

  //  Get Document verification requests api call
  const getDocumentData = async () => {
    if (abortController.current) {
      abortController.current.abort()
    }

    setIsLoading(true)
    // Create a new AbortController for the new request
    abortController.current = new AbortController()

    await axiosApiCall
      .get(API_ROUTER.DOCUMENT_VERIFICATION_REQUESTS, {
        params: {
          page,
          limit: itemsPerPage,
          searchQuery: globalFilter
          // orderBy: '{"_id" : "-1"}'
        },
        signal: abortController.current.signal
      })
      .then(response => {
        setData(response?.data?.response?.documentsVerificationRequests)
        const metaDataFromResponse = response?.data?.meta || {}

        setRecordMetaData(metaDataFromResponse)
        setIsLoading(false)
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
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handlePageChange = (_, newPage) => {
    setPage(newPage)
  }

  const handleItemsPerPageChange = event => {
    setItemsPerPage(event.target.value)
    setPage(1)
  }

  /*
    Page Life Cycle Starts
 */
  useEffect(() => {
    getDocumentData()

    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [page, itemsPerPage, globalFilter])
  /*
    Page Life Cycle Ends
 */

  return (
    <>
      <Card>
        <CardHeader
          title={t('datatable.verification_request_Table.table_title')}
          action={
            <TextField
              label={t('datatable.common.search_placeholder')}
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
                    <TableCell key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          onClick={header.column.getToggleSortingHandler()}
                          //   style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns?.length}>
                    <LinearProgress color='primary' sx={{ height: '2px' }} />
                  </td>
                </tr>
              ) : // </TableRow>
              table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} align='center'>
                    {t('datatable.common.no_data_available')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <div className='flex justify-between items-center p-4'>
          <Typography color='textSecondary'>
            {t('datatable.common.footer_showing_entries', {
              startIndex: recordMetaData?.totalFiltered > 0 ? recordMetaData?.startIndex : 0,
              endIndex: recordMetaData?.totalFiltered > 0 ? recordMetaData?.endIndex : 0,
              totalFiltered: recordMetaData?.totalFiltered
            })}
          </Typography>
          <FormControl variant='outlined' size='small'>
            <div className='flex items-center gap-2'>
              <Typography>{t('datatable.common.show')}</Typography>
              <Select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={20}>20</MenuItem>
              </Select>
            </div>
          </FormControl>
          <Pagination
            count={recordMetaData?.totalPage}
            page={recordMetaData?.page}
            onChange={handlePageChange}
            shape='rounded'
            color='primary'
            variant='tonal'
            showFirstButton
            showLastButton
          />
        </div>
      </Card>
    </>
  )
}

export default DocumentVerificationTable
