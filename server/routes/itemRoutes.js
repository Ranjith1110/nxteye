import express from "express";
import {
    getItems,
    addItem,
    bulkUpload,
    editItem,
    deleteItem,
} from "../controllers/itemController.js";

const router = express.Router();

router.get("/", getItems);
router.post("/", addItem);
router.post("/bulk", bulkUpload);
router.put("/:id", editItem);
router.delete("/:id", deleteItem);

export default router;