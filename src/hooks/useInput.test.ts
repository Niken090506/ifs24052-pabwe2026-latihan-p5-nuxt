import { describe, it, expect } from 'vitest'
import useInputDefault, { useInput } from './useInput'

describe('useInput hook', () => {
  it('initializes with default empty string', () => {
    const input = useInput()
    expect(input.value.value).toBe('')
    expect(input.error.value).toBeNull()
  })

  it('initializes with provided initial value', () => {
    const input = useInput('hello')
    expect(input.value.value).toBe('hello')
  })

  it('updates value via setValue and clears error', () => {
    const input = useInput('')
    input.setError('Error message')
    expect(input.error.value).toBe('Error message')

    input.setValue('new value')
    expect(input.value.value).toBe('new value')
    expect(input.error.value).toBeNull()
  })

  it('handles input event with target value', () => {
    const input = useInput('')
    const mockEvent = {
      target: {
        type: 'text',
        value: 'typed text'
      }
    }
    input.onChange(mockEvent)
    expect(input.value.value).toBe('typed text')
  })

  it('handles checkbox input event', () => {
    const input = useInput(false)
    const mockCheckboxEvent = {
      target: {
        type: 'checkbox',
        checked: true
      }
    }
    input.onChange(mockCheckboxEvent)
    expect(input.value.value).toBe(true)
  })

  it('handles direct value passed to onChange and onInput', () => {
    const input = useInput('')
    input.onChange('direct')
    expect(input.value.value).toBe('direct')

    input.onInput('direct via onInput')
    expect(input.value.value).toBe('direct via onInput')
  })

  it('resets value to initial value and clears error', () => {
    const input = useInput('initial')
    input.setValue('changed')
    input.setError('some error')

    input.reset()
    expect(input.value.value).toBe('initial')
    expect(input.error.value).toBeNull()
  })

  it('provides bind object with value and onInput', () => {
    const input = useInput('bind-test')
    expect(input.bind.value.value).toBe('bind-test')

    input.bind.onInput({
      target: {
        type: 'text',
        value: 'from bind'
      }
    })
    expect(input.value.value).toBe('from bind')
  })

  it('checks default export', () => {
    expect(useInputDefault).toBe(useInput)
  })
})
