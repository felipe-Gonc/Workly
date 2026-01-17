import { generateToken, IsEmail } from "../lib/utils.js";
import User from "../models/user.model.js";

import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { fullName, email, password, serviceProvider } = req.body;

  try {
    {
      /* validações */
    }
    if (!fullName || !email || !password) {
      return res.status(400).json("todos os campos são obrigatorios");
    }

    if (!IsEmail(email)) {
      return res.status(400).json({ message: "não é um email" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "a senha não tem o minimo de caracteres" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "email já cadastrado" });

    {
      /* senha cryptada */
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      serviceProvider: serviceProvider || false,
    });

    {
      /* token JWT */
    }
    if (newUser) {
      await newUser.save();
      generateToken(newUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
      });
    } else {
      res.status(400).json({ message: "User invalido" });
    }
  } catch (error) {
    console.log("Erro no signup controller", error.message);
    return res(500).json({ message: "Erro interno." });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "email não encontrado" });
    }

    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword) {
      return res.status(400).json({ message: "Senha invalida" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
    });

  } catch (error) {
    console.log("Erro no login controller", error.message);
    return res(500).json({ message: "Erro interno." });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {maxAge: 0})
    res.status(200).json({message: "usuario deslogado"})
  } catch (error) {
    console.log("Erro no logout controller", error.message);
    res.status(500).json({ mesage: "Erro interno no server" });
  }
};