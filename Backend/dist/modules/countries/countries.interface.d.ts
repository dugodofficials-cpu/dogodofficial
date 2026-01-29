export interface Country {
    _id: string;
    name: string;
    code: string;
    phoneCode: string;
    currency: string;
    region: string[];
    isActive: boolean;
}
