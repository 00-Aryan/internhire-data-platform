export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="h-12 w-48 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-6 w-96 bg-gray-200 rounded animate-pulse" />
      </div>
      
      <div className="space-y-6">
        <div className="bg-gray-200 rounded-lg p-4 h-96 animate-pulse" />
      </div>
    </div>
  )
}
