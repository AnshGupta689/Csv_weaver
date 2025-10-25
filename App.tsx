import React, { useState, useCallback, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
type AgeDistribution = {
    name: string;
    percentage: number;
    color: string;
}[];
type TransformedUser = {
    id: number;
    name: { full: string };
    age: number;
    [key: string]: any;
};
const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
    </svg>
);
const EraserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 16h16"/><path d="M16 16l-8-8l-4 4l8 8Z"/><path d="M18.5 7.5l-3.2 3.2"/><path d="M21 12l-1.5 1.5"/><path d="M12 2l-2 2l4 4l2-2l-4-4Z"/>
    </svg>
);
const Header: React.FC = () => (
    <header className="bg-gray-950 p-4 border-b border-teal-500">
        <div className="container mx-auto">
            <h1 className="text-3xl font-extrabold text-teal-400 flex items-center">
                <span className="mr-3">{"</>"}</span> CSV Weaver
            </h1>
            <p className="text-gray-400 mt-1">Weave your CSV data into structured JSON with ease.</p>
        </div>
    </header>
);
const FileUpload: React.FC<{ onFileUpload: (file: File) => void; fileName: string }> = ({ onFileUpload, fileName }) => {
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            onFileUpload(file);
        } else {
            alert('Please drop a single CSV file.');
        }
    }, [onFileUpload]);
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
    };
    return (
        <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-4 border-dashed border-gray-700 hover:border-teal-500 transition-colors p-8 rounded-lg text-center cursor-pointer bg-gray-700/30"
            onClick={() => document.getElementById('fileInput')?.click()}
        >
            <UploadIcon className="w-10 h-10 mx-auto text-teal-400 mb-2" />
            <p className="text-gray-400">
                Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-500 mt-1">CSV file up to 50,000+ records</p>
            {fileName && <p className="text-teal-400 mt-2 font-medium">{fileName}</p>}
            <input type="file" id="fileInput" accept=".csv" onChange={handleFileInput} className="hidden" />
        </div>
    );
};
const JsonDisplay: React.FC<{ jsonData: string }> = ({ jsonData }) => (
    <pre className="flex-grow bg-gray-900 p-4 rounded-md overflow-auto text-xs whitespace-pre-wrap">
        {jsonData || "Transformed JSON will appear here"}
    </pre>
);
const SqlDisplay: React.FC<{ sqlData: string }> = ({ sqlData }) => (
    <pre className="flex-grow bg-gray-900 p-4 rounded-md overflow-auto text-xs whitespace-pre-wrap text-yellow-400">
        {sqlData || "Generated SQL INSERT statements will appear here"}
    </pre>
);
const CHART_COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#8884d8', '#8dd1e1'];
const AgeDistributionChart: React.FC<{ data: AgeDistribution, columnName: string }> = ({ data, columnName }) => {
    const maxPercentage = data.reduce((max, item) => Math.max(max, item.percentage), 0);
    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">{columnName} Range Distribution</h3>
            {data.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No numerical data available for report.</p>
            ) : (
                data.map((item, index) => (
                    <div key={item.name} className="flex items-center space-x-3">
                        <span className="w-1/4 text-sm">{item.name}</span>
                        <div className="flex-grow h-4 rounded-full bg-gray-700 overflow-hidden relative">
                            <div 
                                style={{ 
                                    width: `${(item.percentage / (maxPercentage || 100)) * 100}%`,
                                    backgroundColor: item.color 
                                }} 
                                className="h-full transition-all duration-500"
                            />
                            <span className="absolute right-0 text-gray-900 px-1 text-xs font-semibold leading-none">{item.percentage.toFixed(1)}%</span>
                        </div>
                        <span className="w-1/6 text-right text-sm font-medium" style={{ color: item.color }}>{item.percentage.toFixed(1)}%</span>
                    </div>
                ))
            )}
        </div>
    );
};
async function sendDataToBackend(jsonData: any[]): Promise<{success: boolean, message: string}> {
    const backendUrl = 'http://localhost:5000/api/upload'; 
    try {
        const response = await fetch(backendUrl, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData), 
        });
        const result = await response.json();
        if (response.ok) {
            return { success: true, message: result.message };
        } else {
            throw new Error(`DB Insertion Failed: ${result.error || 'Unknown server error.'}`);
        }
    } catch (error: any) {
        throw new Error(`API Call Failed: ${error.message}`);
    }
}
const setNestedProperty = (obj: any, path: string, value: any): void => {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }
    let finalValue = value;
    if (value && !isNaN(Number(value)) && !/\s/.test(value) && value.trim() !== '') {
        finalValue = Number(value);
    }
    current[keys[keys.length - 1]] = finalValue;
};
const parseCsvToJson = (csvText: string): { data: any[], numericColumns: string[] } => {
    if (!csvText || csvText.trim() === '') {
        return { data: [], numericColumns: [] };
    }
    const lines = csvText.trim().replace(/\r\n/g, '\n').split('\n');
    if (lines.length < 2) {
        throw new Error('CSV must have a header row and at least one data row.');
    }
    const headers = lines[0].split(',').map(h => h.trim());
    const jsonData: any[] = [];
    const numericTest: { [key: string]: number } = {};
    const numericColumns: string[] = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(',').map(v => v.trim());
        if (values.length !== headers.length) {
            throw new Error(`Row ${i + 1} has ${values.length} values, but header has ${headers.length} columns.`);
        }
        const obj = {};
        headers.forEach((header, index) => {
            setNestedProperty(obj, header, values[index]);
            const value = values[index];
            if (value && !isNaN(Number(value)) && !/\s/.test(value) && value.trim() !== '') {
                numericTest[header] = (numericTest[header] || 0) + 1;
            }
        });
        jsonData.push(obj);
    }
    const totalDataRows = jsonData.length;
    headers.forEach(header => {
        if (numericTest[header] / totalDataRows > 0.8) {
            numericColumns.push(header);
        }
    });
    return { data: jsonData, numericColumns };
};
const calculateDynamicAgeDistribution = (users: TransformedUser[], columnName: string): AgeDistribution => {
    const values = users.map(u => u[columnName]).filter(v => typeof v === 'number' && !isNaN(v)) as number[];
    if (values.length === 0) return [];
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal;
    const numBins = Math.min(6, Math.max(4, Math.ceil(range / 15))) || 4;
    const binSize = Math.ceil(range / numBins) || 10;
    const bins: { [key: string]: number } = {};
    const binLabels: string[] = [];
    let currentMin = minVal;
    while (currentMin <= maxVal) {
        let binMax = Math.min(maxVal, currentMin + binSize - 1);
        if (binLabels.length >= 1 && (maxVal - currentMin) < (binSize / 2) && currentMin !== minVal) {
             const lastLabel = binLabels[binLabels.length - 1];
             const [prevMin] = lastLabel.split('-').map(Number);
             binMax = maxVal;
             binLabels[binLabels.length - 1] = `${prevMin}-${binMax}`;
             bins[binLabels[binLabels.length - 1]] = 0;
             binLabels.pop();
             binLabels.push(`${prevMin}-${binMax}`);
             currentMin = maxVal + 1;
             continue;
        }
        const label = `${currentMin}-${binMax}`;
        bins[label] = 0;
        binLabels.push(label);
        currentMin = binMax + 1;
    }
    users.forEach(user => {
        const val = user[columnName];
        if (typeof val !== 'number' || isNaN(val)) return;
        for (let i = 0; i < binLabels.length; i++) {
            const label = binLabels[i];
            const [min, max] = label.split('-').map(Number);
            if (val >= min && val <= max) {
                bins[label]++;
                break;
            }
        }
    });
    const totalUsers = users.length;
    let colorIndex = 0;
    return binLabels.map(label => ({
        name: label,
        percentage: (bins[label] / totalUsers) * 100,
        color: CHART_COLORS[colorIndex++ % CHART_COLORS.length],
    }));
};
const transformDataForDb = (parsedData: any[]): TransformedUser[] => {
    return parsedData.map((record, index) => {
        const recordCopy = JSON.parse(JSON.stringify(record));
        const transformed: any = { id: index + 1 };
        const nameKeys = ['name.full', 'name', 'full_name', 'fullName'];
        let fullName = '';
        for (const key of nameKeys) {
            const val = recordCopy[key] || recordCopy[key.split('.').pop() || ''];
            if (val && typeof val === 'string') {
                fullName = val;
                delete recordCopy[key];
                break;
            }
        }
        transformed.name = { full: fullName || `Record ${index + 1}` };
        transformed.address = recordCopy.address || {};
        delete recordCopy.address;
        const additionalInfo: any = {};
        Object.keys(recordCopy).forEach(key => {
            if (typeof recordCopy[key] === 'number') {
                transformed[key] = recordCopy[key];
            }
            additionalInfo[key] = recordCopy[key];
        });
        transformed.additional_info = additionalInfo;
        transformed.age = transformed.age || transformed['age'] || 0;
        return transformed as TransformedUser;
    });
};
const generateSqlInserts = (users: TransformedUser[]): string => {
    if (users.length === 0) return '';
    const escapeSql = (str: string) => str.replace(/'/g, "''");
    const statements = users.map(user => {
        const name = escapeSql(user.name.full);
        const age = user.age;
        const address = user.address ? `'${escapeSql(JSON.stringify(user.address))}'` : 'NULL';
        const additionalInfoObj = { ...user };
        delete additionalInfoObj.id;
        delete additionalInfoObj.name;
        delete additionalInfoObj.age;
        delete additionalInfoObj.address;
        const additionalInfo = Object.keys(additionalInfoObj).length > 0 
          ? `'${escapeSql(JSON.stringify(additionalInfoObj))}'` 
          : 'NULL';
        return `INSERT INTO public.users (name, age, address, additional_info) VALUES ('${name}', ${age}, ${address}, ${additionalInfo});`;
    });
    return statements.join('\n');
};
export const processCsvData = async (csvText: string, reportColumnName: string) => { 
    const { data: parsedJson, numericColumns } = parseCsvToJson(csvText);
    if (parsedJson.length === 0) {
        throw new Error('CSV file contains no data rows.');
    }
    const transformedUsers = transformDataForDb(parsedJson);
    const ageDistribution = calculateDynamicAgeDistribution(transformedUsers, reportColumnName);
    const sqlInserts = generateSqlInserts(transformedUsers);
    const apiResponse = await sendDataToBackend(transformedUsers);
    return {
        transformedUsers,
        ageDistribution,
        sqlInserts,
        recordsProcessed: transformedUsers.length,
        apiSuccess: apiResponse.success, 
        apiMessage: apiResponse.message,
        numericColumns,
    };
};
const App: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [ageDistribution, setAgeDistribution] = useState<AgeDistribution | null>(null);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [jsonOutput, setJsonOutput] = useState<string>('');
    const [sqlOutput, setSqlOutput] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'json' | 'sql'>('json');
    const [reportColumn, setReportColumn] = useState<string>('age'); 
    const [availableColumns, setAvailableColumns] = useState<string[]>([]);
    const isProcessing = isLoading || !selectedFile;
    const handleFileUpload = (file: File) => {
        setSelectedFile(file);
        setFileName(file.name);
        handleClear();
        setFileName(file.name);
    };
    const handleClear = () => {
        setAgeDistribution(null);
        setError('');
        setJsonOutput('');
        setSqlOutput('');
        setAvailableColumns([]);
        setReportColumn('age');
    };
    const handleFullClear = () => {
        setSelectedFile(null);
        setFileName('');
        handleClear();
    };
    const processData = useCallback(async () => {
        if (!selectedFile) {
            setError('Please select a CSV file first.');
            return;
        }
        setIsLoading(true);
        setError('');
        setJsonOutput('');
        setSqlOutput('');
        setAgeDistribution(null);
        setActiveTab('json');
        setAvailableColumns([]);
        setReportColumn('age');
        try {
            const csvText = await selectedFile.text();
            const { data: initialParsedData, numericColumns } = parseCsvToJson(csvText);
            if (numericColumns.length === 0) {
                 throw new Error("No numeric columns found in CSV for reporting.");
            }
            const defaultReportCol = numericColumns.includes('age') ? 'age' : numericColumns[0];
            setAvailableColumns(numericColumns);
            setReportColumn(defaultReportCol);
            const results = await processCsvData(csvText, defaultReportCol); 
            setJsonOutput(JSON.stringify(results.transformedUsers, null, 2));
            setSqlOutput(results.sqlInserts);
            setAgeDistribution(results.ageDistribution);
            alert(`✅ Success: Inserted ${results.recordsProcessed} records and generated reports!`); 
        } catch (e: any) {
            const errorMessage = e.message || "An unknown processing error occurred.";
            setError(`Failed to process: ${errorMessage}`);
            console.error("Full Processing Error:", e);
        } finally {
            setIsLoading(false);
        }
    }, [selectedFile]); 
    const regenerateReport = useCallback(async (columnName: string) => {
        if (!selectedFile || !columnName) return;
        setIsLoading(true);
        setAgeDistribution(null);
        try {
            const csvText = await selectedFile.text();
            const { data: parsedJson } = parseCsvToJson(csvText);
            const transformedUsers = transformDataForDb(parsedJson);
            const dynamicReport = calculateDynamicAgeDistribution(transformedUsers, columnName);
            setAgeDistribution(dynamicReport);
        } catch (e: any) {
            setError(`Failed to generate report for ${columnName}: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [selectedFile]);
    React.useEffect(() => {
        if (reportColumn && ageDistribution && !isLoading) {
             regenerateReport(reportColumn);
        }
    }, [reportColumn, selectedFile]);
    const currentReportName = useMemo(() => {
        return reportColumn.split('.').pop() || 'Value';
    }, [reportColumn]);
    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col space-y-6 h-full">
                        <h2 className="text-2xl font-bold text-teal-400 border-b-2 border-gray-700 pb-2">1. Upload & Process CSV</h2>
                        <FileUpload onFileUpload={handleFileUpload} fileName={fileName} />
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                            <button
                                onClick={processData}
                                disabled={isProcessing || !selectedFile}
                                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-teal-400 hover:bg-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <UploadIcon className="w-5 h-5 mr-2" />
                                        Generate Outputs
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleFullClear}
                                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                            >
                                <EraserIcon className="w-5 h-5 mr-2" /> 
                                Clear All
                            </button>
                        </div>
                        {error && <div className="bg-red-900 border border-red-500 text-red-300 px-4 py-3 rounded-md text-sm">{error}</div>}
                        {ageDistribution && availableColumns.length > 0 && (
                            <div className="space-y-4 pt-4">
                                <h2 className="text-2xl font-bold text-teal-400 border-b-2 border-gray-700 pb-2">2. {currentReportName} Distribution Report</h2>
                                <div className="flex items-center space-x-3">
                                    <label htmlFor="report-column" className="text-gray-400 text-sm">Analyze Column:</label>
                                    <select 
                                        id="report-column"
                                        value={reportColumn}
                                        onChange={(e) => setReportColumn(e.target.value)}
                                        className="bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-md p-2 focus:ring-teal-500 focus:border-teal-500"
                                        disabled={isLoading}
                                    >
                                        {availableColumns.map(col => (
                                            <option key={col} value={col}>{col}</option>
                                        ))}
                                    </select>
                                </div>
                                <p className="text-sm text-gray-400">This report analyzes the distribution of the selected column.</p>
                                <AgeDistributionChart data={ageDistribution} columnName={currentReportName} />
                            </div>
                        )}
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col">
                        <div className="flex justify-between items-center border-b-2 border-gray-700 pb-2 mb-4">
                            <h2 className="text-2xl font-bold text-teal-400">3. Generated Outputs</h2>
                            <div className="flex space-x-1 bg-gray-900 p-1 rounded-md">
                                <button 
                                    onClick={() => setActiveTab('json')}
                                    className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${activeTab === 'json' ? 'bg-teal-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                                >
                                    JSON
                                </button>
                                <button 
                                    onClick={() => setActiveTab('sql')}
                                    className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${activeTab === 'sql' ? 'bg-teal-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                                    >
                                    SQL
                                </button>
                            </div>
                        </div>
                        <div className="flex-grow flex flex-col">
                            {activeTab === 'json' ? (
                                <JsonDisplay jsonData={jsonOutput} />
                            ) : (
                                <SqlDisplay sqlData={sqlOutput} />
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
export default App;
