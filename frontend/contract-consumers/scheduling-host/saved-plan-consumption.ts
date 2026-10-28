import {
  SchedulingPlanGantt,
  SchedulingPlanOrders,
  SchedulingWorkOrderLink,
  type SavedPlanOrdersInput,
  type SavedPlanNavigateRequest,
} from '@nerv-iip/scheduling'
const orders: SavedPlanOrdersInput = {
  planId: 'reading',
  rows: [
    {
      orderId: 'order',
      label: '约定',
      taskRefs: [{ taskId: 'assignment', operationId: 'activity', orderId: 'order' }],
    },
  ],
}
const props: InstanceType<typeof SchedulingPlanGantt>['$props'] = {
  planId: 'reading',
  groupBy: 'room',
  orders,
  onNavigate: async (request: SavedPlanNavigateRequest) => {
    if (request.kind === 'group') console.info(request.groupKey)
    else console.info(request.taskId)
  },
}
// @ts-expect-error no task request without assignment identity
const invalid: SavedPlanNavigateRequest = {
  kind: 'task',
  planId: 'reading',
  orderId: 'order',
  target: '/order',
}
void [props, invalid, SchedulingPlanOrders, SchedulingWorkOrderLink]
