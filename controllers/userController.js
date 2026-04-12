const mongoose = require('mongoose');
const { logInfo, logWarning, logError } = require('../utils/logger');
const User = require('../models/User');
const Excursion = require('../models/Excursion'); // Needed for subscribe/unsubscribe operations
const Picture = require('../models/Picture');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Find a user by normalized phone digits.
 */
async function findUserByLoginIdentifier(raw) {
  const trimmed = (raw || '').trim();
  if (!trimmed) return null;
  const normalizedPhone = trimmed.replace(/\D/g, '');
  if (!normalizedPhone) return null;
  return User.findOne({ phone: normalizedPhone });
}

/**
 * Get all users
 */
exports.getAllUsers = async (req, res) => {
  try {
    await logInfo('[getAllUsers] start');
    const users = await User.find();
    await logInfo('[getAllUsers] ok', { count: users.length });
    res.status(200).json(users);
  } catch (err) {
    await logError('Error fetching users', { tag: '[getAllUsers]', message: err?.message, stack: err?.stack, name: err?.name });
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
};

/**
 * Get user by ID
 */
exports.getUserById = async (req, res) => {
  try {
    await logInfo('[getUserById] start', { id: req.params.id });
    const user = await User.findById(req.params.id);
    if (!user) {
      await logWarning(`User not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    await logInfo(`User fetched by ID: ${req.params.id}`);
    res.status(200).json(user);
  } catch (err) {
    await logError('Error fetching user by ID', { tag: '[getUserById]', message: err?.message, stack: err?.stack, name: err?.name });
    res.status(500).json({ message: 'Erro ao buscar usuário.' });
  }
};

/**
 * Resolve user by phone (normalized digits) for admin flows — returns id without password.
 */
exports.getUserByPhone = async (req, res) => {
  const raw = String(req.query.phone || '').trim();
  if (!raw) {
    return res.status(422).json({ message: 'O parâmetro phone é obrigatório.' });
  }

  try {
    await logInfo('[getUserByPhone] start', { phoneParamLength: raw.length });
    const user = await findUserByLoginIdentifier(raw);
    if (!user) {
      await logWarning('GetUserByPhone: no matching user');
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    await logInfo(`GetUserByPhone: resolved user ${user._id}`);
    res.status(200).json({
      id: user._id,
      name: user.name,
      phone: user.phone,
      type: user.type,
      picture: user.picture
    });
  } catch (err) {
    await logError('Error fetching user by phone', { tag: '[getUserByPhone]', message: err?.message, stack: err?.stack, name: err?.name });
    res.status(500).json({ message: 'Erro ao buscar usuário.' });
  }
};

/**
 * Create a new user account.
 *
 * This endpoint registers a new user in the system. It expects the following fields in the request body:
 * - name: The user's full name (required)
 * - password: The user's password (required, will be securely hashed)
 * - phone: Mobile/phone number, digits only or formatted (required, must be unique)
 * - birthDate: Date of birth (required)
 * - cpf: CPF digits (required, must be unique)
 *
 * Workflow:
 * 1. Validates that all required fields are present.
 * 2. Checks if the provided phone or CPF is already registered.
 * 3. Hashes the password using bcrypt for security.
 * 4. Creates and saves the new user in the database.
 * 5. Logs the creation event and returns a success message.
 *
 * Responses:
 * - 201: User created successfully.
 * - 422: Missing required fields, phone already registered, or CPF already registered.
 * - 500: Server error during user creation.
 *
 * Example request body:
 * {
 *   "name": "João Silva",
 *   "password": "minhasenha123",
 *   "phone": "11999999999",
 *   "birthDate": "1990-01-01",
 *   "cpf": "12345678901"
 * }
 */
exports.createUser = async (req, res) => {
  const { name, password, phone, birthDate, cpf } = req.body;
  // Basic validation
  if (!name || !password || !phone || !birthDate || !cpf) {
    return res.status(422).json({ message: 'Todos os campos são obrigatórios.' });
  }

  // Normalization (Defense in depth)
  const normalizedCpf = cpf.replace(/\D/g, '');
  const normalizedPhone = phone.replace(/\D/g, '');

  if (normalizedCpf.length !== 11) {
    return res.status(422).json({ message: 'CPF deve conter 11 dígitos.' });
  }

  if (normalizedPhone.length < 10 || normalizedPhone.length > 11) {
    return res.status(422).json({ message: 'Telefone deve ter 10 ou 11 dígitos.' });
  }

  try {
    await logInfo('[CreateUser] enter', { phoneDigits: normalizedPhone.length, cpfDigits: normalizedCpf.length });

    await logInfo('[CreateUser] phone duplicate check');
    const phoneExists = await User.findOne({ phone: normalizedPhone });
    await logInfo('[CreateUser] phone duplicate check done', { exists: !!phoneExists });
    if (phoneExists) {
      await logWarning(`Attempt to create user with existing phone: ${normalizedPhone}`);
      return res.status(422).json({ message: 'Telefone já cadastrado!' });
    }

    await logInfo('[CreateUser] CPF duplicate check');
    const cpfExists = await User.findOne({ cpf: normalizedCpf });
    await logInfo('[CreateUser] CPF duplicate check done', { exists: !!cpfExists });
    if (cpfExists) {
      await logWarning(`Attempt to create user with existing CPF: ${normalizedCpf}`);
      return res.status(422).json({ message: 'CPF já cadastrado!' });
    }

    await logInfo('[CreateUser] bcrypt start');
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    await logInfo('[CreateUser] bcrypt done');

    await logInfo('[CreateUser] build User', { birthDateRaw: birthDate });
    const user = new User({
      name,
      password: passwordHash,
      phone: normalizedPhone,
      birthDate: new Date(birthDate),
      cpf: normalizedCpf,
      type: 'user'
    });
    await logInfo('[CreateUser] user.save()');
    await user.save();
    await logInfo('[CreateUser] user.save ok', { userId: user._id?.toString() });

    await logInfo(`User created with phone: ${normalizedPhone} and CPF: ${normalizedCpf}`);
    res.status(201).json({ message: 'Usuário criado com sucesso! Redirecionando para a página de login.' });
  } catch (err) {
    await logError('Error creating user', { tag: '[CreateUser]', message: err?.message, stack: err?.stack, name: err?.name });
    res.status(500).json({ message: 'Erro ao criar usuário.' });
  }
};

/**
 * Delete user by ID
 */
exports.deleteUserById = async (req, res) => {
  try {
    await logInfo('[deleteUserById] start', { id: req.params.id });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      await logWarning(`Attempt to delete non-existent user with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    await logInfo(`User deleted with ID: ${req.params.id}`);
    res.status(204).send();
  } catch (err) {
    await logError('Error deleting user', { tag: '[deleteUserById]', message: err?.message, stack: err?.stack, name: err?.name });
    res.status(500).json({ message: 'Erro ao deletar usuário.' });
  }
};

/**
 * Authenticate and log in a user.
 *
 * This endpoint allows a registered user to log in by verifying their credentials.
 * It expects the following fields in the request body:
 * - phone: The user's registered phone number (required)
 * - password: The user's password (required)
 *
 * Workflow:
 * 1. Validates that both phone and password are provided.
 * 2. Searches for a user with the given phone (normalized digits).
 * 3. If the user exists, compares the provided password with the stored hashed password using bcrypt.
 * 4. If authentication is successful, generates a JWT token for session management.
 * 5. Logs the login event and returns user details and the token.
 *
 * Responses:
 * - 200: Login successful. Returns JWT token and user info.
 * - 401: Invalid phone or password.
 * - 422: Missing required fields.
 * - 500: Server error during login.
 *
 * Example request body:
 * {
 *   "phone": "11999999999",
 *   "password": "minhasenha123"
 * }
 *
 * Example successful response:
 * {
 *   "message": "Autenticado com sucesso!",
 *   "token": "<jwt_token>",
 *   "user": {
 *     "id": "<user_id>",
 *     "name": "João Silva",
 *     "phone": "11999999999"
 *   }
 * }
 */
exports.loginUser = async (req, res) => {
  const { phone, password } = req.body;
  const rawLogin = String(phone ?? '').trim();

  // Validations
  if (!rawLogin) return res.status(422).json({ message: 'O telefone é obrigatório!' });
  if (!password) return res.status(422).json({ message: 'A senha é obrigatória!' });

  try {
    await logInfo('[loginUser] attempt', { loginFieldLength: rawLogin.length });
    const invalidMsg = 'Telefone ou senha inválido.';

    await logInfo('[loginUser] find user');
    const user = await findUserByLoginIdentifier(rawLogin);
    if (!user) {
      await logWarning(`Login attempt for non-existent identifier: ${rawLogin}`);
      return res.status(401).json({ message: invalidMsg });
    }

    await logInfo('[loginUser] compare password');
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      await logWarning(`Invalid password attempt for user: ${user._id}`);
      return res.status(401).json({ message: invalidMsg });
    }

    await logInfo('[loginUser] sign JWT');
    const secret = process.env.SECRET;
   
    const token = jwt.sign(
      { id: user._id },
      secret
    );

    await logInfo(`User logged in: ${user.phone}`);
    res.status(200).json({
      message: 'Autenticado com sucesso!',
      token: token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        type: user.type,
        picture: user.picture ? user.picture.toString() : null
      }
    });
  } catch (err) {
    await logError('Error logging in user', { tag: '[loginUser]', message: err?.message, stack: err?.stack, name: err?.name });
    res.status(500).json({ message: 'Aconteceu um erro no servidor, tente novamente mais tarde!' });
  }
};



// Subscribe user to an excursion
exports.subscribeToExcursion = async (req, res) => {
  const userId = req.params.userId;
  const excursionId = req.params.excursionId;
  try {
    await logInfo('[subscribeToExcursion] start', { userId, excursionId });
    const user = await User.findById(userId);
    const excursion = await Excursion.findById(excursionId);
    if (!user || !excursion) return res.status(404).json({ message: 'Usuário ou excursão não encontrado.' });

    if (!user.excursions?.includes(excursionId)) {
      await logInfo('[subscribeToExcursion] push excursion on user');
      user.excursions = user.excursions || [];
      user.excursions.push(excursionId);
      await user.save();
    }
    if (!excursion.users?.includes(userId)) {
      await logInfo('[subscribeToExcursion] push user on excursion');
      excursion.users = excursion.users || [];
      excursion.users.push(userId);
      await excursion.save();
    }
    await logInfo('[subscribeToExcursion] ok');
    res.status(200).json({ message: 'Inscrito na excursão com sucesso!' });
  } catch (err) {
    await logError('Error subscribing to excursion', { tag: '[subscribeToExcursion]', message: err?.message, stack: err?.stack, name: err?.name });
    res.status(500).json({ message: 'Erro ao inscrever na excursão.' });
  }
};

// Unsubscribe user from an excursion
exports.unsubscribeFromExcursion = async (req, res) => {
  const userId = req.params.userId;
  const excursionId = req.params.excursionId;
  try {
    await logInfo('[unsubscribeFromExcursion] start', { userId, excursionId });
    const user = await User.findById(userId);
    const excursion = await Excursion.findById(excursionId);
    if (!user || !excursion) return res.status(404).json({ message: 'Usuário ou excursão não encontrado.' });

    await logInfo('[unsubscribeFromExcursion] update user and excursion');
    user.excursions = (user.excursions || []).filter(eId => eId.toString() !== excursionId);
    await user.save();

    excursion.users = (excursion.users || []).filter(uId => uId.toString() !== userId);
    await excursion.save();

    await logInfo('[unsubscribeFromExcursion] ok');
    res.status(200).json({ message: 'Desinscrito da excursão com sucesso!' });
  } catch (err) {
    await logError('Error unsubscribing from excursion', { tag: '[unsubscribeFromExcursion]', message: err?.message, stack: err?.stack, name: err?.name });
    res.status(500).json({ message: 'Erro ao desinscrever da excursão.' });
  }
};

/**
 * Partial update of a user resource (REST). Currently only `role` is accepted in the body;
 * persisted as the User model `type` field (`user` | `admin`).
 * POC: no server-side auth; intended for admin-only UI access.
 */
exports.patchUser = async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'ID de usuário inválido.' });
  }

  if (role === undefined || role === null || String(role).trim() === '') {
    return res.status(422).json({ message: 'O campo role é obrigatório.' });
  }

  const roleStr = String(role).trim();
  if (!['user', 'admin'].includes(roleStr)) {
    return res.status(400).json({ message: 'Role inválida. Use "user" ou "admin".' });
  }

  try {
    await logInfo('[patchUser] start', { userId, role: roleStr });
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      await logWarning(`PATCH /users/:id — user not found: ${userId}`);
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const previousType = targetUser.type;
    targetUser.type = roleStr;
    await targetUser.save();

    await logInfo(`User role/type changed from ${previousType} to ${roleStr} for user ${targetUser._id}`);
    res.status(200).json({
      message: `Papel alterado para ${roleStr} com sucesso!`,
      user: {
        id: targetUser._id,
        name: targetUser.name,
        phone: targetUser.phone,
        type: targetUser.type
      }
    });
  } catch (err) {
    await logError('Error patching user', { tag: '[patchUser]', message: err?.message, stack: err?.stack, name: err?.name });
    res.status(500).json({ message: 'Erro ao atualizar usuário.' });
  }
};

