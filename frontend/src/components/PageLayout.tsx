// frontend/src/components/PageLayout.tsx
export default function PageLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-stone-100 py-8 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
                {children}
            </div>
        </div>
    )
}