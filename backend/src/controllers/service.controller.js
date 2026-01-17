import mongoose from "mongoose";
import Service from "../models/services.model.js";
import User from "../models/user.model.js";

export const createService = async (req, res) => {
  const { title, description, typeProvider } = req.body;

  try {
    if (!title || !description || !typeProvider) {
      return res.status(400).json({ message: "Preencha todos os campos" });
    }

    const service = await Service.create({
      contractorId: req.user._id,
      title,
      description,
      typeProvider,
      status: "open",
    });

    res.status(201).json(service);
  } catch (error) {
    console.log("Erro ao criar serviço", error.message);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const getAllService = async (req, res) => {
  const filter = { status: "open" };

  try {
    const services = await Service.find(filter)
      .populate("contractorId", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json(services);
  } catch (error) {
    console.log("Erro ao listar serviços abertos", error.message);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const getService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID invalido" });
    }

    const service = await Service.findById(id).populate(
      "contractorId",
      "fullName email",
    );

    if (!service) {
      return res.status(404).json({ message: "service não encontrado" });
    }

    res.status(200).json(service);
  } catch (error) {
    console.log("Erro ao listar serviço", error.message);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const applyService = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, message } = req.body;

    if (!price || price < 0) {
      return res.status(400).json({ message: "coloque um valor valido" });
    }

    {
      /* pega o serviço */
    }
    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ message: "serviço não encontrado" });
    }

    if (service.status !== "open") {
      return res
        .status(400)
        .json({ message: "Serviço não está aberto para candidatura" });
    }

    if (service.contractorId.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: "não pode se candidatar" });
    }

    {
      /* não deixa se candidatar mais de uma vez */
    }
    const aplied = service.applicants.some(
      (app) => app.providerId.toString() === req.user._id.toString(),
    );

    if (aplied) {
      return res.status(400).json({ message: "Vc já se candidatou" });
    }

    {
      /* candidata na vaga */
    }
    service.applicants.push({
      providerId: req.user._id,
      price,
      message,
    });

    await service.save();

    res.status(200).json({ message: "Candidatura realizada com sucesso" });
  } catch (error) {
    console.log("Erro ao se candidatar", error.message);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const getServiceApplicants = async (req, res) => {
  try {
    const { id } = req.params;

    {
      /* valida o ID */
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    {
      /* pega o serviço */
    }
    const service = await Service.findById(id);

    if (!service) {
      return res.status(400).json({ message: "Service não encontrado" });
    }
    {
      /* somente o contratante pode ver */
    }
    if (service.contractorId !== req.user._id.toString()) {
      return res.status(400).json({ message: "Acesso negado" });
    }

    res.status(200).json(service.applicants);
  } catch (error) {
    console.log("Erro ao buscar candidatos", error.message);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const chosseProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const { providerId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(providerId)
    ) {
      return res.status(400).json({ message: "ID invalido" });
    }

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ message: "Service não encontrado" });
    }

    if (service.contractorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "acesso negado" });
    }

    const applied = service.applicants.some(
      (app) => app.providerId.toString() === req.user._id.toString(),
    );

    if (!applied) {
      return res
        .status(400)
        .json({ message: "não se candidatou a este serviço" });
    }

    service.providerId = providerId;
    service.status = "in_progress";

    await service.save();

    res.status(200).json({ message: "Prestador selecionado com sucesso" });
  } catch (error) {
    console.log("Erro ao escolher prestador", error.message);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const rateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { stars, comment } = req.body;

    if (stars < 1 || stars > 5) {
      return res.status(400).json({ message: "Nota invalida" });
    }

    {
      /* pega o serviço */
    }
    const service = Service.findById(id);

    if (!service) {
      return res.status(400).json({ message: "ID invalido" });
    }

    if (service.status !== "complete") {
      return res
        .status(400)
        .json({ message: "o serviço tem que está completo" });
    }

    if (service.contractorId.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: "acesso negado" });
    }

    {
      /* pega o prestador de serviço */
    }
    const provider = await User.findById(service.providerId);

    if (!provider) {
      return res.status(404).json({ message: "prestador não encontrado" });
    }

    {
      /* avaliação */
    }
    const rated = provider.ratings.some((r) => r.serviceId.toString() === id);

    if (rated) {
      return res.status(400).json({ message: "já avaliado" });
    }

    {
      /* faz a avaliação */
    }
    provider.ratings.push({
      serviceId: id,
      stars,
      comment,
      ratedBy: req.user._id,
    });

    {
      /* soma media */
    }
    const totalStars = provider.ratings.reduce((s, r) => s + r.stars, 0);

    {
      /* pega a media */
    }
    provider.averageRating = totalStars / provider.ratings.length;

    res.status(200).json({ message: "Avaliação registrada com sucesso" });
  } catch (error) {
    console.log("Erro ao avaliar", error.message);
    res.status(500).json({ message: "Erro interno" });
  }
};
