declare module 'react-test-renderer' {
  import type { ReactElement } from 'react'

  export interface ReactTestInstance {
    type: unknown
    props: unknown
    find(predicate: (node: ReactTestInstance) => boolean): ReactTestInstance
    findAll(predicate: (node: ReactTestInstance) => boolean): ReactTestInstance[]
  }

  export interface ReactTestRenderer {
    root: ReactTestInstance
    unmount(): void
  }

  interface TestRendererModule {
    create(element: ReactElement): ReactTestRenderer
  }

  export function act(callback: () => void): void
  export function act(callback: () => Promise<void>): Promise<void>

  const TestRenderer: TestRendererModule

  export default TestRenderer
}
