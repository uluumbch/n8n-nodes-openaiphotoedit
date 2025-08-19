import * as fs from 'fs';
import * as path from 'path';

interface LogData {
    timestamp: string;
    [key: string]: any;
}

export function writeDebugLog(data: Omit<LogData, 'timestamp'>, logFileName: string = 'openai-photo-edit-debug.log'): void {
    const logData: LogData = {
        timestamp: new Date().toISOString(),
        ...data
    };

    const logFile = path.join('/tmp', logFileName);
    fs.appendFileSync(logFile, JSON.stringify(logData, null, 2) + '\n---\n');
    console.log(`Debug log written to: ${logFile}`);
}