import express from "express";
import { createServiceRequest } from "../controller/serviceRequest.controller.js";

const router = express.Router();

router.post("/", createServiceRequest);

export default router; 