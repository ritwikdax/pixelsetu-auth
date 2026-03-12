import { Request, Response } from "express";


export function userRegistrationHandler(req: Request, res: Response) {
  // Handle user registration logic here

  
  res.status(200).json({ message: "User registration successful" });
}
