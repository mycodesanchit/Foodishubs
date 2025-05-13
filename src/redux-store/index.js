// Third-party Imports
import { configureStore } from '@reduxjs/toolkit'

// Slice Imports
import profileReducer from '@/redux-store/slices/profile'
import calendarReducer from '@/redux-store/slices/calendar'

export const store = configureStore({
  reducer: {
    profileReducer,
    calendarReducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
})
