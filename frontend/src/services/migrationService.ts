// This file is kept for backward compatibility but no longer performs any migration
// All data is now stored directly in the database

/**
 * Empty function that does nothing - kept for backward compatibility
 */
export const checkAndMigrateData = async (): Promise<void> => {
    // Do nothing - all data is now stored in the database
    console.log('Migration service is deprecated - all data is stored directly in the database');
}

/**
 * Empty function that does nothing - kept for backward compatibility
 */
export const migrateLocalTransactions = async (): Promise<boolean> => {
    // Do nothing - all data is now stored in the database
    return true;
} 