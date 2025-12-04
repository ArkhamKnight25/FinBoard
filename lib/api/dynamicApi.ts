import axios from 'axios';

export interface ApiTestResult {
  success: boolean;
  data?: any;
  error?: string;
  fields?: string[];
}

export async function testApiEndpoint(url: string): Promise<ApiTestResult> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
    });

    const fields = extractFields(response.data);

    return {
      success: true,
      data: response.data,
      fields,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to connect to API',
    };
  }
}

export function extractFields(data: any, prefix = ''): string[] {
  const fields: string[] = [];

  if (typeof data !== 'object' || data === null) {
    return fields;
  }

  if (Array.isArray(data)) {
    if (data.length > 0) {
      const arrayFields = extractFields(data[0], prefix);
      return arrayFields.map(field => `${prefix}[]${field ? '.' + field : ''}`);
    }
    return [`${prefix}[]`];
  }

  Object.keys(data).forEach(key => {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    const value = data[key];

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      fields.push(fullPath);
      fields.push(...extractFields(value, fullPath));
    } else if (Array.isArray(value)) {
      fields.push(fullPath);
      if (value.length > 0 && typeof value[0] === 'object') {
        fields.push(...extractFields(value[0], `${fullPath}[]`));
      }
    } else {
      fields.push(fullPath);
    }
  });

  return fields;
}

export function getValueByPath(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (part.includes('[]')) {
      const key = part.replace('[]', '');
      if (key) {
        current = current[key];
      }
      if (Array.isArray(current) && current.length > 0) {
        current = current[0];
      }
    } else {
      current = current?.[part];
    }
    
    if (current === undefined) return undefined;
  }

  return current;
}

export function getFieldType(value: any): 'string' | 'number' | 'boolean' | 'array' | 'object' {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'string';
  return typeof value as any;
}

export async function fetchDynamicData(url: string, selectedFields: string[]): Promise<any> {
  try {
    const response = await axios.get(url);
    const data = response.data;

    if (selectedFields.length === 0) {
      return data;
    }

    const result: any = {};
    selectedFields.forEach(field => {
      const value = getValueByPath(data, field);
      if (value !== undefined) {
        result[field] = value;
      }
    });

    return result;
  } catch (error) {
    throw new Error('Failed to fetch data from API');
  }
}
