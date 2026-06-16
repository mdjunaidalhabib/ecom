"use client";

export default function ModalWrapper({ open, children }) {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />

      {/* Modal container */}
      <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
        <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow">
          {children}
        </div>
      </div>
    </>
  );
}
