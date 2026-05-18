import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import { toast } from 'sonner'

export function useEscalateDispute() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (disputeId: string) =>
            api.patch(`/api/v1/disputes/${disputeId}/escalate`),
        onSuccess: () => {
            toast.success('Dispute escalated. Admin will review it shortly.')
            queryClient.invalidateQueries({ queryKey: ['my-disputes'] })
        },
        onError: (err: Error) => {
            toast.error(err.message ?? 'Failed to escalate dispute.')
        },
    })
}