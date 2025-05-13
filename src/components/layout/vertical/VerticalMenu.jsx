// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, MenuItem } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const { lang: locale } = params
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuItem href={`/${locale}/dashboard`} icon={<i className='tabler-layout-dashboard' />}>
          {dictionary['navigation'].dashboard}
        </MenuItem>
        <MenuItem
          href={`/${locale}/staff-management`}
          icon={<i className='tabler-user' />}
          activeUrl={`/${locale}/staff-management`}
          exactMatch={false}
        >
          {dictionary['navigation'].add_staff}
        </MenuItem>
        <MenuItem
          href={`/${locale}/user-management`}
          icon={<i className='tabler-user' />}
          activeUrl={`/${locale}/user-management`}
          exactMatch={false}
        >
          {dictionary['navigation'].user_management}
        </MenuItem>
        <MenuItem
          href={`/${locale}/food-chart-creation`}
          icon={<i className='tabler-user' />}
          activeUrl={`/${locale}/food-chart-creation`}
          exactMatch={false}
        >
          {dictionary['navigation'].food_chart_creation}
        </MenuItem>
        <MenuItem
          href={`/${locale}/vendor-management`}
          icon={<i className='tabler-user' />}
          activeUrl={`/${locale}/vendor-management`}
          exactMatch={false}
        >
          {dictionary['navigation'].vendor_management}
        </MenuItem>
        <MenuItem href={`/${locale}/profile-management`} icon={<i className='tabler-user' />}>
          {dictionary['navigation'].profile_management}
        </MenuItem>
        <MenuItem href={`/${locale}/parent-profile`} icon={<i className='tabler-user' />}>
          {dictionary['navigation'].parents_profile}
        </MenuItem>
        <MenuItem href={`/${locale}/kid-profile-management`} icon={<i className='tabler-user' />}>
          {dictionary['navigation'].kids_profile_management}
        </MenuItem>
        <MenuItem href={`/${locale}/order-management`} icon={<i className='tabler-user' />}>
          {dictionary['navigation'].order_management}
        </MenuItem>
        <MenuItem href={`/${locale}/menu-management`} icon={<i className='tabler-user' />}>
          {dictionary['navigation'].menu_management}
        </MenuItem>
        <MenuItem href={`/${locale}/about`} icon={<i className='tabler-info-circle' />}>
          {dictionary['navigation'].about}
        </MenuItem>
      </Menu>
      {/* <Menu
          popoutMenuOffset={{ mainAxis: 23 }}
          menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
          renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
          renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
          menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
        >
          <GenerateVerticalMenu menuData={menuData(dictionary)} />
        </Menu> */}
    </ScrollWrapper>
  )
}

export default VerticalMenu
