// src/services/categories.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Category, CategoryType } from '../entities/Category';
import { Subcategory } from '../entities/Subcategory';
import { User } from '../entities/User';

interface CreateCategoryDTO {
  name: string;
  type: CategoryType;
}

interface CreateSubcategoryDTO {
  name: string;
  categoryId: string;
}

export class CategoryService {
  private categoryRepository: Repository<Category>;
  private subcategoryRepository: Repository<Subcategory>;

  constructor() {
    this.categoryRepository = AppDataSource.getRepository(Category);
    this.subcategoryRepository = AppDataSource.getRepository(Subcategory);
  }

  async createCategory(userId: string, categoryData: CreateCategoryDTO): Promise<Category> {
    const category = this.categoryRepository.create({
      name: categoryData.name,
      type: categoryData.type,
      user: { id: userId } as User
    });

    return this.categoryRepository.save(category);
  }

  async createSubcategory(categoryId: string, subcategoryData: CreateSubcategoryDTO): Promise<Subcategory> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId }
    });

    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    const subcategory = this.subcategoryRepository.create({
      name: subcategoryData.name,
      category: category
    });

    return this.subcategoryRepository.save(subcategory);
  }

  async getCategoriesByUser(userId: string): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { user: { id: userId } },
      relations: ['subcategories'],
      order: {
        type: 'ASC',
        name: 'ASC'
      }
    });
  }

  async getCategoryById(categoryId: string, userId: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: {
        id: categoryId,
        user: { id: userId }
      },
      relations: ['subcategories']
    });
  }

  async updateCategory(
    categoryId: string,
    userId: string,
    updateData: Partial<CreateCategoryDTO>
  ): Promise<Category | null> {
    const category = await this.getCategoryById(categoryId, userId);
    if (!category) return null;

    Object.assign(category, updateData);
    return this.categoryRepository.save(category);
  }

  async deleteCategory(categoryId: string, userId: string): Promise<boolean> {
    const result = await this.categoryRepository.delete({
      id: categoryId,
      user: { id: userId }
    });

    return result.affected ? result.affected > 0 : false;
  }

  async updateSubcategory(
    subcategoryId: string,
    updateData: { name: string }
  ): Promise<Subcategory | null> {
    const subcategory = await this.subcategoryRepository.findOne({
      where: { id: subcategoryId }
    });

    if (!subcategory) return null;

    Object.assign(subcategory, updateData);
    return this.subcategoryRepository.save(subcategory);
  }

  async deleteSubcategory(subcategoryId: string): Promise<boolean> {
    const result = await this.subcategoryRepository.delete(subcategoryId);
    return result.affected ? result.affected > 0 : false;
  }

  async createDefaultCategories(userId: string): Promise<void> {
    const defaultCategories = [
      // Categorías de gastos
      { name: 'Alimentación', type: CategoryType.EXPENSE, subcategories: ['Supermercado', 'Restaurantes', 'Comida rápida'] },
      { name: 'Transporte', type: CategoryType.EXPENSE, subcategories: ['Gasolina', 'Transporte público', 'Mantenimiento'] },
      { name: 'Servicios', type: CategoryType.EXPENSE, subcategories: ['Luz', 'Agua', 'Gas', 'Internet', 'Teléfono'] },
      { name: 'Vivienda', type: CategoryType.EXPENSE, subcategories: ['Renta', 'Mantenimiento', 'Muebles'] },
      { name: 'Salud', type: CategoryType.EXPENSE, subcategories: ['Medicamentos', 'Consultas', 'Seguros'] },
      
      // Categorías de ingresos
      { name: 'Salario', type: CategoryType.INCOME, subcategories: ['Nómina', 'Bonos'] },
      { name: 'Inversiones', type: CategoryType.INCOME, subcategories: ['Intereses', 'Dividendos', 'Rendimientos'] },
      { name: 'Otros Ingresos', type: CategoryType.INCOME, subcategories: ['Ventas', 'Regalos', 'Reembolsos'] }
    ];

    for (const categoryData of defaultCategories) {
      const category = await this.createCategory(userId, {
        name: categoryData.name,
        type: categoryData.type
      });

      for (const subcategoryName of categoryData.subcategories) {
        await this.createSubcategory(category.id, {
          name: subcategoryName,
          categoryId: category.id
        });
      }
    }
  }
}