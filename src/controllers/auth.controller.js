const bcrypt = require("bcrypt");
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");
const UserStat = require("../models/UserStat");
const { signToken } = require("../utils/jwt");
const { ensureUserProgress } = require("../services/userProgress.service");

async function ping(req, res) {
  res.json({ ok: true, message: "pong 🏓" });
}

async function register(req, res) {
  try {
    const { username, email, password, birthdate, avatar } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Faltan campos"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "Password mínimo 6 caracteres"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({
        ok: false,
        message: "Ese email ya está registrado"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      passwordHash,
      avatar: avatar || "🧙",
      birthdate: birthdate ? new Date(birthdate) : null
    });

    await ensureUserProgress(user._id);

    const token = signToken({
      userId: user._id.toString(),
      email: user.email
    });

    const profile = await UserProfile.findOne({ userId: user._id });
    const stats = await UserStat.find({ userId: user._id }).sort({ statKey: 1 });

    return res.status(201).json({
      ok: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        birthdate: user.birthdate
      },
      profile,
      stats
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Faltan campos"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "Credenciales inválidas"
      });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      return res.status(401).json({
        ok: false,
        message: "Credenciales inválidas"
      });
    }

    await ensureUserProgress(user._id);

    const token = signToken({
      userId: user._id.toString(),
      email: user.email
    });

    const profile = await UserProfile.findOne({ userId: user._id });
    const stats = await UserStat.find({ userId: user._id }).sort({ statKey: 1 });

    return res.json({
      ok: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        birthdate: user.birthdate
      },
      profile,
      stats
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message
    });
  }
}

async function me(req, res) {
  try {
    const userId = req.user.userId;

    await ensureUserProgress(userId);

    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado"
      });
    }

    const profile = await UserProfile.findOne({ userId });
    const stats = await UserStat.find({ userId }).sort({ statKey: 1 });

    return res.json({
      ok: true,
      user,
      profile,
      stats
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message
    });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.userId;
    const { username, birthdate, avatar } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado"
      });
    }

    if (username && username.trim().length >= 2) {
      user.username = username.trim();
    }

    if (typeof avatar === "string" && avatar.trim()) {
      user.avatar = avatar.trim();
    }

    if (birthdate) {
      user.birthdate = new Date(birthdate);
    }

    await user.save();

    return res.json({
      ok: true,
      message: "Perfil actualizado correctamente",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        birthdate: user.birthdate
      }
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message
    });
  }
}

module.exports = {
  ping,
  register,
  login,
  me,
  updateProfile
};