import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Gets all categories from storage
 * @returns {Promise<Array>} Categories array
 */
export async function getCategories() {
  try {
    const value = await AsyncStorage.getItem('categories');
    return value != null ? JSON.parse(value) : [];
  } catch (error) {
    console.error('Error reading categories:', error);
    return [];
  }
}

/**
 * Gets a category by name
 * @param {string} categoryName Name of the category to find
 * @returns {Promise<Object|null>} Category object or null if not found
 */
export async function getCategoryByName(categoryName) {
  try {
    const categories = await getCategories();
    return categories.find(cat => cat.name === categoryName) || null;
  } catch (error) {
    console.error('Error finding category:', error);
    return null;
  }
}

/**
 * Rolls a random task from a specific category
 * @param {string} categoryName Name of the category to roll from
 * @returns {Promise<Object|null>} Random task object or null if category not found
 */
export async function rollFromCategory(categoryName) {
  try {
    const category = await getCategoryByName(categoryName);
    if (!category || !category.tasks || !category.tasks.length) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * category.tasks.length);
    return category.tasks[randomIndex];
  } catch (error) {
    console.error('Error rolling from category:', error);
    return null;
  }
}

/**
 * Gets the names of all available categories
 * @returns {Promise<Array<string>>} Array of category names
 */
export async function getCategoryNames() {
  try {
    const categories = await getCategories();
    return categories.map(cat => cat.name);
  } catch (error) {
    console.error('Error getting category names:', error);
    return [];
  }
}

/**
 * Rolls a random task from the first available category
 * @returns {Promise<Object|null>} Random task object or null if no categories
 */
export async function rollFromAnyCategory() {
  try {
    const categories = await getCategories();
    if (!categories.length) return null;
    
    // Default to first category (usually "General")
    const category = categories[0];
    if (!category.tasks || !category.tasks.length) return null;
    
    const randomIndex = Math.floor(Math.random() * category.tasks.length);
    return {
      task: category.tasks[randomIndex],
      categoryName: category.name
    };
  } catch (error) {
    console.error('Error rolling from any category:', error);
    return null;
  }
} 