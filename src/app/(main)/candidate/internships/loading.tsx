export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="h-12 w-96 bg-gray-200 rounded animate-pulse" />
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-gray-200 rounded-2xl p-6 h-32 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
