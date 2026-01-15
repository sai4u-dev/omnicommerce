export default function Navbar() {
    return (
        <div className="flex items-center gap-6 px-6 h-16 bg-white border-b sticky top-0 z-10">
            <h1 className="text-xl font-bold text-blue-600">Accio Connect</h1>

            <input
                type="text"
                placeholder="Search"
                className="flex-1 px-4 py-2 rounded-lg border bg-gray-50 outline-none"
            />

            <div className="flex items-center gap-4">
                <span>⏱️</span>
                <div className="w-9 h-9 rounded-full bg-gray-300" />
            </div>
        </div>
    );
}
