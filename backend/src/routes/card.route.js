const router = require("express").Router();
const { createCard, updateCardStatus, deleteCard } = require("../controllers/card.controller");

router.post("/", createCard);
router.patch("/:id", updateCardStatus); // ONE handler only
router.delete("/:id", deleteCard);

module.exports = router;