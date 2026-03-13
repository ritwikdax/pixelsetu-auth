import { ZodSchema } from "zod";

export function validateSchema<T>(schema: ZodSchema<T>) {
    return (req: any, res: any, next: any) => {
        try {
            schema.parse(req.body);
            next();
        } catch (err: any) {
            return res.status(400).json({ error: err.errors });
        }
    };

}