'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// Third-party Imports

// MUI Imports

// Util Imports
import axiosApiCall from '@/utils/axiosApiCall'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

const MealSelection = props => {
  // Props
  const { mode, dictionary, id } = props

  // Hooks
  const router = useRouter()
  const { lang: locale } = useParams()

  // states
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [menuItems, setMenuItems] = useState([])
  const [dishes, setDishes] = useState([])

  useEffect(() => {
    axiosApiCall
      .get(
        `/v1/parent-meal-selection/get-all-categories?vendorId=675bba8947ec2f9a22825df5&kidId=67601bd416712aa2732faa7f`
      )
      .then(response => {
        setUserData(response?.data?.response)

        if (!response?.data?.response?.isApproved) {
          setOpenIsApproveModel(true)
        }

        setIsDataLoaded(true)
      })
      .catch(error => {
        console.error('Error fetching roles:', error)
        setIsDataLoaded(true)
      })
  }, [])

  return <>data</>
}

export default MealSelection
