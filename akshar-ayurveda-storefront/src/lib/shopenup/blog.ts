import { sdk } from '@lib/config';

export interface BlogArticle {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  author_expert_title?: string;
  url_slug: string;
  seo_title?: string;
  seo_description?: string;
  thumbnail_image?: string;
  tags: string[];
  body: {
    type: string;
    content: Array<{
      type: string;
      attrs?: {
        level?: number;
      };
      content?: Array<{
        type: string;
        text: string;
      }>;
    }>;
  };
  draft: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface BlogArticleListResponse {
  articles: BlogArticle[];
  count: number;
  offset: number;
  limit: number;
}

export interface BlogSearchParams {
  q?: string;
  author?: string;
  tags?: string[];
  draft?: boolean;
  sortBy?: 'created_at' | 'updated_at' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface BlogFilter {
  author?: string;
  tags?: string[];
  draft?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
  search?: string;
}

export class ShopenupBlogService {
  constructor() {
    // Initialize any required modules if needed
  }

  // Helper method to convert absolute URLs to relative URLs and provide fallback
  private convertToRelativeUrl(url?: string): string {
    // If no URL provided, use placeholder
    if (!url) return '/assets/homeimage1.jpg';
    
    // If it's already a relative URL, return as-is
    // if (url.startsWith('/')) return url;
    
    // If it's an absolute URL with localhost:9000, convert to relative
    // if (url.includes('localhost:9000/static/')) {
    //   return url;
    // }
    
    // For other absolute URLs, return as-is (external images)
    return url;
  }

  // Get all blog articles with optional filtering
  async getArticles(params?: BlogSearchParams): Promise<BlogArticle[]> {
    try {
      const query: any = {
        ...(params?.q && { q: params.q }),
        ...(params?.author && { author: params.author }),
        ...(params?.tags && { tags: params.tags.join(',') }),
        ...(params?.draft !== undefined && { draft: params.draft }),
      };

      const response = await sdk.client.fetch<BlogArticle[]>(
        '/store/blog/articles',
        {
          query,
          next: { tags: ['blog-articles'] },
        }
      );
      
      // Handle pagination on the client side if needed
      let articles = response || [];
      
      if (params?.limit) {
        const offset = params?.offset || 0;
        articles = articles.slice(offset, offset + params.limit);
      }
      
      // Convert absolute URLs to relative URLs for proper proxying
      return articles.map(article => ({
        ...article,
        thumbnail_image: this.convertToRelativeUrl(article.thumbnail_image)
      }));
    } catch (error) {
      console.error('Failed to get blog articles:', error);
      throw error;
    }
  }

  // Get blog article by ID
  async getArticle(articleId: string): Promise<BlogArticle | null> {
    try {
      const response = await sdk.client.fetch<BlogArticle>(
        `/store/blog/articles/${articleId}`,
        {
          next: { tags: ['blog-articles'] },
        }
      );
      
      if (!response) return null;
      
      // Convert absolute URLs to relative URLs for proper proxying
      return {
        ...response,
        thumbnail_image: this.convertToRelativeUrl(response.thumbnail_image)
      };
    } catch (error) {
      console.error('Failed to get blog article:', error);
      return null;
    }
  }

  // Get blog article by URL slug
  async getArticleBySlug(slug: string): Promise<BlogArticle | null> {
    try {
      const articles = await this.getArticles({ limit: 1000 }); // Get all articles to find by slug
      return articles.find(article => article.url_slug === slug) || null;
    } catch (error) {
      console.error('Failed to get blog article by slug:', error);
      return null;
    }
  }

  // Search blog articles
  async searchArticles(query: string, params?: BlogSearchParams): Promise<BlogArticle[]> {
    try {
      return this.getArticles({
        ...params,
        q: query
      });
    } catch (error) {
      console.error('Failed to search blog articles:', error);
      throw error;
    }
  }

  // Get articles by author
  async getArticlesByAuthor(author: string, params?: BlogSearchParams): Promise<BlogArticle[]> {
    try {
      return this.getArticles({
        ...params,
        author
      });
    } catch (error) {
      console.error('Failed to get articles by author:', error);
      throw error;
    }
  }

  // Get articles by tags
  async getArticlesByTags(tags: string[], params?: BlogSearchParams): Promise<BlogArticle[]> {
    try {
      return this.getArticles({
        ...params,
        tags
      });
    } catch (error) {
      console.error('Failed to get articles by tags:', error);
      throw error;
    }
  }

