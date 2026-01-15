import { generateToken, IsEmail } from "../lib/utils.js";
import User from "../models/user.model.js";

import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { fullName, email, password, serviceProvider } = req.body;

  console.log(req.body)
  
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
      serviceProvider: serviceProvider || false
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

export const login = (req, res) => {
  res.send(login);
};

export const logout = (req, res) => {
  res.send(logout);
};
