export default function RoastCard({ roast }) {
  return (
    <div className="border border-orange-100 bg-orange-50 rounded-2xl p-4
                    space-y-3 mt-2">
      {/* Roast text */}
      <div>
        <p className="text-xs font-medium text-orange-400 mb-1">
          🔥 AI roast
        </p>
        <p className="text-sm text-gray-800 leading-relaxed">
          {roast.roastText}
        </p>
      </div>

      {/* Tips */}
      <div className="border-t border-orange-100 pt-3">
        <p className="text-xs font-medium text-teal-600 mb-2">
          ✨ Gợi ý cải thiện
        </p>
        <ul className="space-y-1">
          {roast.tips.map((tip, i) => (
            <li key={i} className="text-sm text-gray-700 flex gap-2">
              <span className="text-teal-400 font-medium mt-0.5">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}