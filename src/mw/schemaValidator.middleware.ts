import { ZodSchema } from "zod";
import { HttpError } from "../error/http.error.js";

export function validateSchema<T>(schema: ZodSchema<T>) {
    return (req: any, res: any, next: any) => {
        try {
            schema.parse(req.body);
            next();
        } catch (err: any) {
            throw new HttpError("Schema validation error", 400);
        }
    };

}