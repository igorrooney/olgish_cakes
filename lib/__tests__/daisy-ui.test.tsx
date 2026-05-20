/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react'
import dayjs from 'dayjs'
import {
  Box,
  Breadcrumbs,
  DatePicker,
  Grid,
  IconButton,
  Link,
  MenuItem,
  Select,
  Snackbar,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TablePagination,
  TextField,
  Typography
} from '../daisy-ui'

describe('daisy-ui compatibility wrappers', () => {
  describe('Select and MenuItem', () => {
    it('renders rich menu item children as plain option text', () => {
      const { container } = render(
        <Select label='Design Type' value='standard' onChange={() => {}}>
          <MenuItem value='standard'>
            <Box>
              <Typography>Standard Design - GBP 30</Typography>
              <Typography>Our signature design</Typography>
            </Box>
          </MenuItem>
        </Select>
      )

      const option = container.querySelector('option[value="standard"]')

      expect(option).toHaveTextContent('Standard Design - GBP 30 Our signature design')
      expect(option?.querySelector('div')).toBeNull()
    })

    it('does not inject a duplicate blank label option when one is provided', () => {
      const { container } = render(
        <Select label='Select Cake' value='' onChange={() => {}}>
          <MenuItem value=''>
            <em>Custom Order</em>
          </MenuItem>
          <MenuItem value='honey-cake'>Honey Cake</MenuItem>
        </Select>
      )

      const options = Array.from(container.querySelectorAll('option'))

      expect(options).toHaveLength(2)
      expect(options[0]).toHaveValue('')
      expect(options[0]).toHaveTextContent('Custom Order')
      expect(screen.queryByText('Select Cake')).not.toBeInTheDocument()
    })
  })

  describe('DatePicker', () => {
    const calendarAriaFormatter = new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    const formatCalendarButtonName = (value: string) => {
      const [year, month, day] = value.split('-').map(Number)
      return calendarAriaFormatter.format(new Date(year, month - 1, day))
    }

    it('sets today as the minimum date when past dates are disabled', () => {
      render(
        <DatePicker
          label='Date Needed'
          value={null}
          onChange={() => {}}
          disablePast
          slotProps={{
            textField: {
              fullWidth: true,
              required: true
            }
          }}
        />
      )

      expect(screen.getByLabelText('Date Needed')).toHaveAttribute('data-min-date', dayjs().format('YYYY-MM-DD'))
    })

    it('adapts selected dates back to Dayjs values', () => {
      const handleChange = jest.fn()

      render(
        <DatePicker
          label='Date Needed'
          value={null}
          onChange={handleChange}
          min='2026-03-18'
        />
      )

      fireEvent.click(screen.getByLabelText('Date Needed'))
      fireEvent.click(screen.getByRole('button', {
        name: new RegExp(`select ${formatCalendarButtonName('2026-03-19')}`, 'i')
      }))

      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange.mock.calls[0][0].format('YYYY-MM-DD')).toBe('2026-03-19')
    })
  })

  describe('Grid', () => {
    it('maps common MUI breakpoint spans to Tailwind grid classes', () => {
      const { container } = render(
        <Grid container spacing={3}>
          <Grid item xs={6} sm={3} md={4} lg={2}>
            Field
          </Grid>
        </Grid>
      )

      const grid = container.firstElementChild
      const item = screen.getByText('Field')

      expect(grid).toHaveClass('grid', 'grid-cols-12', 'gap-3')
      expect(item).toHaveClass('col-span-6', 'sm:col-span-3', 'md:col-span-4', 'lg:col-span-2')
    })
  })

  describe('Box', () => {
    it('maps responsive display sx values to Tailwind classes', () => {
      render(
        <Box sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
          Responsive content
        </Box>
      )

      expect(screen.getByText('Responsive content')).toHaveClass('hidden', 'md:inline-flex')
    })
  })

  describe('Typography', () => {
    it('applies MUI-style color props through the token palette', () => {
      render(
        <>
          <Typography color='text.secondary'>Muted text</Typography>
          <Typography color='primary'>Primary text</Typography>
        </>
      )

      expect(screen.getByText('Muted text')).toHaveStyle({
        color: 'hsl(var(--bc) / 0.72)'
      })
      expect(screen.getByText('Primary text')).toHaveStyle({
        color: 'hsl(var(--p))'
      })
    })

    it('lets sx color override the color prop', () => {
      render(
        <Typography color='text.secondary' sx={{ color: 'rgb(1, 2, 3)' }}>
          Explicit color
        </Typography>
      )

      expect(screen.getByText('Explicit color')).toHaveStyle({
        color: 'rgb(1, 2, 3)'
      })
    })
  })

  describe('Breadcrumbs and Link', () => {
    it('forwards breadcrumb attributes and renders custom separators', () => {
      render(
        <Breadcrumbs aria-label='breadcrumb navigation' separator='>'>
          <Link href='/'>Home</Link>
          <Typography>Current</Typography>
        </Breadcrumbs>
      )

      expect(screen.getByLabelText('breadcrumb navigation')).toBeInTheDocument()
      expect(screen.getByText('>')).toBeInTheDocument()
    })

    it('forwards link attributes and event handlers', () => {
      const handleClick = jest.fn((event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()
      })

      render(
        <Link
          href='https://example.com'
          target='_blank'
          rel='noopener noreferrer'
          aria-label='Open example'
          onClick={handleClick}
        >
          Example
        </Link>
      )

      const link = screen.getByRole('link', { name: 'Open example' })

      expect(link).toHaveAttribute('href', 'https://example.com')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')

      fireEvent.click(link)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('IconButton', () => {
    it('renders href buttons as anchors', () => {
      render(
        <IconButton href='https://example.com' target='_blank' rel='noopener noreferrer' aria-label='Open example'>
          Open
        </IconButton>
      )

      const link = screen.getByRole('link', { name: 'Open example' })

      expect(link).toHaveAttribute('href', 'https://example.com')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveTextContent('Open')
    })
  })

  describe('TablePagination', () => {
    it('renders a rows-per-page select and forwards changes', () => {
      const selectedValues: string[] = []
      const handleRowsPerPageChange = jest.fn()
        .mockImplementation((event: React.ChangeEvent<HTMLInputElement>) => {
          selectedValues.push(event.target.value)
        })

      render(
        <TablePagination
          count={100}
          page={0}
          rowsPerPage={10}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage='Rows per page:'
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )

      fireEvent.change(screen.getByLabelText('Rows per page:'), { target: { value: '25' } })

      expect(handleRowsPerPageChange).toHaveBeenCalledTimes(1)
      expect(selectedValues).toEqual(['25'])
    })
  })

  describe('Stepper', () => {
    it('only renders content for the active vertical step', () => {
      render(
        <Stepper activeStep={1}>
          <Step>
            <StepLabel>Customer</StepLabel>
            <StepContent>Customer fields</StepContent>
          </Step>
          <Step>
            <StepLabel>Details</StepLabel>
            <StepContent>Details fields</StepContent>
          </Step>
        </Stepper>
      )

      expect(screen.getByText('Customer')).toBeInTheDocument()
      expect(screen.getByText('Details')).toBeInTheDocument()
      expect(screen.queryByText('Customer fields')).not.toBeInTheDocument()
      expect(screen.getByText('Details fields')).toBeInTheDocument()
    })
  })

  describe('Snackbar', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.runOnlyPendingTimers()
      jest.useRealTimers()
    })

    it('calls onClose with timeout after autoHideDuration', () => {
      const handleClose = jest.fn()

      render(
        <Snackbar open autoHideDuration={3000} onClose={handleClose}>
          Saved
        </Snackbar>
      )

      jest.advanceTimersByTime(2999)
      expect(handleClose).not.toHaveBeenCalled()

      jest.advanceTimersByTime(1)
      expect(handleClose).toHaveBeenCalledWith(undefined, 'timeout')
    })
  })

  describe('TextField', () => {
    it('forwards inputProps and standard input handlers to the input element', () => {
      const handleBlur = jest.fn()

      render(
        <TextField
          label='Postcode'
          value='LS1 2AB'
          onChange={() => {}}
          onBlur={handleBlur}
          autoComplete='postal-code'
          inputProps={{
            pattern: '^[A-Z]',
            title: 'Enter a valid postcode',
            min: 0,
            step: 0.01
          }}
        />
      )

      const input = screen.getByLabelText('Postcode')

      expect(input).toHaveAttribute('autocomplete', 'postal-code')
      expect(input).toHaveAttribute('pattern', '^[A-Z]')
      expect(input).toHaveAttribute('title', 'Enter a valid postcode')
      expect(input).toHaveAttribute('min', '0')
      expect(input).toHaveAttribute('step', '0.01')

      fireEvent.blur(input)
      expect(handleBlur).toHaveBeenCalled()
    })
  })
})
