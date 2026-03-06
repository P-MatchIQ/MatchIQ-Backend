import { offerService } from './offers.service.js';
import { validateCreateOffer, validateUpdateOffer, validateCancelOffer,} from './offers.validation.js';

// POST /offers
async function createOffer(req, res) {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      salary,
      modality,
      min_experience_years,
      required_english_level,
      positions_available,
      category_ids,
      skill_ids,
    } = req.body;

    validateCreateOffer({
      title,
      modality,
      category_ids,
      skill_ids,
      description,
      salary,
      min_experience_years,
      required_english_level,
      positions_available,
    });

    const result = await offerService.createOffer(userId, {
      title,
      description,
      salary,
      modality,
      min_experience_years,
      required_english_level,
      positions_available,
      category_ids,
      skill_ids,
    });

    return res.status(201).json(result);

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

// GET /offers
async function getMyOffers(req, res) {
  try {
    const userId = req.user.id;

    const result = await offerService.getMyOffers(userId);

    return res.json(result);

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

// GET /offers/:id
async function getOfferById(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'El id de la oferta es obligatorio' });
    }

    const result = await offerService.getOfferById(userId, id);

    return res.json(result);

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

// PATCH /offers/:id
async function updateOffer(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      title,
      description,
      salary,
      modality,
      min_experience_years,
      required_english_level,
      positions_available,
    } = req.body;

    validateUpdateOffer({
      title,
      description,
      salary,
      modality,
      min_experience_years,
      required_english_level,
      positions_available,
    });

    const result = await offerService.updateOffer(userId, id, {
      title,
      description,
      salary,
      modality,
      min_experience_years,
      required_english_level,
      positions_available,
    });

    return res.json(result);

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

// PATCH /offers/:id/status
async function updateOfferStatus(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    validateCancelOffer({ status });

    const result = await offerService.updateOfferStatus(userId, id, { status });

    // Si hay candidatos en proceso, devolver advertencia con 200 para que el frontend confirme
    if (result.warning) {
      return res.status(200).json(result);
    }

    return res.json(result);

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

// PATCH /offers/:id/force-cancel
async function forceCancel(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await offerService.forceCancel(userId, id);

    return res.json(result);

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export const offerController = {
  createOffer,
  getMyOffers,
  getOfferById,
  updateOffer,
  updateOfferStatus,
  forceCancel,
};