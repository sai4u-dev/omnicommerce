import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const categories = [
    {
        id: 1,
        title: "HEADPHONE",
        subtitle: "With",
        tag: "Enjoy",
        tagColor: "bg-pink-500",
        bg: "from-purple-400 to-purple-600",
        img: "https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-category/image-2.png",
        imgClass: "absolute right-0 top-0 w-[200px]",
        colSpan: "",
    },
    {
        id: 2,
        title: "WATCH",
        subtitle: "Smart",
        tag: "New",
        tagColor: "bg-orange-500",
        bg: "from-yellow-400 to-yellow-500",
        img: "https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-category/image-1.png",
        imgClass: "absolute right-6 top-4 w-[170px]",
        colSpan: "",
    },
    {
        id: 3,
        title: "LAPTOP",
        subtitle: "Smart",
        tag: "Productivity",
        tagColor: "bg-rose-400",
        bg: "from-cyan-400 to-cyan-600",
        img: "https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-category/image-3.png",
        imgClass: "absolute -right-2 bottom-0 w-[300px]",
        colSpan: "md:col-start-3",
    },
    {
        id: 4,
        title: "CONSOLE",
        subtitle: "Gaming",
        tag: "Play",
        tagColor: "bg-orange-500",
        bg: "from-yellow-400 to-yellow-400",
        img: "https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-category/image-4.png",
        imgClass: "absolute  right-0 top-0 bottom-0 w-[350px] ",
        colSpan: "md:col-span-2",
    },
    {
        id: 5,
        title: "OCULUS",
        subtitle: "Game",
        tag: "Play",
        tagColor: "bg-orange-600",
        bg: "from-green-500 to-green-600",
        img: "https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-category/image-5.png",
        imgClass: "absolute right-4 bottom-0 w-[200px]",
        colSpan: "",
    },
]

export default function CategorySection() {
    return (
        <section className="bg-[#2c2c2c] py-20 text-white">
            <div className="max-w-6xl mx-auto px-4">

                {/* Header */}
                <div className="text-center mb-14">
                    <p className="text-yellow-500 text-sm tracking-widest uppercase">
                        Category
                    </p>

                    <h2 className="text-4xl font-bold mt-3">
                        Shop By Category
                    </h2>

                    <p className="text-gray-300 mt-4">
                        Explore our gallery to learn more about our amazing products and their features.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[260px]">

                    {categories.map((item) => (
                        <Card
                            key={item.id}
                            className={`relative overflow-hidden border-0 bg-gradient-to-br ${item.bg} p-8 flex flex-col justify-between ${item.colSpan} hover:scale-105`}
                        >
                            <div className="relative z-20">
                                <Badge className={`${item.tagColor} text-white mb-4`}>
                                    {item.tag}
                                </Badge>

                                <p className="text-lg ">{item.subtitle}</p>
                                <h3 className="text-3xl font-bold">{item.title}</h3>

                                <Button
                                    size="sm"
                                    className="mt-4 bg-amber-700 hover:bg-amber-800"
                                >
                                    Browse
                                </Button>
                            </div>

                            <img
                                src={item.img}
                                alt={item.title}
                                className={item.imgClass}
                            />
                        </Card>
                    ))}

                </div>
            </div>
        </section>
    )
}