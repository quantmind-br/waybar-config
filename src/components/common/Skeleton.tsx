// ============================================================================
// SKELETON - Loading placeholder components
// ============================================================================

export interface SkeletonProps {
  /** Width of skeleton */
  width?: string | number
  /** Height of skeleton */
  height?: string | number
  /** Border radius */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  /** Custom className */
  className?: string
}

const roundedClasses = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

/**
 * Base skeleton component
 *
 * @example
 * ```tsx
 * <Skeleton width="100%" height="20px" rounded="md" />
 * ```
 */
export function Skeleton({
  width = '100%',
  height = '1rem',
  rounded = 'md',
  className = '',
}: SkeletonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${roundedClasses[rounded]} ${className}`}
      style={style}
    />
  )
}

/**
 * Text skeleton (single line)
 */
export function SkeletonText({
  width = '100%',
  className = '',
}: {
  width?: string | number
  className?: string
}) {
  return <Skeleton width={width} height="1rem" rounded="sm" className={className} />
}

/**
 * Text skeleton (multiple lines)
 */
export function SkeletonParagraph({
  lines = 3,
  className = '',
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonText
          key={i}
          width={i === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  )
}

/**
 * Card skeleton
 */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      <div className="flex items-start gap-3 mb-3">
        <Skeleton width={40} height={40} rounded="full" />
        <div className="flex-1 space-y-2">
          <SkeletonText width="60%" />
          <SkeletonText width="40%" />
        </div>
      </div>
      <SkeletonParagraph lines={2} />
    </div>
  )
}

/**
 * List item skeleton
 */
export function SkeletonListItem({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 p-3 ${className}`}>
      <Skeleton width={32} height={32} rounded="md" />
      <div className="flex-1 space-y-2">
        <SkeletonText width="70%" />
        <SkeletonText width="40%" />
      </div>
    </div>
  )
}

/**
 * List skeleton
 */
export function SkeletonList({
  count = 5,
  className = '',
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonListItem key={i} />
      ))}
    </div>
  )
}

/**
 * Table row skeleton
 */
export function SkeletonTableRow({
  columns = 4,
  className = '',
}: {
  columns?: number
  className?: string
}) {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3">
          <SkeletonText />
        </td>
      ))}
    </tr>
  )
}

/**
 * Table skeleton
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
  className = '',
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <table className={`w-full ${className}`}>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} columns={columns} />
        ))}
      </tbody>
    </table>
  )
}

/**
 * Bar editor skeleton (specific to waybar config app)
 */
export function SkeletonBarEditor({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <SkeletonText width="200px" />
        <div className="flex gap-2">
          <Skeleton width={80} height={32} rounded="md" />
          <Skeleton width={80} height={32} rounded="md" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        <SkeletonText width="80px" />
        <SkeletonText width="80px" />
        <SkeletonText width="80px" />
      </div>

      {/* Content */}
      <div className="grid grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}

/**
 * Module palette skeleton
 */
export function SkeletonModulePalette({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      <SkeletonText width="150px" />
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-2">
              <Skeleton width={24} height={24} rounded="sm" />
              <SkeletonText width="60%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Skeleton
