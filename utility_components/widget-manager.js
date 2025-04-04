import { NativeModules, Platform } from 'react-native';
import { rollFromCategory, rollFromAnyCategory, getCategoryNames } from './roll-helper';

const { AppFeatures } = NativeModules;

/**
 * Widget manager to handle widget functionality
 */
class WidgetManager {
  /**
   * Check if widget module is available (Android only)
   */
  isAvailable() {
    return Platform.OS === 'android' && AppFeatures !== undefined;
  }
  
  /**
   * Update all widgets
   */
  updateWidgets() {
    if (this.isAvailable()) {
      AppFeatures.updateWidgets();
      return true;
    }
    return false;
  }
  
  /**
   * Get all categories for widget configuration
   * @returns {Promise<Array>} Array of category objects
   */
  async getCategories() {
    if (this.isAvailable()) {
      return AppFeatures.getCategories();
    }
    
    // Fallback to JS implementation if native module not available
    const categories = await getCategoryNames();
    return categories.map(name => ({ name, description: '' }));
  }
  
  /**
   * Roll a task from a specific category
   * @param {string} categoryName The category to roll from
   * @returns {Promise<Object>} The rolled task
   */
  async rollFromCategory(categoryName) {
    if (this.isAvailable()) {
      return AppFeatures.rollFromCategory(categoryName);
    }
    
    // Fallback to JS implementation if native module not available
    return rollFromCategory(categoryName);
  }
  
  /**
   * Roll a task from any category
   * @returns {Promise<Object>} The rolled task with category information
   */
  async rollFromAnyCategory() {
    if (this.isAvailable()) {
      return AppFeatures.rollFromAnyCategory();
    }
    
    // Fallback to JS implementation if native module not available
    return rollFromAnyCategory();
  }
}

export default new WidgetManager(); 