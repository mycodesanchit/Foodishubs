'use client'

// React Imports
import { useEffect } from 'react'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import useLayoutInit from '@core/hooks/useLayoutInit'

// Util Imports
import { fetchUserProfileAndUpdateStoreValue } from '@utils/globalFunctions'

const LayoutWrapper = props => {
  // Props
  const { systemMode, verticalLayout, horizontalLayout } = props

  // Hooks
  const { settings } = useSettings()

  useLayoutInit(systemMode)

  useEffect(() => {
    fetchUserProfileAndUpdateStoreValue()
  }, [])

  // Return the layout based on the layout context
  return (
    <div className='flex flex-col flex-auto nh-dashboard-layout' data-skin={settings.skin}>
      {settings.layout === 'horizontal' ? horizontalLayout : verticalLayout}
    </div>
  )
}

export default LayoutWrapper
