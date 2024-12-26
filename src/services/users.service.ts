// src/services/users.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { CategoryService } from './categories.service';
import { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  hasCompletedOnboarding?: boolean;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    hasCompletedOnboarding: boolean;
  };
  token: string;
}

export class UserService {
  private userRepository: Repository<User>;
  private categoryService: CategoryService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.categoryService = new CategoryService();
  }

  async createUser(userData: CreateUserDTO): Promise<AuthResponse> {
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Crear el nuevo usuario
    const user = this.userRepository.create(userData);
    await user.hashPassword();
    const savedUser = await this.userRepository.save(user);

    // Crear categorías por defecto
    await this.categoryService.createDefaultCategories(savedUser.id);

    // Generar token
    const token = this.generateToken(savedUser);

    return {
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        hasCompletedOnboarding: savedUser.hasCompletedOnboarding
      },
      token
    };
  }

  async loginUser(email: string, password: string): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email }
    });

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        hasCompletedOnboarding: user.hasCompletedOnboarding
      },
      token
    };
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId }
    });
  }

  async updateUser(userId: string, updateData: UpdateUserDTO): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Si se está actualizando la contraseña, hashearla
    if (updateData.password) {
      updateData.password = await hash(updateData.password, 10);
    }

    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async updateOnboardingStatus(userId: string, status: boolean): Promise<AuthResponse> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.hasCompletedOnboarding = status;
    const updatedUser = await this.userRepository.save(user);

    // Generar nuevo token con el estado actualizado
    const token = this.generateToken(updatedUser);

    return {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        hasCompletedOnboarding: updatedUser.hasCompletedOnboarding
      },
      token
    };
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await this.userRepository.delete(userId);
    return result.affected ? result.affected > 0 : false;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const isValidPassword = await user.validatePassword(oldPassword);
    if (!isValidPassword) {
      throw new Error('Contraseña actual incorrecta');
    }

    user.password = newPassword;
    await user.hashPassword();
    await this.userRepository.save(user);

    return true;
  }

  private generateToken(user: User): string {
    return jwt.sign(
      { 
        id: user.id,
        hasCompletedOnboarding: user.hasCompletedOnboarding 
      },
      process.env.JWT_SECRET || 'tu-secreto-super-seguro',
      { expiresIn: '24h' }
    );
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'tu-secreto-super-seguro'
      ) as { id: string };

      return this.getUserById(decoded.id);
    } catch (error) {
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<Partial<User> | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'hasCompletedOnboarding', 'createdAt']
    });

    return user;
  }
}