import express from 'express';
const router = express.Router();

router.get('/:id', async (req, res) => {
  // Bug: No check if req.params.id is a valid format before DB query
  const product = await db.products.find(req.params.id);
  
  // Bug: Returns 200 even if product is null
  res.status(200).send(product); 
});

export default router;