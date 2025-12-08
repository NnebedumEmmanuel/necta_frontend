export default function DetailsSection({ product }) {
  if (!product.details) return null;

  const { details } = product;

  const renderSpecRow = (label, value) => (
    <div className="flex justify-between py-1.5 border-b border-gray-200">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );

  return (
    <section className="mt-12 bg-[#FAFAFA] p-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Details</h2>

        <p className="text-gray-600 leading-relaxed mb-6">{details.description}</p>

        <div className="space-y-4">
          {/* Screen Section */}
          {details.screen && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Screen</h3>
              <div className="border-t border-gray-200 divide-y divide-gray-200">
                {details.screen.diagonal && renderSpecRow("Screen diagonal", details.screen.diagonal)}
                {details.screen.resolution && renderSpecRow("The screen resolution", details.screen.resolution)}
                {details.screen.refreshRate && renderSpecRow("The screen refresh rate", details.screen.refreshRate)}
                {details.screen.pixelDensity && renderSpecRow("The pixel density", details.screen.pixelDensity)}
                {details.screen.type && renderSpecRow("Screen type", details.screen.type)}
                {details.screen.additionalFeatures && renderSpecRow(
                  "Additionally",
                  <span>{details.screen.additionalFeatures.join(", ")}</span>
                )}
              </div>
            </div>
          )}

          {/* CPU Section */}
          {details.cpu && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg border-t">CPU</h3>
              <div className="border-gray-200 divide-y divide-gray-200">
                {details.cpu.model && renderSpecRow("CPU", details.cpu.model)}
                {details.cpu.cores && renderSpecRow("Number of Cores", details.cpu.cores)}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-6">
          <button className="text-gray-700 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 flex items-center gap-2 transition">
            View More
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}