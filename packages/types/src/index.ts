export type Role = 'user' | 'admin' | 'vendor' | 'delivery'

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: Role
  createdAt: string
  addresses: Address[]
}

export interface Address {
  id?: string
  label?: string
  address: string
  city: string
  zip?: string
  country?: string
  phone?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  image: string
}

export interface Product {
  id: string
  title: string
  description: string
  price: number
  originalPrice: number
  category: string
  brand: string
  images: string[]
  rating: number
  reviewsCount: number
  stock: number
  isFeatured: boolean
  vendorId: string | null
  createdAt: string
}

export interface CartItem {
  productId: string
  qty: number
  product?: Product
}

export interface Cart {
  items: CartItem[]
  total?: number
  count?: number
}

export interface Wishlist {
  items: string[] // productIds
  products?: Product[]
}

export interface OrderItem {
  productId: string
  title: string
  price: number
  qty: number
  image: string
}

export interface Order {
  id: string
  userId: string
  userName: string
  userEmail: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: Address
  paymentMethod: string
  deliveryManId: string | null
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedProducts {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AuthTokens {
  token: string
  user: User
}
