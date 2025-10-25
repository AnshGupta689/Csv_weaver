export interface AgeDistribution {
  under20: number;
  between20and40: number;
  between40and60: number;
  over60: number;
}

export interface TransformedUser {
  id: number;
  name: {
    firstName: string;
    lastName: string;
  };
  age: number;
  address: Record<string, any> | null;
  additional_info: Record<string, any>;
}