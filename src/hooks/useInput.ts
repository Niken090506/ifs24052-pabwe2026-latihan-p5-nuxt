import { ref, type Ref } from 'vue'

export interface UseInputReturn<T = string> {
  value: Ref<T>
  setValue: (newValue: T) => void
  onChange: (eventOrValue: Event | T | any) => void
  onInput: (eventOrValue: Event | T | any) => void
  reset: () => void
  error: Ref<string | null>
  setError: (msg: string | null) => void
  bind: {
    value: Ref<T>
    onInput: (e: any) => void
  }
}

export function useInput<T = string>(initialValue: T = '' as unknown as T): UseInputReturn<T> {
  const value = ref<T>(initialValue) as Ref<T>
  const error = ref<string | null>(null)

  const setValue = (newValue: T) => {
    value.value = newValue
    if (error.value) {
      error.value = null
    }
  }

  const onChange = (eventOrValue: Event | T | any) => {
    if (eventOrValue && typeof eventOrValue === 'object' && 'target' in eventOrValue) {
      const target = eventOrValue.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      if (target.type === 'checkbox') {
        value.value = (target as HTMLInputElement).checked as unknown as T
      } else {
        value.value = target.value as unknown as T
      }
    } else {
      value.value = eventOrValue as T
    }
    if (error.value) {
      error.value = null
    }
  }

  const reset = () => {
    value.value = initialValue
    error.value = null
  }

  const setError = (msg: string | null) => {
    error.value = msg
  }

  return {
    value,
    setValue,
    onChange,
    onInput: onChange,
    reset,
    error,
    setError,
    bind: {
      value,
      onInput: onChange
    }
  }
}

export default useInput
