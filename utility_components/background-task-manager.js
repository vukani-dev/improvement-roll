import { NativeModules, Platform } from 'react-native';

const { AppFeatures } = NativeModules;

/**
 * Background Task Manager
 */
class BackgroundTaskManager {
  /**
   * Check if module is available (Android only)
   */
  isAvailable() {
    return Platform.OS === 'android' && AppFeatures !== undefined;
  }
  
  /**
   * Schedule random roll notifications with advanced settings
   * @param {string} categoryName Category to roll from
   * @param {number} frequencyHours Hours between checks
   * @param {number} probability Probability of showing (0-1)
   * @param {number} activeHoursStart Start hour (0-23)
   * @param {number} activeHoursEnd End hour (0-23)
   * @returns {Promise<boolean>}
   */
  async scheduleRandomNotifications(
    categoryName = 'General',
    frequencyHours = 6,
    probability = 0.5,
    activeHoursStart = 9,
    activeHoursEnd = 22
  ) {
    if (this.isAvailable()) {
      try {
        return await AppFeatures.scheduleRandomNotifications(
          categoryName,
          frequencyHours,
          probability,
          activeHoursStart,
          activeHoursEnd
        );
      } catch (e) {
        console.error('Failed to schedule notifications', e);
        return false;
      }
    }
    console.warn('Background task scheduling not available on this platform.');
    return false;
  }
  
  /**
   * Cancel random roll notifications
   * @returns {Promise<boolean>}
   */
  async cancelRandomNotifications() {
    if (this.isAvailable()) {
      try {
        return await AppFeatures.cancelRandomNotifications();
      } catch (e) {
        console.error('Failed to cancel notifications', e);
        return false;
      }
    }
    console.warn('Background task scheduling not available on this platform.');
    return false;
  }
}

export default new BackgroundTaskManager(); 