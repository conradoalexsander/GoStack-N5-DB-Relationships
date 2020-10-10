import { getRepository, Repository, Any } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    // TODO
    const product = this.ormRepository.create({ name, price, quantity });
    await this.ormRepository.save(product);
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    // TODO
    const product = await this.ormRepository.findOne({ where: { name } });
    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    // TODO
    let foundProducts: Product[] = [];
    if (products.length > 0) {
      foundProducts = await this.ormRepository.find({
        where: {
          id: Any(products),
        },
      });
    }

    return foundProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    // TODO
    products.forEach(product => {
      this.ormRepository.update(product.id, product);
    });

    const productsIds: IFindProducts[] = products.map(product => ({
      id: product.id,
    }));

    return this.findAllById(productsIds);
  }
}

export default ProductsRepository;
