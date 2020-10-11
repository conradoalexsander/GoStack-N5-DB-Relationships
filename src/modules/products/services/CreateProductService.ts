import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Product from '../infra/typeorm/entities/Product';
import IProductsRepository from '../repositories/IProductsRepository';

interface IRequest {
  name: string;
  price: number;
  quantity: number;
}

@injectable()
class CreateProductService {
  constructor(
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
  ) {}

  public async execute({ name, price, quantity }: IRequest): Promise<Product> {
    // TODO
    const checkProductExists = await this.productsRepository.findByName(name);

    if (checkProductExists) {
      throw new AppError('A product with this name already exists');
    }

    if (quantity < 0) {
      throw new AppError(`The quantity of a product can't be less then 0`);
    }

    const product = this.productsRepository.create({
      name,
      price,
      quantity,
    });

    return product;
  }
}

export default CreateProductService;
