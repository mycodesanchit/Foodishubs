'use client'

import React, { useState } from 'react'

import { Button } from '@mui/material'

import AddCategoryForm from './AddCategoryForm'

import AddDishForm from './AddDishForm'

import AddModifierGroupForm from './AddModifierGroupForm'

import TabBar from './Tabbar'

import MenuBar from './Menu'

function ParentComponent(props) {
  const { dictionary = null } = props
  const [tabValue, setTabValue] = useState(0) // Active tab index
  const [isPageOpen, setIsPageOpen] = useState(false) // Whether a page is open
  const [currentTabIndex, setCurrentTabIndex] = useState(0) // To track which tab to go back to
  const [pageContent, setPageContent] = useState(null)
  const [editId, setEditId] = useState(null)
  const [isEdit, SetIsEdit] = useState(false)

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleOpenPage = tabIndex => {
    console.log('handleOpenPage')
    setCurrentTabIndex(tabIndex) // Store the current tab index
    setIsPageOpen(true)
    SetIsEdit(false)
    setEditId(null)
    setPageContent(getPageContent(tabIndex)) // Set page content based on the tab index
  }

  const handleBackToTabs = () => {
    console.log('handleBackToTabs')
    setIsPageOpen(false)
    SetIsEdit(false)
    setEditId(null) // Close the page
    setPageContent(null) // Clear the page content
    setTabValue(currentTabIndex) // Go back to the previously active tab
  }

  const getId = (id, tabIndex) => {
    console.log('getId', id)
    setEditId(id)
    setCurrentTabIndex(tabIndex)
    setIsPageOpen(true)
    SetIsEdit(true)
    setTimeout(() => {
      setPageContent(getPageContent(tabIndex))
    }, 0)
    // setPageContent(getPageContent(tabIndex))
  }

  const getPageContent = tabIndex => {
    switch (tabIndex) {
      case 0:
        return <AddCategoryForm handleBackToTabs={handleBackToTabs} tabValue={tabIndex} editId={editId} />
      case 1:
        return <AddDishForm handleBackToTabs={handleBackToTabs} tabValue={tabIndex} />
      case 2:
        return <AddModifierGroupForm handleBackToTabs={handleBackToTabs} tabValue={tabIndex} />
      default:
        return <div>Page Not Found</div>
    }
  }

  return (
    <>
      <MenuBar tabValue={tabValue} onTabChange={handleTabChange} onOpenPage={handleOpenPage} isEdit={isEdit} />
      {!isPageOpen ? (
        <TabBar tabValue={tabValue} onTabChange={handleTabChange} dictionary={dictionary} getId={getId} />
      ) : (
        <div style={{ padding: '16px' }}>
          <Button variant='contained' onClick={handleBackToTabs}>
            Back
          </Button>
          {pageContent}
        </div>
      )}
    </>
  )
}

export default ParentComponent
