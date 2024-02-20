import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserSchema from "../models/User.js";
import CommentSchema from "../models/Comment.js";
import Favorites from "../models/Favorite.js";


export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
  
    const doc = new UserSchema({
      email: req.body.email,
      username: req.body.username,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    });
  
    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id
      },
      "secret123",
      {
        expiresIn: "30d" 
      }
    );

    const {passwordHash, ...userData} = user._doc;
  
    res.json(
      {
        ...userData,
        token
      }
    );
  }

  catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось зарегистрироваться"
    });
  }
};

export const login = async (req, res) => {
  try {
    const user = await UserSchema.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      })
    }

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

    if (!isValidPass) {
      return res.status(400).json({
        message: "Неверный логин или пароль",
      })
    } 

    const token = jwt.sign(
      {
        _id: user._id,
      }, 
      "secret123",
      {
        expiresIn: "30d",
      }
    );

    const {passwordHash, ...userData} = user._doc;
  
    res.json(
      {
        ...userData,
        token
      }
    );
  }
  catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось авторизоваться"
    })
  }
};

export const getMe = async (req, res) => {
  try {

    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Пользователь не аутентифицирован' });
    }
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Пользователь не аутентифицирован' });
    }

    const userId = req.session.userId;

    const user = await UserSchema.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};
export const getAllComments = async(req, res) => {
  try {
      const comments = await CommentSchema.find();
      res.json(comments);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
}

export const addComment = async (req, res) => {
  const { text } = req.body;

    if (!text) {
        return res.status(400).json({ message: "Текст комментария не был предоставлен." });
    }

    try {
        const newComment = new CommentSchema({ text });
        const savedComment = await newComment.save();
        res.status(201).json(savedComment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    
    }


export const deleteComment = async (req, res) =>{
  try {
    console.log('Удаление комментария с id:', req.params.id);
    const deletedComment = await CommentSchema.findOneAndDelete({ _id: req.params.id });
    console.log('Удаленный комментарий:', deletedComment);
    if (!deletedComment) {
        return res.status(404).json({ message: 'Комментарий не найден' });
    }
    res.json({ message: 'Комментарий успешно удален' });
} catch (err) {
    console.error('Ошибка при удалении комментария:', err);
    res.status(500).json({ message: err.message });
}
}

export const getUserFavorites = async(req, res) =>{
  const { userId } = req.params; // Предполагается, что userId передается в URL
  try {
    const userFavorites = await Favorites.find({ userId });
    res.json(userFavorites);
  } catch (error) {
    console.error('Ошибка при получении списка избранных тайтлов:', error);
    res.status(500).json({ error: 'Ошибка при получении списка избранных тайтлов' });
  }
}

// Обработчик для добавления тайтла в список избранных
export const addToFavorites = async(req, res) =>{
  const { userId, animeId } = req.params; // Предполагается, что userId и animeId передаются в URL
  try {
  
    const favorite = new Favorites({ userId : userId, animeId:animeId});
    await favorite.save();
    res.json({ message: 'Тайтл успешно добавлен в избранное' });
  } catch (error) {
    console.error('Ошибка при добавлении тайтла в избранное:', error);
    res.status(500).json({ error: 'Ошибка при добавлении тайтла в избранное' });
  }
}
// Обработчик для удаления тайтла из списка избранных
export const removeFromFavorites = async(req, res) =>{
  const { userId, animeId } = req.params; // Предполагается, что userId и animeId передаются в URL
  try {
    await Favorites.deleteOne({userId, animeId });
    res.json({ message: 'Тайтл успешно удален из избранного' });
  } catch (error) {
    console.error('Ошибка при удалении тайтла из избранного:', error);
    res.status(500).json({ error: 'Ошибка при удалении тайтла из избранного' });
  }
}







