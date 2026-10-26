import { expectTypeOf, it } from 'vitest'
import type {
  SchedulingHorizonInput,
  SchedulingRequestItem,
  SchedulingRequestSourceState,
  SchedulingSingleRequest,
} from '../../index'

it('public request types preserve source states and readonly request identity', () => {
  expectTypeOf<SchedulingRequestSourceState>().toEqualTypeOf<
    'unready' | 'loading' | 'error' | 'ready'
  >()
  const item: SchedulingRequestItem = { key: 'session-a', label: '晨间共读' }
  expectTypeOf(item.key).toEqualTypeOf<string>()
})

function compileOnly(request: SchedulingSingleRequest, item: SchedulingRequestItem) {
  // @ts-expect-error A request identity is immutable after capture.
  request.sourceKey = 'another-source'
  // @ts-expect-error Public item facts are host owned.
  item.key = 'another-item'
  const invalidWindow: SchedulingHorizonInput = {
    // @ts-expect-error The window mode is a discriminant, not an arbitrary string.
    mode: 'automatic',
    presetKey: '',
    startLocal: '',
    endLocal: '',
  }
  return invalidWindow
}
void compileOnly