/**
 * Upload a profile picture for a user.
 * 
 * This endpoint allows a user to upload a profile picture. It expects:
 * - A file in the request with field name 'picture' (multipart/form-data)
 * - The user ID in the URL parameter
 * 
 * Workflow:
 * 1. Validates that a file was uploaded
 * 2. Finds the user by ID
 * 3. If user has an old picture, deletes it from the database
 * 4. Creates a new Picture document with the uploaded file data
 * 5. Associates the new picture to the user
 * 6. Returns success message with the picture ID
 * 
 * Responses:
 * - 200: Picture uploaded successfully. Returns { message, pictureId }
 * - 400: No file uploaded or invalid file
 * - 404: User not found
 * - 500: Server error during upload
 */
exports.uploadUserPicture = async (req, res) => {
  try {
    await logInfo('[uploadUserPicture] start', { userId: req.params.id, hasFile: !!req.file });
    if (!req.file) {
      await logWarning('Upload attempt without file');
      return res.status(400).json({ message: 'Nenhuma imagem foi enviada.' });
    }

    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      await logWarning(`Attempt to upload picture for non-existent user with ID: ${userId}`);
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    if (user.picture) {
      try {
        await Picture.findByIdAndDelete(user.picture);
        await logInfo(`Deleted old picture ${user.picture} for user ${userId}`);
      } catch (err) {
        await logWarning(`Error deleting old picture ${user.picture}`, {
          message: err?.message,
          stack: err?.stack,
          name: err?.name
        });
      }
    }

    await logInfo('[uploadUserPicture] create Picture document');
    const picture = new Picture({
      name: req.file.originalname || 'profile-picture',
      data: req.file.buffer,
      contentType: req.file.mimetype
    });

    await picture.save();
    await logInfo(`Created new picture ${picture._id} for user ${userId}`);

    await logInfo('[uploadUserPicture] associate picture to user');
    user.picture = picture._id;
    await user.save();

    await logInfo(`Picture ${picture._id} associated to user ${userId}`);
    res.status(200).json({
      message: 'Foto de perfil atualizada com sucesso!',
      pictureId: picture._id.toString()
    });
  } catch (err) {
    await logError('Error uploading user picture', { tag: '[uploadUserPicture]', message: err?.message, stack: err?.stack, name: err?.name });
    res.status(500).json({ message: 'Erro ao fazer upload da foto de perfil.' });
  }
};

