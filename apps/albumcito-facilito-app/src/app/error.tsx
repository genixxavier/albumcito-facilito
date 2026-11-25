"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold">Algo salió mal</h1>
      <p className="mt-2 text-gray-600">No pudimos cargar los datos. ¿La API está en ejecución?</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
      >
        Reintentar
      </button>
    </main>
  );
}
