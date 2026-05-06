import toast from 'react-hot-toast'
import { useStore } from '../../../store/useStore'

export function useFavorites() {
  const {
    state: { saved },
    dispatch,
  } = useStore()

  const toggle = (id: number, title: string) => {
    const exists = saved.includes(id)
    dispatch({ type: 'TOGGLE_FAVORITE', payload: id })
    toast.success(`${exists ? 'Removed' : 'Saved'}: ${title}`)
  }

  const isSaved = (id: number) => saved.includes(id)

  return {
    toggle,
    count: saved.length,
    isSaved,
  }
}