/**
 * Reset user password.
 * 
 * This endpoint allows a user to reset their password by providing:
 * - cpf: The user's CPF (required)
 * - phone: The user's phone number (required)
 * - birthDate: The user's birth date (required)
 * - newPassword: The new password to be set (required)
 * 
 * Workflow:
 * 1. Normalizes CPF and phone (removes non-digits).
 * 2. Finds the user by normalized CPF.
 * 3. Validates that the provided phone and birth date match the stored data.
 * 4. If validation passes, hashes the new password using bcrypt.
 * 5. Saves the new hashed password to the user document.
 */
exports.resetPassword = async (req, res) => {
  const { cpf, phone, birthDate, newPassword } = req.body;

  if (!cpf || !phone || !birthDate || !newPassword) {
    return res.status(422).json({ message: 'Todos os campos são obrigatórios.' });
  }

  const normalizedCpf = cpf.replace(/\D/g, '');
  const normalizedPhone = phone.replace(/\D/g, '');

  try {
    await logInfo('[resetPassword] start', { cpfDigits: normalizedCpf.length, phoneDigits: normalizedPhone.length });
    const user = await User.findOne({ cpf: normalizedCpf });

    if (!user) {
      await logWarning(`Password reset attempt for non-existent CPF: ${normalizedCpf}`);
      return res.status(401).json({ message: 'Dados de recuperação inválidos.' });
    }

    const storedPhone = user.phone.replace(/\D/g, '');
    
    const providedDate = new Date(birthDate).toISOString().split('T')[0];
    const storedDate = new Date(user.birthDate).toISOString().split('T')[0];

    if (normalizedPhone !== storedPhone || providedDate !== storedDate) {
      await logWarning(`Invalid recovery data for CPF: ${normalizedCpf}`);
      return res.status(401).json({ message: 'Dados de recuperação não conferem.' });
    }

    await logInfo('[resetPassword] hash new password');
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    user.password = passwordHash;
    await user.save();

    await logInfo(`Password reset successfully for CPF: ${normalizedCpf}`);
    res.status(200).json({ message: 'Senha alterada com sucesso!' });
  } catch (err) {
    await logError('Error resetting password', { tag: '[resetPassword]', message: err?.message, stack: err?.stack, name: err?.name });
    res.status(500).json({ message: 'Erro ao resetar senha.' });
  }
};