import FashionGallery from '@/components/Categories'
import ConnectWithUS from '@/components/ConnectWithUs'
import Features from '@/components/FeaturesSection'
import HeroSectionPage from '@/components/Hero'
import PopularProductsCarousel from '@/components/PopularProductsCarousel'
import ProductListPage from '@/components/ProductList'
import React from 'react'

export function Home() {
    return (
        <div className="">
            <HeroSectionPage />
            <FashionGallery />
            <ProductListPage />
            <PopularProductsCarousel />
            <PopularProductsCarousel />
            <PopularProductsCarousel />
            <Features />
            <ConnectWithUS />
        </div>
    )
}
