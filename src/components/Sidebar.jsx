
const menu = [
    { label: "Chat", icon: "💬" },
    { label: "Referral Posts", icon: "📁" },
    { label: "Create Post", icon: "✏️" },
];

export default function Sidebar({ onCreate }) {

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm h-[80vmin] flex flex-col justify-between sticky top-22">
            <div>
                {menu.map((item) => (
                    <div
                        key={item.label}
                        whileHover={{ x: 6 }}
                        onClick={item.label === "Create Post" ? onCreate : undefined}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-100"
                    >
                        <span>{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </div>
                ))}
            </div>
            <div>
                {menu.map((item) => (
                    <div
                        key={item.label}
                        whileHover={{ x: 6 }}
                        onClick={item.label === "Create Post" ? onCreate : undefined}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-100"
                    >
                        <span>{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
