'use client'
// React Imports
import { useEffect, useState } from 'react'

import Link from 'next/link'

// MUI Imports
import { Card, CardContent, Grid, Typography } from '@mui/material'

// Core Component Imports
import CustomAvatar from '@/@core/components/mui/Avatar'

// Page
const Dashboard = ({ params }) => {
  return (
    <div className=''>
      <div className='top-block-card'>
        <div className='card-block-inner'>
          <div className='card-block'>
            <Link href={``}>
              <Card>
                <CardContent className='flex flex-col gap-1'>
                  <div className='flex items-center gap-4'>
                    <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                      <i className='tabler-clipboard-check text-xl' />
                    </CustomAvatar>
                    <div className='card-text-top'>
                      <Typography variant='h4'>Total Orders</Typography>
                      <Typography variant='body2' color='text.disabled'>
                        Last Week
                      </Typography>
                    </div>
                  </div>
                  <div className='flex flex-col gap-1 number-text-block'>
                    <div className='flex items-center number-text-block-inner gap-2'>
                      <Typography variant='h4'>124 K</Typography>
                      <Typography variant='body2' className='highlight-text'>
                        +12.6
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
          <div className='card-block'>
            <Link href={``}>
              <Card>
                <CardContent className='flex flex-col gap-1'>
                  <div className='flex items-center gap-4'>
                    <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                      <i className='tabler-clipboard-check text-xl' />
                    </CustomAvatar>
                    <div className='card-text-top'>
                      <Typography variant='h4'>Total Profits</Typography>
                      <Typography variant='body2' color='text.disabled'>
                        Last Week
                      </Typography>
                    </div>
                  </div>
                  <div className='flex flex-col gap-1 number-text-block'>
                    <div className='flex items-center number-text-block-inner gap-2'>
                      <Typography variant='h4'>124 K</Typography>
                      <Typography variant='body2' className='highlight-text'>
                        +12.6
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
          <div className='card-block'>
            <Link href={``}>
              <Card>
                <CardContent className='flex flex-col gap-1'>
                  <div className='flex items-center gap-4'>
                    <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                      <i className='tabler-clipboard-check text-xl' />
                    </CustomAvatar>
                    <div className='card-text-top'>
                      <Typography variant='h4'>Total Profits</Typography>
                      <Typography variant='body2' color='text.disabled'>
                        Last Week
                      </Typography>
                    </div>
                  </div>
                  <div className='flex flex-col gap-1 number-text-block'>
                    <div className='flex items-center number-text-block-inner gap-2'>
                      <Typography variant='h4'>124 K</Typography>
                      <Typography variant='body2' className='highlight-text'>
                        +12.6
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
          <div className='card-block'>
            <Link href={``}>
              <Card>
                <CardContent className='flex flex-col gap-1'>
                  <div className='flex items-center gap-4'>
                    <CustomAvatar className='custom-avatar' color={'primary'} skin='light' variant='rounded'>
                      <i className='tabler-clipboard-check text-xl' />
                    </CustomAvatar>
                    <div className='card-text-top'>
                      <Typography variant='h4'>Total Profits</Typography>
                      <Typography variant='body2' color='text.disabled'>
                        Last Week
                      </Typography>
                    </div>
                  </div>
                  <div className='flex flex-col gap-1 number-text-block'>
                    <div className='flex items-center number-text-block-inner gap-2'>
                      <Typography variant='h4'>124 K</Typography>
                      <Typography variant='body2' className='highlight-text'>
                        +12.6
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
      <div className='common-block'>
        <div className='common-block-title'>
          <h4>Monthly Orders</h4>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
