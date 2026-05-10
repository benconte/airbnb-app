import toast from 'react-hot-toast'
import { useStore } from '../../../store/useStore'

export function useFavorites() {
  const {
    state: { saved },
    dispatch,
  } = useStore()

  const toggle = (id: string, title: string) => {
    const exists = saved.includes(id as any)
    dispatch({ type: 'TOGGLE_FAVORITE', payload: id as any })
    toast.success(`${exists ? 'Removed' : 'Saved'}: ${title}`)
  }

  const isSaved = (id: string) => saved.includes(id as any)

  return {
    toggle,
    count: saved.length,
    isSaved,
  }
}
