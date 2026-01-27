import formatFeatureList from '../../../lib/formatFeatureList';

export default function DetailsSection({ product }) {
  // Prefer `product.specs` as canonical source for structured specs/details.
  const specs = product.specs || product.details || null;
  if (!specs) return null;

  const details = specs;

  return (
    <section className="mt-12 bg-[#FAFAFA] p-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Details</h2>

  <p className="text-gray-600 leading-relaxed mb-6">{details.description || ''}</p>

        <div className="space-y-4">
          {}
          {/* Render screen section if present */}
          {details.screen && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Screen</h3>
              <div className="border-t border-gray-200 divide-y divide-gray-200">
                {details.screen.diagonal && (
                  <div className="flex justify-between py-1.5 border-b border-gray-200"><span className="text-gray-600">Screen diagonal</span><span className="font-medium text-gray-900">{details.screen.diagonal}</span></div>
                )}
                {details.screen.resolution && (
                  <div className="flex justify-between py-1.5 border-b border-gray-200"><span className="text-gray-600">Resolution</span><span className="font-medium text-gray-900">{details.screen.resolution}</span></div>
                )}
                {details.screen.refreshRate && (
                  <div className="flex justify-between py-1.5 border-b border-gray-200"><span className="text-gray-600">Refresh rate</span><span className="font-medium text-gray-900">{details.screen.refreshRate}</span></div>
                )}
                {details.screen.pixelDensity && (
                  <div className="flex justify-between py-1.5 border-b border-gray-200"><span className="text-gray-600">Pixel density</span><span className="font-medium text-gray-900">{details.screen.pixelDensity}</span></div>
                )}
                {details.screen.type && (
                  <div className="flex justify-between py-1.5 border-b border-gray-200"><span className="text-gray-600">Screen type</span><span className="font-medium text-gray-900">{details.screen.type}</span></div>
                )}
                {details.screen.additionalFeatures && (
                  <div className="flex justify-between py-1.5 border-b border-gray-200"><span className="text-gray-600">Additional features</span><span className="font-medium text-gray-900">{formatFeatureList(details.screen.additionalFeatures)}</span></div>
                )}
              </div>
            </div>
          )}

          {/* Render remaining detail sections dynamically (excluding screen) */}
          {Object.entries(details).filter(([k]) => k !== 'screen' && String(k).toLowerCase() !== 'features').map(([sectionKey, sectionVal]) => (
            <div key={sectionKey}>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg border-t">{sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}</h3>
              <div className="border-gray-200 divide-y divide-gray-200">
                {sectionVal && typeof sectionVal === 'object' && !Array.isArray(sectionVal) ? (
                  Object.entries(sectionVal).map(([label, value]) => (
                    <div key={label} className="flex justify-between py-1.5 border-b border-gray-200">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-medium text-gray-900 text-right">
                        {Array.isArray(value) ? formatFeatureList(value) : (typeof value === 'string' || typeof value === 'number' ? String(value) : JSON.stringify(value))}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between py-1.5 border-b border-gray-200">
                    <span className="text-gray-600">{sectionKey}</span>
                    <span className="font-medium text-gray-900 text-right">{formatFeatureList(sectionVal)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {/* Render features if present on the canonical specs object */}
          {Array.isArray(details.features) && details.features.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg border-t">Features</h3>
              <div className="border-gray-200 divide-y divide-gray-200">
                <div className="py-2">
                  {formatFeatureList(details.features)}
                </div>
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