import { useState } from "react";

export default function PostCard({ name, subtitle, content, type }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md sticky top-22">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 ring-2 ring-blue-500" />
                <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-gray-500">{subtitle}</p>
                </div>
            </div>

            {/* Content */}
            <p className={`mb-2 text-gray-700 transition-all ${expanded ? "" : "line-clamp-4"}`}>
                {content}
            </p>

            {/* Read More / Less */}
            <div
                onClick={() => setExpanded(!expanded)}
                className="text-blue-500 text-sm font-medium cursor-pointer hover:underline"
            >
                {expanded ? "Read less" : "Read more"}
            </div>

            {type === "referral" && (
                <div className="h-32 border rounded-xl flex items-center justify-center text-5xl font-bold tracking-wide mt-4">
                    XYZ
                </div>
            )}

            {type === "video" && (
                <div className="h-32 bg-teal-600 rounded-xl flex items-center justify-center text-white text-xl mt-4">
                    ▶
                </div>
            )}

            <div className="flex gap-6 mt-4 text-sm text-gray-500">
                <span className="hover:text-blue-500 cursor-pointer">👍 12</span>
                <span className="hover:text-blue-500 cursor-pointer">💬 5</span>
            </div>
        </div>
    );
}
