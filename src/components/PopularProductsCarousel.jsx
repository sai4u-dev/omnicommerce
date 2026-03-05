"use client"

import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart } from "lucide-react"

const products = [
    {
        type: "product",
        title: "2-piece set with braces",
        price: "$52.00",
        rating: 4.7,
        image: "https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-list/image-30.png",
    },
    {
        type: "product",
        title: "Printed dungaree shorts",
        price: "$26.00",
        rating: 4.2,
        image: "https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-list/image-30.png",
    },
    {
        type: "product",
        title: "Sweatshirt",
        price: "$85.32",
        rating: 4.9,
        image: "https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-list/image-30.png",
    },
    {
        type: "product",
        title: "Rib-knit beanie",
        price: "$25.75",
        rating: 3.9,
        image: "https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-list/image-30.png",
    },
    {
        type: "product",
        title: "Two layer Shirt",
        price: "$98.52",
        rating: 4.8,
        image: "https://cdn.shadcnstudio.com/ss-assets/blocks/ecommerce/product-list/image-30.png",
    },
]

export default function PopularProductsCarousel() {
    const [emblaRef] = useEmblaCarousel(
        { loop: true, align: "start" },
        [Autoplay({ delay: 3000, stopOnInteraction: false })]
    )

    return (
        <section className="bg-neutral-800 py-16">
            <div className="container mx-auto">
                <div className="text-left text-white mb-10">
                    <h2 className="text-3xl font-bold">Most Popular Products</h2>
                    <p className="text-neutral-400 mt-2">
                        Transforming your wardrobe with the latest trends
                    </p>
                </div>

                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-6">
                        {products.map((item, index) => (
                            <div
                                key={index}
                                className="flex-[0_0_300px] min-w-0"
                            >
                                {item.type === "promo" ? (
                                    <Card className={`${item.bg} border-0 h-full ml-4`}>
                                        <CardContent className="p-6 flex flex-col justify-between h-[380px]">
                                            <h3 className="text-xl font-bold text-white leading-snug">
                                                {item.title}
                                            </h3>
                                            <Button className="w-fit bg-orange-500 hover:bg-orange-600">
                                                {item.button}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card className="bg-neutral-700 border-0 h-full">
                                        <CardContent className="p-4 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Badge className="bg-yellow-500 text-black">
                                                    ⭐ {item.rating}
                                                </Badge>
                                                <Heart className="w-4 h-4 text-neutral-400" />
                                            </div>

                                            <div className="h-40 bg-neutral-600 rounded-md flex items-center justify-center text-white">
                                                <img src={item.image} className="h-40" alt="" />
                                            </div>

                                            <div>
                                                <p className="text-white font-medium">
                                                    {item.title}
                                                </p>
                                                <p className="text-neutral-300 text-sm">
                                                    {item.price}
                                                </p>
                                            </div>

                                            <Button
                                                size="sm"
                                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                                            >
                                                Add to cart
                                            </Button>
                                            <div class="bg-gray-600 flex flex-col gap-1.5 rounded-md p-4">
                                                <span data-slot="badge" data-variant="default" class="focus-visible:border-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] [&amp;&gt;svg]:pointer-events-none [&amp;&gt;svg]:size-3 bg-primary/10 [a&amp;]:hover:bg-primary/5 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 text-primary border-none focus-visible:outline-none">Outwear</span>
                                                <div class="flex flex-col gap-1">
                                                    <h3 class="font-semibold">Printed dungaree shorts</h3>
                                                    <div class="flex items-center justify-between">
                                                        <span class="text-xl font-semibold">$26.00</span>
                                                        <button data-slot="button" data-variant="default" data-size="default" class="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 px-4 py-2 has-[&gt;svg]:px-3 hover:bg-primary/10 text-primary size-6 bg-transparent"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus size-3.5" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}