export type StoreProductReview = {
    id: string
    title: string
    rating: number
    content: string
    first_name: string
    last_name: string
    product_id: string
    customer_id: string
    status: string
    created_at: string
  }

  export type UpdateProductReviewInput = {
    id: string
    title?: string
    content?: string
    first_name?: string
    last_name?: string
    rating?: number
  }