  // Get published articles only
  async getPublishedArticles(params?: BlogSearchParams): Promise<BlogArticle[]> {
    try {
      return this.getArticles({
        ...params,
        draft: false
      });
    } catch (error) {
      console.error('Failed to get published articles:', error);
      throw error;
    }
  }

  // Get latest articles
  async getLatestArticles(limit: number = 10): Promise<BlogArticle[]> {
    try {
      return this.getPublishedArticles({
        sortBy: 'created_at',
        sortOrder: 'desc',
        limit
      });
    } catch (error) {
      console.error('Failed to get latest articles:', error);
      throw error;
    }
  }

  // Get featured articles (you can implement this based on your criteria)
  async getFeaturedArticles(limit: number = 5): Promise<BlogArticle[]> {
    try {
      const articles = await this.getPublishedArticles({ limit: 50 });
      // You can implement your own logic for featured articles
      // For now, we'll return the most recent ones
      return articles
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get featured articles:', error);
      throw error;
    }
  }

  // Get articles by date range
  async getArticlesByDateRange(
    from: string, 
    to: string, 
    params?: BlogSearchParams
  ): Promise<BlogArticle[]> {
    try {
      const articles = await this.getPublishedArticles(params);
      const fromDate = new Date(from);
      const toDate = new Date(to);
      
      return articles.filter(article => {
        const articleDate = new Date(article.created_at);
        return articleDate >= fromDate && articleDate <= toDate;
      });
    } catch (error) {
      console.error('Failed to get articles by date range:', error);
      throw error;
    }
  }

  // Get all unique authors
  async getAuthors(): Promise<string[]> {
    try {
      const articles = await this.getPublishedArticles();
      const authors = Array.from(new Set(articles.map(article => article.author)));
      return authors.sort();
    } catch (error) {
      console.error('Failed to get authors:', error);
      throw error;
    }
  }

  // Get all unique tags
  async getTags(): Promise<string[]> {
    try {
      const articles = await this.getPublishedArticles();
      const tags = Array.from(new Set(articles.flatMap(article => article.tags || [])));
      return tags.sort();
    } catch (error) {
      console.error('Failed to get tags:', error);
      throw error;
    }
  }

  // Get related articles based on tags
  async getRelatedArticles(articleId: string, limit: number = 4): Promise<BlogArticle[]> {
    try {
      const currentArticle = await this.getArticle(articleId);
      if (!currentArticle || !currentArticle.tags || currentArticle.tags.length === 0) {
        return [];
      }

      const relatedArticles = await this.getPublishedArticles();
      
      // Filter out the current article and find articles with matching tags
      const related = relatedArticles
        .filter(article => article.id !== articleId)
        .filter(article => 
          article.tags && 
          article.tags.some(tag => currentArticle.tags.includes(tag))
        )
        .slice(0, limit);

      return related;
    } catch (error) {
      console.error('Failed to get related articles:', error);
      throw error;
    }
  }

  // Get articles with pagination
  async getArticlesPaginated(
    page: number = 1, 
    limit: number = 10, 
    params?: BlogSearchParams
  ): Promise<{
    articles: BlogArticle[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    try {
      // Get all articles first
      const allArticles = await this.getPublishedArticles(params);
      const totalItems = allArticles.length;
      const totalPages = Math.ceil(totalItems / limit);
      
      // Apply pagination
      const offset = (page - 1) * limit;
      const articles = allArticles.slice(offset, offset + limit);

      return {
        articles,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error('Failed to get paginated articles:', error);
      throw error;
    }
  }

  // Get articles by category (if you implement categories)
  async getArticlesByCategory(category: string, params?: BlogSearchParams): Promise<BlogArticle[]> {
    try {
      // This would depend on how you implement categories in your blog system
      // For now, we'll search in tags
      return this.getArticlesByTags([category], params);
    } catch (error) {
      console.error('Failed to get articles by category:', error);
      throw error;
    }
  }

  // Get article statistics
  async getArticleStats(): Promise<{
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    totalAuthors: number;
    totalTags: number;
  }> {
    try {
      const allArticles = await this.getArticles();
      const publishedArticles = allArticles.filter(article => !article.draft);
      const authors = Array.from(new Set(allArticles.map(article => article.author)));
      const tags = Array.from(new Set(allArticles.flatMap(article => article.tags || [])));

      return {
        totalArticles: allArticles.length,
        publishedArticles: publishedArticles.length,
        draftArticles: allArticles.length - publishedArticles.length,
        totalAuthors: authors.length,
        totalTags: tags.length,
      };
    } catch (error) {
      console.error('Failed to get article statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const blogService = new ShopenupBlogService();
