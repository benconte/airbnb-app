import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../auth/hooks/useAuth'
import { api } from '../../../../lib/api'
import { toast } from 'sonner'

export function useFavorites() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: saved = [] } = useQuery({
    queryKey: ['wishlists', user?.id],
    queryFn: async () => {
      if (!user) return []
      const res = await api.get(`/api/v1/users/${user.id}/wishlists`)
      return (res.data?.map((l: any) => l.id) || res?.data?.data?.map((l: any) => l.id)) || []
    },
    enabled: !!user,
  })

  const { mutate } = useMutation({
    mutationFn: async ({ id }: { id: string, title: string }) => {
      await api.post(`/api/v1/users/${user?.id}/wishlists/${id}`)
      return { id }
    },
    onMutate: async ({ id, title }) => {
      await queryClient.cancelQueries({ queryKey: ['wishlists', user?.id] })
      const previous = queryClient.getQueryData(['wishlists', user?.id]) as string[]

      const exists = previous?.includes(id)
      queryClient.setQueryData(['wishlists', user?.id], (old: string[] = []) =>
        exists ? old.filter(x => x !== id) : [...old, id]
      )

      return { previous, exists, title }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['wishlists', user?.id], context.previous)
      }
      toast.error('Failed to update wishlist')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlists', user?.id] })
    },
    onSuccess: (data, variables, context) => {
      toast.success(`${context.exists ? 'Removed' : 'Saved'}: ${context.title}`)
    }
  })

  return {
    toggle: (id: string, title: string) => {
      if (!user) {
        toast.error('Please login to save to wishlist')
        return
      }
      mutate({ id, title })
    },
    count: saved.length,
    isSaved: (id: string) => saved.includes(id)
  }
}
