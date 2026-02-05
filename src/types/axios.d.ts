import "axios";

declare module "axios" {
    export interface AxiosRequestConfig {
        meta?: {
            ignore403?: boolean;
            silent?: boolean;
        };
    }
}
