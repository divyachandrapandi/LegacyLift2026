import "./App.css";

/**
 * Root page-level UI for the LegacyLift frontend.
 *
 * Description:
 * - Renders the top-level page shell where the URL analysis flow starts.
 * - Exists as the single-page entry surface that will host input, score, issues,
 *   detected components, and AI modernization guidance.
 *
 * Example input:
 * - User enters `"https://example.com"` in the URL form (wired in upcoming UI steps).
 *
 * Example output:
 * - Rendered page container that displays analysis/report sections.
 *
 * Usage in project:
 * - Used by `frontend/src/main.tsx` as the app root component.
 */
function App() {
  return (
    <div className="w-full min-h-40 p-4 bg-pink-700 flex justify-center gap-2  text-red-500 items-center">
      <h1 className="">This is the start</h1>
    </div>
  );
}

export default App;
