import type { AgeDistribution, TransformedUser } from './types';  

 
async function sendDataToBackend(jsonData: any[]): Promise<{success: boolean, message: string}> {
    const backendUrl = 'http://localhost:5000/api/upload'; 

    try {
        const response = await fetch(backendUrl, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify(jsonData), 
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Success: Data inserted into PostgreSQL!', result.message);
            return { success: true, message: result.message };
        } else {
            
            console.error('❌ Server Insertion Error:', result.error, result.details);
            throw new Error(`DB Insertion Failed: ${result.error || 'Unknown server error.'}`);
        }
    } catch (error: any) {
       
        console.error('❌ Network/Processing Error:', error.message);
        throw new Error(`API Call Failed: ${error.message}`);
    }
}

 
const setNestedProperty = (obj: any, path: string, value: any): void => { /* ... existing logic ... */ };
const parseCsvToJson = (csvText: string): any[] => { /* ... existing logic ... */ return []; };
const transformDataForDb = (parsedData: any[]): TransformedUser[] => { /* ... existing logic ... */ return []; };
const calculateAgeDistribution = (users: TransformedUser[]): AgeDistribution => { /* ... existing logic ... */ return {}; };
const generateSqlInserts = (users: TransformedUser[]): string => { /* ... existing logic ... */ return ''; };


 
export const processCsvData = async (csvText: string) => {  
    const parsedJson = parseCsvToJson(csvText);

    if (parsedJson.length === 0) {
        throw new Error('CSV file contains no data rows.');
    }
    
    const transformedUsers = transformDataForDb(parsedJson);
    const ageDistribution = calculateAgeDistribution(transformedUsers);
    const sqlInserts = generateSqlInserts(transformedUsers);

     
    const apiResponse = await sendDataToBackend(transformedUsers);

    return {
        transformedUsers,  
        ageDistribution,   
        sqlInserts,        
        recordsProcessed: transformedUsers.length,
        apiSuccess: apiResponse.success,
        apiMessage: apiResponse.message
    };
};