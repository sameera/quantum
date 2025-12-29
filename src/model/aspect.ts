export interface Aspect {
    id: string;
    name: string;
    [key: string]: string | number | Date | object | Aspect | undefined;
}
