export default function RightPanel() {
    return (
        <div className="space-y-6 sticky top-22">
            <div className="bg-white border rounded-xl p-4 border-gray-300">
                <h3 className="font-semibold mb-4">Recently Placed</h3>

                {[
                    { name: "Mahira", role: "Software Engineer", time: "3h" },
                    { name: "Raj Patel", role: "Data Analyst", time: "5h" },
                    { name: "Sophia Lee", role: "Associate Designer", time: "2d" },
                ].map((user) => (
                    <div key={user.name} className="flex gap-3 mb-4">
                        <div className="w-9 h-9 rounded-full bg-gray-300" />
                        <div className="text-sm">
                            <p className="font-medium">{user.name}</p>
                            <p className="text-gray-500">{user.role}</p>
                            <span className="text-green-500">●</span>{" "}
                            <span className="text-gray-400">{user.time}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white border rounded-xl p-4 border-gray-300">
                <h3 className="font-semibold mb-4">User Dashboard</h3>
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300" />
                    <div>
                        <p className="font-medium">Admin</p>
                        <p className="text-sm text-gray-500">8 placements</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
