
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { tasksService } from "@/services/task/task.service";
// import { taskKeys } from "@/lib/react-query/taskKeys";
// import { showSuccessToast, showErrorToast } from "@/lib/helpers/toast-helpers";
// import { TaskApi } from "@/types/api/task.api";

// export function useUpdateTaskOrder() {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: async ({
//             workspaceId,
//             projectId,
//             orderedTaskIds,
//         }: {
//             workspaceId: number;
//             projectId: number;
//             orderedTaskIds: number[];
//         }) => {
//             await tasksService.updateOrder(workspaceId, projectId, orderedTaskIds);
//         },

//         onMutate: async ({ workspaceId, projectId, orderedTaskIds }) => {
//             // Cancel outgoing refetches
//             await queryClient.cancelQueries({
//                 queryKey: taskKeys.list(workspaceId, projectId),
//             });

//             // Snapshot previous value
//             const previousTasks = queryClient.getQueryData<TaskApi[]>(
//                 taskKeys.list(workspaceId, projectId)
//             );

//             // Optimistically update
//             queryClient.setQueryData<TaskApi[]>(
//                 taskKeys.list(workspaceId, projectId),
//                 (old) => {
//                     if (!old) return old;

//                     // Create map of task ID to new order index
//                     const orderMap = new Map(
//                         orderedTaskIds.map((id, index) => [id, index])
//                     );

//                     // Update order_index for each task
//                     return old
//                         .map((task) => ({
//                             ...task,
//                             order_index: orderMap.get(task.id) ?? task.order_index,
//                         }))
//                         .sort((a, b) => a.order_index - b.order_index);
//                 }
//             );

//             return { previousTasks };
//         },

//         onError: (error, variables, context) => {
//             // Rollback on error
//             if (context?.previousTasks) {
//                 queryClient.setQueryData(
//                     taskKeys.list(variables.workspaceId, variables.projectId),
//                     context.previousTasks
//                 );
//             }

//             showErrorToast("Failed to update task order");
//         },

//         onSuccess: (_, variables) => {
//             // Optionally refetch to ensure sync
//             queryClient.invalidateQueries({
//                 queryKey: taskKeys.list(variables.workspaceId, variables.projectId),
//             });
//         },
//     });
// }