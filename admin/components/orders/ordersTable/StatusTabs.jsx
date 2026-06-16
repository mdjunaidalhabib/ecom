import {
  STATUS_OPTIONS,
  STATUS_LABEL,
  STATUS_TEXT_COLOR,
} from "../shared/constants";

export default function StatusTabs({ tabStatus, setTabStatus }) {
  return (
    <>
      <button
        onClick={() => setTabStatus("")}
        className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
          tabStatus === ""
            ? "bg-gray-900 text-white"
            : "bg-white hover:bg-gray-50"
        }`}
      >
        All
      </button>

      {STATUS_OPTIONS.map((s) => (
        <button
          key={s}
          onClick={() => setTabStatus(s)}
          className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
            tabStatus === s
              ? "bg-blue-600 text-white"
              : `bg-white hover:bg-gray-50 ${STATUS_TEXT_COLOR[s]}`
          }`}
        >
          {STATUS_LABEL[s]}
        </button>
      ))}
    </>
  );
}
