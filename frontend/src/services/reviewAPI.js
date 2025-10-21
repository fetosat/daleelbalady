// reviewAPI.js
const API_BASE_URL = '/api';

class ReviewAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/reviews`;
  }

  // Get authorization headers (using cookies, no token needed)
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json'
    };
  }

  // Get reviews for a service, product, or shop
  async getReviews({ serviceId, productId, shopId, page = 1, limit = 10, rating, sortBy = 'createdAt' }) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy
      });

      if (serviceId) params.append('serviceId', serviceId);
      if (productId) params.append('productId', productId);
      if (shopId) params.append('shopId', shopId);
      if (rating) params.append('rating', rating.toString());

      const response = await fetch(`${this.baseURL}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch reviews');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  // Create a new review
  async createReview({ serviceId, productId, shopId, rating, comment }) {
    try {
      const reviewData = { rating };
      if (comment) reviewData.comment = comment;
      if (serviceId) reviewData.serviceId = serviceId;
      if (productId) reviewData.productId = productId;
      if (shopId) reviewData.shopId = shopId;

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        // If unauthorized, throw specific error
        if (response.status === 401) {
          throw new Error('Authentication required to create a review');
        }
        const error = await response.json();
        throw new Error(error.error || 'Failed to create review');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  // Update a review
  async updateReview(reviewId, { rating, comment }) {
    try {
      const updateData = {};
      if (rating !== undefined) updateData.rating = rating;
      if (comment !== undefined) updateData.comment = comment;

      const response = await fetch(`${this.baseURL}/${reviewId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update review');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  // Delete a review
  async deleteReview(reviewId) {
    try {
      const response = await fetch(`${this.baseURL}/${reviewId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include' // Include cookies for authentication
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete review');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  // Get current user's reviews
  async getMyReviews({ page = 1, limit = 10, sortBy = 'createdAt' }) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy
      });

      const response = await fetch(`${this.baseURL}/my-reviews?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include' // Include cookies for authentication
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch your reviews');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  // Note: With cookie-based auth, we can't check client-side.
  // The backend will return 401 if not authenticated.
  // For UI purposes, we'll always return true and let the backend handle auth.
  isAuthenticated() {
    // Always return true - let backend validate via cookies
    // The form will handle 401 responses appropriately
    return true;
  }
}

// Create and export a singleton instance
const reviewAPI = new ReviewAPI();
export default reviewAPI;
