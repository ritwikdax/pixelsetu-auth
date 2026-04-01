import { Request, Response } from "express";
import { orgService } from "../services/org.service.js";

export default async function checkNamespaceAvailabilityHandler(req: Request, res: Response) {
    const { namespace } = req.body;
    const isAvailable = await orgService.checkNamespaceAvailability(namespace);
    res.status(200).json({ message: "Success", data: { isAvailable } });
}