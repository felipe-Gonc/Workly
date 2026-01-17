import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { applyService, chosseProvider, createService, getAllService, getService, getServiceApplicants, rateService } from "../controllers/service.controller.js";

const router = express.Router()

router.get("/", getAllService)
router.get("/:id", getService)
router.post("/:id/apply", protectRoute, applyService)
router.post("/create", protectRoute, createService)
router.get("/:id/applicants", protectRoute, getServiceApplicants)
router.post("/:id/chosse", protectRoute, chosseProvider)
router.post("/:id/rate", protectRoute, rateService)

export default router;